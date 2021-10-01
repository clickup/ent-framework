import { QueryBase } from "../abstract/Query";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
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

class SQLRunnerDelete<TTable extends Table> extends SQLRunner<
  TTable,
  string,
  boolean
> {
  static override readonly IS_WRITE = true;
  readonly op = "DELETE";

  private prefix = this.fmt("DELETE FROM %T WHERE ");
  private suffix = this.fmt(" RETURNING %ID");
  private listBuilder = this.createInBuilder(ID);

  // If no delete happened, returns false.
  readonly default = false;

  override key(input: string): string {
    return input;
  }

  async runSingle(
    input: string,
    annotations: Iterable<QueryAnnotation>
  ): Promise<boolean> {
    const sql = this.prefix + this.listBuilder([input]) + this.suffix;
    const rows = await this.clientQuery<{ [ID]: string }>(sql, annotations, 1);
    return rows.length > 0 ? true : false;
  }

  async runBatch(
    inputs: Map<string, string>,
    annotations: Iterable<QueryAnnotation>
  ): Promise<Map<string, boolean>> {
    const sql = this.prefix + this.listBuilder(inputs.values()) + this.suffix;
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
