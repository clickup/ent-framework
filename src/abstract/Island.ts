import type { Client } from "./Client";

/**
 * Island is 1 master + N replicas.
 * One island typically hosts multiple shards.
 */
export class Island<TClient extends Client> {
  constructor(
    public readonly no: number,
    public readonly master: TClient,
    public readonly replicas: TClient[]
  ) {}
}
