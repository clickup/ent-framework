import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import { QueryBase } from "../abstract/QueryBase";
import type { Schema } from "../abstract/Schema";
import type { InsertInput, Table } from "../types";
import { ID } from "../types";
import type { PgClient } from "./PgClient";
import { PgRunner } from "./PgRunner";

export class PgQueryInsert<TTable extends Table> extends QueryBase<
  TTable,
  InsertInput<TTable>,
  string | null,
  PgClient
> {
  /** @ignore */
  readonly RUNNER_CLASS = PgRunnerInsert;
}

class PgRunnerInsert<TTable extends Table> extends PgRunner<
  TTable,
  InsertInput<TTable>,
  string | null
> {
  static override readonly IS_WRITE = true;
  private singleBuilder;
  private batchBuilder;

  readonly op = "INSERT";
  readonly maxBatchSize = 100;
  readonly default = null; // In case of duplicate key error, returns null.

  constructor(schema: Schema<TTable>, client: PgClient) {
    super(schema, client);

    const fields = this.addPK(Object.keys(this.schema.table), "append");

    this.singleBuilder = this.createValuesBuilder({
      prefix: this.fmt("INSERT INTO %T (%FIELDS) VALUES", { fields }),
      indent: "  ",
      fields,
      suffix: this.fmt(` ON CONFLICT DO NOTHING RETURNING %PK AS ${ID}`),
    });

    // We use WITH clause in INSERT, because "ON CONFLICT DO NOTHING" clause
    // doesn't emit anything in "RETURNING" clause, so we could've not
    // distinguished rows which were inserted from the rows which were not.
    // Having WITH solves this (see RETURNING below).
    this.batchBuilder = this.createWithBuilder({
      fields,
      suffix: this.fmt(
        "INSERT INTO %T (%FIELDS)\n" +
          "SELECT %FIELDS FROM rows OFFSET 1\n" +
          `ON CONFLICT DO NOTHING RETURNING (SELECT _key FROM rows WHERE %PK(rows)=%PK(%T)), %PK AS ${ID}`,
        { fields },
      ),
    });
  }

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
    annotations: QueryAnnotation[],
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
    annotations: QueryAnnotation[],
  ): Promise<Map<string, string>> {
    const sql =
      this.batchBuilder.prefix +
      this.batchBuilder.func(inputs) +
      this.batchBuilder.suffix;
    const rows = await this.clientQuery<{ _key: string; [ID]: string }>(
      sql,
      annotations,
      inputs.size,
    );
    const outputs = new Map<string, string>();
    for (const row of rows) {
      outputs.set(row._key, row[ID]);
    }

    return outputs;
  }
}
