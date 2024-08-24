import delay from "delay";
import { Memoize } from "fast-typescript-memoize";
import defaults from "lodash/defaults";
import random from "lodash/random";
import pTimeout from "p-timeout";
import { CachedRefreshedValue } from "../internal/CachedRefreshedValue";
import type {
  DesperateAny,
  MaybeCallable,
  MaybeError,
  PickPartial,
} from "../internal/misc";
import {
  nullthrows,
  mapJoin,
  runInVoid,
  objectHash,
  maybeCall,
  jsonHash,
} from "../internal/misc";
import { Registry } from "../internal/Registry";
import type { Client } from "./Client";
import { ClientError } from "./ClientError";
import { Island } from "./Island";
import type { LocalCache } from "./LocalCache";
import type { Loggers } from "./Loggers";
import { Shard } from "./Shard";
import { ShardError } from "./ShardError";

/**
 * Options for Cluster constructor.
 */
export interface ClusterOptions<TClient extends Client, TNode> {
  /** Islands configuration of the Cluster. */
  islands: MaybeCallable<
    ReadonlyArray<{ no: number; nodes: readonly TNode[] }>
  >;
  /** Given a node of some Island, instantiates a Client for this node. Called
   * when a new node appears in the Cluster statically or dynamically. */
  createClient: (node: TNode) => TClient;
  /** Loggers to be injected into all Clients returned by createClient(). */
  loggers: Loggers;
  /** An instance of LocalCache which may be used for auxillary purposes when
   * discovering Shards/Clients. */
  localCache?: LocalCache | null;
  /** How often to run Shards rediscovery in normal circumstances. */
  shardsDiscoverIntervalMs?: MaybeCallable<number>;
  /** How often to recheck for changes in options.islands (typically, often,
   * since it's assumed that options.islands calculation is cheap). If the
   * Cluster configuration is changed, then we trigger rediscovery ASAP. */
  shardsDiscoverRecheckIslandsIntervalMs?: MaybeCallable<number>;
  /** Used in the following situations:
   * 1. If we think that we know Island of a particular Shard, but an attempt to
   *    access it fails, this means that maybe the Shard is migrating to another
   *    Island. In this case, we wait a bit and retry that many times. We should
   *    not do it too many times though, because all DB requests will be blocked
   *    waiting for the resolution.
   * 2. If we sent a write request to a Client, but it appeared that this Client
   *    is a replica, and the master moved to some other Client. In this case,
   *    we wait a bit and ping all Clients of the Island to refresh, who is
   *    master and who is replica. */
  locateIslandErrorRetryCount?: MaybeCallable<number>;
  /** How much time to wait before we retry rediscovering the entire Cluster.
   * The time here should be just enough to wait for switching the Shard from
   * one Island to another (typically quick). */
  locateIslandErrorRediscoverClusterDelayMs?: MaybeCallable<number>;
  /** How much time to wait before sending discover requests to all Clients of
   * the Island trying to find the new master. The time here may reach several
   * seconds, since some DBs shut down the old master and promote some replica
   * to it not simultaneously. */
  locateIslandErrorRediscoverIslandDelayMs?: MaybeCallable<number>;
}

/**
 * Holds the complete auto-discovered and non-contradictory snapshot of Islands
 * and a map of Shards to figure out, which Island each Shard is located on.
 */
interface ShardsDiscovered<TClient extends Client> {
  islandNoToIsland: Map<number, Island<TClient>>;
  shardNoToIslandNo: ReadonlyMap<number, number>;
  nonGlobalShardNos: readonly number[];
}

/**
 * Cluster is a collection of Islands and an orchestration of shardNo -> Island
 * resolution.
 *
 * It's unknown beforehand, which Island some particular Shard belongs to; the
 * resolution is done asynchronously and lazily.
 *
 * Shard 0 is a special "global" Shard.
 */
export class Cluster<TClient extends Client, TNode = DesperateAny> {
  /** Default values for the constructor options. */
  static readonly DEFAULT_OPTIONS: Required<
    PickPartial<ClusterOptions<Client, never>>
  > = {
    localCache: null,
    shardsDiscoverIntervalMs: 10000,
    shardsDiscoverRecheckIslandsIntervalMs: 500,
    locateIslandErrorRetryCount: 2,
    locateIslandErrorRediscoverClusterDelayMs: 1000,
    locateIslandErrorRediscoverIslandDelayMs: 5000,
  };

