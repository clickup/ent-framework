import type { EntValidationErrorInfo } from "../errors/EntValidationError";
import type { VC } from "../VC";
import type { Predicate } from "./Predicate";

/**
 * Checks that the validator function returns true for the value in some field.
 */
export class FieldIs
  implements Predicate<Record<string, any>>, EntValidationErrorInfo
{
  readonly name = this.constructor.name + "(" + this.field + ")";

  constructor(
    public readonly field: string,
    public readonly validator: (
      fieldValue: any,
      row: Record<string, any>,
      vc: VC
    ) => boolean | Promise<boolean>,
    public readonly message: string
  ) {}

  async check(vc: VC, row: Record<string, unknown>): Promise<boolean> {
    const fieldValue = row[this.field];
    return this.validator(fieldValue, row, vc);
  }
}
