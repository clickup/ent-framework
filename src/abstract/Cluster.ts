import { inspect, types } from "util";
import delayMod from "delay";
import { Memoize } from "fast-typescript-memoize";
import defaults from "lodash/defaults";
import random from "lodash/random";
import pTimeout from "p-timeout";
import { CachedRefreshedValue } from "../internal/CachedRefreshedValue";
import type {
  Writeable,
  DesperateAny,
  MaybeCallable,
  MaybeError,
  PickPartial,
  MaybeAsyncCallable,
} from "../internal/misc";
import {
  nullthrows,
  mapJoin,
  runInVoid,
  objectHash,
  maybeCall,
  jsonHash,
  jitter,
  maybeAsyncCall,
} from "../internal/misc";
import { Registry } from "../internal/Registry";
import type { Client } from "./Client";
import { ClientError } from "./ClientError";
import { Island } from "./Island";
import type { LocalCache } from "./LocalCache";
import type { Loggers, SwallowedErrorLoggerProps } from "./Loggers";
import { Shard } from "./Shard";
import { ShardIsNotDiscoverableError } from "./ShardIsNotDiscoverableError";
import type { ShardNamer } from "./ShardNamer";

/** Same as vanilla delay(), but with unref()ed timers. */
const delay = delayMod.createWithTimers({
  setTimeout: (...args) => setTimeout(...args).unref(),
  clearTimeout: (...args) => clearTimeout(...args),
});

/**
 * Options for Cluster constructor.
 */
export interface ClusterOptions<TClient extends Client, TNode> {
  /** Islands configuration of the Cluster. */
  islands: MaybeAsyncCallable<ClusterIslands<TNode>>;
  /** Given a node of some Island, instantiates a Client for this node. Called
   * when a new node appears in the Cluster statically or dynamically. */
  createClient: (node: TNode) => TClient;
  /** Loggers to be injected into all Clients returned by createClient(). */
  loggers: Loggers;
  /** An instance of LocalCache which may be used for auxiliary purposes when
   * discovering Shards/Clients. */
  localCache?: LocalCache | null;
  /** How often to recheck for changes in `options.islands`. If it is SYNC, then
   * by default - often, like every 500 ms (since it's assumed that
   * `options.islands` calculation is cheap). If it is ASYNC, then by default -
   * not so often, every `shardsDiscoverIntervalMs` (we assume that getting the
   * list of Island nodes may be expensive, e.g. fetching from AWS API or so).
   * If the Islands list here changes, then we trigger Shards rediscovery and
   * Clients recreation ASAP. */
  reloadIslandsIntervalMs?: MaybeCallable<number>;
  /** Info on how to build/parse Shard names. */
  shardNamer?: ShardNamer | null;
  /** How often to run Shards rediscovery in normal circumstances. */
  shardsDiscoverIntervalMs?: MaybeCallable<number>;
  /** Jitter for shardsDiscoverIntervalMs and reloadIslandsIntervalMs. */
  shardsDiscoverIntervalJitter?: MaybeCallable<number>;
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
 * A type of `ClusterOptions#islands` property. Represents the full list of
 * Islands and their corresponding Nodes (masters and replicas).
 */
export type ClusterIslands<TNode> = ReadonlyArray<{
  no: number;
  nodes: readonly TNode[];
}>;

/**
 * Holds the complete auto-discovered and non-contradictory snapshot of Islands
 * and a map of Shards to figure out, which Island each Shard is located on.
 * Also, includes all errors which caused some Islands to be completely
 * undiscoverable (i.e. if we could not locate Shards on master and all
 * replicas, so we gave up for that Island till the next rediscovery).
 */
interface ShardsDiscovered<TClient extends Client> {
  islandNoToIsland: Map<number, Island<TClient>>;
  shardNoToIslandNo: ReadonlyMap<number, number>;
  nonGlobalShardNos: readonly number[];
  errors: SwallowedErrorLoggerProps[];
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
    shardNamer: null,
    shardsDiscoverIntervalMs: 10000,
    shardsDiscoverIntervalJitter: 0.2,
    reloadIslandsIntervalMs: NaN,
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
  /** Represents the result of the recent successful call to
   * `options.islands()`. */
  private islandsCache: CachedRefreshedValue<ClusterIslands<TNode>>;
  /** Represents the result of the recent successful Shards discovery. */
  private shardsDiscoverCache: CachedRefreshedValue<ShardsDiscovered<TClient>>;
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

    if (
      typeof this.options.reloadIslandsIntervalMs === "number" &&
      isNaN(this.options.reloadIslandsIntervalMs)
    ) {
      this.options.reloadIslandsIntervalMs = types.isAsyncFunction(
        this.options.islands,
      )
        ? maybeCall(this.options.shardsDiscoverIntervalMs)
        : 500;
    }

