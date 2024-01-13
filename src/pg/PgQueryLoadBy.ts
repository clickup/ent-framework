import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import { QueryBase } from "../abstract/QueryBase";
import type { Schema } from "../abstract/Schema";
import type { LoadByInput, Row, Table, UniqueKey } from "../types";
import type { PgClient } from "./PgClient";
import { PgRunner } from "./PgRunner";

export class PgQueryLoadBy<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
> extends QueryBase<
  TTable,
  LoadByInput<TTable, TUniqueKey>,
  Row<TTable> | null,
  PgClient
> {
  /** @ignore */
  readonly RUNNER_CLASS = PgRunnerLoadBy;
}

class PgRunnerLoadBy<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>,
> extends PgRunner<
  TTable,
  LoadByInput<TTable, TUniqueKey>,
  Row<TTable> | null
> {
  static override readonly IS_WRITE = false;
  private builders;

  readonly op = "SELECT_UNIQ";
  override readonly maxBatchSize = 200; // Select by unique key is cheap, so we can have much bigger load batches to accumulate more data from e.g. Shard 0 for the next multi-Shard requests.
  readonly default = null; // If no row is found, returns null.

  constructor(schema: Schema<TTable>, client: PgClient) {
    super(schema, client);
    this.builders = this.createWhereBuildersFieldsEq<
      LoadByInput<TTable, TUniqueKey>
    >({
      prefix: this.fmt("SELECT %SELECT_FIELDS FROM %T "),
      fields: this.schema.uniqueKey,
      suffix: this.fmt(""),
    });
  }

  override key(input: LoadByInput<TTable, TUniqueKey>): string {
    return JSON.stringify(this.schema.uniqueKey.map((field) => input[field]));
  }

  async runSingle(
    input: LoadByInput<TTable, TUniqueKey>,
    annotations: QueryAnnotation[],
  ): Promise<Row<TTable> | undefined> {
    const sql =
      this.builders.plain.prefix +
      this.builders.plain.func([["", input]]) +
      this.builders.plain.suffix;
    const rows = await this.clientQuery<Row<TTable>>(sql, annotations, 1);
    return rows[0];
  }

  async runBatch(
    inputs: Map<string, LoadByInput<TTable, TUniqueKey>>,
    annotations: QueryAnnotation[],
  ): Promise<Map<string, Row<TTable>>> {
    const sql =
      this.builders.optimized.prefix +
      this.builders.optimized.func(inputs) +
      this.builders.optimized.suffix;
    const rows = await this.clientQuery<Row<TTable>>(
      sql,
      annotations,
      inputs.size,
    );
    const output = new Map<string, Row<TTable>>();
    for (const row of rows) {
      output.set(
        this.key(row as unknown as LoadByInput<TTable, TUniqueKey>),
        row,
      );
    }

    return output;
  }
}
