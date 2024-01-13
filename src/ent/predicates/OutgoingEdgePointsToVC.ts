import type { VC } from "../VC";
import type { Predicate } from "./Predicate";

/**
 * Checks that the field's value is the same as VC's principal:
 *
 * EntOur[user_id] ---> vc.principal
 */
export class OutgoingEdgePointsToVC<TField extends string>
  implements Predicate<Record<TField, string | null>>
{
  readonly name;

  constructor(public readonly field: TField) {
    this.name = this.constructor.name + "(" + this.field + ")";
  }

  async check(vc: VC, row: Record<TField, string | null>): Promise<boolean> {
    const toID = row[this.field];
    if (!toID) {
      return false;
    }

    return toID === vc.principal;
  }
}
