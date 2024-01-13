import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import { QueryBase } from "../abstract/QueryBase";
import type { Schema } from "../abstract/Schema";
import type { ExistsInput, Table } from "../types";
import type { PgClient } from "./PgClient";
import { PgRunner } from "./PgRunner";

export class PgQueryExists<TTable extends Table> extends QueryBase<
  TTable,
  ExistsInput<TTable>,
  boolean,
  PgClient
> {
  /** @ignore */
  readonly RUNNER_CLASS = PgRunnerExists;
}

class PgRunnerExists<TTable extends Table> extends PgRunner<
  TTable,
  ExistsInput<TTable>,
  boolean
> {
  static override readonly IS_WRITE = false;
  private builder;

  readonly op = "EXISTS";
  readonly maxBatchSize = 100;
  readonly default = false; // We just need something here.

  constructor(schema: Schema<TTable>, client: PgClient) {
    super(schema, client);
    this.builder = this.createWhereBuilder({
      prefix: this.fmt("SELECT EXISTS (SELECT true FROM %T "),
      suffix: this.fmt(")"),
    });
  }

  override key(input: ExistsInput<TTable>): string {
    // Coalesce equal queries.
    return JSON.stringify(input);
  }

  async runSingle(
    input: ExistsInput<TTable>,
    annotations: QueryAnnotation[],
  ): Promise<boolean> {
    const sql =
      this.builder.prefix + this.builder.func(input) + this.builder.suffix;
    const res = await this.clientQuery<{ exists: boolean }>(
      sql,
      annotations,
      1,
    );
    return !!res[0].exists;
  }

  async runBatch(
    inputs: Map<string, ExistsInput<TTable>>,
    annotations: QueryAnnotation[],
  ): Promise<Map<string, boolean>> {
    // SELECT EXISTS(SELECT 1 FROM ... WHERE ...)
    //   UNION ALL
    // SELECT EXISTS(SELECT 1 FROM ... WHERE ...)
    const sql = [...inputs.values()]
      .map(
        (input) =>
          this.builder.prefix + this.builder.func(input) + this.builder.suffix,
      )
      .join("\n  UNION ALL\n");
    const rows = await this.clientQuery<{ i: string; exists: boolean }>(
      sql,
      annotations,
      inputs.size,
      // The reasonable assumption is that, if someone uses EXISTS, they always
      // want the query to match some index.
      { enable_seqscan: "off" },
    );
    const outputs = new Map<string, boolean>();
    let i = 0;
    for (const key of inputs.keys()) {
      outputs.set(key, !!rows[i].exists);
      i++;
    }

    return outputs;
  }
}
