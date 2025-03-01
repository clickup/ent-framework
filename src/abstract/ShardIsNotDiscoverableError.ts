import type { Client } from "./Client";
import type { Island } from "./Island";
import type { SwallowedErrorLoggerProps } from "./Loggers";
import { ShardError } from "./ShardError";

/**
 * This non-retriable error is thrown when shardsDiscoverCache.cached() returns
 * no shard with the requested number.
 */
export class ShardIsNotDiscoverableError extends ShardError {
  constructor(
    shardNo: number,
    errors: SwallowedErrorLoggerProps[],
    islands: Array<Island<Client>>,
    elapsed: number,
  ) {
    super(
      `Shard ${shardNo} is not discoverable: no such Shard in the Cluster? some Islands are down? connections limit?` +
        (errors.length > 0
          ? "\n" +
            errors
              .map(
                ({ where, error, elapsed }) =>
                  `- ${where}` +
                  (elapsed !== null ? ` (took ${elapsed} ms)` : "") +
                  ": " +
                  `${error?.toString() ?? error}`.trimEnd(),
              )
              .sort()
              .join("\n")
          : ""),
      "Islands " +
        islands
          .map(({ no, clients }) => `${no}@${clients[0].options.name}`)
          .join(", ") +
        `; cached discovery took ${elapsed} ms`,
    );
  }
}
