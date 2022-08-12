import { Client } from "../abstract/Client";
import { Cluster } from "../abstract/Cluster";
import { Shard } from "../abstract/Shard";
import { copyStack, mapJoin, nullthrows } from "../helpers";
import { $shardOfID, ID } from "../types";
import { GLOBAL_SHARD, ShardAffinity } from "./Configuration";
import { EntCannotDetectShardError } from "./errors/EntCannotDetectShardError";
import { EntNotFoundError } from "./errors/EntNotFoundError";
import { Inverse } from "./Inverse";
import { VC } from "./VC";

/**
 * Knows how to locate shard(s) based on various inputs. In some contexts, we
 * expect exactly one shard returned, and in other contexts, multiple shards are
 * okay.
 */
export class ShardLocator<TClient extends Client, TField extends string> {
  constructor(
    private cluster: Cluster<TClient>,
    private schemaName: string,
    private shardAffinity: ShardAffinity<TField>,
    private inverses: Array<Inverse<TClient, any>>
  ) {}

  /**
   * Called in a context when we must know exactly 1 shard to work with (e.g.
   * INSERT, UPSERT etc.).
   */
  singleShardFromInput(
    input: Record<string, any>,
    op: string,
    allowRandomShard: boolean
  ): Shard<TClient> {
    const shard = this.shardFromAffinity(input, allowRandomShard);
    if (!shard) {
      throw new EntCannotDetectShardError(
        this.schemaName,
        op,
        this.shardAffinity instanceof Array ? this.shardAffinity : [ID],
        input,
        this.shardAffinity
      );
    }

    return shard;
  }

  /**
   * Called in a context when multiple shards may be involved, e.g. when
   * selecting Ents referred by some inverses. May also return the empty list of
   * shards in case there are fields with inverses in input (i.e. the filtering
   * is correct), but there are no inverses in the database.
   */
  async multiShardsFromInput(
    vc: VC,
    input: Record<string, any>,
    op: string
  ): Promise<Array<Shard<TClient>>> {
    const singleShard = this.shardFromAffinity(input, false);
    if (singleShard) {
      return [singleShard];
    }

    const shards = new Set<Shard<TClient>>();
    let hadInputFieldsWithInverse = false;
    await mapJoin(this.inverses, async (inverse) => {
      const field = inverse.id2Field;
      const id1 = input[field];
      if (id1 !== undefined) {
        hadInputFieldsWithInverse = true;
        await mapJoin(id1 instanceof Array ? id1 : [id1], async (id1) => {
          const id2s = await inverse.id2s(vc, id1);
          for (const id2 of id2s) {
            shards.add(this.singleShardFromID(field, id2));
          }
        });
      }
    });

    if (!hadInputFieldsWithInverse) {
      const inverseFields = this.inverses.map(({ id2Field }) => id2Field);
      throw new EntCannotDetectShardError(
        this.schemaName,
        op,
        [
          ...(this.shardAffinity instanceof Array ? this.shardAffinity : [ID]),
          ...inverseFields,
        ],
        input,
        this.shardAffinity,
        inverseFields
      );
    }

    return [...shards.keys()];
  }

  /**
   * A wrapper for cluster.shard() which injects Ent name to the exception. This
   * is just a convenience for debugging.
   */
  singleShardFromID(field: string, id: string | null | undefined) {
    // ATTENTION: GLOBAL_SHARD has precedence over a shard number from ID (or
    // any other fields, since global tables may refer to global tables only).
    // This allows to move some previously sharded objects to the global shard
    // while doing some refactoring.
    if (this.shardAffinity === GLOBAL_SHARD) {
      return this.cluster.globalShard();
    }

    try {
      const shard = this.cluster.shard(nullthrows(id));
      if (shard.no === this.cluster.globalShard().no) {
        throw Error(
          "ID is from the global shard, although the Ent has a non-global shard affinity"
        );
      }

      return shard;
    } catch (origError) {
      if (origError instanceof Error) {
        const error = new EntNotFoundError(
          this.schemaName + (field !== ID ? "." + field : ""),
          id,
          origError.message
        );
        throw copyStack(error, origError);
      }

      throw origError;
    }
  }

  /**
   * All shards for this particular Ent depending on its affinity.
   */
  allShards() {
    return [...this.cluster.shards.values()].filter((shard) =>
      this.shardAffinity === GLOBAL_SHARD ? shard.no === 0 : shard.no !== 0
    );
  }

  private shardFromAffinity(
    input: Record<string, any>,
    allowRandomShard: boolean
  ): Shard<TClient> | null {
    // For a low number of a very global objects only. ATTENTION: GLOBAL_SHARD
    // has precedence over a shard number from ID! This allows to move some
    // previously sharded objects to the global shard while doing some
    // refactoring.
    if (this.shardAffinity === GLOBAL_SHARD) {
      return this.cluster.globalShard();
    }

    // Explicit info about which shard to use.
    if (input[$shardOfID] !== undefined) {
      return this.singleShardFromID($shardOfID, input[$shardOfID].toString());
    }

    // If we have Ent ID as a part of the request, we can just use it.
    if (input[ID] !== undefined) {
      return this.singleShardFromID(ID, input[ID].toString());
    }

    // An explicit list of fields is passed in SHARD_AFFINITY.
    if (this.shardAffinity instanceof Array) {
      for (const fromField of this.shardAffinity) {
        if (input[fromField]) {
          return this.singleShardFromID(fromField, input[fromField].toString());
        }
      }

      // RANDOM_SHARD works for INSERT only; for other operations, we must know
      // the shard in advance (either from ID or by deducing by affinity).
      return allowRandomShard ? this.cluster.randomShard() : null;
    }

    // Something weird, should never happen.
    return null;
  }
}
