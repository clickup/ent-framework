import uniq from "lodash/uniq";
import type { Client } from "../abstract/Client";
import type { Cluster } from "../abstract/Cluster";
import type { Shard } from "../abstract/Shard";
import { ShardError } from "../abstract/ShardError";
import { inspectCompact, mapJoin } from "../internal/misc";
import type { Table } from "../types";
import { ID } from "../types";
import { EntNotFoundError } from "./errors/EntNotFoundError";
import type { Inverse } from "./Inverse";
import type { ShardAffinity } from "./ShardAffinity";
import { GLOBAL_SHARD } from "./ShardAffinity";
import type { VC } from "./VC";
import { GUEST_ID } from "./VC";

/**
 * Knows how to locate Shard(s) based on various inputs. In some contexts, we
 * expect exactly one Shard returned, and in other contexts, multiple Shards are
 * okay.
 */
export class ShardLocator<
  TClient extends Client,
  TTable extends Table,
  TField extends string,
> {
  private cluster;
  private entName;
  private shardAffinity;
  private uniqueKey;
  private inverses;
  private globalShard;
  private idAndShardAffinity;

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
    inverses: ReadonlyArray<Inverse<TClient, TTable>>;
  }) {
    this.cluster = cluster;
    this.entName = entName;
    this.shardAffinity = shardAffinity;
    this.idAndShardAffinity = [
      ID,
      ...(this.shardAffinity instanceof Array ? this.shardAffinity : []),
    ];
    this.uniqueKey = uniqueKey;
    this.inverses = inverses;
    this.globalShard = cluster.globalShard();
  }

  /**
   * Called in a context when we must know exactly 1 Shard to work with (e.g.
   * INSERT, UPSERT etc.). If op === "insert" (fallback to random Shard), then
   * returns a random Shard in case when it can't infer the Shard number from
   * the input (used in e.g. INSERT operations); otherwise throws ShardError
   * (happens in e.g. UPSERT).
   *
   * The "randomness" of the "random Shard" is deterministic by the Ent's unique
   * key (if it's defined), so Ents with the same unique key will map to the
   * same "random" Shard (considering the total number of discovered Shards is
   * unchanged). Notice that this logic applies at INSERT time: since we often
   * times add Shards to the Cluster, we can't rely on it consistently at SELECT
   * time (but relying at INSERT time is more or less fine: it protects against
   * most of "unique key violation" problems, although still doesn't prevent all
   * of them for a fraction of the second when the number of Shards has just
   * been changed).
   */
  async singleShardForInsert(
    input: Record<string, unknown>,
    op: "insert" | "upsert",
  ): Promise<Shard<TClient>> {
    let shard = await this.singleShardFromAffinity(input, op);

    if (!shard && op === "insert") {
      shard = await this.cluster.randomShard(
        this.uniqueKey?.length
          ? this.uniqueKey.map((field) => input[field])
          : undefined,
      );
    }

    if (!shard) {
      throw new ShardError(
        this.buildShardErrorMessage({
          op,
          fields:
            this.shardAffinity instanceof Array ? this.shardAffinity : [ID],
          input,
        }),
      );
    }

    return shard;
  }

  /**
   * Called in a context when multiple Shards may be involved, e.g. when
   * selecting Ents referred by some Inverses. May also return the empty list of
   * Shards when, although there are fields with Inverses in input (i.e. the
   * filtering is correct), there are no Inverse rows existing in the database.
   */
  async multiShardsFromInput(
    vc: VC,
    input: Record<string, unknown>,
    op: string,
  ): Promise<Array<Shard<TClient>>> {
    const singleShard = await this.singleShardFromAffinity(input, op);
    if (singleShard) {
      return [singleShard];
    }

    // Scan Inverses from left to right (assuming the leftmost Inverses are
    // lower in cardinality) and check whether our input has a filtering field
    // defined for that Inverse. If so, locate Shards based on that 1st found
    // field only (because it makes no sense to move to the next Inverse if we
    // can use a previous Inverse already).
    let hadInputFieldWithInverse = false;
    const shards = new Set<Shard<TClient>>();
    for (const inverse of this.inverses) {
      const field = inverse.id2Field;
      const id1 = input[field];
      if (id1 !== undefined) {
        hadInputFieldWithInverse = true;
        await mapJoin(id1 instanceof Array ? id1 : [id1], async (id1) => {
          let id2s: string[];
          try {
            id2s = await inverse.id2s(vc, id1);
          } catch (e: unknown) {
            throw e instanceof ShardError
              ? new EntNotFoundError(this.entName, { [field]: id1 }, e)
              : e;
          }

          for (const id2 of id2s) {
            const shard = await this.singleShardFromID(field, id2, op);
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
      throw new ShardError(
        this.buildShardErrorMessage({
          op,
          fields: uniq([
            ...(this.shardAffinity instanceof Array
              ? this.shardAffinity
              : [ID]),
            ...inverseFields,
          ]),
          input,
        }),
      );
    }

    return [...shards];
  }

  /**
   * A wrapper for Cluster#shard() which injects Ent name to the exception (in
   * case of e.g. "Cannot locate Shard" exception). This is just a convenience
   * for debugging.
   *
   * If this method returns null, that means the caller should give up trying to
   * load the Ent with this ID, because it won't find it anyways (e.g. when we
   * try to load a sharded Ent using an ID from the global Shard). This is
   * identical to the case of an Ent not existing in the database.
   */
  async singleShardFromID(
    field: string,
    id: string | null | undefined,
    op: string,
  ): Promise<Shard<TClient> | null> {
    try {
      let shard: Shard<TClient>;

      // GLOBAL_SHARD has precedence over a Shard number from ID (or any other
      // fields, since global tables may refer to global tables only). This allows
      // to move some previously sharded objects to the global Shard while doing
      // some refactoring.
      if (this.shardAffinity === GLOBAL_SHARD) {
        shard = this.globalShard;
      } else if (id === GUEST_ID) {
        throw new ShardError(
          this.buildShardErrorMessage({
            op,
            why: "most likely you're trying to use a guest VC's principal instead of an ID",
          }),
        );
      } else {
        if (id === null || id === undefined) {
          throw new ShardError(
            this.buildShardErrorMessage({
              op,
              why: `you should not pass null or undefined value in "${field}" field`,
            }),
          );
        }

        shard = this.cluster.shard(id);

        if (shard.no === this.globalShard.no) {
          // We're trying to load a sharded Ent using an ID from the global
          // Shard. We know for sure that there will be no such Ent there then.
          return null;
        }
      }

      // We want to throw ShardError early to wrap the possible exception with
      // EntNotFoundError below. This is a little kludge, since on success, it
      // will call into Shard#options.locateClient() twice (here and when
      // running the actual query). Also, assertDiscoverable() is used only in
      // this single place.
      await shard.assertDiscoverable();

      return shard;
    } catch (e: unknown) {
      throw e instanceof ShardError
        ? new EntNotFoundError(this.entName, { [field]: id }, e)
        : e;
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
   * Infers Shard number from shardAffinity info and the input record.
   * - Returns null if it can't do this; the caller should likely throw in this
   *   case (although not always).
   * - If a field's value is an array of IDs from multiple Shards, then returns
   *   the 1st inferred Shard still. This is the current limitation: we don't
   *   even try to infer multiple Shards if we have some affinity fields in the
   *   request, which e.g. simplifies Ent creation logic. Cross-Shard logic is
   *   only enabled when using Inverses; see multiShardsFromInput().
   */
  private async singleShardFromAffinity(
    input: Record<string, unknown>,
    op: string,
  ): Promise<Shard<TClient> | null> {
    // For a low number of a very global objects only. ATTENTION: GLOBAL_SHARD
    // has precedence over a Shard number from ID! This allows to move some
    // previously sharded objects to the global Shard while doing some
    // refactoring.
    if (this.shardAffinity === GLOBAL_SHARD) {
      return this.globalShard;
    }

    // Explicit info about which Shard to use.
    if (input["$shardOfID"] !== undefined) {
      return this.singleShardFromID(
        "$shardOfID",
        input["$shardOfID"]?.toString(),
        op,
      );
    }

    // An explicit list of fields is passed in SHARD_AFFINITY.
    for (const fromField of this.idAndShardAffinity) {
      const fromValue = input[fromField];
      const value = fromValue instanceof Array ? fromValue[0] : fromValue;
      if (typeof value === "string" && value) {
        return this.singleShardFromID(fromField, value, op);
      }
    }

    // Couldn't detect Shard number from any of the sources.
    return null;
  }

  /**
   * A helper to build uniform ShardError error messages.
   */
  private buildShardErrorMessage({
    op,
    why,
    fields,
    input,
  }: { op: string } & (
    | { why: string; fields?: never; input?: never }
    | { why?: never; fields: readonly string[]; input: object }
  )): string {
    throw new ShardError(
      `${this.entName}: cannot detect shard in "${op}" query: ` +
        (typeof why === "string"
          ? why
          : (fields.length > 1
              ? `at least one of non-empty "${fields.join(", ")}" fields`
              : `non-empty "${fields[0]}" field`) +
            " must be present at TOP LEVEL of the input, but got " +
            inspectCompact(input)),
    );
  }
}
