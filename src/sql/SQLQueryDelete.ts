import { QueryBase } from "../abstract/Query";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
import { Schema } from "../abstract/Schema";
import { ID, Table } from "../types";
import { SQLClient } from "./SQLClient";
import { SQLRunner } from "./SQLRunner";

export class SQLQueryDelete<TTable extends Table> extends QueryBase<
  TTable,
  string,
  boolean,
  SQLClient
> {
  protected readonly RUNNER_CLASS = SQLRunnerDelete;
}

export class SQLRunnerDelete<TTable extends Table> extends SQLRunner<
  TTable,
  string,
  boolean
> {
  static override readonly IS_WRITE = true;
  readonly op = "DELETE";

  // If no delete happened, returns false.
  readonly default = false;

  private builder;

  constructor(schema: Schema<TTable>, client: SQLClient) {
    super(schema, client);
    this.builder = {
      prefix: this.fmt("DELETE FROM %T WHERE "),
      func: this.createInBuilder(ID),
      suffix: this.fmt(` RETURNING %PK AS ${ID}`),
    };
  }

  override key(input: string): string {
    return input;
  }

  async runSingle(
    input: string,
    annotations: QueryAnnotation[]
  ): Promise<boolean> {
    const sql =
      this.builder.prefix + this.builder.func([input]) + this.builder.suffix;
    const rows = await this.clientQuery<{ [ID]: string }>(sql, annotations, 1);
    return rows.length > 0 ? true : false;
  }

  async runBatch(
    inputs: Map<string, string>,
    annotations: QueryAnnotation[]
  ): Promise<Map<string, boolean>> {
    const sql =
      this.builder.prefix +
      this.builder.func(inputs.values()) +
      this.builder.suffix;
    const rows = await this.clientQuery<{ [ID]: string }>(
      sql,
      annotations,
      inputs.size
    );
    const outputs = new Map<string, boolean>();
    for (const row of rows) {
      outputs.set(row[ID], true);
    }

    return outputs;
  }
}
