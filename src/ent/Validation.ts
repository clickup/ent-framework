import pickBy from "lodash/pickBy";
import { indent } from "../helpers/misc";
import type {
  InsertFieldsRequired,
  InsertInput,
  Row,
  Table,
  UpdateInput,
} from "../types";
import { EntNotInsertableError } from "./errors/EntNotInsertableError";
import { EntNotReadableError } from "./errors/EntNotReadableError";
import { EntNotUpdatableError } from "./errors/EntNotUpdatableError";
import type { EntValidationErrorInfo } from "./errors/EntValidationError";
import { EntValidationError } from "./errors/EntValidationError";
import type { Predicate } from "./predicates/Predicate";
import type { AllowIf } from "./rules/AllowIf";
import type { DenyIf } from "./rules/DenyIf";
import { Require } from "./rules/Require";
import type { Rule, RuleResult } from "./rules/Rule";
import { evaluate, RuleDecision } from "./rules/Rule";
import { buildUpdateNewRow } from "./Triggers";
import type { VC } from "./VC";

type LoadRule<TInput extends object> = AllowIf<TInput> | DenyIf<TInput>;

/**
 * For safety, we enforce all Require rules to be in the end of the
 * insert/update/delete privacy list, and have at least one of them. In
 * TypeScript, it's not possible to create [...L[], R, ...R[]] type
 * (double-variadic) when both L[] and R[] are open-ended (i.e. tuples with
 * unknown length), so we have to brute-force.
 */
type WriteRules<TInput extends object> =
  | []
  | [Require<TInput>, ...Array<Require<TInput>>]
  | [LoadRule<TInput>, Require<TInput>, ...Array<Require<TInput>>]
  | [
      LoadRule<TInput>,
      LoadRule<TInput>,
      Require<TInput>,
      ...Array<Require<TInput>>
    ]
  | [
      LoadRule<TInput>,
      LoadRule<TInput>,
      LoadRule<TInput>,
      Require<TInput>,
      ...Array<Require<TInput>>
    ]
  | [
      LoadRule<TInput>,
      LoadRule<TInput>,
      LoadRule<TInput>,
      LoadRule<TInput>,
      Require<TInput>,
      ...Array<Require<TInput>>
    ];

export type ValidationRules<TTable extends Table> = {
  readonly tenantPrincipalField?: InsertFieldsRequired<TTable> & string;
  readonly inferPrincipal?: (
    vc: VC,
    row: Row<TTable>
  ) => Promise<string | null>;
  readonly load: Validation<TTable>["load"];
  readonly insert: Validation<TTable>["insert"];
  readonly update?: Validation<TTable>["update"];
  readonly delete?: Validation<TTable>["delete"];
  readonly validate?: Array<Predicate<Row<TTable>> & EntValidationErrorInfo>;
};

export class Validation<TTable extends Table> {
  readonly tenantPrincipalField?: ValidationRules<TTable>["tenantPrincipalField"];
  readonly inferPrincipal?: ValidationRules<TTable>["inferPrincipal"];
  readonly load: Array<LoadRule<Row<TTable>>>;
  readonly insert: WriteRules<InsertInput<TTable>>;
  readonly update: WriteRules<Row<TTable>>;
  readonly delete: WriteRules<Row<TTable>>;
  readonly validate: Array<Require<Row<TTable>>>;

  constructor(private entName: string, rules: ValidationRules<TTable>) {
    this.tenantPrincipalField = rules.tenantPrincipalField;
    this.inferPrincipal = rules.inferPrincipal;
    this.load = rules.load;
    this.insert = rules.insert;
    this.update = rules.update || (this.insert as any);
    this.delete = rules.delete || this.update;
    this.validate = (rules.validate || []).map((pred) => new Require(pred));
  }

  async validateLoad(vc: VC, row: Row<TTable>): Promise<void> {
    await this.validatePrivacyImpl(
      "load",
      this.load,
      vc,
      row,
      false,
      EntNotReadableError
    );
  }

  async validateInsert(vc: VC, input: InsertInput<TTable>): Promise<void> {
    await this.validateUserInputImpl(vc, input as Row<TTable>, input);
    await this.validatePrivacyImpl(
      "insert",
      this.insert,
      vc,
      input,
      true, // parallel
      EntNotInsertableError
    );
  }

  async validateUpdate(
    vc: VC,
    old: Row<TTable>,
    input: UpdateInput<TTable>,
    privacyOnly = false
  ): Promise<void> {
    // Simulate the update, as if it's applied to the ent.
    const newRow = buildUpdateNewRow(old, input);

    if (!privacyOnly) {
      await this.validateUserInputImpl(vc, newRow, input);
    }

    await this.validatePrivacyImpl(
      "update",
      this.update,
      vc,
      newRow,
      true, // parallel
      EntNotUpdatableError
    );
  }

  async validateDelete(vc: VC, row: Row<TTable>): Promise<void> {
    await this.validatePrivacyImpl(
      "delete",
      this.delete,
      vc,
      row,
      true, // parallel
      EntNotUpdatableError // same exception as for update
    );
  }

  private async validatePrivacyImpl(
    op: string,
    rules: Array<Rule<object>>,
    vc: VC,
    row: object,
    parallel: boolean,
    ExceptionClass:
      | typeof EntNotReadableError
      | typeof EntNotInsertableError
      | typeof EntNotUpdatableError
  ): Promise<void> {
    this.validateTenantUserIDImpl(vc, row, ExceptionClass);

    const { allow, results } = await evaluate(rules, vc, row, parallel);
    if (allow) {
      return;
    }

    throw new ExceptionClass(this.entName, vc.toString(), row as any, {
      message: resultsToText(op, results),
    });
  }

  private validateTenantUserIDImpl(
    vc: VC,
    row: object,
    ExceptionClass:
      | typeof EntNotReadableError
      | typeof EntNotInsertableError
      | typeof EntNotUpdatableError
  ): void {
    if (this.tenantPrincipalField === undefined) {
      return;
    }

    const rowTenantUserID = (row as any)[this.tenantPrincipalField];
    if (rowTenantUserID === vc.principal) {
      return;
    }

    throw new ExceptionClass(this.entName, vc.toString(), row as any, {
      message:
        this.tenantPrincipalField +
        " is expected to be " +
        JSON.stringify(vc.principal) +
        ", but got " +
        JSON.stringify(rowTenantUserID),
    });
  }

  private async validateUserInputImpl(
    vc: VC,
    newRow: Row<TTable>,
    input: object
  ): Promise<void> {
    const { allow, results } = await evaluate(this.validate, vc, newRow, true);
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

/**
 * A helper function which returns a debugging text for a list of rule
 * evaluation results.
 */
function resultsToText(op: string, results: RuleResult[]): string {
  if (results.length === 0) {
    return `No "${op}" rules defined`;
  }

  return results
    .map(
      ({ rule, decision, cause }) =>
        "Rule " +
        rule.name +
        " returned " +
        decision +
        (cause ? ", because:\n" + indent(cause.message) : "")
    )
    .join("\n");
}
