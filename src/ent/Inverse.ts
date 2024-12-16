import { Memoize } from "fast-typescript-memoize";
import type { Client } from "../abstract/Client";
import type { Cluster } from "../abstract/Cluster";
import type { Query } from "../abstract/Query";
import type { Schema } from "../abstract/Schema";
import type { Shard } from "../abstract/Shard";
import type { DesperateAny } from "../internal/misc";
import { join } from "../internal/misc";
import type { FieldOfIDTypeRequired, Table } from "../types";
import { ID } from "../types";
import type { ShardAffinity } from "./ShardAffinity";
import { GLOBAL_SHARD } from "./ShardAffinity";
import type { VC } from "./VC";

/**
 * No DB unique indexes can include a nullable field and be really unique, so we
 * simulate id1=NULL via just storing "0" in the Inverse, and Inverse abstracts
 * this fact from the caller.
 */
const ZERO_NULL = "0";

/**
 * Represents an Inverse assoc manager which knows how to modify/query Inverses.
 * Parameter `name` is the Inverse's schema name (in relational databases, most
 * likely a table name), and `type` holds both the name of the "parent" entity
 * and the field name of the child (e.g. "org2users" when a field "org_id" in
 * EntUser refers an EntOrg row).
 */
export class Inverse<TClient extends Client, TTable extends Table> {
  private cluster;
  private shardAffinity;
  private name;
  private inverseSchema;
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
    id2Field: FieldOfIDTypeRequired<TTable>;
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
   * Returns true if the Inverse row was actually inserted in the DB.
   */
  async beforeInsert(
    vc: VC,
    id1: string | null,
    id2: string,
  ): Promise<boolean> {
    if (this.id2ShardIsInferrableFromShardAffinity(id1)) {
      return false;
    }

    const id = await this.run(
      vc,
      this.shard(id1),
      this.inverseSchema.insert({
        type: this.type,
        id1: id1 ?? ZERO_NULL,
        id2,
      }),
    );
    return id !== null;
  }

  /**
   * Runs after a row was updated in the main schema.
   */
  async afterUpdate(
    vc: VC,
    id1: string | null,
    id2: string,
    oldID1: string | null,
  ): Promise<void> {
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
  async afterDelete(vc: VC, id1: string | null, id2: string): Promise<void> {
    if (this.id2ShardIsInferrableFromShardAffinity(id1)) {
      return;
    }

    const row = await this.run(
      vc,
      this.shard(id1),
      this.inverseSchema.loadBy({
        type: this.type,
        id1: id1 ?? ZERO_NULL,
        id2,
      }),
    );
    if (row) {
      await this.run(vc, this.shard(id1), this.inverseSchema.delete(row[ID]));
    }
  }

  /**
   * Returns all id2s by a particular (id1, type) pair. The number of resulting
   * rows is limited to not overload the database.
   */
  async id2s(vc: VC, id1: string | null): Promise<string[]> {
    const rows = await this.run(
      vc,
      this.shard(id1),
      this.inverseSchema.selectBy({
        type: this.type,
        id1: id1 ?? ZERO_NULL,
      }),
    );
    return rows.map((row) => row.id2).sort();
  }

  /**
   * Creates an Inverse schema which derives its id field's autoInsert from the
   * passed id2 schema. The returned schema is heavily cached, so batching for
   * it works efficiently even for different id2 schemas and different Inverse
   * types (actually, it would work the same way even without `@Memoize` since
   * Runner batches by schema hash, not by schema object instance, but anyways).
   */
  @Memoize(
    (id2Schema: Schema<DesperateAny>, name: string) =>
      id2Schema.table[ID].autoInsert + name,
  )
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private static buildInverseSchema(
    id2Schema: Schema<DesperateAny>,
    name: string,
  ) {
    return new id2Schema.constructor(
      name,
      {
        id: { type: ID, autoInsert: id2Schema.table[ID].autoInsert },
        created_at: { type: Date, autoInsert: "now()" },
        type: { type: String },
        id1: { type: ID },
        id2: { type: ID },
      },
      ["type", "id1", "id2"],
    );
  }

  /**
   * If the field is already mentioned in shardAffinity, and the referred parent
   * object (id1) exists, we won't need to create an Inverse, because the engine
   * will be able to infer the target Shard from shardAffinity. This method
   * would return true in such a case. In fact, we could've still create an
   * Inverse for this case, but in sake of keeping the database lean, we don't
   * do it (useful when a field holds a reference to an "optionally sharded"
   * Ent, like sometimes it point so an Ent which is sharded, and sometimes on
   * an Ent in the global Shard).
   */
  private id2ShardIsInferrableFromShardAffinity(id1: string | null): boolean {
    return (
      id1 !== null &&
      this.cluster.shard(id1) !== this.cluster.globalShard() &&
      this.shardAffinity !== GLOBAL_SHARD &&
      this.shardAffinity.includes(this.id2Field)
    );
  }

  /**
   * A shortcut to run a query on the Shard of id1.
   */
  private async run<TOutput>(
    vc: VC,
    shard: Shard<TClient>,
    query: Query<TOutput>,
  ): Promise<TOutput> {
    return shard.run(
      query,
      vc.toAnnotation(),
      vc.timeline(shard, `${this.name}:${this.type}`),
      vc.freshness,
    );
  }

  /**
   * Returns a target Shard for an id.
   */
  private shard(id: string | null): Shard<TClient> {
    // id1=NULL Inverse is always put to the global Shard.
    return id ? this.cluster.shard(id) : this.cluster.globalShard();
  }
}
