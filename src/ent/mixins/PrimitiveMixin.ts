import flatten from "lodash/flatten";
import sum from "lodash/sum";
import { Client } from "../../abstract/Client";
import { hasKey, mapJoin, OmitNew } from "../../helpers";
import memoize2 from "../../memoize2";
import {
  $and,
  $gt,
  CountInput,
  ID,
  InsertInput,
  LoadByInput,
  Order,
  Row,
  Table,
  UniqueKey,
  UpdateInput,
  Where,
} from "../../types";
import { EntNotInsertableError } from "../errors/EntNotInsertableError";
import { OutgoingEdgePointsToVC } from "../predicates/OutgoingEdgePointsToVC";
import { IDsCacheReadable, IDsCacheUpdatable } from "../predicates/Predicate";
import { VC } from "../VC";
import { ConfigClass, ConfigInstance } from "./ConfigMixin";

export interface PrimitiveInstance<TTable extends Table>
  extends ConfigInstance {
  /**
   * VC of this Ent.
   */
  readonly vc: VC;

  /**
   * For simplicity, every Ent has an ID field name hardcoded to "id".
   */
  readonly [ID]: string;

  /**
   * Updates the object in the DB, but doesn't update the Ent itself (since it's
   * immutable). Returns true if the object was found.
   */
  updateOriginal(input: UpdateInput<TTable>): Promise<boolean>;

  /**
   * Deletes the object in the DB. Returns true if the object was found. Keeps
   * the current object untouched (since it's immutable).
   */
  deleteOriginal(): Promise<boolean>;
}

export type PrimitiveClass<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
  TClient extends Client
> = OmitNew<ConfigClass<TTable, TUniqueKey, TClient>> & {
  /**
   * Runs INSERT mutation for the Ent.
   * - The shard is inferred from the input fields using SHARD_AFFINITY.
   * - Returns ID of the newly inserted row.
   * - Returns null if the Ent violates unique key constraints.
   * - If the Ent has some triggers set up, this will be translated into two
   *   schema operations: idGen() and insert(), and before-triggers will run in
   *   between having the ID known in advance.
   */
  insertIfNotExists: (
    vc: VC,
    input: InsertInput<TTable>
  ) => Promise<string | null>;

  /**
   * Inserts an Ent or updates an existing one if unique key matches.
   * - Don't use upsert() too often, because upsert may still delete IDs even
   *   if the object was updated, not inserted (there is no good ways to solve
   *   this in some DB engines like SQL so far).
   * - Upsert can't work if some triggers are defined for the Ent, because we
   *   don't know Ent ID in advance (whether the upsert succeeds or skips on
   *   duplication).
   */
  upsert: (vc: VC, input: InsertInput<TTable>) => Promise<string>;

  /**
   * Loads an Ent by its ID. Returns null if no such Ent exists. Try to use
   * loadX() instead as much as you can.
   */
  loadNullable: <TEnt extends PrimitiveInstance<TTable>>(
    this: new (...args: any[]) => TEnt,
    vc: VC,
    id: string
  ) => Promise<TEnt | null>;

  /**
   * Loads an Ent by its unique key. Returns null if no such Ent exists. Notice
   * that the key must be REALLY unique, otherwise the database may return
   * multiple items, and the API will break. Don't try to use this method with
   * non-unique keys!
   */
  loadByNullable: <TEnt extends PrimitiveInstance<TTable>>(
    this: new (...args: any[]) => TEnt,
    vc: VC,
    input: LoadByInput<TTable, TUniqueKey>
  ) => Promise<TEnt | null>;

  /**
   * Loads the list of Ents by some predicate. The query can span multiple
   * shards if their locations can be inferred from inverses related to the
   * fields mentioned in the query. In multi-shard case, ordering of results is
   * not guaranteed.
   */
  select: <TEnt extends PrimitiveInstance<TTable>>(
    this: new (...args: any[]) => TEnt,
    vc: VC,
    where: Where<TTable>,
    limit: number,
    order?: Order<TTable>,
    custom?: {}
  ) => Promise<TEnt[]>;

  /**
   * Same as select(), but returns data in chunks and uses multiple select()
   * queries under the hood. The returned Ents are always ordered by ID. Also,
   * it always pulls data from a single shard and throws if this shard cannot be
   * unambiguously inferred from the input.
   */
  selectChunked: <TEnt extends PrimitiveInstance<TTable>>(
    this: new (...args: any[]) => TEnt,
    vc: VC,
    where: Where<TTable>,
    chunkSize: number,
    limit: number,
    custom?: {}
  ) => AsyncIterableIterator<TEnt[]>;

  /**
   * Returns count of Ents matching a predicate. The query can span multiple
   * shards if their locations can be inferred from inverses related to the
   * fields mentioned in the query.
   */
  count: (vc: VC, where: CountInput<TTable>) => Promise<number>;

  /**
   * TS requires us to have a public constructor to infer instance types in
   * various places. We make this constructor throw if it's called.
   *
   * KLUDGE here: it should've been PrimitiveInstance<TTable> & Row<TTable>. But
   * unfortunately if we do so, TS disallows inheritance from PrimitiveClass and
   * thus breaks the chain of mixins. So we add Row<TTable> only at the very
   * late stage, in the latest mixin in the chain and not here.
   */
  new (...args: any[]): PrimitiveInstance<TTable>;
};

