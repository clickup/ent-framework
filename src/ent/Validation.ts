import { indent } from "../helpers";
import {
  InsertFieldsRequired,
  InsertInput,
  Row,
  Table,
  UpdateInput,
} from "../types";
import { EntNotInsertableError } from "./errors/EntNotInsertableError";
import { EntNotReadableError } from "./errors/EntNotReadableError";
import { EntNotUpdatableError } from "./errors/EntNotUpdatableError";
import {
  EntValidationError,
  EntValidationErrorInfo,
} from "./errors/EntValidationError";
import { Predicate } from "./predicates/Predicate";
import { Require } from "./rules/Require";
import { evaluate, Rule, RuleDecision, RuleResult } from "./rules/Rule";
import { buildNewRow } from "./Triggers";
import { VC } from "./VC";

export type ValidationRules<TTable extends Table> = {
  readonly tenantUserIDField?: InsertFieldsRequired<TTable> & string;
  readonly load: Validation<TTable>["load"];
  readonly insert: Validation<TTable>["insert"];
  readonly update?: Validation<TTable>["update"];
  readonly delete?: Validation<TTable>["delete"];
  readonly validate?: Array<Predicate<Row<TTable>> & EntValidationErrorInfo>;
};

export class Validation<TTable extends Table> {
  readonly tenantUserIDField?: InsertFieldsRequired<TTable> & string;
  readonly load: Array<Rule<Row<TTable>>>;
  readonly insert: Array<Rule<InsertInput<TTable>>>;
  readonly update: Array<Rule<Row<TTable>>>;
  readonly delete: Array<Rule<Row<TTable>>>;
  readonly validate: Array<Require<Row<TTable>>>;

  constructor(private entName: string, rules: ValidationRules<TTable>) {
    this.load = rules.load;
    this.insert = rules.insert;
    this.update = rules.update || (this.insert as any);
    this.delete = rules.delete || this.update;
    this.validate = (rules.validate || []).map((pred) => new Require(pred));
    this.tenantUserIDField = rules.tenantUserIDField;
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
    await this.validateUserInputImpl(vc, input as Row<TTable>);
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
    const newRow = buildNewRow(old, input);

    if (!privacyOnly) {
      await this.validateUserInputImpl(vc, newRow);
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
  ) {
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
  ) {
    if (this.tenantUserIDField === undefined) {
      return;
    }

    const rowTenantUserID = (row as any)[this.tenantUserIDField];
    if (rowTenantUserID === vc.userID) {
      return;
    }

    throw new ExceptionClass(this.entName, vc.toString(), row as any, {
      message:
        this.tenantUserIDField +
        " is expected to be " +
        JSON.stringify(vc.userID) +
        ", but got " +
        JSON.stringify(rowTenantUserID),
    });
  }

  private async validateUserInputImpl(vc: VC, row: Row<TTable>) {
    const { allow, results } = await evaluate(this.validate, vc, row, true);
    if (allow) {
      return;
    }

    const failedPredicates = results
      .filter((result) => result.decision === RuleDecision.DENY)
      .map((result) => result.rule.predicate as any as EntValidationErrorInfo);
    if (failedPredicates.length > 0) {
      throw new EntValidationError(this.entName, failedPredicates);
    }
  }
}

/**
 * A helper function which returns a debugging text for a list of rule
 * evaluation results.
 */
function resultsToText(op: string, results: RuleResult[]) {
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
