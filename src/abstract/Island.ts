import shuffle from "lodash/shuffle";
import type { Client } from "./Client";

/**
 * Island is a collection of DB connections (represented as Clients) that
 * contains a single master server and any number of replicas.
 */
export class Island<TClient extends Client> {
  constructor(
    public readonly master: TClient,
    public readonly replicas: TClient[]
  ) {}

  /**
   * Returns all shards on the first available client (master, then replicas).
   */
  async shardNos(): Promise<readonly number[]> {
    for (const client of [this.master, ...shuffle(this.replicas)]) {
      const startedAt = performance.now();
      try {
        return await client.shardNos();
      } catch (error: unknown) {
        client.loggers.swallowedErrorLogger({
          where: `${client.constructor.name}(${client.name}): ${this.shardNos.name}()`,
          error,
          elapsed: performance.now() - startedAt,
        });
      }
    }

    // Being unable to access a DB is not a critical error here, we'll just
    // miss some shards (and other shards will work). DO NOT throw through
    // here yet! This needs to be addressed holistically and with careful
    // retries. Also, we have shards rediscovery every N seconds, so a missing
    // island will self-heal eventually.
    return [];
  }
}
