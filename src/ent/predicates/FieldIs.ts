import type { EntValidationErrorInfo } from "../errors/EntValidationError";
import type { VC } from "../VC";
import type { Predicate } from "./Predicate";

/**
 * Checks that the validator function returns true for the value in some field.
 */
export class FieldIs<
  TField extends string,
  TRow extends Partial<Record<TField, unknown>>
> implements Predicate<TRow>, EntValidationErrorInfo
{
  readonly name = this.constructor.name + "(" + this.field + ")";

  constructor(
    public readonly field: TField,
    public readonly validator: (
      fieldValue: TRow[TField],
      row: TRow,
      vc: VC
    ) => boolean | Promise<boolean>,
    public readonly message: string
  ) {}

  async check(vc: VC, row: TRow): Promise<boolean> {
    const fieldValue = row[this.field];
    return this.validator(fieldValue, row, vc);
  }
}
