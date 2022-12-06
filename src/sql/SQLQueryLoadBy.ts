import last from "lodash/last";
import { QueryBase } from "../abstract/Query";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import type { Schema } from "../abstract/Schema";
import { nullthrows } from "../helpers/misc";
import type { LoadByInput, Row, Table, UniqueKey } from "../types";
import type { SQLClient } from "./SQLClient";
import { SQLRunner } from "./SQLRunner";

export class SQLQueryLoadBy<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>
> extends QueryBase<
  TTable,
  LoadByInput<TTable, TUniqueKey>,
  Row<TTable> | null,
  SQLClient
> {
  protected readonly RUNNER_CLASS = SQLRunnerLoadBy;
}

export class SQLRunnerLoadBy<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>
> extends SQLRunner<
  TTable,
  LoadByInput<TTable, TUniqueKey>,
  Row<TTable> | null
> {
  static override readonly IS_WRITE = false;
  private inBuilder;
  private builder;
  readonly op = "SELECT_UNIQ";
  override readonly maxBatchSize = 1000; // Select by unique key is cheap, so we can have much bigger load batches to accumulate more data from e.g. shard 0 for the next multi-shard requests.
  readonly default = null; // If no row is found, returns null.

  constructor(schema: Schema<TTable>, client: SQLClient) {
    super(schema, client);
    const lastUniqueKeyField = last(this.schema.uniqueKey);
    this.inBuilder = lastUniqueKeyField
      ? this.createOneOfBuilder(
          lastUniqueKeyField,
          `$value.${lastUniqueKeyField}`
        )
      : null;
    this.builder = {
      prefix: this.fmt("SELECT %SELECT_FIELDS FROM %T WHERE "),
      func:
        this.schema.uniqueKey.length === 1
          ? this.oneColumnWhereBuilder.bind(this)
          : this.multiColumnWhereBuilder.bind(this),
      suffix: this.fmt(""),
    };
  }

  override key(input: LoadByInput<TTable, TUniqueKey>): string {
    return JSON.stringify(this.schema.uniqueKey.map((field) => input[field]));
  }

  async runSingle(
    input: LoadByInput<TTable, TUniqueKey>,
    annotations: QueryAnnotation[]
  ): Promise<Row<TTable> | undefined> {
    const sql =
      this.builder.prefix + this.builder.func([input]) + this.builder.suffix;
    const rows = await this.clientQuery<Row<TTable>>(sql, annotations, 1);
    return rows[0];
  }

  async runBatch(
    inputs: Map<string, LoadByInput<TTable, TUniqueKey>>,
    annotations: QueryAnnotation[]
  ): Promise<Map<string, Row<TTable>>> {
    const sql =
      this.builder.prefix +
      this.builder.func(inputs.values()) +
      this.builder.suffix;
    const rows = await this.clientQuery<Row<TTable>>(
      sql,
      annotations,
      inputs.size
    );
    const output = new Map<string, Row<TTable>>();
    for (const row of rows) {
      output.set(this.key(row as any), row);
    }

    return output;
  }

  private oneColumnWhereBuilder(
    inputs: Iterable<LoadByInput<TTable, TUniqueKey>>
  ): string {
    // field1 IN('aa', 'bb', 'cc', ...)
    return nullthrows(this.inBuilder, "no unique key defined")(inputs);
  }

  private multiColumnWhereBuilder(
    inputs: Iterable<LoadByInput<TTable, TUniqueKey>>
  ): string {
    // field1='aaa' AND field2='bbb' AND field3 IN('aa', 'bb', 'cc', ...) OR ...
    // ^^^^^^^^^^^^^prefix^^^^^^^^^^               ^^^^^^^^^^ins^^^^^^^^
    // In case of constant prefix, it will be one Index Scan with ANY sub-clause.
    const inBuilder = nullthrows(this.inBuilder, "no unique key defined");

    const insByPrefix = new Map<
      string,
      Array<LoadByInput<TTable, TUniqueKey>>
    >();
    for (const input of inputs) {
      let prefix = "";
      for (let i = 0; i < this.schema.uniqueKey.length - 1; i++) {
        const field = this.schema.uniqueKey[i];
        if (prefix !== "") {
          prefix += " AND ";
        }

        const value = (input as any)[field];
        prefix +=
          value !== null
            ? field + "=" + this.escapeValue(field, value)
            : field + " IS NULL";
      }

      let ins = insByPrefix.get(prefix);
      if (!ins) {
        ins = [];
        insByPrefix.set(prefix, ins);
      }

      ins.push(input);
    }

    let sql = "";
    for (const [prefix, ins] of insByPrefix) {
      if (sql !== "") {
        sql += " OR ";
      }

      const inClause = inBuilder(ins);
      if (prefix !== "") {
        sql += "(" + prefix + " AND " + inClause + ")";
      } else {
        sql += inClause;
      }
    }

    return sql;
  }
}
