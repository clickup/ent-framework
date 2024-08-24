import { memoize2 } from "fast-typescript-memoize";
import compact from "lodash/compact";
import first from "lodash/first";
import flatten from "lodash/flatten";
import sum from "lodash/sum";
import type { Client } from "../../abstract/Client";
import { ClientError } from "../../abstract/ClientError";
import type { OmitNew } from "../../internal/misc";
import { hasKey, join, mapJoin } from "../../internal/misc";
import type {
  CountInput,
  ExistsInput,
  InsertInput,
  LoadByInput,
  Order,
  Row,
  SelectByInput,
  Table,
  UniqueKey,
  UpdateInput,
  Where,
} from "../../types";
import { ID } from "../../types";
import { EntNotInsertableError } from "../errors/EntNotInsertableError";
import { IDsCacheReadable, IDsCacheUpdatable } from "../predicates/Predicate";
import type { TriggerUpdateOrDeleteOldRow } from "../Triggers";
import type { UpdateOriginalInput } from "../types";
import type { VC } from "../VC";
import type { ConfigClass, ConfigInstance } from "./ConfigMixin";

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
   * immutable).
   * - This method can work with CAS; see $cas property of the passed object.
   * - If a special value "skip-if-someone-else-changed-updating-ent-props" is
   *   passed to $cas, then the list of props for CAS is brought from the input,
   *   and the values of these props are brought from the Ent itself (i.e. from
   *   `this`).
   * - If a special value, a list of field names, is passed to $cas, then it
   *   works like described above, but the list of prop names is brought from
   *   that list of field names.
   * - Returns false if there is no such object in the DB, or if CAS check
   *   didn't succeed.
   * - Returns true if the object was found and updated.
   */
  updateOriginal(input: UpdateOriginalInput<TTable>): Promise<boolean>;

  /**
   * Deletes the object in the DB. Returns true if the object was found. Keeps
   * the current object untouched (since it's immutable).
   */
  deleteOriginal(): Promise<boolean>;
}

export type PrimitiveClass<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
  TClient extends Client,
