import { ServerError } from "./ServerError";

/**
 * Thrown by the engine when an error should affect sharding logic, e.g. how the
 * engine performs retries and rediscovery. Some (maybe not all) examples:
 * - A table (Shard) disappeared from an Island; it may be a Shard relocation to
 *   another Island.
 * - A master node appeared to be a replica; it may be that a switchover
 *   happened.
 * - Someone tried to use a Client after it was end()'ed; it can be that Cluster
 *   reconfiguration is in progress, so an old Client was recycled whilst a new
 *   replacement Client was added to the Island.
 */
export class ShardError extends ServerError {
  constructor(
    origError: any,
    where: string,
    public readonly postAction:
      | "rediscover" // re-run Shards/Islands discovery before retrying
      | "choose-another-client" // choose another replica, but don't rerun discovery
      | "fail" // do not retry, fail immediately
  ) {
    super(origError, where);
  }
}
