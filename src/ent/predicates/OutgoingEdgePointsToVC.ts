import { VC } from "../VC";
import { Predicate } from "./Predicate";

/**
 * Checks that the field's value is the same as VC's principal:
 *
 * EntOur[user_id] ---> vc.principal
 */
export class OutgoingEdgePointsToVC<TField extends string>
  implements Predicate<Record<TField, string | null>>
{
  readonly name = this.constructor.name + "(" + this.field + ")";

  constructor(public readonly field: TField) {}

  async check(vc: VC, row: Record<TField, string | null>): Promise<boolean> {
    const toID = row[this.field];
    if (!toID) {
      return false;
    }

    return toID === vc.principal;
  }
}
