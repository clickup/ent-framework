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
      row: Record<string, any>
    ) => boolean,
    public readonly message: string,
    /** The condition that has to be met to run this check. */
    private readonly condition?: (vc: VC) => boolean
  ) {}

  async check(vc: VC, row: Record<string, any>): Promise<boolean> {
    // If condition is defined then run the check only if it was met.
    if (this.condition && !this.condition(vc)) {
      return true;
    }

    const fieldValue = row[this.field];
    return this.validator(fieldValue, row);
  }
}
