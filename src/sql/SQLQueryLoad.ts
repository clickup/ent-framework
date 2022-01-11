import { QueryBase } from "../abstract/Query";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
import { ID, Row, Table } from "../types";
import { SQLClient } from "./SQLClient";
import { SQLRunner } from "./SQLRunner";

export class SQLQueryLoad<TTable extends Table> extends QueryBase<
  TTable,
  string,
  Row<TTable> | null,
  SQLClient
> {
  protected readonly RUNNER_CLASS = SQLRunnerLoad;
}

class SQLRunnerLoad<TTable extends Table> extends SQLRunner<
  TTable,
  string,
  Row<TTable> | null
> {
  static override readonly IS_WRITE = false;
  readonly op = "SELECT_BY_ID";

  private prefix = this.fmt("SELECT %F FROM %T WHERE ", {
    specs: this.schema.table,
  });
  private suffix = this.fmt("");
  private listBuilder = this.createInBuilder(ID);

  // Select by ID is cheap, so we can have much bigger load batches.
  override readonly maxBatchSize = 1000;

  // If no row is found, returns null.
  readonly default = null;

  override key(input: string): string {
    return input;
  }

  async runSingle(
    input: string,
    annotations: QueryAnnotation[]
  ): Promise<Row<TTable> | undefined> {
    const sql = this.prefix + this.listBuilder([input]) + this.suffix;
    const rows = await this.clientQuery<Row<TTable>>(sql, annotations, 1);
    return rows[0];
  }

  async runBatch(
    inputs: Map<string, string>,
    annotations: QueryAnnotation[]
  ): Promise<Map<string, Row<TTable>>> {
    const sql = this.prefix + this.listBuilder(inputs.values()) + this.suffix;
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
