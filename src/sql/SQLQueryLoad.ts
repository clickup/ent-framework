import { QueryBase } from "../abstract/Query";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import type { Schema } from "../abstract/Schema";
import type { Row, Table } from "../types";
import { ID } from "../types";
import type { SQLClient } from "./SQLClient";
import { SQLRunner } from "./SQLRunner";

export class SQLQueryLoad<TTable extends Table> extends QueryBase<
  TTable,
  string,
  Row<TTable> | null,
  SQLClient
> {
  protected readonly RUNNER_CLASS = SQLRunnerLoad;
}

export class SQLRunnerLoad<TTable extends Table> extends SQLRunner<
  TTable,
  string,
  Row<TTable> | null
> {
  static override readonly IS_WRITE = false;
  readonly op = "SELECT_BY_ID";

  // Select by ID is cheap, so we can have much bigger load batches.
  override readonly maxBatchSize = 1000;

  // If no row is found, returns null.
  readonly default = null;

  private builder;

  constructor(schema: Schema<TTable>, client: SQLClient) {
    super(schema, client);
    this.builder = {
      prefix: this.fmt("SELECT %SELECT_FIELDS FROM %T WHERE "),
      func: this.createOneOfBuilder(ID),
      suffix: this.fmt(""),
    };
  }

  override key(input: string): string {
    return input;
  }

  async runSingle(
    input: string,
    annotations: QueryAnnotation[]
  ): Promise<Row<TTable> | undefined> {
    const sql =
      this.builder.prefix + this.builder.func([input]) + this.builder.suffix;
    const rows = await this.clientQuery<Row<TTable>>(sql, annotations, 1);
    return rows[0];
  }

  async runBatch(
    inputs: Map<string, string>,
    annotations: QueryAnnotation[]
  ): Promise<Map<string, Row<TTable>>> {
    const sql =
      this.builder.prefix +
      this.builder.func(inputs.values()) +
      this.builder.suffix;
    const rows = await this.clientQuery<Row<TTable>>(
      sql,
      annotations,
      inputs.size
    );
    const outputs = new Map<string, Row<TTable>>();
    for (const row of rows) {
      outputs.set(row[ID], row);
    }

    return outputs;
  }
}