    this.clientRegistry = new Registry<TNode, Client>({
      key: (node) => jsonHash(node),
      create: (node) => {
        const client = this.options.createClient(node);
        client.options.shardNamer ??= this.options.shardNamer;
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
            elapsed: Math.round(performance.now() - startTime),
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

    this.islandsCache = new CachedRefreshedValue({
      delayMs: () =>
        Math.round(
          maybeCall(this.options.reloadIslandsIntervalMs) *
            jitter(maybeCall(this.options.shardsDiscoverIntervalJitter)),
        ),
      warningTimeoutMs: () => maybeCall(this.options.reloadIslandsIntervalMs),
      deps: {
        // If `options.islands` is reassigned externally (e.g. in a unit test),
        // then it will be reflected in `await this.islandsCache.cached()`
        // within `deps.delayMs` (not immediately). To expedite this (and Shards
        // map) recheck, call Cluster#rediscover().
        delayMs: 50,
        // We use the value of `options.islands` itself as a dependency, so if
        // `options.islands` is reassigned externally, then we'll catch the
        // change quickly, within `deps.delayMs`. We do NOT call
        // `options.islands()` intentionally, we use its value - since we just
        // want to check for reassignment (e.g. in unit tests).
        handler: () => this.options.islands,
      },
      resolverName: "Cluster#options.islands",
      resolverFn: async () => maybeAsyncCall(this.options.islands),
      delay,
      onError: (error, elapsed) =>
        this.options.loggers.swallowedErrorLogger({
          where: `${this.constructor.name}.islandsCache`,
          error,
          elapsed,
          importance: "normal",
        }),
    });

    this.shardsDiscoverCache = new CachedRefreshedValue({
      delayMs: () =>
        Math.round(
          maybeCall(this.options.shardsDiscoverIntervalMs) *
            jitter(maybeCall(this.options.shardsDiscoverIntervalJitter)),
        ),
      warningTimeoutMs: () => maybeCall(this.options.shardsDiscoverIntervalMs),
      deps: {
        delayMs: () => maybeCall(this.options.reloadIslandsIntervalMs),
        handler: async () =>
          jsonHash(await maybeAsyncCall(this.islandsCache.cached())),
      },
      resolverName: "Cluster#shardsDiscoverExpensive",
      resolverFn: async () => this.shardsDiscoverExpensive(),
      delay,
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
   *
   * Except when `randomizedDelayMs` is passed as 0, the actual prewarm (and
   * Islands discovery) queries will run with a randomized delay between N/2 and
   * N ms. It is better to operate in such mode: if multiple Node processes
   * start simultaneously in the cluster, then the randomization helps to avoid
   * new connections burst (new connections establishment is expensive for e.g.
   * pgbouncer or when DB is accessed over SSL).
   */
  prewarm(
    randomizedDelayMs: number = 5000,
    onInitialPrewarm?: (delayMs: number) => void,
  ): void {
    if (this.prewarmEnabled) {
      return;
    }

    this.prewarmEnabled = true;
    const initialDelayMs = randomizedDelayMs
      ? Math.round(random(randomizedDelayMs / 2, randomizedDelayMs))
      : 0;
    setTimeout(
      () =>
        runInVoid(async () => {
          onInitialPrewarm?.(initialDelayMs);
          for (const island of await this.islands()) {
            for (const client of island.clients) {
              client.prewarm();
            }
          }
        }),
      initialDelayMs,
    ).unref();
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
    return this.shardByNo(
      this.options.shardNamer ? this.options.shardNamer.shardNoByID(id) : 0,
    );
  }

  /**
   * Returns a Shard if we know its number. The idea: for each Shard number
   * (even for non-discovered yet Shards), we keep the corresponding Shard
   * object in a Memoize cache, so Shards with the same number always resolve
   * into the same Shard object. Then, an actual Island locating process happens
   * when the caller wants to get a Client of that Shard (and it throws if such
   * Shard hasn't been discovered actually).
   */
  @Memoize()
  shardByNo(shardNo: number): Shard<TClient> {
    return new Shard(shardNo, this.runOnShard.bind(this));
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

    return this.shardByNo(
      nullthrows(
        nonGlobalShardNos[index],
        () => "There are no non-global Shards in the Cluster",
      ),
    );
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
  async rediscover(what?: "islands" | "shards"): Promise<void> {
    if (!what || what === "islands") {
      await this.islandsCache.refreshAndWait();
    }

    if (!what || what === "shards") {
      await this.shardsDiscoverCache.refreshAndWait();
    }
  }

  /**
   * Runs the body function with retries. The Island injected into the body
   * function is located automatically by the Shard number. In case of an error
   * after any run attempt, calls onAttemptError().
   */
  private async runOnShard<TRes>(
    shardNo: number,
    body: (island: Island<TClient>, attempt: number) => Promise<TRes>,
    onAttemptError?: (error: unknown, attempt: number) => void,
  ): Promise<TRes> {
    let island: Island<TClient>;
    for (let attempt = 0; ; attempt++) {
      try {
        // Re-read Islands map on every retry, because it might change.
        const startTime = performance.now();
        const { shardNoToIslandNo, islandNoToIsland, errors } =
          await this.shardsDiscoverCache.cached();
        const islandNo = shardNoToIslandNo.get(shardNo);
        if (islandNo === undefined) {
          // Notice that we don't retry ShardIsNotDiscoverableError below (it's
          // not a ClientError) to avoid DoS, since it could be e.g. a fake ID
          // passed to us in some URL or something else. We still want to log it
          // through runOnShardErrorLogger() though.
          throw new ShardIsNotDiscoverableError(
            shardNo,
            errors,
            [...islandNoToIsland.values()],
            Math.round(performance.now() - startTime),
          );
        }

        // Retry the entire call to body(), to let it re-elect Client if needed.
        island = nullthrows(islandNoToIsland.get(islandNo));
        return await body(island, attempt);
      } catch (cause: unknown) {
        const error = cause as MaybeError | ClientError;

        if (typeof error?.stack === "string") {
          const suffix = `\n    after ${attempt + 1} attempt${attempt > 0 ? "s" : ""}`;
          process.stdout.write(
            `DEBUG: ${inspect(
              {
                error:
                  error instanceof ClientError
                    ? error
                    : error?.constructor?.name,
                island: island!?.options.clients.map((c) => c.options),
              },
              { depth: null, compact: true, breakLength: 100000000 },
            )}\n`,
          );
          if (!error.stack.endsWith(suffix)) {
            error.stack = error.stack.trimEnd() + suffix;
          }
        }

        onAttemptError?.(error, attempt);
        this.options.loggers.runOnShardErrorLogger?.({ error, attempt });

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
   * Runs the whole-cluster rediscover after a delay, hoping that we'll load the
   * new Shards-to-Island mapping.
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
      // Notice that we intentionally DO NOT call `islandsCache#refreshAndWait()
      // here: changes in the list of Islands never reveal moved Shards.
      this.shardsDiscoverCache.refreshAndWait(),
      Math.round(
        maybeCall(this.options.shardsDiscoverIntervalMs) *
          jitter(maybeCall(this.options.shardsDiscoverIntervalJitter)) *
          2,
      ),
      "Timed out while waiting for whole-Cluster Shards discovery.",
    ).catch((error) =>
      this.options.loggers.swallowedErrorLogger({
        where: `${this.constructor.name}.rediscoverCluster`,
        error,
        elapsed: Math.round(performance.now() - startTime),
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
      Math.round(
        maybeCall(this.options.shardsDiscoverIntervalMs) *
          jitter(maybeCall(this.options.shardsDiscoverIntervalJitter)) *
          2,
      ),
      `Timed out while waiting for Island ${island.no} Shards discovery.`,
    ).catch((error) =>
      this.options.loggers.swallowedErrorLogger({
        where: `${this.constructor.name}.rediscoverIsland(${island.no})`,
        error,
        elapsed: Math.round(performance.now() - startTime),
        importance: "normal",
      }),
    );
  }

  /**
   * Runs the actual Shards discovery queries over all Islands and updates the
   * mapping from each Shard number to an Island where it lives. These queries
   * may be expensive, so it's expected that the returned Promise is heavily
   * cached by the caller code.
   */
  private async shardsDiscoverExpensive(): Promise<ShardsDiscovered<TClient>> {
    const islands = await this.islandsCache.cached();
    const seenKeys = new Set<string>();
    const islandNoToIsland = new Map<number, Island<TClient>>(
      islands.map(({ no, nodes }) => {
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
    const errors: SwallowedErrorLoggerProps[] = [];
    const shards: Array<Shard<TClient>> = [];
    await mapJoin(
      [...islandNoToIsland.entries()],
      async ([islandNo, island]) => {
        errors.push(...(await island.rediscover()));
        for (const shard of island.shards()) {
          shards.push(shard);
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

    // Assign the last known Island number to all Shards synchronously.
    for (const shard of shards) {
      (shard as Writeable<Shard<TClient>>).lastKnownIslandNo =
        shardNoToIslandNo.get(shard.no) ?? null;
    }

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
      errors,
    };
  }
}
