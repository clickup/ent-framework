import assert from "assert";
import { inspect } from "util";
import random from "lodash/random";
import uniq from "lodash/uniq";
import { Runner } from "../abstract/Batcher";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import type { Schema } from "../abstract/Schema";
import { hasKey } from "../helpers";
import type { Field, Literal, Table, Value, Where } from "../types";
import { ID } from "../types";
import parseCompositeRow from "./helpers/parseCompositeRow";
import * as sqlClientMod from "./SQLClient";
import { SQLError } from "./SQLError";

const DEADLOCK_RETRY_MS_MIN = 2000;
const DEADLOCK_RETRY_MS_MAX = 5000;
const ERROR_DEADLOCK = "deadlock detected";
const ERROR_FK = "violates foreign key constraint ";
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
  override ["constructor"]!: typeof SQLRunner;

  abstract readonly op: string;

  readonly shardName = this.client.shardName;
  readonly isMaster = this.client.isMaster;

  private runtimeEscapers: Partial<Record<string, (value: any) => string>> = {};
  private runtimeParsers: Array<[string, (value: any) => any]> = [];
  private stringifiers: Partial<Record<string, (value: any) => string>> = {};

  constructor(
    public readonly schema: Schema<TTable>,
    private client: sqlClientMod.SQLClient
  ) {
    super(sqlClientMod.escapeIdent(schema.name));

    // For tables with composite primary key and no explicit "id" column, we
    // still need an ID escaper (where id looks like "(1,2)" anonymous row).
    for (const field of [ID, ...Object.keys(this.schema.table)]) {
      const body = "return " + this.createEscapeCode(field, "$value");
      this.runtimeEscapers[field] = this.newFunction("$value", body);
    }

    for (const [field, { type }] of Object.entries(this.schema.table)) {
      // Notice that e.g. Date type has parse() static method, so we require
      // BOTH parse() and stringify() to be presented in custom types.
      if (hasKey("parse", type) && hasKey("stringify", type)) {
        this.runtimeParsers.push([field, type.parse.bind(type)]);
        this.stringifiers[field] = type.stringify.bind(type);
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
      // Debatch some of SQL WRITE query errors.
      (e instanceof SQLError && e.message.includes(ERROR_DEADLOCK)) ||
      (e instanceof SQLError && e.message.includes(ERROR_FK)) ||
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
      for (const [field, parser] of this.runtimeParsers) {
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
   * Formats prefixes/suffixes of various compound SQL clauses. Don't use on
   * performance-critical path!
   */
  protected fmt(
    template: string,
    args: { fields?: Array<Field<TTable>> } = {}
  ) {
    return template.replace(
      /%(?:T|SELECT_FIELDS|INSERT_FIELDS|UPDATE_FIELD_VALUE_PAIRS|PK)(?:\(([%\w]+)\))?/g,
      (c: string, a?: string) => {
        // Table name.
        if (c === "%T") {
          return this.name;
        }

        // Comma-separated list of ALL fields in the table to be used in
        // SELECT clauses (always includes ID field).
        if (c === "%SELECT_FIELDS") {
          return uniq([...Object.keys(this.schema.table), ID])
            .map((field) => this.escapeField(field, undefined, true))
            .join(", ");
        }

        // Comma-separated list of ALL fields in the table (never with AS
        // clause). Always includes primary key fields in the beginning.
        if (c === "%INSERT_FIELDS") {
          return this.prependPK(Object.keys(this.schema.table))
            .map((field) => this.escapeField(field))
            .join(", ");
        }

        // field1=X.field1, field2=X.field2, ...
        if (c.startsWith("%UPDATE_FIELD_VALUE_PAIRS")) {
          assert(args.fields, `BUG: no args.fields passed in ${template}`);
          assert(a, `BUG: you must pass an argument, alias name`);
          return args.fields
            .map(
              (field) =>
                `${this.escapeField(field)}=${a}.${this.escapeField(field)}`
            )
            .join(", ");
        }

        // Primary key (simple or composite).
        if (c.startsWith("%PK")) {
          return this.escapeField(ID, a?.replace(/%T/g, this.name));
        }

        throw Error(`Unknown format spec: ${c}`);
      }
    );
  }

  /**
   * Escapes a value at runtime using the codegen functions created above. We
   * use escapers table and the codegen for the following reasons:
   * 1. We want to be sure that we know in advance, how to escape all table
   *    fields (and not fail at runtime).
   * 2. We want to make createEscapeCode() the single source of truth about
   *    fields escaping, even at runtime.
   */
  protected escapeValue(field: Field<TTable>, value: any): string {
    const escaper = this.runtimeEscapers[field];
    if (!escaper) {
      this.throwUnknownField(field);
    }

    return escaper(value);
  }

  /**
   * Escapes field name identifier. In case it's a composite primary key,
   * returns its `ROW(f1,f2,...)` representation.
   */
  protected escapeField(
    field: Field<TTable>,
    table?: string,
    withAs?: boolean
  ) {
    if (this.schema.table[field]) {
      return (table ? `${table}.` : "") + sqlClientMod.escapeIdent(field);
    }

    if (field === ID) {
      return (
        sqlClientMod.escapeIdentComposite(this.schema.uniqueKey, table) +
        (withAs ? ` AS ${sqlClientMod.escapeIdent(field)}` : "")
      );
    }

    this.throwUnknownField(field);
  }

  /**
   * Returns a newly created JS function which, when called with a row set,
   * returns the following SQL clause:
   *
   * ```
   * WITH rows(id, a, b, _key) AS (VALUES
   *   ((NULL::tbl).id, (NULL::tbl).a, (NULL::tbl).b, 'k0'),
   *   ('123',          'xyz',         'nn',          'kSome'),
   *   ('456',          'abc',         'nn',          'kOther'),
   *   ...
   * )
   * {suffix}
   * ```
   *
   * For composite primary key, its parts (fields) are always prepended. The set
   * of columns is passed in specs.
   */
  protected createWithBuilder({
    fields,
    rowsReorderingIsSafe,
    suffix,
  }: {
    fields: Array<Field<TTable>>;
    rowsReorderingIsSafe: boolean;
    suffix: string;
  }) {
    const cols = [
      ...this.prependPK(fields).map((field) => [
        this.fmt(`(NULL::%T).${this.escapeField(field)}`),
        this.escapeField(field),
      ]),
      ["'k0'", "_key"],
    ];

    // We prepend VALUES with a row which consists of all NULL values, but typed
    // to the actual table's columns types. This hints PG how to cast input.
    return this.createValuesBuilder({
      prefix:
        `WITH rows(${cols.map(([_, f]) => f).join(", ")}) AS (VALUES\n` +
        `  (${cols.map(([n, _]) => n).join(", ")}),`,
      fields,
      withKey: true,
      rowsReorderingIsSafe,
      suffix: ")\n" + suffix,
    });
  }

  /**
   * Returns a newly created JS function which, when called with a row set,
   * returns the following SQL clause (when called with withKey=true):
   *
   * ```
   *   ('123', 'xyz', 'nn', 'kSome'),
   *   ('456', 'abc', 'nn', 'kOther'),
   *   ...
   * )
   * ```
   *
   * or (when called without withKey):
   *
   * ```
   *   ('123', 'xyz', 'nn'),
   *   ('456', 'abc', 'nn'),
   *   ...
   * ```
   *
   * The set of columns is passed in fields.
   *
   * Notice that either a simple primary key or a composite primary key columns
   * are always prepended to the list of values since it makes no sense to
   * generate VALUES clause without exact identification of the destination.
   */
  protected createValuesBuilder({
    prefix,
    fields,
    withKey,
    rowsReorderingIsSafe,
    suffix,
  }: {
    prefix: string;
    fields: Array<Field<TTable>>;
    withKey?: boolean;
    rowsReorderingIsSafe: boolean;
    suffix: string;
  }) {
    const cols = this.prependPK(fields).map((field) => {
      const spec = this.schema.table[field];
      if (!spec) {
        this.throwUnknownField(field);
      }

      return this.createEscapeCode(
        field,
        `$input.${field}`,
        spec.autoInsert !== undefined ? spec.autoInsert : spec.autoUpdate
      );
    });
    const rowFunc = this.newFunction(
      "$key",
      "$input",
      'return "(" + ' +
        cols.join(" + ', ' + ") +
        (withKey ? '+ ", " + this.escapeString($key)' : "") +
        '+ ")"'
    );

    return {
      prefix: prefix + "\n  ",
      func: (
        entries: Iterable<[key: string, input: object & { [ID]?: string }]>
      ) => {
        const parts: string[] = [];
        for (const [key, input] of entries) {
          parts.push(rowFunc(key, this.unfoldCompositePK(input)));
        }

        if (rowsReorderingIsSafe) {
          // To eliminate deadlocks in parallel batched inserts, we sort rows. This
          // prevents deadlocks when two batched queries are running in different
          // connections, and the table has some unique key.
          parts.sort();
        }

        return parts.join(",\n  ");
      },
      suffix,
    };
  }

  /**
   * Returns a newly created JS function which, when called with an object,
   * returns the following SQL clause:
   *
   * id='123', a='xyz', b='nnn' [, {literal}]
   *
   * The set of columns is passed in specs, all other columns are ignored.
   */
  protected createUpdateKVsBuilder(fields: Array<Field<TTable>>) {
    const parts = fields.map(
      (field) =>
        JSON.stringify(this.escapeField(field) + "=") +
        " + " +
        this.createEscapeCode(
          field,
          `$input.${field}`,
          this.schema.table[field].autoUpdate
        )
    );
    const func = this.newFunction(
      "$input",
      "return " + (parts.length ? parts.join(" + ', ' + ") : `""`)
    );
    return (input: object, literal?: Literal): string => {
      const kvs = func(input);
      const custom = literal ? this.buildLiteral(literal) : "";
      return kvs && custom ? `${kvs}, ${custom}` : kvs ? kvs : custom;
    };
  }

  /**
   * Returns a newly created JS function which, when called with an array of
   * values, returns one of following SQL clause:
   *
   * - $field IN('aaa', 'bbb', 'ccc')
   * - ($field IN('aaa', 'bbb') OR $field IS NULL)
   * - $field IS NULL
   * - false
   */
  protected createInBuilder(
    field: Field<TTable>,
    fieldValCode = "$value"
  ): (values: Iterable<unknown>) => string {
    const escapedFieldCode = JSON.stringify(this.escapeField(field));
    const valueCode = this.createEscapeCode(field, fieldValCode);
    const body = `
      let sql = '';
      let hasIsNull = false;
      for (const $value of $values) {
        if (${fieldValCode} != null) {
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
    for (const key of Object.keys(where)) {
      const value = where[key];
      if (value === undefined) {
        continue;
      }

      if (key[0] === "$") {
        continue;
      }

      let foundOp = false;
      if (hasKey("$gte", value)) {
        pieces.push(this.buildFieldBinOp(key, ">=", value.$gte));
        foundOp = true;
      }

      if (hasKey("$gt", value)) {
        pieces.push(this.buildFieldBinOp(key, ">", value.$gt));
        foundOp = true;
      }

      if (hasKey("$lte", value)) {
        pieces.push(this.buildFieldBinOp(key, "<=", value.$lte));
        foundOp = true;
      }

      if (hasKey("$lt", value)) {
        pieces.push(this.buildFieldBinOp(key, "<", value.$lt));
        foundOp = true;
      }

      if (hasKey("$ne", value)) {
        pieces.push(this.buildFieldNe(key, value.$ne));
        foundOp = true;
      }

      if (hasKey("$overlap", value)) {
        pieces.push(this.buildFieldBinOp(key, "&&", value.$overlap));
        foundOp = true;
      }

      if (!foundOp) {
        pieces.push(this.buildFieldEq(key, value));
      }
    }

    if (hasKey("$and", where)) {
      const clause = this.buildLogical(specs, "AND", where.$and);
      if (clause.length) {
        pieces.push(clause);
      }
    }

    if (hasKey("$or", where)) {
      const clause = this.buildLogical(specs, "OR", where.$or);
      if (clause.length) {
        pieces.push(clause);
      }
    }

    if (hasKey("$not", where)) {
      pieces.push(this.buildNot(specs, where.$not));
    }

    if (hasKey("$literal", where)) {
      // $literal clause in WHERE may look like "abc OR def", and to make sure
      // this OR doesn't interfere with priorities of other operators around, we
      // always wrap the literal with (). We must wrap in WHERE only, not in
      // e.g. ORDER BY or CTEs.
      pieces.push("(" + this.buildLiteral(where.$literal) + ")");
    }

    if (!pieces.length) {
      // This is for cases like { [$and]: [{}, {}] }
      pieces.push("true");
    }

    const sql = pieces.join(" AND ");
    return pieces.length > 1 && !isTopLevel ? "(" + sql + ")" : sql;
  }

  protected buildFieldBinOp<TField extends Field<TTable>>(
    field: TField,
    binOp: string,
    value: NonNullable<Value<TTable[TField]>>
  ) {
    return this.escapeField(field) + binOp + this.escapeValue(field, value);
  }

  private buildFieldNe<TField extends Field<TTable>>(
    field: TField,
    value: Value<TTable[TField]> | ReadonlyArray<Value<TTable[TField]>>
  ) {
    if (value === null) {
      return this.escapeField(field) + " IS NOT NULL";
    } else if (value instanceof Array) {
      let andIsNotNull = false;
      const pieces: string[] = [];
      for (const v of value) {
        if (v === null) {
          andIsNotNull = true;
        } else {
          pieces.push(this.escapeValue(field, v));
        }
      }

      const sql = pieces.length
        ? this.escapeField(field) + " NOT IN(" + pieces.join(",") + ")"
        : "true/*empty_NOT_IN*/";
      return andIsNotNull
        ? "(" + sql + " AND " + this.escapeField(field) + " IS NOT NULL)"
        : sql;
    } else {
      return this.escapeField(field) + "<>" + this.escapeValue(field, value);
    }
  }

  protected buildFieldEq<TField extends Field<TTable>>(
    field: TField,
    value: Where<TTable>[TField]
  ) {
    if (value === null) {
      return this.escapeField(field) + " IS NULL";
    } else if (value instanceof Array) {
      let orIsNull = false;
      const pieces: string[] = [];
      for (const v of value) {
        if (v === null) {
          orIsNull = true;
        } else {
          pieces.push(this.escapeValue(field, v));
        }
      }

      const sql = pieces.length
        ? this.escapeField(field) + " IN(" + pieces.join(",") + ")"
        : "false/*empty_IN*/";
      return orIsNull
        ? "(" + sql + " OR " + this.escapeField(field) + " IS NULL)"
        : sql;
    } else {
      return this.escapeField(field) + "=" + this.escapeValue(field, value);
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
   * '($fieldValCode !== undefined ? this.escapeXyz($fieldValCode) : "$defSQL")'
   *
   * It's expected that, while running the generated code, `this` points to an
   * object with a) `escapeXyz()` functions, b) `stringifiers` object containing
   * the table fields custom stringifiers.
   */
  private createEscapeCode(
    field: Field<TTable>,
    fieldValCode: string,
    defSQL?: string
  ) {
    const specType = this.schema.table[field]?.type;
    if (!specType && field !== ID) {
      throw Error(`BUG: cannot find the field "${field}" in the schema`);
    }

    const escapeCode =
      specType === undefined && field === ID
        ? `this.escapeComposite(${fieldValCode})`
        : specType === Boolean
        ? `this.escapeBoolean(${fieldValCode})`
        : specType === Date
        ? `this.escapeDate(${fieldValCode}, ${JSON.stringify(field)})`
        : specType === ID
        ? `this.escapeID(${fieldValCode})`
        : specType === Number
        ? `this.escapeString(${fieldValCode})`
        : specType === String
        ? `this.escapeString(${fieldValCode})`
        : hasKey("stringify", specType)
        ? `this.escapeStringify(${fieldValCode}, this.stringifiers.${field})`
        : (() => {
            throw Error(
              `BUG: unknown spec type ${specType} for field ${field}`
            );
          })();
    if (defSQL !== undefined) {
      return (
        `(${fieldValCode} !== undefined ` +
        `? ${escapeCode} ` +
        `: ${JSON.stringify(defSQL)})`
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
   * from runtime and speed up hot code paths.
   */
  private newFunction(...argsAndBody: string[]) {
    return new Function(...argsAndBody).bind({
      ...sqlClientMod,
      stringifiers: this.stringifiers,
    });
  }

  /**
   * Prepends a primary key to the list of fields. In case the primary key is
   * plain (i.e. "id" field), it's just added as a field; otherwise, the unique
   * key fields are added. (Prepending the primary key fields doesn't affect
   * logic, but minimizes deadlocks since the rows to insert/update are sorted
   * lexicographically.)
   */
  private prependPK(fields: Array<Field<TTable>>) {
    return uniq([
      ...(this.schema.table[ID] ? [ID] : this.schema.uniqueKey),
      ...fields,
    ]);
  }

  /**
   * The problem: PG is not working fine with queries like:
   *
   * ```
   * WITH rows(composite_id, c) AS (
   *   VALUES
   *   ( ROW((NULL::tbl).x, (NULL::tbl).y), (NULL::tbl).c ),
   *   ( ROW(1,2),                          3             ),
   *   ( ROW(3,4),                          5             )
   * )
   * UPDATE tbl SET c=rows.c
   * FROM rows WHERE ROW(tbl.x, tbl.y)=composite_id
   * ```
   *
   * It cannot match the type of composite_id with the row, and even the trick
   * with NULLs doesn't help it to infer types. It's a limitation of WITH clause
   * (because in INSERT ... VALUES, there is no such problem).
   *
   * So the only solution is to parse/decompose the row string into individual
   * unique key columns at runtime for batched UPDATEs. And yes, it's slow.
   *
   * ```
   * WITH rows(x, y, c) AS (
   *   VALUES
   *   ( (NULL::tbl).x, (NULL::tbl).y, (NULL::tbl).c ),
   *   ( 1,             2,             3             ),
   *   ( 3,             4,             5             )
   * )
   * UPDATE tbl SET c=rows.c
   * FROM rows WHERE ROW(tbl.x, tbl.y)=ROW(rows.x, ROW.y)
   * ```
   */
  private unfoldCompositePK(input: any) {
    if (
      !this.schema.table[ID] &&
      input[ID] !== null &&
      input[ID] !== undefined
    ) {
      const compositePK = parseCompositeRow(input[ID]);
      input = { ...input };
      for (const [i, field] of this.schema.uniqueKey.entries()) {
        input[field] = compositePK[i];
      }
    }

    return input;
  }

  /**
   * Throws an exception about some field being not mentioned in the table
   * schema. Notice that ID is treated as always available.
   */
  private throwUnknownField(field: Field<TTable>): never {
    throw Error(
      `Unknown field: ${field}; allowed fields: ` +
        [ID, ...Object.keys(this.schema.table)]
    );
  }
}
