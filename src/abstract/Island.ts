import delay from "delay";
import compact from "lodash/compact";
import defaults from "lodash/defaults";
import first from "lodash/first";
import sample from "lodash/sample";
import sortBy from "lodash/sortBy";
import type { PickPartial } from "../internal/misc";
import { mapJoin, nullthrows } from "../internal/misc";
import type { Client, ClientRole } from "./Client";
import type { LocalCache } from "./LocalCache";
import type { Shard } from "./Shard";

/**
 * The list of Clients grouped into master, replica and unknown groups. In each
 * group, there are healthy and unhealthy Clients.
 */
type ClassifiedClients<TClient extends Client> = Record<
  ClientRole,
  { healthy: TClient[]; unhealthy: TClient[] }
>;

/**
 * Options for Island constructor.
 */
export interface IslandOptions<TClient extends Client> {
  /** Island number. */
  no: number;
  /** Clients of that Island (the order is arbitrary). */
  clients: readonly TClient[];
  /** Should return a Memoize'd Shards object by its number. */
  createShard: (no: number) => Shard<TClient>;
  /** An auxillary LocalCache used to fallback-infer master/replica role in case
   * some Client is unavailable right now. */
  localCache?: LocalCache<{
    address: string;
    role: ClientRole;
    // We must not put non-deterministic fields (like timestamps) here,
    // otherwise the cache file will be overwritten over and over even when
    // writing the same data.
  }> | null;
  /** If nonzero, runs the second shardNos() call attempt on a Client if the 1st
   * call on that Client gets stuck for longer than the provided number of ms.
   *
   * This option is used to detect the unhealthy DB connection quicker, and
   * thus, exit from rediscover() faster (the Shards map can likely be loaded
   * from a replica still, so the down DB is not the end of the world). The idea
   * is that the 1st shardNos() could get stuck due to the load balancer trying
   * to wait until the DB goes back up again (e.g. for PgBouncer, that is
   * query_wait_timeout situation; "pause_client" is printed to PgBouncer debug
   * logs, and then the Client gets frozen for up to query_wait_timeout; other
   * engines may have similar behavior). But for the NEW connections/queries,
   * after a small delay, the load balancer may realize that the DB is really
   * down (the load balancer typically can get "connection refused" while
   * connecting to the DB server really quickly), and the 2nd shardNos() call
   * will reject almost immediately ("fast fail" workflow), way before the 1st
   * call rejects (e.g. for PgBouncer and query_wait_timeout=15s, the 1st call
   * may get stuck for up to 15 seconds!). So, we will not wait that long to
   * figure out that the DB is down, and will detect that situation quicker.
   *
   * Typically, the connection attempt from load balancer to an unhealthy DB
   * server ends up quickly with "connection refused" TCP error (e.g. when the
   * load balancer and the DB server run on the same host), so the value in this
   * option can be small. But not always. Sometimes, the new connection from
   * load balancer to the DB server gets stuck in "connecting..." state (e.g.
   * this happens when the load balancer runs in a Docker container, and the DB
   * container gets killed; the connection attempt will eventually fail, but in
   * 1+ minutes and with "no route to host" error). In this case, the value in
   * the option must be greater than e.g. server_connect_timeout (example for
   * PgBouncer; basically, server_connect_timeout is PgBouncer's tool to detect
   * "stuck" connection attempts (the connections which don't get "connection
   * refused" quickly). */
  shardNosConcurrentRetryDelayMs?: number;
}

/**
 * Island is a moderately short-lived collection of DB connections (represented
 * as Clients) that contains a single master Client and any number of replicas.
 *
 * - In normal situations, you don't likely need to work with Islands directly,
 *   you can rely on higher level abstractions which support automatic
 *   rediscovery and retries: Ent (or lower level Shard and Schema).
 * - Islands are helpful mostly when working with cross-Shards logic.
 * - Island is somewhat temporary: if the Cluster is reconfigured in real-time,
 *   then its Island objects may be recycled and re-created, and the
 *   corresponding Clients may be ended. This also applies to any given Client
 *   instance. Don't retain and reuse those objects for too long. The reliable
 *   abstractions (resilient to disconnects, shards migration, failover etc.)
 *   start from Shard level.
 * - There is no guarantee that the data returned by shards(), master() or
 *   replica() will be up to date. Shards may be just migrated to another
 *   Island. Master may become a replica, or vice versa.
 */
