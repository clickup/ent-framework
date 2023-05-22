import { inspect } from "util";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import { QueryBase } from "../abstract/QueryBase";
import type { Schema } from "../abstract/Schema";
import { hash, hasKey } from "../helpers/misc";
import type { Order, Row, SelectInput, Table } from "../types";
import type { SQLClient } from "./SQLClient";
import { escapeString } from "./SQLClient";
import { SQLRunner } from "./SQLRunner";

export class SQLQuerySelect<TTable extends Table> extends QueryBase<
  TTable,
  SelectInput<TTable>,
  Array<Row<TTable>>,
  SQLClient
> {
  protected readonly RUNNER_CLASS = SQLRunnerSelect;
}

const ALLOWED_ORDER = [
  "ASC",
  "ASC NULLS LAST",
  "ASC NULLS FIRST",
  "DESC",
  "DESC NULLS LAST",
  "DESC NULLS FIRST",
];

export class SQLRunnerSelect<TTable extends Table> extends SQLRunner<
  TTable,
  SelectInput<TTable>,
  Array<Row<TTable>>
> {
  static override readonly IS_WRITE = false;
  private prefix = this.fmt("SELECT %SELECT_FIELDS FROM %T ");
  private prefixUnion = this.fmt("SELECT ");
  private midfixUnion = this.fmt(" AS _key, %SELECT_FIELDS FROM %T ");
  private builder;
  readonly op = "SELECT";
  override readonly maxBatchSize = 10; // PG crashes on large queries with lots of UNION ALL, so we keep this value low.
  readonly default = []; // We just need something here.

  constructor(schema: Schema<TTable>, client: SQLClient) {
    super(schema, client);
    this.builder = this.createWhereBuilder({
      prefix: this.fmt(""),
      suffix: this.fmt(""),
    });
  }

  override key(input: SelectInput<TTable>): string {
    // Coalesce equal select queries.
    const json = JSON.stringify(input);
    return hash(json);
  }

  async runSingle(
    input: SelectInput<TTable>,
    annotations: QueryAnnotation[]
  ): Promise<Array<Row<TTable>>> {
    let sql =
      this.prefix +
      this.builder.prefix +
      this.builder.func(input.where) +
      this.builder.suffix +
      this.buildOptionalOrder(input.order) +
      this.buildLimit(input.limit);
    sql = this.buildCustom(input, sql);
    return this.clientQuery<Row<TTable>>(sql, annotations, 1);
  }

  async runBatch(
    inputs: Map<string, SelectInput<TTable>>,
    annotations: QueryAnnotation[]
  ): Promise<Map<string, Array<Row<TTable>>>> {
    // SELECT '...' AS _key, ... FROM ... WHERE ...
    //    UNION ALL
    // SELECT '...' AS _key, ... FROM ... WHERE ...
    const pieces: string[] = [];
    for (const [key, input] of inputs.entries()) {
      let sql =
        this.prefixUnion +
        escapeString(key) +
        this.midfixUnion +
        this.builder.prefix +
        this.builder.func(input.where) +
        this.builder.suffix +
        this.buildOptionalOrder(input.order) +
        this.buildLimit(input.limit);
      sql = this.buildCustom(input, sql);
      pieces.push("(" + sql + ")");
    }

    const unionRows = await this.clientQuery<{ _key: string } & Row<TTable>>(
      pieces.join("\n  UNION ALL\n"),
      annotations,
      inputs.size
    );

    const outputs = new Map<string, Array<Row<TTable>>>();
    for (const { _key: key, ...row } of unionRows) {
      let rows = outputs.get(key);
      if (!rows) {
        rows = [];
        outputs.set(key, rows);
      }

      rows.push(row as Row<TTable>);
    }

    return outputs;
  }

  private buildCustom(input: SelectInput<TTable>, sql: string) {
    // This is mostly to do hacks in PostgreSQL queries.
    // Not even exposed by Ent framework.
    const custom = input.custom
      ? (input.custom as {
          ctes?: string[][];
          joins?: string[][];
          from?: string[];
        })
      : {};
    if (custom.joins?.length) {
      sql = sql.replace(
        / FROM \S+\s+/,
        (m) =>
          m +
          "\n" +
          custom.joins!.map((join) => this.buildLiteral(join)).join("\n") +
          "\n"
      );
    } else if (custom.from?.length) {
      sql = sql.replace(
        / FROM \S+/,
        () => " FROM " + this.buildLiteral(custom.from!)
      );
    }

    if (custom.ctes?.length) {
      sql =
        "WITH\n  " +
        custom.ctes.map((cte) => this.buildLiteral(cte)).join(",\n  ") +
        "\n" +
        sql;
    }

    return sql;
  }

  private buildOptionalOrder(order: Order<TTable> | undefined) {
    if (!order) {
      return "";
    }

    // TS tuples support is unfortunately weak: it has hard time treating arrays
    // as tuples, and also treating strings as literal strings. E.g. we can't do:
    //   [["field", "ASC"], ...]
    // in the caller code and have Order<TType> to be tuple-based; the only
    // work-around would be
    //   [tuple("field" as const, "ASC" as const), ...]
    // which is ugly. So we use object-based order specifiers and lots of run-time
    // checks around the data passed.
    const pieces: string[] = [];
    for (const item of order) {
      if (hasKey("$literal", item)) {
        if (Object.keys(item).length > 1) {
          throw Error(
            "Invalid order specification - $literal must be the only key: " +
              inspect(item)
          );
        }

        pieces.push(this.buildLiteral(item.$literal));
      } else {
        for (const [field, dir] of Object.entries(item)) {
          if (!ALLOWED_ORDER.includes("" + dir)) {
            throw Error(
              `Invalid order specifier: ${dir}; allowed specifiers: ` +
                ALLOWED_ORDER.join(", ")
            );
          }

          pieces.push(`${this.escapeField(field)} ${dir}`);
        }
      }
    }

    return pieces.length > 0 ? " ORDER BY " + pieces.join(", ") : "";
  }

  private buildLimit(limit: number) {
    return " LIMIT " + (parseInt("" + limit) || 0);
  }
}
