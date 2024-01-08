import compact from "lodash/compact";
import random from "lodash/random";
import sortBy from "lodash/sortBy";
import { mapJoin } from "../helpers/misc";
import type { Client } from "./Client";

/**
 * Island is a collection of DB connections (represented as Clients) that
 * contains a single master server and any number of replicas.
 *
 * Notice that Island is internal: it should never be returned to the caller
 * code. The caller code should use only Client and Shard abstractions.
 */
export class Island<TClient extends Client> {
  private clients: TClient[];

  /**
   * Initializes the Island by copying the Client references into it.
   */
  constructor(clients: readonly TClient[]) {
    this.clients = [...clients];
    if (this.clients.length === 0) {
      throw Error("Island does not have nodes");
    }
  }

  /**
   * Returns all Shards on the best available Client (preferably master, then
   * replicas). If some Clients are unavailable, tries its best to infer the
   * data from other Clients.
   *
   * The method queries ALL clients in parallel, because the caller logic
   * anyways needs to know, who's master and who's replica, as a side effect of
   * the very 1st query after the Client creation. We infer that as a piggy back
   * after calling Client#shardNos().
   */
  async shardNos(): Promise<readonly number[]> {
    const res = sortBy(
      compact(
        // Do NOT use Promise.race() here! We really want to wait until ALL
        // clients either respond or reject, which is what mapJoin() is doing.
        // If we don't, then timing out Clients might be requested by the caller
        // logic concurrently over and over, so the number of pending requests
        // to them would grow. We want to control that parallelism.
        await mapJoin(this.clients, async (client) => {
          const startTime = performance.now();
          try {
            const nos = await client.shardNos();
            return { isMaster: client.isMaster(), nos };
          } catch (error: unknown) {
            client.options.loggers.swallowedErrorLogger({
              where: `${client.constructor.name}(${client.options.name}): shardNos`,
              error,
              elapsed: performance.now() - startTime,
            });
            return null;
          }
        })
      ),
      ({ isMaster }) => (isMaster ? 0 : 1),
      ({ nos }) => -1 * nos.length
    );
    if (res.length > 0) {
      return res[0].nos;
    }

    // Being unable to access all DB Clients is not a critical error here, we'll
    // just miss some Shards (and other Shards will work). DO NOT throw through
    // here yet! This needs to be addressed holistically and with careful
    // retries. Also, we have Shards rediscovery every N seconds, so a missing
    // Island will self-heal eventually.
    return [];
  }

  /**
   * Returns the master Client among the Clients of this Island. In case all
   * Clients are read-only (replicas), still returns the 1st of them, assuming
   * that it's better to throw at the caller side on a failed write (at worst)
   * rather than here. It is not common to have an Island without a master
   * Client, that happens only temporarily during failover/switchover, so the
   * caller will likely rediscover and find a new master on a next retry.
   */
  master(): TClient {
    const firstClient = this.clients[0];
    if (firstClient.isMaster()) {
      return firstClient;
    }

    this.sortClients();
    // Since sortClients() puts the master to the beginning of the list, we just
    // pick it from there. In case it is not master though (e.g. there is no
    // master at all temporarily), we still return the 1s element hoping that
    // the caller will retry and rediscover.
    return this.clients[0];
  }

  /**
   * Returns a random replica Client. In case there are no replicas, returns the
   * master Client.
   */
  replica(): TClient {
    if (this.clients.length === 1) {
      return this.clients[0];
    }

    // In case of a switchover, the head of the list may stop being a master, so
    // we sort the list again.
    if (!this.clients[0].isMaster()) {
      this.sortClients();
    }

    let firstReplicaIndex = 0;
    while (
      firstReplicaIndex < this.clients.length &&
      this.clients[firstReplicaIndex].isMaster()
    ) {
      firstReplicaIndex++;
    }

    let lastReplicaIndex = this.clients.length - 1;
    while (
      lastReplicaIndex >= firstReplicaIndex &&
      this.clients[lastReplicaIndex].isConnectionIssue()
    ) {
      lastReplicaIndex--;
    }

    // No healthy replicas found at all: fallback to master.
    if (lastReplicaIndex < firstReplicaIndex) {
      return this.master();
    }

    // Clients in the range firstReplicaIndex...lastReplicaIndex will likely be
    // replicas with healthy connections (since the tail of the list tends to
    // consist of unhealthy Clients), so the Client in `client` will likely be a
    // valid replica. But in case some Client got connection issues after we
    // sorted them last time (rare), and we picked it as a random one, sort the
    // list and try again.
    const client = this.clients[random(firstReplicaIndex, lastReplicaIndex)];
    if (client.isConnectionIssue()) {
      this.sortClients();
      return this.replica();
    }

    return client;
  }

  /**
   * Makes sure the prewarm loop is running on all Clients.
   */
  prewarm(): void {
    this.clients.forEach((client) => client.prewarm());
  }

  /**
   * Sorts the Clients stored internally, so the master Client(s) will appear in
   * the head of the list, and replica Clients with connection issues will
   * appear in the end of the list. This is relatively expensive when there are
   * lots of replicas, but we call it only when something goes wrong.
   */
  private sortClients(): void {
    this.clients = sortBy(
      this.clients,
      (client) => (client.isMaster() ? 0 : 1),
      (client) => (!client.isConnectionIssue() ? 0 : 1)
    );
  }
}