> = OmitNew<ConfigClass<TTable, TUniqueKey, TClient>> & {
  /**
   * Runs INSERT mutation for the Ent.
   * - The Shard is inferred from the input fields using SHARD_AFFINITY.
   * - Returns ID of the newly inserted row.
   * - Returns null if the Ent violates unique key constraints.
   * - If the Ent has some triggers set up, this will be translated into two
   *   schema operations: idGen() and insert(), and before-triggers will run in
   *   between having the ID known in advance.
   */
  insertIfNotExists: (
    vc: VC,
    input: InsertInput<TTable>,
  ) => Promise<string | null>;

  /**
   * Inserts an Ent or updates an existing one if unique key matches.
   * - Don't use upsert() too often, because upsert may still delete IDs even if
   *   the object was updated, not inserted (there is no good ways to solve this
   *   in some DB engines like relational DBs so far).
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
    this: new () => TEnt,
    vc: VC,
    id: string,
  ) => Promise<TEnt | null>;

  /**
   * Loads an Ent by its unique key. Returns null if no such Ent exists. Notice
   * that the key must be REALLY unique, otherwise the database may return
   * multiple items, and the API will break. Don't try to use this method with
   * non-unique keys!
   */
  loadByNullable: <TEnt extends PrimitiveInstance<TTable>>(
    this: new () => TEnt,
    vc: VC,
    input: LoadByInput<TTable, TUniqueKey>,
  ) => Promise<TEnt | null>;

  /**
   * Selects the list of Ents by their unique key prefix. The query can span
   * multiple Shards if their locations can be inferred from inverses related to
   * the fields mentioned in the query. Ordering of the results is not
   * guaranteed.
   */
  selectBy: <TEnt extends PrimitiveInstance<TTable>>(
    this: new () => TEnt,
    vc: VC,
    input: SelectByInput<TTable, TUniqueKey>,
  ) => Promise<TEnt[]>;

  /**
   * Selects the list of Ents by some predicate.
   * - The query can span multiple Shards if their locations can be inferred
   *   from inverses related to the fields mentioned in the query.
   * - In multi-Shard case, ordering of results is not guaranteed.
   * - In multi-Shard case, it may return more results than requested by limit
   *   (basically, limit is applied to each Shard individually). The caller has
   *   then freedom to reorder & slice the results as they wish.
   */
  select: <TEnt extends PrimitiveInstance<TTable>>(
    this: new () => TEnt,
    vc: VC,
    where: Where<TTable>,
    limit: number,
    order?: Order<TTable>,
    custom?: {},
  ) => Promise<TEnt[]>;

  /**
   * Same as select(), but returns data in chunks.
   * - Uses multiple select() queries under the hood.
   * - The query can span multiple Shards if their locations can be inferred
   *   from inverses related to the fields mentioned in the query.
   * - Ents in each chunk always belong to the same Shard and are ordered by ID
   *   (there is no support for custom ordering). Make sure you have the right
   *   index in the database.
   */
  selectChunked: <TEnt extends PrimitiveInstance<TTable>>(
    this: new () => TEnt,
    vc: VC,
    where: Where<TTable>,
    chunkSize: number,
    limit: number,
    custom?: {},
  ) => AsyncIterableIterator<TEnt[]>;

  /**
   * Returns count of Ents matching a predicate. The query can span multiple
   * Shards if their locations can be inferred from inverses related to the
   * fields mentioned in the query.
   */
  count: (vc: VC, where: CountInput<TTable>) => Promise<number>;

  /**
   * A more optimal approach than count() when we basically just need to know
   * whether we have "0 or not 0" rows.
   */
  exists: (vc: VC, where: ExistsInput<TTable>) => Promise<boolean>;

  /**
   * TS requires us to have a public constructor to infer instance types in
   * various places. We make this constructor throw if it's called.
   *
   * KLUDGE here: it should've been PrimitiveInstance<TTable> & Row<TTable>. But
   * unfortunately if we do so, TS disallows inheritance from PrimitiveClass and
   * thus breaks the chain of mixins. So we add Row<TTable> only at the very
   * late stage, in the latest mixin in the chain and not here.
   */
  new (): PrimitiveInstance<TTable>;
};

/**
 * Modifies the passed class adding support for the minimal number of basic Ent
 * operations. Internally, uses Schema abstractions to run them.
 */
export function PrimitiveMixin<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
  TClient extends Client,
