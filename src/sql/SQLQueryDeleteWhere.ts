import { QueryBase } from "../abstract/Query";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
import { hash } from "../helpers";
import { DeleteWhereInput, ID, Table } from "../types";
import { SQLClient } from "./SQLClient";
import { SQLRunner } from "./SQLRunner";

export class SQLQueryDeleteWhere<TTable extends Table> extends QueryBase<
  TTable,
  DeleteWhereInput<TTable>,
  string[],
  SQLClient
> {
  protected readonly RUNNER_CLASS = SQLRunnerDeleteWhere;
}

class SQLRunnerDeleteWhere<TTable extends Table> extends SQLRunner<
  TTable,
  DeleteWhereInput<TTable>,
  string[]
> {
  static override readonly IS_WRITE = true;
  readonly op = "DELETE_WHERE";
  readonly default = [];
  private prefix = this.fmt("DELETE FROM %T");
  private suffix = this.fmt(" RETURNING %ID");

  override key(input: DeleteWhereInput<TTable>): string {
    // Coalesce equal delete queries.
    const json = JSON.stringify(input);
    return hash(json);
  }

  async runSingle(
    input: DeleteWhereInput<TTable>,
    annotations: QueryAnnotation[]
  ): Promise<string[]> {
    if (!(input[ID] instanceof Array)) {
      throw Error(
        `Field ${ID} must be an array of IDs in ${this.op} query (for safety)`
      );
    }

    const sql =
      this.prefix +
      this.buildOptionalWhere(this.schema.table, input) +
      this.suffix;
    const rows = await this.clientQuery<{ [ID]: string }>(
      sql,
      annotations,
      input[ID].length
    );
    return rows.map((row) => row.id);
  }

  runBatch = undefined;
}
