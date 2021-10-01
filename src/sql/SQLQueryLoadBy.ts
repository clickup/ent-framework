import { QueryBase } from "../abstract/Query";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
import { nullthrows } from "../helpers";
import { LoadByInput, Row, Table, UniqueKey } from "../types";
import { SQLClient } from "./SQLClient";
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

class SQLRunnerLoadBy<
  TTable extends Table,
  TUniqueKey extends UniqueKey<TTable>
> extends SQLRunner<
  TTable,
  LoadByInput<TTable, TUniqueKey>,
  Row<TTable> | null
> {
  static override readonly IS_WRITE = false;
  readonly op = "SELECT_UNIQ";

  private prefix = this.fmt("SELECT %F FROM %T WHERE ", {
    specs: this.schema.table,
  });
  private suffix = this.fmt("");
  private whereBuilder =
    this.schema.uniqueKey.length === 1
      ? this.oneColumnWhereBuilder.bind(this)
      : this.multiColumnWhereBuilder.bind(this);
  private listBuilder = this.schema.uniqueKey.length
    ? this.createInBuilder(
        this.schema.uniqueKey[this.schema.uniqueKey.length - 1],
        `value.${this.schema.uniqueKey[this.schema.uniqueKey.length - 1]}`
      )
    : null;

  // If no row is found, returns null.
  readonly default = null;

  override key(input: LoadByInput<TTable, TUniqueKey>): string {
    return JSON.stringify(this.schema.uniqueKey.map((field) => input[field]));
  }

  async runSingle(
    input: LoadByInput<TTable, TUniqueKey>,
    annotations: Iterable<QueryAnnotation>
  ): Promise<Row<TTable> | undefined> {
    const sql = this.prefix + this.whereBuilder([input]) + this.suffix;
    const rows = await this.clientQuery<Row<TTable>>(sql, annotations, 1);
    return rows[0];
  }

  async runBatch(
    inputs: Map<string, LoadByInput<TTable, TUniqueKey>>,
    annotations: Iterable<QueryAnnotation>
  ): Promise<Map<string, Row<TTable>>> {
    const sql = this.prefix + this.whereBuilder(inputs.values()) + this.suffix;
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
    return nullthrows(this.listBuilder, "no unique key defined")(inputs);
  }

  private multiColumnWhereBuilder(
    inputs: Iterable<LoadByInput<TTable, TUniqueKey>>
  ): string {
    // field1='aaa' AND field2='bbb' AND field3 IN('aa', 'bb', 'cc', ...) OR ...
    // ^^^^^^^^^^^^^prefix^^^^^^^^^^               ^^^^^^^^^^ins^^^^^^^^
    // In case of constant prefix, it will be one Index Scan with ANY sub-clause.
    const listBuilder = nullthrows(this.listBuilder, "no unique key defined");

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
            ? field + "=" + this.escape(field, value)
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

      const inClause = listBuilder(ins);
      if (prefix !== "") {
        sql += "(" + prefix + " AND " + inClause + ")";
      } else {
        sql += inClause;
      }
    }

    return sql;
  }
}
