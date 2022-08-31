import type { Client } from "../abstract/Client";
import type { Cluster } from "../abstract/Cluster";
import type { Shard } from "../abstract/Shard";
import { copyStack, mapJoin, nullthrows } from "../helpers";
import { ID } from "../types";
import type { ShardAffinity } from "./Configuration";
import { GLOBAL_SHARD } from "./Configuration";
import { EntCannotDetectShardError } from "./errors/EntCannotDetectShardError";
import { EntNotFoundError } from "./errors/EntNotFoundError";
import type { Inverse } from "./Inverse";
import type { VC } from "./VC";

/**
 * Knows how to locate shard(s) based on various inputs. In some contexts, we
 * expect exactly one shard returned, and in other contexts, multiple shards are
 * okay.
 */
export class ShardLocator<TClient extends Client, TField extends string> {
  private cluster;
  private schemaName;
  private shardAffinity;
  private uniqueKey;
  private inverses;

  constructor(options: {
    cluster: Cluster<TClient>;
    schemaName: string;
    shardAffinity: ShardAffinity<TField>;
    uniqueKey: readonly string[] | undefined;
    inverses: ReadonlyArray<Inverse<TClient, any>>;
  }) {
    this.cluster = options.cluster;
    this.schemaName = options.schemaName;
    this.shardAffinity = options.shardAffinity;
    this.uniqueKey = options.uniqueKey;
    this.inverses = options.inverses;
  }

  /**
   * Called in a context when we must know exactly 1 shard to work with (e.g.
   * INSERT, UPSERT etc.). If fallbackToRandomShard is true, then returns a
   * random shard in case when it can't infer the shard number from the input
   * (used in e.g. INSERT operations); otherwise throws
   * EntCannotDetectShardError (happens in e.g. upsert, loadBy etc.).
   *
   * The "randomness" of the "random shard" is deterministic by the Ent's unique
   * key (if it's defined), so Ents with the same unique key will map to the
   * same "random" shard. Notice that this logic mainly applies at creation
   * time: since we often times add shared to the cluster, we can't rely on it
   * consistently at select time (but relying at insert time is fine: it
   * protects against most of "unique key violation" problems).
   */
  singleShardFromInput(
    input: Record<string, any>,
    op: string,
    fallbackToRandomShard: boolean
  ): Shard<TClient> {
    let shard = this.shardFromAffinity(input);

    if (!shard && fallbackToRandomShard) {
      shard = this.cluster.randomShard(
        this.uniqueKey?.length
          ? this.uniqueKey.map((field) => input[field])
          : undefined
      );
    }

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
    const singleShard = this.shardFromAffinity(input);
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
            const shard = this.singleShardFromID(field, id2);
            if (shard) {
              shards.add(shard);
            }
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
   * A wrapper for cluster.shard() which injects Ent name to the exception (in
   * case of e.g. "Cannot locate shard" exception). This is just a convenience
   * for debugging.
   *
   * If this method returns null, that means the caller show give up trying to
   * load the Ent with this ID, because it won't find it anyways (e.g. when we
   * try to load a sharded Ent using an ID from the global shard). This is
   * identical to the case of an Ent not existing in the database.
   */
  singleShardFromID(field: string, id: string | null | undefined) {
    // GLOBAL_SHARD has precedence over a shard number from ID (or any other
    // fields, since global tables may refer to global tables only). This allows
    // to move some previously sharded objects to the global shard while doing
    // some refactoring.
    if (this.shardAffinity === GLOBAL_SHARD) {
      return this.cluster.globalShard();
    }

    try {
      const shard = this.cluster.shard(nullthrows(id));
      if (shard.no === this.cluster.globalShard().no) {
        // We're trying to load a sharded Ent using an ID from the global shard.
        // We know for sure that there will be no such Ent there then.
        return null;
      } else {
        return shard;
      }
    } catch (origError) {
      // E.g. "shard does not exist" error; we don't want to mute it.
      if (origError instanceof Error) {
        const error = new EntNotFoundError(
          this.schemaName + (field !== ID ? "." + field : ""),
          id,
          origError.message
        );
        throw copyStack(error, origError);
      } else {
        throw origError;
      }
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

  /**
   * Infers shard number from shardAffinity info and the input record. Returns
   * null if it can't do this; the caller should likely throw in this case
   * (although not always).
   */
  private shardFromAffinity(input: Record<string, any>): Shard<TClient> | null {
    // For a low number of a very global objects only. ATTENTION: GLOBAL_SHARD
    // has precedence over a shard number from ID! This allows to move some
    // previously sharded objects to the global shard while doing some
    // refactoring.
    if (this.shardAffinity === GLOBAL_SHARD) {
      return this.cluster.globalShard();
    }

    // Explicit info about which shard to use.
    if (input.$shardOfID !== undefined) {
      return this.singleShardFromID("$shardOfID", input.$shardOfID.toString());
    }

    // If we have Ent ID as a part of the request, we can just use it.
    if (input[ID] !== undefined) {
      return this.singleShardFromID(ID, input[ID].toString());
    }

    // An explicit list of fields is passed in SHARD_AFFINITY.
    if (this.shardAffinity instanceof Array) {
      for (const fromField of this.shardAffinity) {
        const value =
          input[fromField] instanceof Array
            ? input[fromField][0]
            : input[fromField];
        if (value) {
          return this.singleShardFromID(fromField, input[fromField].toString());
        }
      }
    }

    // Couldn't detect shard number from any of the sources.
    return null;
  }
}
