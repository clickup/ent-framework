import type { Client, ClientPingInput } from "./Client";
import type { Query } from "./Query";
import type { QueryAnnotation } from "./QueryAnnotation";

/**
 * A helper Query which delegates to Client#ping(execTimeMs).
 */
export class QueryPing implements Query<void> {
  constructor(public readonly input: Omit<ClientPingInput, "annotation">) {}

  get IS_WRITE(): boolean {
    return this.input.isWrite;
  }

  async run(client: Client, annotation: QueryAnnotation): Promise<void> {
    return client.ping({ ...this.input, annotation });
  }
}
