import type { EntClass } from "../types";
import type { VC } from "../VC";
import type { Predicate } from "./Predicate";
import { IDsCacheReadable } from "./Predicate";

/**
 * Checks that an ent which a field is pointing to is readable:
 *
 * EntOur[company_id] ---> EntCompany[id]
 *
 * This predicate delegates the readability permission check for the current ent
 * to another ent with ID equals to the value of our ent's field.
 *
 * - field = user_id in the above example
 * - toEntClass = EntCompany in the above example
 */

export class CanReadOutgoingEdge<TField extends string>
  implements Predicate<Record<TField, string | null>>
{
  readonly name;

  constructor(
    public readonly field: TField,
    public readonly toEntClass: EntClass,
  ) {
    this.name = this.constructor.name + "(" + this.field + ")";
  }

  async check(vc: VC, row: Record<TField, string | null>): Promise<boolean> {
    const toID = row[this.field];
    if (!toID) {
      return false;
    }

    const cache = vc.cache(IDsCacheReadable);
    if (cache.has(toID!)) {
      return true;
    }

    await this.toEntClass.loadX(vc, toID!);
    // sill here and not thrown? save to the cache
    cache.add(toID!);
    return true;
  }
}
