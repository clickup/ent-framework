import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import { QueryBase } from "../abstract/QueryBase";
import type { Schema } from "../abstract/Schema";
import type { Table } from "../types";
import { ID } from "../types";
import type { PgClient } from "./PgClient";
import { PgRunner } from "./PgRunner";

export class PgQueryDelete<TTable extends Table> extends QueryBase<
  TTable,
  string,
  boolean,
  PgClient
> {
  /** @ignore */
  readonly RUNNER_CLASS = PgRunnerDelete;
}

class PgRunnerDelete<TTable extends Table> extends PgRunner<
  TTable,
  string,
  boolean
> {
  static override readonly IS_WRITE = true;
  private builder;

  readonly op = "DELETE";
  readonly maxBatchSize = 100;
  readonly default = false; // If no delete happened, returns false.

  constructor(schema: Schema<TTable>, client: PgClient) {
    super(schema, client);
    this.builder = {
      prefix: this.fmt("DELETE FROM %T WHERE "),
      func: this.createOneOfBuilder(ID),
      suffix: this.fmt(` RETURNING %PK AS ${ID}`),
    };
  }

  override key(input: string): string {
    return input;
  }

  async runSingle(
    input: string,
    annotations: QueryAnnotation[],
  ): Promise<boolean> {
    const sql =
      this.builder.prefix + this.builder.func([input]) + this.builder.suffix;
    const rows = await this.clientQuery<{ [ID]: string }>(sql, annotations, 1);
    return rows.length > 0 ? true : false;
  }

  async runBatch(
    inputs: Map<string, string>,
    annotations: QueryAnnotation[],
  ): Promise<Map<string, boolean>> {
    const sql =
      this.builder.prefix +
      this.builder.func(inputs.values()) +
      this.builder.suffix;
    const rows = await this.clientQuery<{ [ID]: string }>(
      sql,
      annotations,
      inputs.size,
    );
    const outputs = new Map<string, boolean>();
    for (const row of rows) {
      outputs.set(row[ID], true);
    }

    return outputs;
  }
}