  /** The complete registry of all initialized Clients. Cluster nodes may change
   * at runtime, so once a new node appears, its Client is added to the
   * registry. Also, the Clients of disappeared nodes are eventually removed
   * from the registry on the next Shards discovery. */
  private clientRegistry: Registry<TNode, Client>;
  /** The complete registry of all Islands ever created. If some Island changes
   * configuration, its old version is eventually removed from the registry
   * during the next Shards discovery. */
  private islandRegistry: Registry<
    { no: number; nodes: readonly TNode[]; clients: readonly Client[] },
    Island<Client>
  >;
  /** Represents the result of the recent successful Shards discovery. */
  private shardsDiscoverCache: CachedRefreshedValue<ShardsDiscovered<TClient>>;
  /** A handler which extracts Shard number from an ID (derived from some node's
   * Client assuming they all have the same logic). */
  private shardNoByID: (id: string) => number;
  /** Once set to true, Clients for newly appearing nodes will be pre-warmed. */
  private prewarmEnabled = false;

  /** Cluster configuration options. */
  readonly options: Required<ClusterOptions<TClient, TNode>>;

  /**
   * Initializes the Cluster, but doesn't send any queries yet, even discovery
   * queries (also, no implicit prewarming).
   */
  constructor(options: ClusterOptions<TClient, TNode>) {
    this.options = defaults({}, options, Cluster.DEFAULT_OPTIONS);

    this.clientRegistry = new Registry<TNode, Client>({
      key: (node) => jsonHash(node),
      create: (node) => {
        const client = this.options.createClient(node);
        const loggers = { ...client.options.loggers };
        client.options.loggers = {
          swallowedErrorLogger: (props) => {
            this.options.loggers.swallowedErrorLogger(props);
            loggers.swallowedErrorLogger?.(props);
          },
          clientQueryLogger: (props) => {
            this.options.loggers.clientQueryLogger?.(props);
            loggers.clientQueryLogger?.(props);
          },
        };
        return client;
      },
      end: async (client) => {
        const startTime = performance.now();
        await client.end().catch((error) =>
          this.options.loggers.swallowedErrorLogger({
            where: `${this.constructor.name}.clientRegistry`,
            error,
            elapsed: performance.now() - startTime,
            importance: "normal",
          }),
        );
      },
    });

    this.islandRegistry = new Registry({
      key: ({ no, nodes }) => jsonHash({ no, nodes }),
      create: ({ no, clients }) =>
        new Island({
          no,
          clients,
          createShard: (no) => this.shardByNo(no),
          localCache: this.options.localCache ?? undefined,
        }),
    });

    const [client] = this.clientRegistry.getOrCreate(
      nullthrows(
        maybeCall(options.islands).find(({ nodes }) => nodes.length > 0),
        "The Cluster must have Islands with nodes",
      ).nodes[0],
    );
    this.shardNoByID = client.shardNoByID.bind(client);

    this.shardsDiscoverCache = new CachedRefreshedValue({
      delayMs: () => maybeCall(this.options.shardsDiscoverIntervalMs),
      warningTimeoutMs: () => maybeCall(this.options.shardsDiscoverIntervalMs),
      deps: {
        delayMs: () =>
          maybeCall(this.options.shardsDiscoverRecheckIslandsIntervalMs),
        handler: () => jsonHash(maybeCall(this.options.islands)),
      },
      resolverFn: async () => this.shardsDiscoverExpensive(),
      delay: async (ms) => delay(ms),
      onError: (error, elapsed) =>
        this.options.loggers.swallowedErrorLogger({
          where: `${this.constructor.name}.shardsDiscoverCache`,
          error,
          elapsed,
          importance: "normal",
        }),
    });
  }

  /**
   * Signals the Cluster to keep the Clients pre-warmed, e.g. open. (It's up to
   * the particular Client's implementation, what does a "pre-warmed Client"
   * mean; typically, it's keeping some minimal number of pooled connections.)
   */
  prewarm(): void {
    this.prewarmEnabled = true;
    runInVoid(async () => {
      for (const island of await this.islands()) {
        for (const client of island.clients) {
          client.prewarm();
        }
      }
    });
  }

  /**
   * Returns a global Shard of the Cluster. This method is made synchronous
   * intentionally, to defer the I/O and possible errors to the moment of the
   * actual query.
   */
  globalShard(): Shard<TClient> {
    return this.shardByNo(0);
  }

  /**
   * Returns all currently known (discovered) non-global Shards in the Cluster.
   */
  async nonGlobalShards(): Promise<ReadonlyArray<Shard<TClient>>> {
    const { nonGlobalShardNos } = await this.shardsDiscoverCache.cached();
    return nonGlobalShardNos.map((shardNo) => this.shardByNo(shardNo));
  }

