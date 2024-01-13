import type { Client } from "../../abstract/Client";
import type {
  CountInput,
  ExistsInput,
  InsertInput,
  LoadByInput,
  Order,
  Table,
  UniqueKey,
  Where,
} from "../../types";
import { QueryCache } from "../QueryCache";
import type { UpdateOriginalInput } from "../types";
import type { VC } from "../VC";
import type { PrimitiveClass, PrimitiveInstance } from "./PrimitiveMixin";

/**
 * Modifies the passed class adding VC-stored cache layer to it.
 */
export function CacheMixin<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
  TClient extends Client,
>(
  Base: PrimitiveClass<TTable, TUniqueKey, TClient>,
): PrimitiveClass<TTable, TUniqueKey, TClient> {
  class CacheMixin extends Base {
    override ["constructor"]!: typeof CacheMixin;

    static override async insertIfNotExists(
      vc: VC,
      input: InsertInput<TTable>,
    ): Promise<string | null> {
      const res = await super.insertIfNotExists(vc, input);
      vc.cache(QueryCache).delete(this, ["loadByNullable", "select", "count"]);
      return res;
    }

    static override async upsert(
      vc: VC,
      input: InsertInput<TTable>,
    ): Promise<string> {
      const res = super.upsert(vc, input);
      vc.cache(QueryCache).delete(this, [
        "loadNullable",
        "loadByNullable",
        "select",
        "count",
      ]);
      return res;
    }

    static override async loadNullable<TEnt extends PrimitiveInstance<TTable>>(
      this: new () => TEnt,
      vc: VC,
      id: string,
    ): Promise<TEnt | null> {
      return vc
        .cache(QueryCache)
        .through(this, "loadNullable", id, async () =>
          super.loadNullable(vc, id),
        ) as Promise<TEnt | null>;
    }

    static override async loadByNullable<
      TEnt extends PrimitiveInstance<TTable>,
    >(
      this: new () => TEnt,
      vc: VC,
      input: LoadByInput<TTable, TUniqueKey>,
    ): Promise<TEnt | null> {
      return vc
        .cache(QueryCache)
        .through(this, "loadByNullable", JSON.stringify(input), async () =>
          super.loadByNullable(vc, input),
        ) as Promise<TEnt | null>;
    }

    static override async select<TEnt extends PrimitiveInstance<TTable>>(
      this: new () => TEnt,
      vc: VC,
      where: Where<TTable>,
      limit: number,
      order?: Order<TTable>,
      custom?: {},
    ): Promise<TEnt[]> {
      return vc
        .cache(QueryCache)
        .through(
          this,
          "select",
          JSON.stringify([where, limit, order, custom]),
          async () => super.select(vc, where, limit, order, custom),
        ) as Promise<TEnt[]>;
    }

    static override async count(
      vc: VC,
      where: CountInput<TTable>,
    ): Promise<number> {
      return vc
        .cache(QueryCache)
        .through(this, "count", JSON.stringify(where), async () =>
          super.count(vc, where),
        );
    }

    static override async exists(
      vc: VC,
      where: ExistsInput<TTable>,
    ): Promise<boolean> {
      return vc
        .cache(QueryCache)
        .through(this, "exists", JSON.stringify(where), async () =>
          super.exists(vc, where),
        );
    }

    override async updateOriginal(
      input: UpdateOriginalInput<TTable>,
    ): Promise<boolean> {
      const res = await super.updateOriginal(input);
      this.vc
        .cache(QueryCache)
        .delete(this.constructor, ["loadNullable"], this.id)
        .delete(this.constructor, ["loadByNullable", "select", "count"]);
      return res;
    }

    override async deleteOriginal(): Promise<boolean> {
      const res = await super.deleteOriginal();
      this.vc
        .cache(QueryCache)
        .delete(this.constructor, ["loadNullable"], this.id)
        .delete(this.constructor, ["loadByNullable", "select", "count"]);
      return res;
    }
  }

  return CacheMixin;
}
