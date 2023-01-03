import pickBy from "lodash/pickBy";
import { QueryBase } from "../abstract/Query";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import type { Schema } from "../abstract/Schema";
import { nullthrows } from "../helpers/misc";
import type { InsertInput, Table } from "../types";
import { ID } from "../types";
import type { SQLClient } from "./SQLClient";
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

export class SQLRunnerUpsert<TTable extends Table> extends SQLRunner<
  TTable,
  InsertInput<TTable>,
  string
> {
  static override readonly IS_WRITE = true;
  private builder;
  readonly op = "UPSERT";

  constructor(schema: Schema<TTable>, client: SQLClient) {
    super(schema, client);

    // TODO: there is a bug here, autoInsert fields are NOT updated during the
    // upsert (they are only inserted). Not clear how to fix this, because we
    // don't want e.g. created_at to be updated (and it's an autoInsert field).

    const uniqueKeyFields = this.schema.uniqueKey
      .map((field) => this.escapeField(field))
      .join(",");
    this.builder = this.createValuesBuilder({
      prefix: this.fmt("INSERT INTO %T (%INSERT_FIELDS) VALUES"),
      fields: Object.keys(this.schema.table),
      suffix: this.fmt(
        "\n" +
          `  ON CONFLICT (${uniqueKeyFields}) DO UPDATE ` +
          `SET %UPDATE_FIELD_VALUE_PAIRS(EXCLUDED) RETURNING %PK AS ${ID}`,
        {
          fields: Object.keys(
            pickBy(
              this.schema.table,
              ({ autoInsert }) => autoInsert === undefined
            )
          ),
        }
      ),
    });
  }

  // Upsert always succeed, or if it fails, we have troubles with the whole batch!
  get default(): string {
    throw Error("BUG: upsert must always return a value");
  }

  override key(inputIn: InsertInput<TTable>): string {
    // This is not fast. Upsert is not fast and is ugly in general.
    if (!this.schema.uniqueKey.length) {
      throw Error(`Define unique key fields to use upsert for ${this.name}`);
    }

    const input: Partial<Record<string, any>> = inputIn;
    const key: unknown[] = [];
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
    annotations: QueryAnnotation[]
  ): Promise<string | undefined> {
    const sql =
      this.builder.prefix +
      this.builder.func([["", input]]) +
      this.builder.suffix;
    const rows = await this.clientQuery<{ [ID]: string }>(sql, annotations, 1);
    return nullthrows(rows[0], sql)[ID];
  }

  async runBatch(
    inputs: Map<string, InsertInput<TTable>>,
    annotations: QueryAnnotation[]
  ): Promise<Map<string, string>> {
    const sql =
      this.builder.prefix + this.builder.func(inputs) + this.builder.suffix;
    const rows = await this.clientQuery<{ [ID]: string }>(
      sql,
      annotations,
      inputs.size
    );

    // In "INSERT ... VALUES ... ON CONFLICT DO UPDATE ... RETURNING ..." in
    // case insert didn't happen we can't match the updated row id with the key.
    // Luckily, the order of rows returned is the same as the input rows order,
    // and "ON CONFLICT DO UPDATE" update always succeeds entirely (or fails
    // entirely).
    if (rows.length !== inputs.size) {
      throw Error(
        `BUG: number of rows returned from upsert (${rows.length}) ` +
          `is different from the number of input rows (${inputs.size}): ${sql}`
      );
    }

    const outputs = new Map<string, string>();
    let i = 0;
    for (const key of inputs.keys()) {
      outputs.set(key, rows[i][ID]);
      i++;
    }

    return outputs;
  }
}
