import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import { QueryBase } from "../abstract/QueryBase";
import type { Schema } from "../abstract/Schema";
import { stringHash } from "../internal/misc";
import type { DeleteWhereInput, Table } from "../types";
import { ID } from "../types";
import type { PgClient } from "./PgClient";
import { PgRunner } from "./PgRunner";

export class PgQueryDeleteWhere<TTable extends Table> extends QueryBase<
  TTable,
  DeleteWhereInput<TTable>,
  string[],
  PgClient
> {
  /** @ignore */
  readonly RUNNER_CLASS = PgRunnerDeleteWhere;
}

class PgRunnerDeleteWhere<TTable extends Table> extends PgRunner<
  TTable,
  DeleteWhereInput<TTable>,
  string[]
> {
  static override readonly IS_WRITE = true;
  private builder;

  readonly op = "DELETE_WHERE";
  readonly maxBatchSize = 100;
  readonly default = [];

  // This runner doesn't support batching.
  runBatch = undefined;

  constructor(schema: Schema<TTable>, client: PgClient) {
    super(schema, client);
    this.builder = this.createWhereBuilder({
      prefix: this.fmt("DELETE FROM %T "),
      suffix: this.fmt(` RETURNING %PK AS ${ID}`),
    });
  }

  override key(input: DeleteWhereInput<TTable>): string {
    // Coalesce equal delete queries.
    const json = JSON.stringify(input);
    return stringHash(json);
  }

  async runSingle(
    input: DeleteWhereInput<TTable>,
    annotations: QueryAnnotation[],
  ): Promise<string[]> {
    if (!(input[ID] instanceof Array)) {
      throw Error(
        `Field ${ID} must be an array of IDs in ${this.op} query (for safety)`,
      );
    }

    const sql =
      this.builder.prefix + this.builder.func(input) + this.builder.suffix;
    const rows = await this.clientQuery<{ [ID]: string }>(
      sql,
      annotations,
      input[ID].length,
    );
    return rows.map((row) => row[ID]);
  }
}
