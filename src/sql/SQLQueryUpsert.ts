import pickBy from "lodash/pickBy";
import { QueryBase } from "../abstract/Query";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
import { Schema } from "../abstract/Schema";
import { nullthrows } from "../helpers";
import { ID, InsertInput, Table } from "../types";
import { SQLClient } from "./SQLClient";
import { SQLRunner } from "./SQLRunner";

export class SQLQueryUpsert<TTable extends Table> extends QueryBase<
  TTable,
  InsertInput<TTable>,
  string,
  SQLClient
> {
  // TODO: we need to do the same as we did with SQLQueryUpdate() here. Because
  // currently upsert ignores autoInsert fields in ON CONFLICT UPDATE ... clause,
  // so if some field is auto-insertable (i.e. has default value on insert), it
  // will be ignored by upsert even if it's provided in the input row.
  // It may be not simple though; not clear, is it expressible in SQL at all or not.
  protected readonly RUNNER_CLASS = SQLRunnerUpsert;
}

class SQLRunnerUpsert<TTable extends Table> extends SQLRunner<
  TTable,
  InsertInput<TTable>,
  string
> {
  static override readonly IS_WRITE = true;
  readonly op = "UPSERT";

  private valuesBuilder = this.createValuesBuilder(this.schema.table, true);
  private prefixSimple: string;
  private suffixSimple: string;

  constructor(schema: Schema<TTable>, client: SQLClient) {
    super(schema, client);

    // TODO: there is a bug here, autoInsert fields are NOT updated during
    // the upsert (they are only inserted). Not clear how to fix this,
    // because we don't want e.g. created_at to be updated (and it's an
    // autoInsert field).
    const conflictTarget = this.schema.uniqueKey.join(",");
    this.prefixSimple = this.fmt("INSERT INTO %T (%F) VALUES\n  ", {
      specs: this.schema.table,
    });
    this.suffixSimple = this.fmt(
      "\n" +
        `  ON CONFLICT (${conflictTarget}) DO UPDATE ` +
        `SET %KV(EXCLUDED) RETURNING %ID`,
      {
        specs: pickBy(
          this.schema.table,
          ({ autoInsert }) => autoInsert === undefined
        ) as Partial<TTable>,
      }
    );

    this.valuesBuilder.suffix += this.fmt(
      "\n" +
        "  INSERT INTO %T (%F)\n" +
        "  SELECT %F FROM rows OFFSET 1" +
        this.suffixSimple,
      { specs: this.schema.table }
    );
  }

  // Upsert always succeed, or if it fails, we have troubles with the whole batch!
  get default(): string {
    throw Error("BUG: upsert must always return a value");
  }

  override key(inputIn: InsertInput<TTable>): string {
    // This is not fast. Upsert is not fast and is ugly in general.
    if (!this.schema.uniqueKey.length) {
      throw Error("Define unique key fields to use upsert");
    }

    const input: Partial<Record<string, any>> = inputIn;
    const key: any[] = [];
    for (const field of this.schema.uniqueKey as readonly string[]) {
      key.push(
        input[field] === null || input[field] === undefined
          ? { guaranteed_unique_value: super.key(inputIn) }
          : input[field]
      );
    }

    return JSON.stringify(key);
  }

  async runSingle(
    input: InsertInput<TTable>,
    annotations: Iterable<QueryAnnotation>
  ): Promise<string | undefined> {
    const sql =
      this.prefixSimple +
      this.valuesBuilder.func("", input) +
      this.suffixSimple;
    const rows = await this.clientQuery<{ [ID]: string }>(sql, annotations, 1);
    return nullthrows(rows[0], sql)[ID];
  }

  async runBatch(
    inputs: Map<string, InsertInput<TTable>>,
    annotations: Iterable<QueryAnnotation>
  ): Promise<Map<string, string>> {
    // In "WITH ... VALUES ... INSERT ... ON CONFLICT UPDATE ... RETURNING ..." in
    // case insert didn't happen we can't match the updated row id with the WITH id.
    // Luckily, the order of rows returned is the same as the input rows order, and
    // "ON CONFLICT UPDATE" update always succeeds entirely (or fails entirely).
    const tuples: Array<{ key: string; sql: string }> = [];
    for (const [key, input] of inputs) {
      tuples.push({ key: key, sql: this.valuesBuilder.func(key, input) });
    }

    // Sorting values tuples at the client to eliminate deadlocks.
    tuples.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

    let sql = this.valuesBuilder.prefix;
    sql += ",\n  " + tuples.map((tuple) => tuple.sql).join(",\n  ");
    sql += this.valuesBuilder.suffix;

    const rows = await this.clientQuery<{ [ID]: string }>(
      sql,
      annotations,
      inputs.size
    );
    if (rows.length !== inputs.size) {
      throw Error(
        "Number of rows returned from upsert (" +
          rows.length +
          ") is different from the number of input rows (" +
          inputs.size +
          "): " +
          sql
      );
    }

    const outputs = new Map<string, string>();
    let i = 0;
    for (const row of rows) {
      outputs.set(tuples[i++].key, row[ID]);
    }

    return outputs;
  }
}
