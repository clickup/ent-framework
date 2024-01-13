import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import { QueryBase } from "../abstract/QueryBase";
import type { Schema } from "../abstract/Schema";
import type { Row, Table } from "../types";
import { ID } from "../types";
import type { PgClient } from "./PgClient";
import { PgRunner } from "./PgRunner";

export class PgQueryLoad<TTable extends Table> extends QueryBase<
  TTable,
  string,
  Row<TTable> | null,
  PgClient
> {
  /** @ignore */
  readonly RUNNER_CLASS = PgRunnerLoad;
}

class PgRunnerLoad<TTable extends Table> extends PgRunner<
  TTable,
  string,
  Row<TTable> | null
> {
  static override readonly IS_WRITE = false;
  private builder;

  readonly op = "SELECT_BY_ID";
  readonly maxBatchSize = 1000; // Select by ID is cheap, so we can have much bigger load batches.
  readonly default = null; // If no row is found, returns null.

  constructor(schema: Schema<TTable>, client: PgClient) {
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
    annotations: QueryAnnotation[],
  ): Promise<Row<TTable> | undefined> {
    const sql =
      this.builder.prefix + this.builder.func([input]) + this.builder.suffix;
    const rows = await this.clientQuery<Row<TTable>>(sql, annotations, 1);
    return rows[0];
  }

  async runBatch(
    inputs: Map<string, string>,
    annotations: QueryAnnotation[],
  ): Promise<Map<string, Row<TTable>>> {
    const sql =
      this.builder.prefix +
      this.builder.func(inputs.values()) +
      this.builder.suffix;
    const rows = await this.clientQuery<Row<TTable>>(
      sql,
      annotations,
      inputs.size,
    );
    const outputs = new Map<string, Row<TTable>>();
    for (const row of rows) {
      outputs.set(row[ID], row);
    }

    return outputs;
  }
}
