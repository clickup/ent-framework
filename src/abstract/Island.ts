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
}
