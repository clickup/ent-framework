import type { Client } from "../abstract/Client";
import type { Cluster } from "../abstract/Cluster";
import type { Query } from "../abstract/Query";
import type { Schema } from "../abstract/Schema";
import { join } from "../helpers";
import Memoize from "../Memoize";
import type { IDFieldsRequired, Table } from "../types";
import { ID } from "../types";
import type { ShardAffinity } from "./Configuration";
import { GLOBAL_SHARD } from "./Configuration";
import type { VC } from "./VC";

// For perf reasons, we return no more than that number of id2s per each id1.
const MAX_ID2_PER_ID1 = 1000;

// No DB unique indexes can include a nullable field and be really unique, so we
// simulate id1=NULL via just storing "0" in the inverse, and Inverse abstracts
// this fact from the caller.
const ZERO_NULL = "0";

/**
 * Represents an inverse assoc manager which knows how to modify/query/fix
 * inverses. Parameter `name` is the inverse's schema name (in SQL like
 * databases, most likely a table name), and `type` holds both the name of the
 * "parent" entity and the field name of the child (e.g. "org2users" when a
 * field "org_id" in EntUser refers an EntOrg row).
 */
export class Inverse<TClient extends Client, TTable extends Table> {
  public readonly cluster;
  public readonly shardAffinity;
  public readonly inverseSchema;
  public readonly id2Field;
  public readonly name;
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
      id1,
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
      id1,
      this.inverseSchema.loadBy({ id1: id1 ?? "0", type: this.type, id2 })
    );
    if (row) {
      await this.run(vc, id1, this.inverseSchema.delete(row.id));
    }
  }

  /**
   * Returns all id2s by a particular (id1, type) pair. The number of resulting
   * rows is limited to not overload the database.
   */
  async id2s(vc: VC, id1: string | null) {
    const rows = await this.run(
      vc,
      id1,
      this.inverseSchema.select({
        where: { id1: id1 ?? ZERO_NULL, type: this.type },
        limit: MAX_ID2_PER_ID1,
      })
    );
    return rows.map((row) => row.id2).sort();
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
    id1: string | null,
    query: Query<TOutput>
  ) {
    // id1=NULL inverse is always put to the global shard.
    const shard = id1 ? this.cluster.shard(id1) : this.cluster.globalShard();
    return shard.run(
      query,
      vc.toAnnotation(),
      vc.timeline(shard, this.name + ":" + this.type),
      vc.freshness
    );
  }

  /**
   * Creates an inverse schema which derives its id field's autoInsert from the
   * passed id2 schema. The returned schema is heavily cached, so batching for
   * it works efficiently even for different id2 schemas.
   */
  @Memoize(
    (schema: Schema<Table>, name: string) => schema.table[ID].autoInsert + name
  )
  private static buildInverseSchema<TTable extends Table>(
    schema: Schema<TTable>,
    name: string
  ) {
    return new schema.constructor(
      name,
      {
        id: { type: ID, autoInsert: schema.table[ID].autoInsert! },
        type: { type: String },
        id1: { type: ID },
        id2: { type: ID },
      },
      ["id1", "type", "id2"]
    );
  }
}
