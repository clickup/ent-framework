import last from "lodash/last";
import { QueryBase } from "../abstract/Query";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import type { Schema } from "../abstract/Schema";
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
  private optimizedBuilder;
  private plainBuilder;
  readonly op = "SELECT_UNIQ";
  override readonly maxBatchSize = 1000; // Select by unique key is cheap, so we can have much bigger load batches to accumulate more data from e.g. shard 0 for the next multi-shard requests.
  readonly default = null; // If no row is found, returns null.

  constructor(schema: Schema<TTable>, client: SQLClient) {
    super(schema, client);
    const escapedFields = this.schema.uniqueKey.map((f) => this.escapeField(f));

    // ```
    // WHERE (field1, field2) IN(VALUES
    //   ((NULL::tbl).field1, (NULL::tbl).field2),
    //   ('aa', 'bb'),
    //   ('cc', 'dd'))
    // ```
    // - This clause always produces an Index Scan (not Bitmap Index Scan).
    // - Used in most of the cases in runBatch(), i.e. when unique key has >1
    //   fields, and they are all non-nullable.
    this.optimizedBuilder =
      this.schema.uniqueKey.length > 1 &&
      this.schema.uniqueKey.every(
        (field) => !this.schema.table[field].allowNull
      )
        ? this.createValuesBuilder<LoadByInput<TTable, TUniqueKey>>({
            prefix:
              this.fmt("SELECT %SELECT_FIELDS FROM %T WHERE ") +
              `(${escapedFields.join(", ")}) IN(VALUES\n` +
              "  (" +
              escapedFields.map((f) => this.fmt(`(NULL::%T).${f}`)).join(", ") +
              "),",
            fields: this.schema.uniqueKey,
            skipSorting: true, // for JS perf
            suffix: this.fmt(")"),
          })
        : null;

    // ```
    // (field1='a' AND field2='b' AND field3 IN('a', 'b', 'c', ...)) OR (...)
    //  ^^^^^^^^^^prefix^^^^^^^^^               ^^^^^^^^ins^^^^^^^
    // ```
    // - If at least one OR is produced, it will likely result in a slower
    //   Bitmap Index Scan.
    // - Used in runSingle() (no ORs there) or when optimized builder is not
    //   available (e.g. when unique key contains nullable fields).
    this.plainBuilder = {
      prefix: this.fmt("SELECT %SELECT_FIELDS FROM %T WHERE "),
      func: this.createOrBasedWhereBuilder(),
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
      this.plainBuilder.prefix +
      this.plainBuilder.func([["", input]]) +
      this.plainBuilder.suffix;
    const rows = await this.clientQuery<Row<TTable>>(sql, annotations, 1);
    return rows[0];
  }

  async runBatch(
    inputs: Map<string, LoadByInput<TTable, TUniqueKey>>,
    annotations: QueryAnnotation[]
  ): Promise<Map<string, Row<TTable>>> {
    const builder = this.optimizedBuilder ?? this.plainBuilder;
    const sql = builder.prefix + builder.func(inputs) + builder.suffix;
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

  private createOrBasedWhereBuilder() {
    if (this.schema.uniqueKey.length === 0) {
      return () => {
        throw Error("No unique key defined");
      };
    }

    const lastUniqueKeyField = last(this.schema.uniqueKey)!;

    // fieldN IN('aa', 'bb', 'cc', ...)
    const lastFieldOneOf = this.createOneOfBuilder(
      lastUniqueKeyField,
      `$value[1].${lastUniqueKeyField}`
    );

    if (this.schema.uniqueKey.length === 1) {
      // If we have only one field in unique key, we can use the plain
      // oneOfBuilder (which is either an IN(...) or =ANY(...) clause).
      return lastFieldOneOf;
    }

    return (
      inputs: Iterable<[key: string, input: LoadByInput<TTable, TUniqueKey>]>
    ) => {
      const insByPrefix = new Map<
        string,
        Array<[key: string, input: LoadByInput<TTable, TUniqueKey>]>
      >();
      for (const input of inputs) {
        let prefix = "";
        for (let i = 0; i < this.schema.uniqueKey.length - 1; i++) {
          const field = this.schema.uniqueKey[i];
          if (prefix !== "") {
            prefix += " AND ";
          }

          const value = (input[1] as any)[field];
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

        const inClause = lastFieldOneOf(ins);
        if (prefix !== "") {
          sql += "(" + prefix + " AND " + inClause + ")";
        } else {
          sql += inClause;
        }
      }

      return sql;
    };
  }
}
