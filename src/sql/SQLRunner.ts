import { inspect } from "util";
import random from "lodash/random";
import { Runner } from "../abstract/Batcher";
import { QueryAnnotation } from "../abstract/QueryAnnotation";
import { Schema } from "../abstract/Schema";
import { hasKey, nullthrows } from "../helpers";
import {
  $and,
  $gt,
  $gte,
  $literal,
  $lt,
  $lte,
  $ne,
  $not,
  $or,
  $overlap,
  ID,
  Literal,
  Table,
  Value,
  Where,
} from "../types";
import * as sqlClientMod from "./SQLClient";
import { SQLError } from "./SQLError";

const DEADLOCK_RETRY_MS_MIN = 2000;
const DEADLOCK_RETRY_MS_MAX = 5000;
const ERROR_DEADLOCK = "deadlock detected";
const ERROR_CONFLICT_RECOVERY =
  "canceling statement due to conflict with recovery";

/**
 * A convenient pile of helper methods usable by most of SQLQuery* classes. In
 * some sense it's an anti-pattern, but still reduces the boilerplate.
 *
 * SQLRunner is also responsible for stringifying the values passed to the
 * queries and parsing values returned from the DB according to the field types
 * specs.
 */
export abstract class SQLRunner<
  TTable extends Table,
  TInput,
  TOutput
