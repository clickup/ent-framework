import flatten from "lodash/flatten";
import type { Client } from "../abstract/Client";
import type { Cluster } from "../abstract/Cluster";
import type { Query } from "../abstract/Query";
import type { Schema } from "../abstract/Schema";
import type { Shard } from "../abstract/Shard";
import { DefaultMap } from "../helpers/DefaultMap";
import Memoize from "../helpers/Memoize";
import { join, mapJoin } from "../helpers/misc";
import type { IDFieldsRequired, Row, Table } from "../types";
import { ID } from "../types";
import type { ShardAffinity } from "./Configuration";
import { GLOBAL_SHARD } from "./Configuration";
import type { VC } from "./VC";

/**
 * No DB unique indexes can include a nullable field and be really unique, so we
 * simulate id1=NULL via just storing "0" in the inverse, and Inverse abstracts
 * this fact from the caller.
 */
const ZERO_NULL = "0";

/**
 * Represents an inverse assoc manager which knows how to modify/query/fix
 * inverses. Parameter `name` is the inverse's schema name (in SQL like
 * databases, most likely a table name), and `type` holds both the name of the
 * "parent" entity and the field name of the child (e.g. "org2users" when a
 * field "org_id" in EntUser refers an EntOrg row).
 */
export class Inverse<TClient extends Client, TTable extends Table> {
  private cluster;
  private shardAffinity;
  private name;
  private inverseSchema;
  private InverseLoader;
  public readonly id2Field;
  public readonly type;

  constructor({
    cluster,
    shardAffinity,
    id2Schema,
    id2Field,
    name,
    type,
  }: {
    cluster: Cluster<TClient>;
    shardAffinity: ShardAffinity<string>;
    id2Schema: Schema<TTable>;
    id2Field: IDFieldsRequired<TTable>;
    name: string;
    type: string;
  }) {
    this.cluster = cluster;
    this.shardAffinity = shardAffinity;
    this.inverseSchema = Inverse.buildInverseSchema(id2Schema, name);
    this.id2Field = id2Field;
    this.name = name;
    this.type = type;
    this.InverseLoader = this.buildInverseLoaderClass();
  }

  /**
   * Runs before a row with a pre-generated id2 was inserted to the main schema.
   */
  async beforeInsert(vc: VC, id1: string | null, id2: string) {
    if (this.id2ShardIsInferrableFromShardAffinity(id1)) {
      return;
    }

    await this.run(
      vc,
      this.shard(id1),
      this.inverseSchema.insert({ id1: id1 ?? ZERO_NULL, type: this.type, id2 })
    );
  }

  /**
   * Runs after a row was updated in the main schema.
   */
  async afterUpdate(
    vc: VC,
    id1: string | null,
    id2: string,
    oldID1: string | null
  ) {
    if (id1 === oldID1) {
      return;
    }

    await join([
      this.afterDelete(vc, oldID1, id2),
      this.beforeInsert(vc, id1, id2),
    ]);
  }

  /**
   * Runs after a row was deleted in the main schema.
   */
  async afterDelete(vc: VC, id1: string | null, id2: string) {
    if (this.id2ShardIsInferrableFromShardAffinity(id1)) {
      return;
    }

    const row = await this.run(
      vc,
      this.shard(id1),
      this.inverseSchema.loadBy({ id1: id1 ?? "0", type: this.type, id2 })
    );
    if (row) {
      await this.run(vc, this.shard(id1), this.inverseSchema.delete(row.id));
    }
  }

  /**
   * Returns all id2s by a particular (id1, type) pair. The number of resulting
   * rows is limited to not overload the database.
   */
  async id2s(vc: VC, id1: string | null) {
    const rows = await vc.loader(this.InverseLoader).load(id1);
    return rows.map((row) => row.id2).sort();
  }