>(
  Base: ConfigClass<TTable, TUniqueKey, TClient>,
): PrimitiveClass<TTable, TUniqueKey, TClient> {
  class PrimitiveMixin extends Base {
    override ["constructor"]!: typeof PrimitiveMixin;

    readonly vc!: VC;

    readonly [ID]: string;

    constructor() {
      super();
      throw Error("Don't create Ents manually, use static loaders");
    }

    static async insertIfNotExists(
      vc: VC,
      input: InsertInput<TTable>,
    ): Promise<string | null> {
      const [shard] = await join([
        this.SHARD_LOCATOR.singleShardForInsert(
          input,
          "insert", // falls back to random Shard
        ),
        vc.heartbeater.heartbeat(),
      ]);

      if (!vc.isOmni()) {
        await this.VALIDATION.validateInsert(vc, input);
      }

      if (this.TRIGGERS.hasInsertTriggers() || this.INVERSES.length > 0) {
        // We have some triggers or inverses; that means we must generate an ID
        // separately to let the before-triggers see it before the actual db
        // operation happens.
        const [id2, id2IsNewlyGenerated] = hasKey(ID, input)
          ? [input[ID], false]
          : [
              await shard.run(
                this.SCHEMA.idGen(),
                vc.toAnnotation(),
                vc.timeline(shard, this.SCHEMA.name),
                vc.freshness,
              ),
              true,
            ];
        vc.cache(IDsCacheUpdatable).add(id2); // to enable privacy checks in beforeInsert triggers

        // Inverses which we're going to create.
        const inverseRows = this.INVERSES.map((inverse) => ({
          inverse,
          id1: input[inverse.id2Field] as string | null,
          id2,
          canUndoInverseInsert: id2IsNewlyGenerated,
        }));

        let isInserted = false;
        let isKnownServerState = true;
        let lastError: unknown = undefined;
        try {
          // Preliminarily insert inverse rows to inverses table, even before we
          // insert the main Ent. This avoids race conditions for cases when
          // multiple Clients insert and load the main Ent simultaneously: in
          // terms of business logic, there is nothing too bad in having some
          // "extra" inverses in the database since they're only "hints" and are
          // used to resolve shard CANDIDATES.
          await mapJoin(inverseRows, async (inverseRow) => {
            const { inverse, id1, id2 } = inverseRow;
            if (!(await inverse.beforeInsert(vc, id1, id2))) {
              // We must not allow to even try undoing an Inverse creation in
              // case we know that we did not create it. (Some Inverses may
              // already exist beforehand, e.g. for the cases when Ent ID was
              // explicitly passed during its insertion.)
              inverseRow.canUndoInverseInsert = false;
            }
          });

          // Insert the actual Ent. On DB error, we'll get an exception, and on
          // a duplicate key violation (which is a business logic condition),
          // we'll get a null returned.
          return await this.TRIGGERS.wrapInsert(
            async (input) => {
              try {
                // Remember actuallyInsertedID received from exactly shard
                // INSERT operation, prior to the after-triggers kick in. This
                // allows to know that ID for inverse undo purposes in case some
                // after-trigger fails.
                const id = await shard.run(
                  this.SCHEMA.insert(input),
                  vc.toAnnotation(),
                  vc.timeline(shard, this.SCHEMA.name),
                  vc.freshness,
                );
                isInserted = !!id;
                return id;
              } catch (error: unknown) {
                // Do we know for sure whether the server applied the insert or
                // not? Some examples are: "connection reset" or PgBouncer
                // timeout: in those cases, it's quite possible that the insert
                // actually DID succeed internally, but we still received an
                // error, so we must NOT delete inverses as a cleanup action.
                isKnownServerState =
                  error instanceof ClientError &&
                  error.kind === "data-on-server-is-unchanged";
                throw error;
              }
            },
            vc,
            { ...input, [ID]: id2 },
          );
        } catch (e: unknown) {
          lastError = e;
          throw e;
        } finally {
          // There are 3 failure conditions here:
          // 1. There was an exception, but we don't know the state of PG server
          //    (it might or might not have applied the insert).
          // 2. There was an exception during the insert (in this case,
          //    isInserted will remain null due to the above initialization),
          //    and we received the response from PG.
          // 3. An insert resulted in a no-op due to unique constraints
          //    violation (and in this case, insert() will return null, and we
          //    will write false to isInserted).
          if (!isInserted && isKnownServerState) {
            // We couldn't insert the Ent due to an unique key violation or some
            // other DB error for which we know the exact PG server state. Try
            // to undo the inverses creation (but if we fail to undo, it's not a
            // big deal to have stale inverses in the DB since they are only
            // "hints" and affect Shard candidates locating). This logic looks
            // scary, but in real life, there is always an "inverses fixer"
            // service which removes orphaned inverses asynchronously.
            await mapJoin(
              inverseRows,
              async ({ inverse, id1, id2, canUndoInverseInsert }) => {
                if (canUndoInverseInsert) {
                  this.CLUSTER.options.loggers.swallowedErrorLogger({
                    where:
                      `(not an error, just a debug warning) PrimitiveMixin.insertIfNotExists(${this.name}), ` +
                      `undoing Inverse ${inverse.type} ${id1}->${id2}`,
                    error: lastError ?? Error("duplicate key on insert"),
                    elapsed: null,
                    importance: "low",
                  });
                  await inverse.afterDelete(vc, id1, id2).catch(() => {});
                }
              },
            );
          }
        }
      } else {
        // No insert triggers and no inverses: do just a plain insert.
        return shard.run(
          this.SCHEMA.insert(input),
          vc.toAnnotation(),
          vc.timeline(shard, this.SCHEMA.name),
          vc.freshness,
        );
      }
    }

    static async upsert(vc: VC, input: InsertInput<TTable>): Promise<string> {
      const [shard] = await join([
        this.SHARD_LOCATOR.singleShardForInsert(
          input,
          "upsert", // does not fallback to random Shard
        ),
        vc.heartbeater.heartbeat(),
      ]);

      if (
        this.TRIGGERS.hasInsertTriggers() ||
        this.TRIGGERS.hasUpdateTriggers()
      ) {
        throw new EntNotInsertableError(
          this.name,
          vc.toString(),
          input,
          "upsert cannot work with triggers defined since it doesn't know whether the row was inserted or updated in the database",
        );
      }

      if (this.INVERSES.length > 0) {
        throw new EntNotInsertableError(
          this.name,
          vc.toString(),
          input,
          "upsert cannot work with inverses since it doesn't know the old values of fields in the database",
        );
      }

      if (!vc.isOmni()) {
        await this.VALIDATION.validateInsert(vc, input);
      }

      const query = this.SCHEMA.upsert(input);
      const id = await shard.run(
        query,
        vc.toAnnotation(),
        vc.timeline(shard, this.SCHEMA.name),
        vc.freshness,
      );
      vc.cache(IDsCacheUpdatable).add(id);
      return id;
    }

    static async loadNullable(
      vc: VC,
      id: string,
    ): Promise<PrimitiveInstance<TTable> | null> {
      const [shard] = await join([
        this.SHARD_LOCATOR.singleShardFromID(ID, id, "loadNullable"),
        vc.heartbeater.heartbeat(),
      ]);
      if (!shard) {
        return null;
      }

      const query = this.SCHEMA.load(id);
      const row = await shard.run(
        query,
        vc.toAnnotation(),
        vc.timeline(shard, this.SCHEMA.name),
        vc.freshness,
      );
      return row ? this.createEnt(vc, row) : null;
    }

    static async loadByNullable(
      vc: VC,
      input: LoadByInput<TTable, TUniqueKey>,
    ): Promise<PrimitiveInstance<TTable> | null> {
      const [shards] = await join([
        this.SHARD_LOCATOR.multiShardsFromInput(vc, input, "loadBy"),
        vc.heartbeater.heartbeat(),
      ]);

      const rows = compact(
        await mapJoin(shards, async (shard) =>
          shard.run(
            this.SCHEMA.loadBy(input),
            vc.toAnnotation(),
            vc.timeline(shard, this.SCHEMA.name),
            vc.freshness,
          ),
        ),
      );
      const row = first(rows);
      return row ? this.createEnt(vc, row) : null;
    }

    static async selectBy(
      vc: VC,
      input: SelectByInput<TTable, TUniqueKey>,
    ): Promise<Array<PrimitiveInstance<TTable>>> {
      const [shards] = await join([
        this.SHARD_LOCATOR.multiShardsFromInput(vc, input, "selectBy"),
        vc.heartbeater.heartbeat(),
      ]);

      const ents = await mapJoin(shards, async (shard) => {
        const rows = await shard.run(
          this.SCHEMA.selectBy(input),
          vc.toAnnotation(),
          vc.timeline(shard, this.SCHEMA.name),
          vc.freshness,
        );
        return mapJoin(rows, async (row) => this.createEnt(vc, row));
      });

      return flatten(ents);
    }

    static async select(
      vc: VC,
      where: Where<TTable>,
      limit: number,
      order?: Order<TTable>,
      custom?: {},
    ): Promise<Array<PrimitiveInstance<TTable>>> {
      const [shards] = await join([
        this.SHARD_LOCATOR.multiShardsFromInput(vc, where, "select"),
        vc.heartbeater.heartbeat(),
      ]);

      const ents = await mapJoin(shards, async (shard) => {
        const rows = await shard.run(
          this.SCHEMA.select({ where, limit, order, custom }),
          vc.toAnnotation(),
          vc.timeline(shard, this.SCHEMA.name),
          vc.freshness,
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
      custom?: {},
    ): AsyncGenerator<Array<PrimitiveInstance<TTable>>, void, unknown> {
      const [shards] = await join([
        this.SHARD_LOCATOR.multiShardsFromInput(vc, where, "selectChunked"),
        vc.heartbeater.heartbeat(),
      ]);
      let lastSeenID = "0";

      while (true) {
        if (limit <= 0 || shards.length === 0) {
          return;
        }

        if (limit < chunkSize) {
          chunkSize = limit;
        }

        const cursoredWhere = {
          ...where,
          $and: [{ [ID]: { $gt: lastSeenID } }, ...(where.$and ?? [])],
        };

        await vc.heartbeater.heartbeat();

        const shard = shards[0];
        const rows = await shard.run(
          this.SCHEMA.select({
            where: cursoredWhere,
            limit: chunkSize,
            order: [{ [ID]: "ASC" }], // IMPORTANT for idCursor
            custom,
          }),
          vc.toAnnotation(),
          vc.timeline(shard, this.SCHEMA.name),
          vc.freshness,
        );

        if (rows.length > 0) {
          const chunk = await mapJoin(rows, async (row) =>
            this.createEnt(vc, row),
          );
          yield chunk;
          lastSeenID = chunk[chunk.length - 1][ID];
          limit -= chunk.length;
        }

        if (rows.length === 0 || rows.length < chunkSize) {
          shards.shift();
          lastSeenID = "0";
        }
      }
    }

    static async count(vc: VC, where: CountInput<TTable>): Promise<number> {
      const [shards] = await join([
        this.SHARD_LOCATOR.multiShardsFromInput(vc, where, "count"),
        vc.heartbeater.heartbeat(),
      ]);

      const counts = await mapJoin(shards, async (shard) =>
        shard.run(
          this.SCHEMA.count(where),
          vc.toAnnotation(),
          vc.timeline(shard, this.SCHEMA.name),
          vc.freshness,
        ),
      );

      return sum(counts);
    }

    static async exists(vc: VC, where: ExistsInput<TTable>): Promise<boolean> {
      const [shards] = await join([
        this.SHARD_LOCATOR.multiShardsFromInput(vc, where, "exists"),
        vc.heartbeater.heartbeat(),
      ]);

      const exists = await mapJoin(shards, async (shard) =>
        shard.run(
          this.SCHEMA.exists(where),
          vc.toAnnotation(),
          vc.timeline(shard, this.SCHEMA.name),
          vc.freshness,
        ),
      );

      return exists.some((v) => v);
    }

    async updateOriginal(
      inputIn: UpdateOriginalInput<TTable>,
    ): Promise<boolean> {
      const cas = inputIn.$cas;
      const input = (
        cas === "skip-if-someone-else-changed-updating-ent-props" ||
        cas instanceof Array
          ? {
              ...inputIn,
              $cas: Object.fromEntries(
                (cas instanceof Array ? cas : Object.keys(inputIn))
                  .filter((k) => !!this.constructor.SCHEMA.table[k])
                  .map((k) => [k, this[k as keyof this] ?? null]),
              ),
            }
          : inputIn
      ) as UpdateInput<TTable>;

      const [shard] = await join([
        this.constructor.SHARD_LOCATOR.singleShardFromID(
          ID,
          this[ID],
          "updateOriginal",
        ),
        this.vc.heartbeater.heartbeat(),
      ]);

      if (!this.vc.isOmni()) {
        await this.constructor.VALIDATION.validateUpdate(
          this.vc,
          this as Row<TTable>,
          input,
        );
      }

      if (!shard) {
        return false;
      }

      return this.constructor.TRIGGERS.wrapUpdate(
        async (input) => {
          const updated = await shard.run(
            this.constructor.SCHEMA.update(this[ID], input),
            this.vc.toAnnotation(),
            this.vc.timeline(shard, this.constructor.SCHEMA.name),
            this.vc.freshness,
          );

          if (updated) {
            this.vc.cache(IDsCacheUpdatable).add(this[ID]);
            await mapJoin(
              this.constructor.INVERSES,
              async (inverse) =>
                hasKey(inverse.id2Field, input) &&
                input[inverse.id2Field] !== undefined &&
                inverse.afterUpdate(
                  this.vc,
                  input[inverse.id2Field] as string | null,
                  this[ID],
                  (this as unknown as Record<string, string | null>)[
                    inverse.id2Field
                  ],
                ),
            );
          }

          return updated;
        },
        this.vc,
        this as TriggerUpdateOrDeleteOldRow<TTable>,
        input,
      );
    }

    async deleteOriginal(): Promise<boolean> {
      const [shard] = await join([
        this.constructor.SHARD_LOCATOR.singleShardFromID(
          ID,
          this[ID],
          "deleteOriginal",
        ),
        this.vc.heartbeater.heartbeat(),
      ]);

      if (!this.vc.isOmni()) {
        await this.constructor.VALIDATION.validateDelete(
          this.vc,
          this as Row<TTable>,
        );
      }

      if (!shard) {
        return false;
      }

      return this.constructor.TRIGGERS.wrapDelete(
        async () => {
          const deleted = await shard.run(
            this.constructor.SCHEMA.delete(this[ID]),
            this.vc.toAnnotation(),
            this.vc.timeline(shard, this.constructor.SCHEMA.name),
            this.vc.freshness,
          );

          if (deleted) {
            this.vc.cache(IDsCacheUpdatable).add(this[ID]);
            await mapJoin(this.constructor.INVERSES, async (inverse) =>
              inverse.afterDelete(
                this.vc,
                (this as unknown as Record<string, string | null>)[
                  inverse.id2Field
                ],
                this[ID],
              ),
            );
          }

          return deleted;
        },
        this.vc,
        this as TriggerUpdateOrDeleteOldRow<TTable>,
      );
    }

    /**
     * Since we disabled the constructor (to not let users call it manually and
     * create fake Ents), we simulate its behavior manually. This method is very
     * critical to performance since the code normally loads LOTS of Ents.
     */
    private static async createEnt(
      vc: VC,
      row: Row<TTable>,
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
        async (vc: VC, _EntCls: unknown) => {
          // Try to reduce permissions and freshness for the injected VC. Also
          // turn the omni VC into an user-owning VC (or a guest). For most of
          // cases, this call is a no-op (we rarely upgrade/downgrade VCs).
          const wasOmniVC = vc.isOmni();
          vc = await this.createLowerVC(vc, row);

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
        },
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
     * to either the Ent's owner (if tenantPrincipalField is used, or if it has a
     * field pointing to VC) or to a guest VC.
     */
    private static async createLowerVC(vc: VC, row: Row<TTable>): Promise<VC> {
      let newRowPrincipal: string | null;
      if (vc.isOmni()) {
        newRowPrincipal = null;

        if (this.VALIDATION.tenantPrincipalField) {
          newRowPrincipal = (row[this.VALIDATION.tenantPrincipalField] ??
            null) as string | null;
        }

        if (!newRowPrincipal) {
          newRowPrincipal = (await this.VALIDATION.inferPrincipal(vc, row))
            .principal;
        }
      } else {
        newRowPrincipal = vc.principal;
      }

      return vc.toLowerInternal(newRowPrincipal);
    }
  }

  return PrimitiveMixin as PrimitiveClass<TTable, TUniqueKey, TClient>;
}

const $CACHED_ENT = Symbol("$CACHED_ENT");
