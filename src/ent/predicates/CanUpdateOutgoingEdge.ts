import type { EntClass } from "../types";
import type { VC } from "../VC";
import type { Predicate } from "./Predicate";
import { IDsCacheUpdatable } from "./Predicate";

/**
 * Checks that an Ent available via a field is updatable. See
 * CanReadOutgoingEdge comments for more details.
 */
export class CanUpdateOutgoingEdge<TField extends string>
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

    const cache = vc.cache(IDsCacheUpdatable);
    if (cache.has(toID!)) {
      return true;
    }

    // load the target Ent and check that it's updatable
    const toEnt = await this.toEntClass.loadX(vc, toID!);
    await this.toEntClass.VALIDATION.validateUpdate(
      vc,
      toEnt,
      {},
      true /* privacyOnly */,
    );

    // sill here and not thrown? save to the cache
    cache.add(toID!);
    return true;
  }
}