> extends Runner<TInput, TOutput> {
  override ["constructor"]: typeof SQLRunner;

  abstract readonly op: string;

  readonly shardName = this.client.shardName;
  readonly isMaster = this.client.isMaster;

  private escapers: Partial<Record<keyof TTable, (value: any) => string>> = {};
  private parsers: Array<[keyof TTable, (value: any) => any]> = [];
  private stringifiers: Partial<Record<keyof TTable, (value: any) => string>> =
    {};

  constructor(
    public readonly schema: Schema<TTable>,
    private client: sqlClientMod.SQLClient
  ) {
    super(sqlClientMod.escapeIdent(schema.name));

    for (const field of Object.keys(this.schema.table)) {
      const body = "return " + this.createEscapeCode(field, "$value");
      this.escapers[field as keyof TTable] = this.newFunction("$value", body);
    }

    for (const [field, { type }] of Object.entries(this.schema.table)) {
      // Notice that e.g. Date type has parse() static method, so we require
      // BOTH parse() and stringify() to be presented in custom types.
      if (hasKey("parse", type) && hasKey("stringify", type)) {
        this.parsers.push([field, type.parse.bind(type)]);
        this.stringifiers[field as keyof TTable] = type.stringify.bind(type);
      }
    }
  }

  delayForSingleQueryRetryOnError(e: any) {
    // Deadlocks may happen when a simple query involves multiple rows (e.g.
    // deleting a row by ID, but this row has foreign keys, especially with ON
    // DELETE CASCADE).
    return e instanceof SQLError && e.message.includes(ERROR_DEADLOCK)
      ? random(DEADLOCK_RETRY_MS_MIN, DEADLOCK_RETRY_MS_MAX)
      : e instanceof SQLError && e.message.includes(ERROR_CONFLICT_RECOVERY)
      ? "immediate_retry"
      : "no_retry";
  }

  shouldDebatchOnError(e: any) {
    return (
      // Debatch ALL SQL WRITE query errors (FK errors, deadlocks etc.)
      (e instanceof SQLError && this.constructor.IS_WRITE) ||
      // Debatch "conflict with recovery" errors (we support retries only after
      // debatching, so have to return true here).
      (e instanceof SQLError && e.message.includes(ERROR_CONFLICT_RECOVERY))
    );
  }

  protected async clientQuery<TOutput>(
    sql: string,
    annotations: QueryAnnotation[],
    batchFactor: number
  ) {
    const rows = await this.client.query<TOutput>(
      sql,
      this.op,
      this.name,
      annotations,
      batchFactor
    );

    // Apply parsers only for known field names. Notice that TOutput is not
    // necessarily a type of the table's row, it can be something else (in e.g.
    // INSERT or DELETE operations).
    if (rows.length > 0) {
      for (const [field, parser] of this.parsers) {
        if (field in rows[0]) {
          for (const row of rows) {
            const dbValue = row[field as keyof TOutput];
            if (dbValue !== null && dbValue !== undefined) {
              row[field as keyof TOutput] = parser(dbValue);
            }
          }
        }
      }
    }

    return rows;
  }

  /**
   * Formats the prefixes/suffixes of various compound SQL clauses.
   * Don't use on performance-critical path!
   */
  protected fmt(template: string, args: { specs?: Partial<Table> } = {}) {
    return template.replace(
      /%(?:T|F|ID|KV\((\w+)\))/g,
      (c: string, a?: string) => {
        if (c === "%T") {
          // Table name
          return this.name;
        } else if (c === "%F") {
          // Comma-separated list of Fields of a Table
          return Object.keys(
            nullthrows(args.specs, "no args.spec passed in " + template)
          ).join(", ");
        } else if (c === "%ID") {
          // id
          return ID;
        } else if (c.startsWith("%KV")) {
          // %KV(X) -> field1=X.field1, field2=X.field2, ...
          // If empty list of fields, we emit id=X.id
          const fields = Object.keys(
            nullthrows(args.specs, "no args.specs passed in " + template)
          );
          return (fields.length ? fields : [ID])
            .map((field) => field + "=" + a + "." + field)
            .join(", ");
        } else {
          throw Error("Unknown format spec: " + c);
        }
      }
    );
  }

  /**
   * Does escaping at runtime using the codegen above. We use escapers table for
   * the following reasons:
   * 1. We want to be sure that we know in advance, how to escape all table
   *    fields (and not fail in run-time).
   * 2. We want to make createEscapeCode() the single source of truth about
   *    fields escaping.
   */
  protected escape(field: keyof TTable, value: any): string {
    const escaper = this.escapers[field];
    if (!escaper) {
      throw Error(
        "Unknown field name: " +
          field +
          "; allowed fields are: " +
          Object.keys(this.schema.table).join(", ")
      );
    }

    return escaper(value);
  }

  /**
   * Returns a newly created JS function which, when called with a row set,
   * returns the following SQL clause:
   *
   * WITH rows(id, a, b, _key) AS (VALUES
   *   ((NULL::tbl).id, (NULL::tbl).a, (NULL::tbl).b, 'k0'),
   *   ('123',          'xyz',         'nn',          'kSome'),
   *   ('456',          'abc',         'nn',          'kOther'),
   *   ...
   * )
   *
   * The set of columns is passed in specs; if noKey is false, then no _key
   * field is emitted in the end.
   */
  protected createValuesBuilder<TRow>(
    specs: Table,
    noKey: boolean = false
  ): {
    prefix: string;
    func: ($key: string, $input: TRow) => string;
    suffix: string;
  } {
    const parts: string[] = [];
    for (const [field, spec] of Object.entries(specs)) {
      parts.push(
        this.createEscapeCode(
          field,
          `$input.${field}`,
          spec.autoInsert !== undefined ? spec.autoInsert : spec.autoUpdate
        )
      );
    }

    const body =
      'return "(" + ' +
      parts.join(" + ', ' + ") +
      (noKey ? "" : '+ ", " + this.escapeString($key)') +
      '+ ")"';

    // Notice that _key pseudo-column MUST be the last one, this allows
    // us later sort the built rows for deadlocks prevention.
    const nulls = Object.keys(specs)
      .map((field) => this.fmt("(NULL::%T)." + field))
      .join(", ");
    return {
      prefix:
        this.fmt(
          "WITH rows(%F" + (noKey ? "" : ", _key") + ") AS (VALUES\n  (",
          { specs }
        ) +
        nulls +
        (noKey ? "" : ", 'k0'") +
        ")",
      func: this.newFunction("$key", "$input", body),
      suffix: ")",
    };
  }

  /**
   * Returns a newly created JS function which, when called with an object,
   * returns the following SQL clause:
   *
   * id='123', a='xyz', b='nnn'
   *
   * The set of columns is passed in specs, all other columns are ignored.
   */
  protected createUpdateKVsBuilder<TInput>(
    specs: Partial<Table>
  ): (input: TInput) => string {
    const parts: string[] = [];
    for (const [field, type] of Object.entries(specs)) {
      parts.push(
        `"${field}=" + ` +
          this.createEscapeCode(field, `$input.${field}`, type!.autoUpdate)
      );
    }

    const body =
      "return " + (parts.length ? parts.join(" + ', ' + ") : `"${ID}=${ID}"`);
    return this.newFunction("$input", body);
  }

  /**
   * Returns a newly created JS function which, when called with an array
   * of values, returns one of following SQL clause:
   *
   * - $field IN('aaa', 'bbb', 'ccc')
   * - ($field IN('aaa', 'bbb') OR $field IS NULL)
   * - $field IS NULL
   * - false
   *
   * If $subField is passed, then $f is "$subField.$field"
   */
  protected createInBuilder(
    field: keyof TTable,
    fieldCode = "value"
  ): (values: Iterable<any>) => string {
    const escapedFieldCode = JSON.stringify(sqlClientMod.escapeIdent(field));
    const valueCode = this.createEscapeCode(field, fieldCode);
    const body = `
      let sql = '';
      let hasIsNull = false;
      for (const value of $values) {
        if (${fieldCode} != null) {
          if (sql) sql += ',';
          sql += ${valueCode};
        } else {
          hasIsNull = true;
        }
      }
      if (sql) {
        sql = ${escapedFieldCode} + ' IN(' + sql + ')';
      }
      return sql && hasIsNull
        ? '(' + sql + ' OR ' + ${escapedFieldCode} + ' IS NULL)'
        : hasIsNull
        ? ${escapedFieldCode} + ' IS NULL'
        : sql
        ? sql
        : 'false/*empty_IN*/';
    `;
    return this.newFunction("$values", body);
  }

  protected buildOptionalWhere(
    specs: TTable,
    where: Where<TTable> | undefined
  ) {
    if (!where) {
      return "";
    }

    return " WHERE " + this.buildWhere(specs, where, true);
  }

  protected buildWhere(
    specs: TTable,
    where: Where<TTable>,
    isTopLevel: boolean = false
  ) {
    const pieces: string[] = [];
    for (const [key, value] of Object.entries(where)) {
      if (value === undefined) {
        continue;
      }

      if (key[0] === "$") {
        continue;
      }

      if (!specs[key]) {
        throw Error("Unknown field " + key);
      }

      let foundOp = false;
      if (hasKey($gte, value)) {
        pieces.push(this.buildFieldBinOp(key, ">=", value[$gte]));
        foundOp = true;
      }

      if (hasKey($gt, value)) {
        pieces.push(this.buildFieldBinOp(key, ">", value[$gt]));
        foundOp = true;
      }

      if (hasKey($lte, value)) {
        pieces.push(this.buildFieldBinOp(key, "<=", value[$lte]));
        foundOp = true;
      }

      if (hasKey($lt, value)) {
        pieces.push(this.buildFieldBinOp(key, "<", value[$lt]));
        foundOp = true;
      }

      if (hasKey($ne, value)) {
        pieces.push(this.buildFieldNe(key, value[$ne]));
        foundOp = true;
      }

      if (hasKey($overlap, value)) {
        pieces.push(this.buildFieldBinOp(key, "&&", value[$overlap]));
        foundOp = true;
      }

      if (!foundOp) {
        pieces.push(this.buildFieldEq(key, value as any));
      }
    }

    if (hasKey($and, where)) {
      const clause = this.buildLogical(specs, "AND", where[$and]);
      if (clause.length) {
        pieces.push(clause);
      }
    }

    if (hasKey($or, where)) {
      const clause = this.buildLogical(specs, "OR", where[$or]);
      if (clause.length) {
        pieces.push(clause);
      }
    }

    if (hasKey($not, where)) {
      pieces.push(this.buildNot(specs, where[$not]));
    }

    if (hasKey($literal, where)) {
      // $literal clause in WHERE may look like "abc OR def", and to make sure
      // this OR doesn't interfere with priorities of other operators around, we
      // always wrap the literal with (). We must wrap in WHERE only, not in
      // e.g. ORDER BY or CTEs.
      pieces.push("(" + this.buildLiteral(where[$literal]) + ")");
    }

    if (!pieces.length) {
      // This is for cases like { [$and]: [{}, {}] }
      pieces.push("true");
    }

    const sql = pieces.join(" AND ");
    return pieces.length > 1 && !isTopLevel ? "(" + sql + ")" : sql;
  }

  protected buildFieldBinOp(
    field: keyof TTable,
    binOp: string,
    value: NonNullable<Value<TTable[keyof TTable]>>
  ) {
    return field + binOp + this.escape(field, value);
  }

  private buildFieldNe(
    field: keyof TTable,
    value:
      | Value<TTable[typeof field]>
      | ReadonlyArray<Value<TTable[typeof field]>>
  ) {
    if (value === null) {
      return field + " IS NOT NULL";
    } else if (value instanceof Array) {
      let andIsNotNull = false;
      const pieces: string[] = [];
      for (const v of value) {
        if (v === null) {
          andIsNotNull = true;
        } else {
          pieces.push(this.escape(field, v));
        }
      }

      const sql = pieces.length
        ? field + " NOT IN(" + pieces.join(",") + ")"
        : "true/*empty_NOT_IN*/";
      return andIsNotNull ? "(" + sql + " AND " + field + " IS NOT NULL)" : sql;
    } else {
      return field + "<>" + this.escape(field, value);
    }
  }

  protected buildFieldEq(
    field: keyof TTable,
    value: Where<TTable>[keyof TTable]
  ) {
    if (value === null) {
      return field + " IS NULL";
    } else if (value instanceof Array) {
      let orIsNull = false;
      const pieces: string[] = [];
      for (const v of value) {
        if (v === null) {
          orIsNull = true;
        } else {
          pieces.push(this.escape(field, v));
        }
      }

      const sql = pieces.length
        ? field + " IN(" + pieces.join(",") + ")"
        : "false/*empty_IN*/";
      return orIsNull ? "(" + sql + " OR " + field + " IS NULL)" : sql;
    } else {
      return field + "=" + this.escape(field, value);
    }
  }

  protected buildLogical(
    specs: TTable,
    op: "OR" | "AND",
    items: Array<Where<TTable>>
  ) {
    const clause = op === "OR" ? " OR " : " AND ";
    if (items.length === 0) {
      return ` false /* Empty${clause}*/ `;
    }

    const sql = items.map((item) => this.buildWhere(specs, item)).join(clause);
    return items.length > 1 ? "(" + sql + ")" : sql;
  }

  protected buildNot(specs: TTable, where: Where<TTable>) {
    return "NOT " + this.buildWhere(specs, where);
  }

  protected buildLiteral(literal: Literal) {
    if (
      !(literal instanceof Array) ||
      literal.length === 0 ||
      typeof literal[0] !== "string"
    ) {
      throw Error(
        "Invalid literal value (must be an array with 1st element as a format): " +
          inspect(literal)
      );
    }

    const [fmt, ...args] = literal;
    if (args.length === 0) {
      return fmt;
    }

    return fmt.replace(/\?([i]?)/g, (_, flag) =>
      flag === "i"
        ? sqlClientMod.escapeID("" + args.shift())
        : sqlClientMod.escapeAny(args.shift())
    );
  }

  /**
   * For codegen, returns the following piece of JS code:
   *
   * '($valueCode !== undefined ? this.escapeXyz($valueCode) : "$defSQL")'
   *
   * It's expected that, while running the generated code, `this` points to an
   * object with a) `escapeXyz()` functions, b) `stringifiers` object containing
   * the table fields custom stringifiers.
   */
  private createEscapeCode(
    field: keyof TTable,
    valueCode: string,
    defSQL?: string
  ) {
    const valueType = this.schema.table[field].type;
    const escapeCode =
      valueType === Date
        ? `this.escapeDate(${valueCode}, ${JSON.stringify(field)})`
        : valueType === Boolean
        ? `this.escapeBoolean(${valueCode})`
        : valueType === Number
        ? `this.escapeString(${valueCode})`
        : valueType === String
        ? `this.escapeString(${valueCode})`
        : valueType === ID
        ? `this.escapeID(${valueCode})`
        : hasKey("stringify", valueType)
        ? `this.escapeStringify(${valueCode}, this.stringifiers.${field})`
        : (() => {
            throw Error(
              `BUG: unknown spec type ${valueType} for field ${field}`
            );
          })();
    if (defSQL !== undefined) {
      return (
        "(" +
        valueCode +
        " !== undefined ? " +
        escapeCode +
        " : " +
        JSON.stringify(defSQL) +
        ")"
      );
    } else {
      return escapeCode;
    }
  }

  /**
   * Compiles a function body with `this` bound to some well-known properties
   * which are available in the body.
   *
   * For each table, we compile frequently accessible pieces of code which
   * serialize data in SQL format. This allows to remove lots of logic and "ifs"
   * from run-time and speed up hot code paths.
   */
  private newFunction(...argsAndBody: string[]) {
    return new Function(...argsAndBody).bind({
      ...sqlClientMod,
      stringifiers: this.stringifiers,
    });
  }
}
