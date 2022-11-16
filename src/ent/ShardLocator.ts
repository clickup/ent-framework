import type { Client } from "../abstract/Client";
import type { Cluster } from "../abstract/Cluster";
import type { Shard } from "../abstract/Shard";
import ShardError from "../abstract/ShardError";
import { copyStack, mapJoin } from "../helpers/misc";
import { ID } from "../types";
import type { ShardAffinity } from "./Configuration";
import { GLOBAL_SHARD } from "./Configuration";
import { EntCannotDetectShardError } from "./errors/EntCannotDetectShardError";
import { EntNotFoundError } from "./errors/EntNotFoundError";
import type { Inverse } from "./Inverse";
import type { VC } from "./VC";
import { GUEST_ID } from "./VC";

/**
 * Knows how to locate shard(s) based on various inputs. In some contexts, we
 * expect exactly one shard returned, and in other contexts, multiple shards are
 * okay.
 */
export class ShardLocator<TClient extends Client, TField extends string> {
  private cluster;
  private entName;
  private shardAffinity;
  private uniqueKey;
  private inverses;
  private globalShard;

  constructor({
    cluster,
    entName,
    shardAffinity,
    uniqueKey,
    inverses,
  }: {
    cluster: Cluster<TClient>;
    entName: string;
    shardAffinity: ShardAffinity<TField>;
    uniqueKey: readonly string[] | undefined;
    inverses: ReadonlyArray<Inverse<TClient, any>>;
  }) {
    this.cluster = cluster;
    this.entName = entName;
    this.shardAffinity = shardAffinity;
    this.uniqueKey = uniqueKey;
    this.inverses = inverses;
    this.globalShard = cluster.globalShard();
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
  async singleShardFromInput(
    input: Record<string, any>,
    op: string,
    fallbackToRandomShard: boolean
  ): Promise<Shard<TClient>> {
    let shard = await this.shardFromAffinity(input);

    if (!shard && fallbackToRandomShard) {
      shard = await this.cluster.randomShard(
        this.uniqueKey?.length
          ? this.uniqueKey.map((field) => input[field])
          : undefined
      );
    }

    if (!shard) {
      throw new EntCannotDetectShardError(
        this.entName,
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
    const singleShard = await this.shardFromAffinity(input);
    if (singleShard) {
      return [singleShard];
    }

    // Scan inverses from left to right (assuming the leftmost inverses are
    // lower in cardinality) and check whether our input has a filtering field
    // defined for that inverse. If so, locate shards based on that 1st found
    // field only (because it makes no sense to move to the next inverse if we
    // can use a previous inverse already).
    let hadInputFieldWithInverse = false;
    const shards = new Set<Shard<TClient>>();
    for (const inverse of this.inverses) {
      const field = inverse.id2Field;
      const id1 = input[field];
      if (id1 !== undefined) {
        hadInputFieldWithInverse = true;
        await mapJoin(id1 instanceof Array ? id1 : [id1], async (id1) => {
          const id2s = await inverse.id2s(vc, id1);
          for (const id2 of id2s) {
            const shard = await this.singleShardFromID(field, id2);
            if (shard) {
              shards.add(shard);
            }
          }
        });
        break;
      }
    }

    if (!hadInputFieldWithInverse) {
      const inverseFields = this.inverses.map(({ id2Field }) => id2Field);
      throw new EntCannotDetectShardError(
        this.entName,
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

    return [...shards];
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
  async singleShardFromID(field: string, id: string | null | undefined) {
    try {
      let shard: Shard<TClient>;

      // GLOBAL_SHARD has precedence over a shard number from ID (or any other
      // fields, since global tables may refer to global tables only). This allows
      // to move some previously sharded objects to the global shard while doing
      // some refactoring.
      if (this.shardAffinity === GLOBAL_SHARD) {
        shard = this.globalShard;
      } else if (id === GUEST_ID) {
        throw new ShardError(
          `can't locate shard; most likely you're trying to use a guest VC's principal instead of an ID`
        );
      } else {
        if (id === null || id === undefined) {
          throw new ShardError(`can't locate shard`);
        }

        shard = this.cluster.shard(id);
        if (shard.no === this.globalShard.no) {
          // We're trying to load a sharded Ent using an ID from the global
          // shard. We know for sure that there will be no such Ent there then.
          return null;
        }
      }

      // We want to throw early to wrap the possible exception with
      // EntNotFoundError below.
      await shard.assertDiscoverable();

      return shard;
    } catch (origError) {
      if (origError instanceof ShardError) {
        throw copyStack(
          new EntNotFoundError(
            this.entName,
            { [field]: id },
            origError.message
          ),
          origError
        );
      } else {
        throw origError;
      }
    }
  }

  /**
   * All shards for this particular Ent depending on its affinity.
   */
  async allShards(): Promise<ReadonlyArray<Shard<TClient>>> {
    return this.shardAffinity === GLOBAL_SHARD
      ? [this.globalShard]
      : this.cluster.nonGlobalShards();
  }

  /**
   * Infers shard number from shardAffinity info and the input record. Returns
   * null if it can't do this; the caller should likely throw in this case
   * (although not always).
   */
  private async shardFromAffinity(input: Record<string, any>) {
    // For a low number of a very global objects only. ATTENTION: GLOBAL_SHARD
    // has precedence over a shard number from ID! This allows to move some
    // previously sharded objects to the global shard while doing some
    // refactoring.
    if (this.shardAffinity === GLOBAL_SHARD) {
      return this.globalShard;
    }

    // Explicit info about which shard to use.
    if (input.$shardOfID !== undefined) {
      return this.singleShardFromID("$shardOfID", input.$shardOfID?.toString());
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
