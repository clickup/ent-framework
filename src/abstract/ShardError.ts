import { ServerError } from "./ServerError";

/**
 * Thrown by the engine when an error is related to sharding.
 */
export class ShardError extends ServerError {
  constructor(
    origError: any,
    destName: string,
    public readonly postAction: "rediscover" | "fail"
  ) {
    super(origError, destName);
  }
}