/**
 * Modifies the passed class adding support for the minimal number of basic Ent
 * operations. Internally, uses Schema abstractions to run them.
 */
export function PrimitiveMixin<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
  TClient extends Client
>(Base: ConfigClass<TTable, TUniqueKey, TClient>) {
  class PrimitiveMixin extends Base {
    override ["constructor"]!: typeof PrimitiveMixin;

    readonly vc!: VC;

    readonly [ID]: string;

    static async insertIfNotExists(vc: VC, input: InsertInput<TTable>) {
      await vc.heartbeater.heartbeat();

      if (!vc.isOmni()) {
        await this.VALIDATION.validateInsert(vc, input);
      }

      const shard = this.SHARD_LOCATOR.singleShardFromInput(
        input,
        "insert",
        true // fallbackToRandomShard
      );

      const insertEntAndInverses = async (input: InsertInput<TTable>) => {
        const id = await shard.run(
          this.SCHEMA.insert(input),
          vc.toAnnotation(),
          vc.timeline(shard, this.SCHEMA.name),
          vc.freshness
        );

        if (id) {
          vc.cache(IDsCacheUpdatable).add(id);
          await mapJoin(this.INVERSES, async (inverse) =>
            inverse.afterInsert(
              vc,
              input[inverse.id2Field] as string | null,
              id
            )
          );
        }

        return id;
      };

      if (this.TRIGGERS.hasInsertTriggers()) {
        // We have some triggers; that means we must generate an ID separately to
        // let the before-triggers see it before the actual db operation happens.
        const id = await shard.run(
          this.SCHEMA.idGen(),
          vc.toAnnotation(),
          vc.timeline(shard, this.SCHEMA.name),
          vc.freshness
        );
        vc.cache(IDsCacheUpdatable).add(id); // to enable privacy checks in beforeInsert triggers
        return this.TRIGGERS.wrapInsert(insertEntAndInverses, vc, {
          ...input,
          [ID]: id,
        });
      } else {
        return insertEntAndInverses(input);
      }
    }

    static async upsert(vc: VC, input: InsertInput<TTable>) {
      await vc.heartbeater.heartbeat();

      if (
        this.TRIGGERS.hasInsertTriggers() ||
        this.TRIGGERS.hasUpdateTriggers()
      ) {
        throw new EntNotInsertableError(
          this.name,
          vc.toString(),
          input,
          "upsert cannot work with triggers defined since it doesn't know whether the row was inserted or updated in the database"
        );
      }

      if (this.INVERSES.length > 0) {
        throw new EntNotInsertableError(
          this.name,
          vc.toString(),
          input,
          "upsert cannot work with inverses since it doesn't know the old values of fields in the database"
        );
      }

      if (!vc.isOmni()) {
        await this.VALIDATION.validateInsert(vc, input);
      }

      const shard = this.SHARD_LOCATOR.singleShardFromInput(
        input,
        "upsert",
        false // fallbackToRandomShard
      );
      const query = this.SCHEMA.upsert(input);
      const id = await shard.run(
        query,
        vc.toAnnotation(),
        vc.timeline(shard, this.SCHEMA.name),
        vc.freshness
      );
      vc.cache(IDsCacheUpdatable).add(id);
      return id;
    }

    static async loadNullable(vc: VC, id: string) {
      await vc.heartbeater.heartbeat();

      const shard = this.SHARD_LOCATOR.singleShardFromID(ID, id);
      if (!shard) {
        return null;
      }

      const query = this.SCHEMA.load(id);
      const row = await shard.run(
        query,
        vc.toAnnotation(),
        vc.timeline(shard, this.SCHEMA.name),
        vc.freshness
      );
      return row ? this.createEnt(vc, row) : null;
    }

    static async loadByNullable(
      vc: VC,
      input: LoadByInput<TTable, TUniqueKey>
    ) {
      await vc.heartbeater.heartbeat();

      const shard = this.SHARD_LOCATOR.singleShardFromInput(
        input,
        "loadBy",
        false // fallbackToRandomShard
      );
      const query = this.SCHEMA.loadBy(input);
      const row = await shard.run(
        query,
        vc.toAnnotation(),
        vc.timeline(shard, this.SCHEMA.name),
        vc.freshness
      );
      return row ? this.createEnt(vc, row) : null;
    }

    static async select(
      vc: VC,
      where: Where<TTable>,
      limit: number,
      order?: Order<TTable>,
      custom?: {}
    ) {
      await vc.heartbeater.heartbeat();

      const shards = await this.SHARD_LOCATOR.multiShardsFromInput(
        vc,
        where,
        "select"
      );

      const ents = await mapJoin(shards, async (shard) => {
        const rows = await shard.run(
          this.SCHEMA.select({ where, limit, order, custom }),
          vc.toAnnotation(),
          vc.timeline(shard, this.SCHEMA.name),
          vc.freshness
        );
        return mapJoin(rows, async (row) => this.createEnt(vc, row));
      });

      return flatten(ents);
    }

    static async *selectChunked(
      vc: VC,
      where: Where<TTable>,
      chunkSize: number,
      limit: number,
      custom?: {}
    ) {
      const shard = this.SHARD_LOCATOR.singleShardFromInput(
        where,
        "selectChunked",
        false // fallbackToRandomShard
      );

      let idCursor: string = "0";
      for (;;) {
        if (limit <= 0) {
          return;
        }

        if (limit < chunkSize) {
          chunkSize = limit;
        }

        const cursoredWhere = {
          ...where,
          [$and]: [{ [ID]: { [$gt]: idCursor } }, ...(where[$and] ?? [])],
        };

        await vc.heartbeater.heartbeat();
        const rows = await shard.run(
          this.SCHEMA.select({
            where: cursoredWhere,
            limit: chunkSize,
            order: [{ [ID]: "ASC" }], // IMPORTANT for idCursor
            custom,
          }),
          vc.toAnnotation(),
          vc.timeline(shard, this.SCHEMA.name),
          vc.freshness
        );
        const chunk = await mapJoin(rows, async (row) =>
          this.createEnt(vc, row)
        );
        if (chunk.length === 0) {
          return;
        }

        yield chunk;

        idCursor = chunk[chunk.length - 1][ID];
        limit -= chunk.length;

        // In absolute most of the cases this condition saves one last query
        // which would returns 0 Ents otherwise.
        if (chunk.length < chunkSize) {
          return;
        }
      }
    }

    static async count(vc: VC, where: CountInput<TTable>) {
      await vc.heartbeater.heartbeat();

      const shards = await this.SHARD_LOCATOR.multiShardsFromInput(
        vc,
        where,
        "count"
      );

      const counts = await mapJoin(shards, async (shard) =>
        shard.run(
          this.SCHEMA.count(where),
          vc.toAnnotation(),
          vc.timeline(shard, this.SCHEMA.name),
          vc.freshness
        )
      );

      return sum(counts);
    }

    async updateOriginal(input: UpdateInput<TTable>) {
      await this.vc.heartbeater.heartbeat();

      if (!this.vc.isOmni()) {
        await this.constructor.VALIDATION.validateUpdate(
          this.vc,
          this as Row<TTable>,
          input
        );
      }

      const shard = this.constructor.SHARD_LOCATOR.singleShardFromID(
        ID,
        this[ID]
      );
      if (!shard) {
        return false;
      }

      return this.constructor.TRIGGERS.wrapUpdate(
        async (input) => {
          const updated = await shard.run(
            this.constructor.SCHEMA.update(this[ID], input),
            this.vc.toAnnotation(),
            this.vc.timeline(shard, this.constructor.SCHEMA.name),
            this.vc.freshness
          );

          if (updated) {
            await mapJoin(
              this.constructor.INVERSES,
              async (inverse) =>
                hasKey(inverse.id2Field, input) &&
                input[inverse.id2Field] !== undefined &&
                inverse.afterUpdate(
                  this.vc,
                  input[inverse.id2Field] as string | null,
                  this[ID],
                  (this as any)[inverse.id2Field] as string | null
                )
            );
          }

          return updated;
        },
        this.vc,
        this as Row<TTable>,
        input
      );
    }

    async deleteOriginal() {
      await this.vc.heartbeater.heartbeat();

      if (!this.vc.isOmni()) {
        await this.constructor.VALIDATION.validateDelete(
          this.vc,
          this as Row<TTable>
        );
      }

      const shard = this.constructor.SHARD_LOCATOR.singleShardFromID(
        ID,
        this[ID]
      );
      if (!shard) {
        return false;
      }

      return this.constructor.TRIGGERS.wrapDelete(
        async () => {
          const deleted = await shard.run(
            this.constructor.SCHEMA.delete(this[ID]),
            this.vc.toAnnotation(),
            this.vc.timeline(shard, this.constructor.SCHEMA.name),
            this.vc.freshness
          );

          if (deleted) {
            await mapJoin(this.constructor.INVERSES, async (inverse) =>
              inverse.afterDelete(
                this.vc,
                (this as any)[inverse.id2Field] as string | null,
                this[ID]
              )
            );
          }

          return deleted;
        },
        this.vc,
        this as Row<TTable>
      );
    }

    /**
     * Since we disabled the constructor (to not let users call it manually and
     * create fake Ents), we simulate its behavior manually. This method is very
     * critical to performance since the code normally loads LOTS of Ents.
     */
    private static async createEnt(
      vc: VC,
      row: Row<TTable>
    ): Promise<PrimitiveInstance<TTable>> {
      // If we've already created an Ent for this exact (row, VC, EntClass),
      // return it. This covers a very frequent case when the same Ent is loaded
      // multiple times concurrently from different places, so the DB query is
      // coalesced into one load. We're coalescing the Ent too which saves LOTS
      // of CPU (spent in this.VALIDATION otherwise) and also enables memoized
      // Ent methods to work much more efficiently.
      const creator = memoize2(
        row,
        $CACHED_ENT,
        async (vc: VC, _EntCls: any) => {
          // Try to reduce permissions and freshness for the injected VC. Also
          // turn the omni VC into an user-owning VC (or a guest). For most of
          // cases, this call is a no-op (we rarely upgrade/downgrade VCs).
          const wasOmniVC = vc.isOmni();
          vc = this.createLowerVC(vc, row);

          // Cloning is important here. Due to possible deduplication of exactly
          // same requests, the same row object can be returned twice, while we
          // request it with two different VCs. We don't want to create two Ents
          // sharing same row storage if they have different VCs, so we clone.
          const ent = Object.assign(Object.create(this.prototype), row);
          Object.defineProperty(ent, "vc", {
            value: vc,
            enumerable: false, // to safely run JSON.stringify() on an Ent
            writable: false,
          });

          if (!wasOmniVC) {
            await this.VALIDATION.validateLoad(vc, ent);
          }

          return ent;
        }
      );
      const ent = await creator(vc, this);

      ent.vc.cache(IDsCacheReadable).add(ent[ID]);
      if (vc !== ent.vc) {
        vc.cache(IDsCacheReadable).add(ent[ID]);
      }

      return ent;
    }

    /**
     * We never create an Ent with ent.vc = omni; instead, we lower permissions
     * to either the Ent's owner (if tenantUserIDField is used, or if it has a
     * field pointing to VC) or to a guest VC.
     */
    private static createLowerVC(vc: VC, row: Row<TTable>) {
      let rowUserID: string | null = null;
      if (vc.isOmni()) {
        if (this.VALIDATION.tenantUserIDField) {
          rowUserID =
            (row[this.VALIDATION.tenantUserIDField as any] as any) ?? null;
        }

        if (!rowUserID) {
          for (const rule of this.VALIDATION.load) {
            if (
              rule.predicate instanceof OutgoingEdgePointsToVC &&
              row[rule.predicate.field]
            ) {
              rowUserID = row[rule.predicate.field] as string;
              break;
            }
          }
        }
      } else {
        rowUserID = vc.userID;
      }

      return vc.toLowerInternal(rowUserID);
    }

    constructor() {
      super();
      throw Error("Don't create Ents manually, use static loaders");
    }
  }

  return PrimitiveMixin as PrimitiveClass<TTable, TUniqueKey, TClient>;
}

const $CACHED_ENT = Symbol("$CACHED_ENT");