  /**
   * Returns Shard of a particular id. This method is made synchronous
   * intentionally, to defer the I/O and possible errors to the moment of the
   * actual query.
   *
   * Why is it important? Because Shards may go up and down temporarily at
   * random moments of time. Imagine we made this method async and asserted that
   * the Shard is actually available at the moment when the method is called.
   * What would happen if the Shard object was stored somewhere as "successful"
   * by the caller, then the Island went down, and then a query is sent to the
   * Shard in, say, 20 seconds? We'd get an absolutely different exception, at
   * the moment of the query. We don't want this to happen: we want all of the
   * exceptions to be thrown with a consistent call stack (e.g. at the moment of
   * the query), no matter whether it was an immediate call or a deferred one.
   */
  shard(id: string): Shard<TClient> {
    return this.shardByNo(this.shardNoByID(id));
  }

  /**
   * Returns a random Shard among the ones which are currently known
   * (discovered) in the Cluster.
   */
  async randomShard(seed?: object): Promise<Shard<TClient>> {
    const { nonGlobalShardNos } = await this.shardsDiscoverCache.cached();

    let index;
    if (seed !== undefined) {
      const numHash = objectHash(seed).readUInt32BE();
      index = numHash % nonGlobalShardNos.length;
    } else {
      // TODO: implement power-of-two algorithm to pick the Shard which is
      // smallest in size.
      index = random(0, nonGlobalShardNos.length - 1);
    }

    return this.shardByNo(nonGlobalShardNos[index]);
  }

  /**
   * Returns an Island by its number.
   */
  async island(islandNo: number): Promise<Island<TClient>> {
    const { islandNoToIsland } = await this.shardsDiscoverCache.cached();
    return nullthrows(
      islandNoToIsland.get(islandNo),
      () => `No such Island: ${islandNo}`,
    );
  }

  /**
   * Returns all Islands in the Cluster.
   */
  async islands(): Promise<Array<Island<TClient>>> {
    const { islandNoToIsland } = await this.shardsDiscoverCache.cached();
    return [...islandNoToIsland.values()];
  }

  /**
   * Triggers shards rediscovery and finishes as soon as it's done. To be used
   * in unit tests mostly, because in real life, it's enough to just modify the
   * cluster configuration.
   */
  async rediscover(): Promise<void> {
    await this.shardsDiscoverCache.waitRefresh();
  }

  /**
   * The idea: for each Shard number (even for non-discovered yet Shard), we
   * keep the corresponding Shard object in a Memoize cache, so Shards with the
   * same number always resolve into the same Shard object. Then, an actual
   * Island locating process happens when the caller wants to get a Client of
   * that Shard (and it throws if such Shard hasn't been discovered actually).
   */
  @Memoize()
  private shardByNo(shardNo: number): Shard<TClient> {
    return new Shard(shardNo, async (body) =>
      this.runWithLocatedIsland(shardNo, body),
    );
  }

  /**
   * Runs the body function with retries. The Island injected into the body
   * function is located automatically by the Shard number.
   */
  private async runWithLocatedIsland<TRes>(
    shardNo: number,
    body: (island: Island<TClient>, attempt: number) => Promise<TRes>,
  ): Promise<TRes> {
    for (let attempt = 0; ; attempt++) {
      let island: Island<TClient>;
      try {
        // Re-read Islands map on every retry, because it might change.
        const startTime = performance.now();
        const { shardNoToIslandNo, islandNoToIsland } =
          await this.shardsDiscoverCache.cached();
        const islandNo = shardNoToIslandNo.get(shardNo);
        if (islandNo === undefined) {
          // Notice that we don't retry ShardError below (it's not a
          // ClientError) it to avoid DoS, since it could be e.g. a fake ID
          // passed to us by a user in some URL or something else. We still want
          // to log it through locateIslandErrorLogger() though.
          throw new ShardError(
            `Shard ${shardNo} is not discoverable (no such Shard in the Cluster? some Islands are down? connections limit?)`,
            "Islands " +
              [...islandNoToIsland.entries()]
                .map(([no, { clients }]) => `${no}@${clients[0].options.name}`)
                .join(", ") +
              `; cached discovery took ${Math.round(performance.now() - startTime)} ms`,
          );
        }

        // Retry the entire call to body(), to let it re-elect Client if needed.
        island = nullthrows(islandNoToIsland.get(islandNo));
        return await body(island, attempt);
      } catch (cause: unknown) {
        const error = cause as MaybeError | ClientError;
        this.options.loggers.locateIslandErrorLogger?.({ attempt, error });

        if (typeof error?.stack === "string" && attempt > 0) {
          error.stack =
            error.stack.trimEnd() + `\n    after ${attempt + 1} attempts`;
        }

        if (
          !(error instanceof ClientError) ||
          attempt >= maybeCall(this.options.locateIslandErrorRetryCount)
        ) {
          throw error;
        }

        switch (error.postAction) {
          case "rediscover-cluster":
            await this.rediscoverCluster();
            continue;
          case "rediscover-island":
            await this.rediscoverIsland(island!);
            continue;
          case "choose-another-client":
            continue;
          case "fail":
            throw error;
        }
      }
    }
  }

