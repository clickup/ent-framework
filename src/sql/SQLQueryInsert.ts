import { QueryBase } from "../abstract/Query";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
import { Schema } from "../abstract/Schema";
import { ID, InsertInput, Table } from "../types";
import { SQLClient } from "./SQLClient";
import { SQLRunner } from "./SQLRunner";

export class SQLQueryInsert<TTable extends Table> extends QueryBase<
  TTable,
  InsertInput<TTable>,
  string | null,
  SQLClient
> {
  protected readonly RUNNER_CLASS = SQLRunnerInsert;
}

export class SQLRunnerInsert<TTable extends Table> extends SQLRunner<
  TTable,
  InsertInput<TTable>,
  string | null
> {
  static override readonly IS_WRITE = true;
  readonly op = "INSERT";

  private singleBuilder;
  private batchBuilder;

  constructor(schema: Schema<TTable>, client: SQLClient) {
    super(schema, client);

    this.singleBuilder = this.createValuesBuilder({
      prefix: this.fmt("INSERT INTO %T (%INSERT_FIELDS) VALUES"),
      fields: Object.keys(this.schema.table),
      rowsReorderingIsSafe: false, // because ON CONFLICT DO NOTHING doesn't have input:output rows as N:N
      suffix: this.fmt(` ON CONFLICT DO NOTHING RETURNING %PK AS ${ID}`),
    });

    // We use WITH clause in INSERT, because "ON CONFLICT DO NOTHING" clause
    // doesn't emit anything in "RETURNING" clause, so we could've not
    // distinguish rows which were inserted from the rows which were not. Having
    // WITH solves this (see RETURNING below).
    this.batchBuilder = this.createWithBuilder({
      fields: Object.keys(this.schema.table),
      rowsReorderingIsSafe: true, // because we use _key to reference the input rows
      suffix: this.fmt(
        "  INSERT INTO %T (%INSERT_FIELDS)\n" +
          "  SELECT %INSERT_FIELDS FROM rows OFFSET 1\n" +
          "  ON CONFLICT DO NOTHING " +
          `RETURNING (SELECT _key FROM rows WHERE %PK(rows)=%PK(%T)), %PK AS ${ID}`
      ),
    });
  }

  // In case of duplicate key error, returns null.
  readonly default = null;

  override key(input: InsertInput<TTable>): string {
    // We must NEVER dedup inserts, because:
    // 1. If the table DOESN'T have an unique key, then we must insert all
    //    input rows (no dedup allowed).
    // 2. If the table DOES have an unique key, then we must logically ensure
    //    that only one concurrent promise is resolved into an inserted row ID,
    //    and all other are resolved with null (aka "not inserted due to
    //    duplicate").
    return super.key(input);
  }

  async runSingle(
    input: InsertInput<TTable>,
    annotations: QueryAnnotation[]
  ): Promise<string | undefined> {
    const sql =
      this.singleBuilder.prefix +
      this.singleBuilder.func([["", input]]) +
      this.singleBuilder.suffix;
    const rows = await this.clientQuery<{ [ID]: string }>(sql, annotations, 1);
    if (!rows.length) {
      return undefined;
    }

    return rows[0][ID];
  }

  async runBatch(
    inputs: Map<string, InsertInput<TTable>>,
    annotations: QueryAnnotation[]
  ): Promise<Map<string, string>> {
    const sql =
      this.batchBuilder.prefix +
      this.batchBuilder.func(inputs) +
      this.batchBuilder.suffix;
    const rows = await this.clientQuery<{ _key: string; [ID]: string }>(
      sql,
      annotations,
      inputs.size
    );
    const outputs = new Map<string, string>();
    for (const row of rows) {
      outputs.set(row._key, row[ID]);
    }

    return outputs;
  }
}
