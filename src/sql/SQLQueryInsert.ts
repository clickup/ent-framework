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

class SQLRunnerInsert<TTable extends Table> extends SQLRunner<
  TTable,
  InsertInput<TTable>,
  string | null
> {
  static override readonly IS_WRITE = true;
  readonly op = "INSERT";

  private valuesBuilder = this.createValuesBuilder(this.schema.table);
  private valuesBuilderSimple = this.createValuesBuilder(
    this.schema.table,
    true
  );

  constructor(schema: Schema<TTable>, client: SQLClient) {
    super(schema, client);

    this.valuesBuilder.suffix += this.fmt(
      "\n" +
        "  INSERT INTO %T (%F)\n" +
        "  SELECT %F FROM rows OFFSET 1\n" +
        "  ON CONFLICT DO NOTHING RETURNING " +
        "(SELECT _key FROM rows WHERE rows.%ID=%T.%ID), %ID",
      { specs: this.schema.table }
    );
    this.valuesBuilderSimple.prefix = this.fmt(
      "INSERT INTO %T (%F) VALUES\n  ",
      { specs: this.schema.table }
    );
    this.valuesBuilderSimple.suffix = this.fmt(
      " ON CONFLICT DO NOTHING RETURNING %ID"
    );
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
      this.valuesBuilderSimple.prefix +
      this.valuesBuilderSimple.func("", input) +
      this.valuesBuilderSimple.suffix;
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
    const pieces: string[] = [];
    for (const [key, input] of inputs) {
      pieces.push(this.valuesBuilder.func(key, input));
    }

    // To eliminate deadlocks in parallel batched inserts, we sort rows. This
    // prevents deadlocks when two batched queries are running in different
    // connections, and the table has some unique key.
    pieces.sort();

    const sql =
      this.valuesBuilder.prefix +
      ",\n  " +
      pieces.join(",\n  ") +
      this.valuesBuilder.suffix;

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
