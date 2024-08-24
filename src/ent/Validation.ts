import pickBy from "lodash/pickBy";
import {
  ID,
  type InsertFieldsRequired,
  type InsertInput,
  type Row,
  type Table,
  type UpdateInput,
} from "../types";
import { EntNotInsertableError } from "./errors/EntNotInsertableError";
import { EntNotReadableError } from "./errors/EntNotReadableError";
import { EntNotUpdatableError } from "./errors/EntNotUpdatableError";
import type { EntValidationErrorInfo } from "./errors/EntValidationError";
import { EntValidationError } from "./errors/EntValidationError";
import type { Predicate } from "./predicates/Predicate";
import type { AllowIf } from "./rules/AllowIf";
import type { DenyIf } from "./rules/DenyIf";
import { evaluate } from "./rules/evaluate";
import { Require } from "./rules/Require";
import type { Rule } from "./rules/Rule";
import { RuleDecision } from "./rules/Rule";
import { buildUpdateNewRow } from "./Triggers";
import type { VC } from "./VC";

export type LoadRule<TInput extends object> = AllowIf<TInput> | DenyIf<TInput>;

/**
 * For safety, we enforce all Require rules to be in the end of the
 * insert/update/delete privacy list, and have at least one of them. In
 * TypeScript, it's not possible to create [...L[], R, ...R[]] type
 * (double-variadic) when both L[] and R[] are open-ended (i.e. tuples with
 * unknown length), so we have to brute-force.
 */
export type WriteRules<TInput extends object> =
  | []
  | [Require<TInput>, ...Array<Require<TInput>>]
  | [LoadRule<TInput>, Require<TInput>, ...Array<Require<TInput>>]
  | [
      LoadRule<TInput>,
      LoadRule<TInput>,
      Require<TInput>,
      ...Array<Require<TInput>>,
    ]
  | [
      LoadRule<TInput>,
      LoadRule<TInput>,
      LoadRule<TInput>,
      Require<TInput>,
      ...Array<Require<TInput>>,
    ]
  | [
      LoadRule<TInput>,
      LoadRule<TInput>,
      LoadRule<TInput>,
      LoadRule<TInput>,
      Require<TInput>,
      ...Array<Require<TInput>>,
    ];

export type ValidationRules<TTable extends Table> = {
  readonly tenantPrincipalField?: InsertFieldsRequired<TTable> & string;
  readonly inferPrincipal: (vc: VC, row: Row<TTable>) => Promise<VC>;
  readonly load: Validation<TTable>["load"];
  readonly insert: Validation<TTable>["insert"];
  readonly update?: Validation<TTable>["update"];
  readonly delete?: Validation<TTable>["delete"];
  readonly validate?: Array<
    Predicate<InsertInput<TTable>> & EntValidationErrorInfo
  >;
};

export class Validation<TTable extends Table> {
  readonly tenantPrincipalField?: ValidationRules<TTable>["tenantPrincipalField"];
  readonly inferPrincipal: ValidationRules<TTable>["inferPrincipal"];
  readonly load: Array<LoadRule<Row<TTable>>>;
  readonly insert: WriteRules<InsertInput<TTable>>;
  readonly update: WriteRules<Row<TTable>>;
  readonly delete: WriteRules<Row<TTable>>;
  readonly validate: Array<Require<InsertInput<TTable>>>;

  constructor(
    private entName: string,
    rules: ValidationRules<TTable>,
  ) {
    this.tenantPrincipalField = rules.tenantPrincipalField;
    this.inferPrincipal = rules.inferPrincipal;
    this.load = rules.load;
    this.insert = rules.insert;
    this.update = rules.update || (this.insert as typeof this.update);
    this.delete = rules.delete || this.update;
    this.validate = (rules.validate || []).map((pred) => new Require(pred));
  }

  async validateLoad(vc: VC, row: Row<TTable>): Promise<void> {
    await this.validatePrivacyImpl(
      "load",
      this.load,
      vc,
      row,
      "sequential",
      EntNotReadableError,
    );
  }

  async validateInsert(vc: VC, input: InsertInput<TTable>): Promise<void> {
    await this.validateUserInputImpl(vc, input, input);
    await this.validatePrivacyImpl(
      "insert",
      this.insert,
      vc,
      input,
      "parallel",
      EntNotInsertableError,
    );
  }

  async validateUpdate(
    vc: VC,
    old: Row<TTable>,
    input: UpdateInput<TTable>,
    privacyOnly = false,
  ): Promise<void> {
    // Simulate the update, as if it's applied to the ent.
    const newRow = buildUpdateNewRow(old, input);

    if (!privacyOnly) {
      await this.validateUserInputImpl(
        vc,
        newRow as InsertInput<TTable>,
        input,
      );
    }

    await this.validatePrivacyImpl(
      "update",
      this.update,
      vc,
      newRow,
      "parallel",
      EntNotUpdatableError,
    );
  }

  async validateDelete(vc: VC, row: Row<TTable>): Promise<void> {
    await this.validatePrivacyImpl(
      "delete",
      this.delete,
      vc,
      row,
      "parallel",
      EntNotUpdatableError, // same exception as for update
    );
  }

  private async validatePrivacyImpl(
    op: string,
    rules: Array<Rule<object>>,
    vc: VC,
    row: object,
    fashion: "parallel" | "sequential",
    ExceptionClass:
      | typeof EntNotReadableError
      | typeof EntNotInsertableError
      | typeof EntNotUpdatableError,
  ): Promise<void> {
    this.validateTenantUserIDImpl(vc, row, ExceptionClass);

    const { allow, cause } =
      rules.length > 0
        ? await evaluate(vc, row, rules, fashion)
        : { allow: false, cause: `No "${op}" rules defined` };
    if (allow) {
      return;
    }

    throw new ExceptionClass(
      this.entName,
      vc.toString(),
      { [ID]: "?", ...row },
      cause,
    );
  }

  private validateTenantUserIDImpl(
    vc: VC,
    row: object,
    ExceptionClass:
      | typeof EntNotReadableError
      | typeof EntNotInsertableError
      | typeof EntNotUpdatableError,
  ): void {
    if (this.tenantPrincipalField === undefined) {
      return;
    }

    const rowTenantUserID = (row as Record<string, unknown>)[
      this.tenantPrincipalField
    ];
    if (rowTenantUserID === vc.principal) {
      return;
    }

    throw new ExceptionClass(
      this.entName,
      vc.toString(),
      { [ID]: "?", ...row },
      `${this.tenantPrincipalField} is expected to be ` +
        JSON.stringify(vc.principal) +
        ", but got " +
        JSON.stringify(rowTenantUserID),
    );
  }

  private async validateUserInputImpl(
    vc: VC,
    newRow: InsertInput<TTable>,
    input: object,
  ): Promise<void> {
    const { allow, results } = await evaluate(
      vc,
      newRow,
      this.validate,
      "parallel",
    );
    if (allow) {
      // Quick path (expected to fire most of the time).
      return;
    }

    // If some predicates failed, we ensure that they relate to the fields which
    // we actually touched. This makes sense for e.g. UPDATE: if we don't update
    // some field, it doesn't make sense to user-validate it.
    const touchedFields = Object.keys(pickBy(input, (v) => v !== undefined));
    const failedPredicates = results
      .filter(({ decision }) => decision === RuleDecision.DENY)
      .map(({ rule }) => rule.predicate as unknown as EntValidationErrorInfo)
      .filter(({ field }) => field === null || touchedFields.includes(field));
    if (failedPredicates.length > 0) {
      throw new EntValidationError(this.entName, failedPredicates);
    }
  }
}