export class Island<TClient extends Client> {
  /** Default values for the constructor options. */
  static readonly DEFAULT_OPTIONS: Required<
    PickPartial<IslandOptions<Client>>
  > = {
    localCache: null,
    // https://willbryant.net/overriding_the_default_linux_kernel_20_second_tcp_socket_connect_timeout
    // Convenient when tcp_syn_retries=1 is set in docker-compose.yml file:
    // "Linux ... sends 5 SYNs ... the retries are after 3s, 6s, 12s, 24s"
    shardNosConcurrentRetryDelayMs: 3500,
  };

  /** Clients grouped based on their roles and health. */
  private classifiedClients!: ClassifiedClients<TClient>;
  /** In case shardNos discovery for some Client hasn't succeeded yet, and thus,
   * we are not sure about the role of that Client, then we try to load the role
   * from fallback cache in this map and use further instead of "unknown". */
  private fallbackRoles = new WeakMap<TClient, ClientRole>();
  /** Recently discovered Shard numbers. */
  private shardNos: number[] | null = null;

  /** Island configuration options. */
  readonly options: Required<IslandOptions<TClient>>;

  /**
   * Initializes the Island by copying the Client references into it.
   */
  constructor(options: IslandOptions<TClient>) {
    this.options = defaults({}, options, Island.DEFAULT_OPTIONS);
    if (options.clients.length === 0) {
      throw Error("Island does not have nodes");
    }

    this.reclassifyClients();
  }

  /**
   * Island number.
   */
  get no(): number {
    return this.options.no;
  }

  /**
   * The list of Clients in this Island. No assumptions about the order.
   */
  get clients(): readonly TClient[] {
    return this.options.clients;
  }

  /**
   * Queries for Shards on the best available Client (preferably master, then
   * replicas) and stores the result internally, available for the further
   * shards() call.
   * - If some Clients are unavailable, tries its best to infer the data from
   *   other Clients.
   * - The method queries ALL clients in parallel, because the caller logic
   *   anyways needs to know, who's master and who's replica, as a side effect
   *   of the very 1st query after the Client creation. We infer that as a piggy
   *   back after calling Client#shardNos().
   */
  async rediscover(): Promise<void> {
    // Load fallback roles as early as possible (since shardNo() queries below
    // may take a lot of time in case they time out).
    await mapJoin(this.clients, async (client) => {
      if (!this.fallbackRoles.has(client)) {
        const fallback = await this.options.localCache?.get(client.address());
        if (fallback) {
          this.fallbackRoles.set(client, fallback.role);
        }
      }
    });

    // We don't use Promise.race() here! We really want to wait until ALL
    // clients either respond or reject, which is what mapJoin() is doing. If we
    // used Promise.race(), then timing out Clients could've been requested by
    // the caller logic concurrently over and over, so the number of pending
    // requests to them would grow. We want to control that parallelism.
    const res = sortBy(
      compact(
        await mapJoin(this.clients, async (client) => {
          const startTime = performance.now();
          try {
            const shardNos = await this.clientShardNos(client);
            const address = client.address();
            const role = client.role();
            await this.options.localCache?.set(address, { address, role });
            this.fallbackRoles.set(client, role);
            return { role, shardNos };
          } catch (error: unknown) {
            client.options.loggers?.swallowedErrorLogger({
              where: `${client.constructor.name}(${client.options.name}): shardNos`,
              error,
              elapsed: performance.now() - startTime,
              importance: "low",
            });
            return null;
          }
        }),
      ),
      ({ role }) => (role === "master" ? 0 : role === "replica" ? 1 : 2),
      ({ shardNos }) => -1 * shardNos.length,
    );
    this.reclassifyClients();

    if (res.length > 0) {
      this.shardNos = [...res[0].shardNos].sort();
    } else {
      // Being unable to access all DB Clients is not a critical error here,
      // we'll just miss some Shards (and other Shards will work). DO NOT throw
      // through here yet! This needs to be addressed holistically and with
      // careful retries. Also, we have Shards rediscovery every N seconds, so a
      // missing Island will self-heal eventually.
      this.shardNos = [];
    }
  }