  /**
   * Creates an inverse schema which derives its id field's autoInsert from the
   * passed id2 schema. The returned schema is heavily cached, so batching for
   * it works efficiently even for different id2 schemas and different inverse
   * types (actually, it would work the same way even without @Memoize since
   * Runner batches by schema hash, not by schema object instance, but anyways).
   */
  @Memoize(
    (id2Schema: Schema<any>, name: string) =>
      id2Schema.table[ID].autoInsert + name
  )
  private static buildInverseSchema(id2Schema: Schema<any>, name: string) {
    return new id2Schema.constructor(
      name,
      {
        id: { type: ID, autoInsert: id2Schema.table[ID].autoInsert },
        created_at: { type: Date, autoInsert: "now()" },
        type: { type: String },
        id1: { type: ID },
        id2: { type: ID },
      },
      ["id1", "type", "id2"]
    );
  }

  /**
   * If the field is already mentioned in shardAffinity, and the referred parent
   * object (id1) exists, we won't need to create an inverse, because the engine
   * will be able to infer the target shard from shardAffinity. This method
   * would return true in such a case. In fact, we could've still create an
   * inverse for this case, but in sake of keeping the database lean, we don't
   * do it (useful when a field holds a reference to an "optionally sharded"
   * Ent, like sometimes it point so an Ent which is sharded, and sometimes on
   * an Ent in the global shard).
   */
  private id2ShardIsInferrableFromShardAffinity(id1: string | null) {
    return (
      id1 !== null &&
      this.cluster.shard(id1) !== this.cluster.globalShard() &&
      this.shardAffinity !== GLOBAL_SHARD &&
      this.shardAffinity.includes(this.id2Field)
    );
  }

  /**
   * A shortcut to run a query on the shard of id1.
   */
  private async run<TOutput>(
    vc: VC,
    shard: Shard<TClient>,
    query: Query<TOutput>
  ) {
    return shard.run(
      query,
      vc.toAnnotation(),
      vc.timeline(shard, `${this.name}:${this.type}`),
      vc.freshness
    );
  }

  /**
   * Returns a target shard for an id.
   */
  private shard(id: string | null) {
    // id1=NULL inverse is always put to the global shard.
    return id ? this.cluster.shard(id) : this.cluster.globalShard();
  }

  /**
   * Allows Inverse.id2s() to build more efficient SQL query to load the
   * requested inverses. Without InversesLoader, having 50 id1s even for the
   * same type, Ent framework would issue a SELECT query with 50 "UNION ALL"
   * clauses, and with this loader, there will be only a plain regular SELECT
   * expression in this example.
   *
   * Why do we build this Loader class dynamically? Because the Loader is per
   * inverse type: i.e. we make the type constant and then vary id1. We can't
   * vary both of them, because e.g. in PG, there is no index-matching way of
   * running the queries like:
   *
   * ```
   * WHERE (id1, type) IN ((1, 'typeA'), ('2', 'typeA'), (3, 'typeB'))
   * ```
   *
   * Despite the above syntax is formally supported in SQL and in PG, for some
   * weird reason, PG doesn't utilize an index on (id1, type) efficiently on
   * such queries; that's also the reason why SQLRunnerLoadBy only varies the
   * last field in the unique key and not all of them.
   */
  private buildInverseLoaderClass() {
    const self = this;

    return class InverseLoader {
      private id1sByShard = new DefaultMap<Shard<TClient>, Set<string>>();
      private results = new DefaultMap<
        string,
        Array<Row<ReturnType<typeof Inverse.buildInverseSchema>["table"]>>
      >();

      constructor(private vc: VC) {}

      onCollect(id1: string | null) {
        this.id1sByShard.getOrAdd(self.shard(id1), Set).add(id1 ?? ZERO_NULL);
      }

      onReturn(id1: string | null) {
        return this.results.get(id1 ?? ZERO_NULL) ?? [];
      }

      async onFlush() {
        const rows = flatten(
          await mapJoin([...this.id1sByShard], async ([shard, id1s]) =>
            self.run(
              this.vc,
              shard,
              self.inverseSchema.select({
                where: { type: self.type, id1: [...id1s] },
                limit: Number.MAX_SAFE_INTEGER,
              })
            )
          )
        );
        for (const row of rows) {
          this.results.getOrAdd(row.id1, Array).push(row);
        }
      }
    };
  }
}
