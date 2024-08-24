import type { EntClass } from "../types";
import type { VC } from "../VC";
import type { Predicate } from "./Predicate";
import { IDsCacheDeletable } from "./Predicate";

/**
 * Checks that an Ent available via a field can be deleted, or Ent doesn't exist
 * (e.g. Ent is orphaned). See CanReadOutgoingEdge comments for more details.
 */
export class CanDeleteOutgoingEdge<TField extends string>
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

    const cache = vc.cache(IDsCacheDeletable);
    if (cache.has(toID!)) {
      return true;
    }

    // Load the target Ent and check that it's deletable.
    const toEnt = await this.toEntClass.loadNullable(vc, toID!);
    if (toEnt === null) {
      return true;
    }

    await this.toEntClass.VALIDATION.validateDelete(vc, toEnt);

    // Sill here and not thrown? save to the cache.
    cache.add(toID!);
    return true;
  }
}