  /**
   * Returns the currently best-known Shards on this Island. This method is
   * needed only when working with cross-Shards logic; in normal situations, it
   * is not called much.
   */
  shards(): Array<Shard<TClient>> {
    const shardNos = nullthrows(
      this.shardNos,
      "Before shards() can be used, rediscover() must finish",
    );
    return shardNos.map((no) => this.options.createShard(no));
  }

  /**
   * Returns the currently best-known master Client among the Clients of this
   * Island.
   *
   * - If all masters are unhealthy, we still return one of them and prefer not
   *   to fall back on a replica, because otherwise, we'll see non-obvious
   *   errors in logs ("can't write in a read-only Client" or so) and suspect
   *   that there is a bug in logic, although there is really no bug, it's just
   *   the master node went down. It's way better to throw a straightforward
   *   error like "Client is down".
   * - If we can't find a master, but there is a list of Clients with unknown
   *   roles, prefer returning one of them vs. any known replica, since there is
   *   a chance that among those unknown Clients, there will be a master.
   * - In case all Clients are read-only (replicas), still returns the 1st of
   *   them, assuming that it's better to throw at the caller side on a failed
   *   write (at worst) rather than here. It is not common to have an Island
   *   without a master Client, that happens only temporarily during
   *   failover/switchover, so the caller will likely rediscover and find a new
   *   master on a next retry.
   */
  master(): TClient {
    if (this.clients.length === 1) {
      return first(this.clients)!;
    }

    const master = sample(this.classifiedClients.master.healthy);
    if (master && master.role() === "master" && !master.connectionIssue()) {
      // Fast and most frequent path.
      return master;
    }

    this.reclassifyClients();
    return (
      sample(this.classifiedClients.master.healthy) ??
      sample(this.classifiedClients.master.unhealthy) ?? // prefer unhealthy master
      sample(this.classifiedClients.unknown.healthy) ??
      sample(this.classifiedClients.unknown.unhealthy) ??
      sample(this.classifiedClients.replica.healthy) ??
      sample(this.classifiedClients.replica.unhealthy) ??
      first(this.clients)! // should never reach here
    );
  }

  /**
   * Returns a currently best-known random replica Client. In case there are no
   * replicas, returns the master Client.
   */
  replica(): TClient {
    if (this.clients.length === 1) {
      return first(this.clients)!;
    }

    const replica = sample(this.classifiedClients.replica.healthy);
    if (replica && replica.role() === "replica" && !replica.connectionIssue()) {
      // Fast and most frequent path.
      return replica;
    }

    this.reclassifyClients();
    return (
      sample(this.classifiedClients.replica.healthy) ??
      sample(this.classifiedClients.unknown.healthy) ??
      sample(this.classifiedClients.master.healthy) ??
      sample(this.classifiedClients.replica.unhealthy) ??
      sample(this.classifiedClients.unknown.unhealthy) ??
      sample(this.classifiedClients.master.unhealthy) ??
      first(this.clients)! // should never reach here
    );
  }

  /**
   * Updates the list of classified Clients. We try hard to not put Clients in
   * "unknown" group by falling back to fallbackRoles.
   */
  private reclassifyClients(): void {
    const classifiedClients: ClassifiedClients<TClient> = {
      master: { healthy: [], unhealthy: [] },
      unknown: { healthy: [], unhealthy: [] },
      replica: { healthy: [], unhealthy: [] },
    };
    for (const client of this.clients) {
      const health = client.connectionIssue() ? "unhealthy" : "healthy";
      const role = client.role();
      classifiedClients[
        role === "unknown" ? this.fallbackRoles.get(client) ?? role : role
      ][health].push(client);
    }

    this.classifiedClients = classifiedClients;
  }

  /**
   * Tries to pull shardNos() out of the Client and fail fast if the DB is down.
   * See details in shardNosConcurrentRetryDelayMs option description.
   */
  private async clientShardNos(client: TClient): Promise<readonly number[]> {
    if (this.options.shardNosConcurrentRetryDelayMs === 0) {
      return client.shardNos();
    }

    const promise = client.shardNos();
    const maybeShardNos = await Promise.race([
      promise,
      delay(this.options.shardNosConcurrentRetryDelayMs),
    ]);
    return maybeShardNos instanceof Array
      ? maybeShardNos
      : Promise.race([promise, client.shardNos()]);
  }
}
