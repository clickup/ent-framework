import { QueryBase } from "../abstract/Query";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
import { CountInput, Table } from "../types";
import { SQLClient } from "./SQLClient";
import { SQLRunner } from "./SQLRunner";

export class SQLQueryCount<TTable extends Table> extends QueryBase<
  TTable,
  CountInput<TTable>,
  number,
  SQLClient
> {
  protected readonly RUNNER_CLASS = SQLRunnerCount;
}

class SQLRunnerCount<TTable extends Table> extends SQLRunner<
  TTable,
  CountInput<TTable>,
  number
> {
  static override readonly IS_WRITE = false;
  readonly op = "COUNT";

  private prefix = this.fmt("SELECT ");
  private suffix = this.fmt("COUNT(1) AS count FROM %T");

  // We just need something here.
  readonly default = 0;

  override key(input: CountInput<TTable>): string {
    // Coalesce equal queries.
    return JSON.stringify(input);
  }

  async runSingle(
    input: CountInput<TTable>,
    annotations: QueryAnnotation[]
  ): Promise<number> {
    const sql =
      this.prefix +
      this.suffix +
      this.buildOptionalWhere(this.schema.table, input);
    const res = await this.clientQuery<{ count: string }>(sql, annotations, 1);
    return parseInt(res[0].count);
  }

  async runBatch(
    inputs: Map<string, CountInput<TTable>>,
    annotations: QueryAnnotation[]
  ): Promise<Map<string, number>> {
    // SELECT 0 AS i, COUNT(1) FROM ... WHERE ...
    //    UNION ALL
    // SELECT 1 AS i, COUNT(1) FROM ... WHERE ...
    const pieces: string[] = [];
    const keys: string[] = [];
    for (const [key, input] of inputs.entries()) {
      const i = keys.length;
      keys.push(key);
      pieces.push(
        this.prefix +
          i +
          " AS i, " +
          this.suffix +
          this.buildOptionalWhere(this.schema.table, input)
      );
    }

    const rows = await this.clientQuery<{ i: string; count: string }>(
      pieces.join("\n  UNION ALL\n"),
      annotations,
      inputs.size
    );
    const outputs = new Map<string, number>();
    for (const { i, count } of rows) {
      outputs.set(keys[parseInt(i)], parseInt(count));
    }

    return outputs;
  }
}
