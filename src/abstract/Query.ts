import type { Table } from "../types";
import type { Runner } from "./Batcher";
import type { Client } from "./Client";
import type { QueryAnnotation } from "./QueryAnnotation";
import type { Schema } from "./Schema";

/**
 * A very lean interface for a Query. In practice each query is so different
 * that this interface is the only common part of them all.
 */
export interface Query<TOutput> {
  readonly IS_WRITE: boolean;
  run(client: Client, annotation: QueryAnnotation): Promise<TOutput>;
}

/**
 * A convenient base class for most (but not all) of the queries. If the query
 * doesn't fit the QueryBase framework (like SQLQueryUpdate for instance), a
 * Query is used directly instead.
 */
export abstract class QueryBase<
  TTable extends Table,
  TInput,
  TOutput,
  TClient extends Client
> implements Query<TOutput>
{
  protected abstract readonly RUNNER_CLASS: {
    readonly IS_WRITE: boolean;
    new (schema: Schema<TTable>, client: TClient): Runner<TInput, TOutput>;
  };

  constructor(
    public readonly schema: Schema<TTable>,
    public readonly input: TInput
  ) {}

  get IS_WRITE() {
    return this.RUNNER_CLASS.IS_WRITE;
  }

  async run(client: TClient, annotation: QueryAnnotation): Promise<TOutput> {
    return client
      .batcher(
        this.constructor,
        this.schema,
        "",
        () => new this.RUNNER_CLASS(this.schema, client)
      )
      .run(this.input, annotation);
  }
}