  /**
   * Runs the whole-cluster rediscover after a delay.
   *
   * Multiple concurrent calls to this method will be coalesced into one
   * (including the delay period):
   * 1. This protects against the burst of rediscover requests caused by
   *    multiple failing concurrent queries.
   * 2. It also allows to keep the queries batched when they are retried (i.e.
   *    the whole batch will be retried, not individual queries).
   */
  @Memoize({ clearOnResolve: true })
  private async rediscoverCluster(): Promise<void> {
    await delay(
      maybeCall(this.options.locateIslandErrorRediscoverClusterDelayMs),
    );
    // We don't want to wait forever if some Island is completely down.
    const startTime = performance.now();
    await pTimeout(
      this.shardsDiscoverCache.waitRefresh(),
      maybeCall(this.options.shardsDiscoverIntervalMs) * 2,
      "Timed out while waiting for whole-Cluster Shards discovery.",
    ).catch((error) =>
      this.options.loggers.swallowedErrorLogger({
        where: `${this.constructor.name}: waitRefresh`,
        error,
        elapsed: performance.now() - startTime,
        importance: "normal",
      }),
    );
  }

  /**
   * Runs Island#rediscover() after a delay.
   *
   * Multiple concurrent calls to this method will be coalesced into one
   * (including the delay period):
   * 1. This protects against the burst of rediscover requests caused by
   *    multiple failing concurrent queries.
   * 2. It also allows to keep the queries batched when they are retried (i.e.
   *    the whole batch will be retried, not individual queries).
   */
  @Memoize((island) => island.no, { clearOnResolve: true })
  private async rediscoverIsland(island: Island<TClient>): Promise<void> {
    await delay(
      maybeCall(this.options.locateIslandErrorRediscoverIslandDelayMs),
    );
    // We don't want to wait forever if the Island is completely down.
    const startTime = performance.now();
    await pTimeout(
      island.rediscover(),
      maybeCall(this.options.shardsDiscoverIntervalMs) * 2,
      `Timed out while waiting for Island ${island.no} Shards discovery.`,
    ).catch((error) =>
      this.options.loggers.swallowedErrorLogger({
        where: `${this.constructor.name}: Island.rediscover`,
        error,
        elapsed: performance.now() - startTime,
        importance: "normal",
      }),
    );
  }

  /**
   * Runs the actual Shards discovery queries over all Islands and updates the
   * mapping from each Shard number to an Island where it lives. These queries
   * may be expensive, so it's expected that the return Promise is heavily
   * cached by the caller code.
   */
  private async shardsDiscoverExpensive(): Promise<ShardsDiscovered<TClient>> {
    const seenKeys = new Set<string>();
    const islandNoToIsland = new Map<number, Island<TClient>>(
      maybeCall(this.options.islands).map(({ no, nodes }) => {
        const clients = nodes.map((node) => {
          const [client, key] = this.clientRegistry.getOrCreate(node);
          seenKeys.add(key);
          this.prewarmEnabled && client.prewarm();
          return client;
        });
        const [island, key] = this.islandRegistry.getOrCreate({
          no,
          nodes,
          clients,
        });
        seenKeys.add(key);
        return [no, island as Island<TClient>];
      }),
    );

    const shardNoToIslandNo = new Map<number, number>();
    const nonGlobalShardNos: number[] = [];

    await mapJoin(
      [...islandNoToIsland.entries()],
      async ([islandNo, island]) => {
        await island.rediscover();
        for (const shard of island.shards()) {
          const otherIslandNo = shardNoToIslandNo.get(shard.no);
          if (otherIslandNo !== undefined) {
            throw Error(
              `Shard #${shard.no} exists in more than one island: ` +
                islandNoToIsland.get(otherIslandNo)?.master().options.name +
                `(${otherIslandNo})` +
                " and " +
                island.master().options.name +
                `(${islandNo})`,
            );
          }

          shardNoToIslandNo.set(shard.no, islandNo);
          if (shard.no !== 0) {
            nonGlobalShardNos.push(shard.no);
          }
        }
      },
    );

    // Gracefully delete and disconnect the Clients which didn't correspond to
    // the list of nodes mentioned in this.options.islands, and also, delete
    // leftover Islands which are not used anymore. In case we don't reach this
    // point and threw earlier, it will eventually be reached on the next Shards
    // discovery iterations.
    for (const registry of [this.clientRegistry, this.islandRegistry]) {
      runInVoid(registry.deleteExcept(seenKeys));
    }

    // Return the updated ENTIRE snapshot.
    return {
      islandNoToIsland,
      shardNoToIslandNo,
      nonGlobalShardNos: nonGlobalShardNos.sort((a, b) => a - b),
    };
  }
}
