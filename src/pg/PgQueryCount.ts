import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import { QueryBase } from "../abstract/QueryBase";
import type { Schema } from "../abstract/Schema";
import type { CountInput, Table } from "../types";
import type { PgClient } from "./PgClient";
import { PgRunner } from "./PgRunner";

export class PgQueryCount<TTable extends Table> extends QueryBase<
  TTable,
  CountInput<TTable>,
  number,
  PgClient
> {
  /** @ignore */
  readonly RUNNER_CLASS = PgRunnerCount;
}

class PgRunnerCount<TTable extends Table> extends PgRunner<
  TTable,
  CountInput<TTable>,
  number
> {
  static override readonly IS_WRITE = false;
  private builder;

  readonly op = "COUNT";
  readonly maxBatchSize = 100;
  readonly default = 0; // We just need something here.

  constructor(schema: Schema<TTable>, client: PgClient) {
    super(schema, client);
    this.builder = this.createWhereBuilder({
      prefix: this.fmt("SELECT COUNT(1) AS count FROM %T "),
      suffix: this.fmt(""),
    });
  }

  override key(input: CountInput<TTable>): string {
    // Coalesce equal queries.
    return JSON.stringify(input);
  }

  async runSingle(
    input: CountInput<TTable>,
    annotations: QueryAnnotation[],
  ): Promise<number> {
    const sql =
      this.builder.prefix + this.builder.func(input) + this.builder.suffix;
    const res = await this.clientQuery<{ count: string }>(sql, annotations, 1);
    return parseInt(res[0].count);
  }

  async runBatch(
    inputs: Map<string, CountInput<TTable>>,
    annotations: QueryAnnotation[],
  ): Promise<Map<string, number>> {
    // SELECT COUNT(1) FROM ... WHERE ...
    //   UNION ALL
    // SELECT COUNT(1) FROM ... WHERE ...
    const sql = [...inputs.values()]
      .map(
        (input) =>
          this.builder.prefix + this.builder.func(input) + this.builder.suffix,
      )
      .join("\n  UNION ALL\n");
    const rows = await this.clientQuery<{ i: string; count: string }>(
      sql,
      annotations,
      inputs.size,
    );
    const outputs = new Map<string, number>();
    let i = 0;
    for (const key of inputs.keys()) {
      outputs.set(key, parseInt(rows[i].count));
      i++;
    }

    return outputs;
  }
}
