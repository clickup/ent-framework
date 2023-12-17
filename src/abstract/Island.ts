import shuffle from "lodash/shuffle";
import type { Client } from "./Client";

/**
 * Island is a collection of DB connections (represented as Clients) that
 * contains a single master server and any number of replicas.
 *
 * Notice that Island is internal: it should never be returned to the caller
 * code. The caller code should use only Client and Shard abstractions.
 */
export class Island<TClient extends Client> {
  constructor(
    public readonly master: TClient,
    public readonly replicas: TClient[]
  ) {}

  /**
   * Returns all Shards on the first available Client (master, then replicas).
   */
  async shardNos(): Promise<readonly number[]> {
    for (const client of [this.master, ...shuffle(this.replicas)]) {
      const startTime = performance.now();
      try {
        return await client.shardNos();
      } catch (error: unknown) {
        client.options.loggers.swallowedErrorLogger({
          where: `${client.constructor.name}(${client.options.name}): ${this.shardNos.name}()`,
          error,
          elapsed: performance.now() - startTime,
        });
      }
    }

    // Being unable to access a DB is not a critical error here, we'll just miss
    // some Shards (and other Shards will work). DO NOT throw through here yet!
    // This needs to be addressed holistically and with careful retries. Also,
    // we have Shards rediscovery every N seconds, so a missing Island will
    // self-heal eventually.
    return [];
  }

  /**
   * Makes sure the prewarm loop is running on all Clients.
   */
  prewarm(): void {
    this.master.prewarm();
    this.replicas.forEach((client) => client.prewarm());
  }
}
