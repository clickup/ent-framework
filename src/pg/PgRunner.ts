import assert from "assert";
import difference from "lodash/difference";
import last from "lodash/last";
import random from "lodash/random";
import uniq from "lodash/uniq";
import type { QueryAnnotation } from "../abstract/QueryAnnotation";
import { Runner } from "../abstract/Runner";
import type { Schema } from "../abstract/Schema";
import { hasKey } from "../internal/misc";
import type {
  Field,
  FieldAliased,
  Literal,
  Table,
  Value,
  Where,
} from "../types";
import { ID } from "../types";
import { escapeIdent } from "./helpers/escapeIdent";
import { escapeLiteral } from "./helpers/escapeLiteral";
import { escapeBoolean } from "./internal/escapeBoolean";
import { escapeComposite } from "./internal/escapeComposite";
import { escapeDate } from "./internal/escapeDate";
import { escapeID } from "./internal/escapeID";
import { escapeIdentComposite } from "./internal/escapeIdentComposite";
import { escapeString } from "./internal/escapeString";
import { escapeStringify } from "./internal/escapeStringify";
import { parseCompositeRow } from "./internal/parseCompositeRow";
import type { PgClient } from "./PgClient";
import { PgError } from "./PgError";

const DEADLOCK_RETRY_MS_MIN = 2000;
const DEADLOCK_RETRY_MS_MAX = 5000;
const ERROR_DEADLOCK = "deadlock detected";
const ERROR_FK = "violates foreign key constraint ";
const ERROR_CONFLICT_RECOVERY =
  "canceling statement due to conflict with recovery";

/**
 * A convenient pile of helper methods usable by most of PgQuery* classes. In
 * some sense it's an anti-pattern, but still reduces the boilerplate.
 *
 * PgRunner is also responsible for stringifying the values passed to the
 * queries and parsing values returned from the DB according to the field types
 * specs.
 */
export abstract class PgRunner<
  TTable extends Table,
  TInput,
  TOutput,
> extends Runner<TInput, TOutput> {
  private escapers: Partial<Record<string, (v: unknown) => string>> = {};
  private oneOfBuilders: Partial<Record<string, (v: unknown[]) => string>> = {};
  private dbValueToJs: Array<[string, (v: unknown) => unknown]> = [];
  private stringify: Partial<Record<string, (v: never) => string>> = {};

  override ["constructor"]!: typeof PgRunner;

  protected async clientQuery<TOutput extends object>(
    sql: string,
    annotations: QueryAnnotation[],
    batchFactor: number,
    hints?: Record<string, string>,
  ): Promise<TOutput[]> {
    const rows = await this.client.query<TOutput>({
      query: [sql],
      hints,
      isWrite: this.constructor.IS_WRITE,
      annotations,
      op: this.op,
      table: this.name,
      batchFactor,
    });

    // Apply parsers only for known field names. Notice that TOutput is not
    // necessarily a type of the table's row, it can be something else (in e.g.
    // INSERT or DELETE operations).
    if (rows.length > 0) {
      for (const [field, dbValueToJs] of this.dbValueToJs) {
        if (field in rows[0]) {
          for (const row of rows) {
            const dbValue = row[field as keyof TOutput];
            if (dbValue !== null && dbValue !== undefined) {
              (row as Record<string, unknown>)[field] = dbValueToJs(dbValue);
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
    args: { fields?: Array<FieldAliased<TTable>>; normalize?: boolean } = {},
  ): string {
    return template.replace(
      /%(?:T|SELECT_FIELDS|FIELDS|UPDATE_FIELD_VALUE_PAIRS|PK)(?:\(([%\w]+)\))?/g,
      (c: string, a?: string) => {
        a = a?.replace(/%T/g, this.name);

        // Table name.
        if (c === "%T") {
          return escapeIdent(this.name);
        }

        // Comma-separated list of ALL fields in the table to be used in SELECT
        // clauses (always includes ID field).
        if (c === "%SELECT_FIELDS") {
          return uniq([...Object.keys(this.schema.table), ID])
            .map((f) => this.escapeField(f) + (f === ID ? ` AS ${ID}` : ""))
            .join(", ");
        }

        // Comma-separated list of the passed fields (never with AS clause).
        if (c.startsWith("%FIELDS")) {
          assert(args.fields, `BUG: no args.fields passed in ${template}`);
          return args.fields
            .map((field) =>
              this.escapeField(field, {
                withTable: a,
                normalize: args.normalize,
              }),
            )
            .join(", ");
        }

        // field1=X.field1, field2=X.field2, ...
        if (c.startsWith("%UPDATE_FIELD_VALUE_PAIRS")) {
          assert(args.fields, `BUG: no args.fields passed in ${template}`);
          assert(a, "BUG: you must pass an argument, source table alias name");
          return args.fields
            .map(
              (field) =>
                `${this.escapeField(field)}=` +
                this.escapeField(field, { withTable: a }),
            )
            .join(", ");
        }

        // Primary key (simple or composite).
        if (c.startsWith("%PK")) {
          return this.escapeField(ID, { withTable: a });
        }

        throw Error(`Unknown format spec "${c}" in "${template}"`);
      },
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
  protected escapeValue(field: Field<TTable>, value: unknown): string {
    const escaper = this.nullThrowsUnknownField(this.escapers[field], field);
    return escaper(value);
  }

  /**
   * Escapes field name identifier.
   * - In case it's a composite primary key, returns its `ROW(f1,f2,...)`
   *   representation.
   * - A field may be aliased, e.g. if `{ field: "abc", alias: "$cas.abc" }` is
   *   passed, then the returned value will be `"$cas.abc"`. Basically, `field`
   *   name is used only to verify that such field is presented in the schema.
   */
  protected escapeField(
    info: FieldAliased<TTable>,
    { withTable, normalize }: { withTable?: string; normalize?: boolean } = {},
  ): string {
    const [field, alias] =
      typeof info === "string" ? [info, info] : [info.field, info.alias];

    if (this.schema.table[field]) {
      const sql = withTable
        ? `${escapeIdent(withTable)}.` + escapeIdent(alias)
        : escapeIdent(alias);
      return normalize ? this.normalizeSQLExpr(field, sql) : sql;
    }

    if (field === ID) {
      return escapeIdentComposite(this.schema.uniqueKey, withTable);
    }

    return this.nullThrowsUnknownField(null, field);
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
    suffix,
  }: {
    fields: ReadonlyArray<FieldAliased<TTable>>;
    suffix: string;
  }): {
    prefix: string;
    func: (entries: Iterable<[key: string, input: object]>) => string;
    suffix: string;
  } {
    const cols = [
      ...fields.map((info) => {
        const [field, alias] =
          typeof info === "string" ? [info, info] : [info.field, info.alias];
        return {
          field: escapeIdent(alias),
          escapedValue: this.fmt("(NULL::%T).") + this.escapeField(field),
        };
      }),
      { field: "_key", escapedValue: "'k0'" },
    ];

    // We prepend VALUES with a row which consists of all NULL values, but typed
    // to the actual table's columns types. This hints PG how to cast input.
    return this.createValuesBuilder({
      prefix:
        `WITH rows(${cols.map(({ field }) => field).join(", ")}) AS (VALUES\n` +
        `  (${cols.map(({ escapedValue }) => escapedValue).join(", ")}),`,
      indent: "  ",
      fields,
      withKey: true,
      suffix: ")\n" + suffix.replace(/^/gm, "  "),
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
   * When the builder func is called, the actual values for some field in a row
   * is extracted from the same-named prop of the row, but if a `{ field,
   * rowPath }` object is passed in `fields` array, then the value is extracted
   * from the `rowPath` sub-prop of the row. This is used to e.g. access
   * `row.$cas.blah` value for a field named blah (in this case,
   * `rowPath="$cas"`).
   *
   * Notice that either a simple primary key or a composite primary key columns
   * are always prepended to the list of values since it makes no sense to
   * generate VALUES clause without exact identification of the destination.
   */
  protected createValuesBuilder<TInput extends object>({
    prefix,
    indent,
    fields,
    withKey,
    skipSorting,
    suffix,
  }: {
    prefix: string;
    indent: string;
    fields: ReadonlyArray<FieldAliased<TTable>>;
    withKey?: boolean;
    skipSorting?: boolean;
    suffix: string;
  }): {
    prefix: string;
    func: (entries: Iterable<[key: string, input: TInput]>) => string;
    suffix: string;
  } {
    const cols = fields.map((info) => {
      const [field, fieldValCode] =
        typeof info === "string"
          ? [info, `$input.${info}`]
          : [info.field, `$input.${info.alias}`];
      const spec = this.nullThrowsUnknownField(this.schema.table[field], field);
      return this.createEscapeCode(
        field,
        fieldValCode,
        spec.autoInsert !== undefined ? spec.autoInsert : spec.autoUpdate,
      );
    });
    const rowFunc = this.newFunction(
      "$key",
      "$input",
      "return " +
        (indent ? `${JSON.stringify("\n" + indent)} +` : "") +
        '"(" + ' +
        cols.join(" + ', ' + ") +
        (withKey ? '+ ", " + this.escapeString($key)' : "") +
        '+ ")"',
    );

    return {
      prefix,
      func: (entries: Iterable<[key: string, input: TInput]>) => {
        const parts: string[] = [];
        for (const [key, input] of entries) {
          parts.push(rowFunc(key, this.unfoldCompositePK(input)));
        }

        // To eliminate deadlocks in parallel batched inserts, we sort rows.
        // This prevents deadlocks when two batched queries are running in
        // different connections, and the table has some unique key.
        if (!skipSorting) {
          parts.sort();
        }

        return parts.join(",");
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
  protected createUpdateKVsBuilder(
    fields: Array<Field<TTable>>,
  ): (input: object, literal?: Literal) => string {
    const parts = fields.map(
      (field) =>
        JSON.stringify(this.escapeField(field) + "=") +
        " + " +
        this.createEscapeCode(
          field,
          `$input.${field}`,
          this.schema.table[field].autoUpdate,
        ),
    );
    const func = this.newFunction(
      "$input",
      "return " + (parts.length ? parts.join(" + ', ' + ") : '""'),
    );
    return (input: object, literal?: Literal): string => {
      const kvs = func(input);
      const custom = literal ? escapeLiteral(literal) : "";
      return kvs && custom ? `${kvs}, ${custom}` : kvs ? kvs : custom;
    };
  }

  /**
   * Prefers to do utilize createAnyBuilder() if it can (i.e. build
   * a=ANY('{...}') clause). Otherwise, builds an IN(...) clause.
   */
  protected createOneOfBuilder(
    field: Field<TTable>,
    fieldValCode = "$value",
  ): (values: Iterable<unknown>) => string {
    const specType = this.schema.table[field]?.type;
    return specType === Boolean ||
      specType === ID ||
      specType === Number ||
      specType === String
      ? this.createAnyBuilder(field, fieldValCode)
      : this.createInBuilder(field, fieldValCode);
  }

  /**
   * Given a list of fields, returns two builders:
   *
   * 1. "Optimized": a newly created JS function which, when called with a row
   *    set, returns one the following SQL clauses:
   *
   * ```
   * WHERE (field1, field2) IN(VALUES
   *   ((NULL::tbl).field1, (NULL::tbl).field2),
   *   ('aa', 'bb'),
   *   ('cc', 'dd'))
   *
   * or
   *
   * WHERE (field1='a' AND field2='b' AND field3 IN('a', 'b', 'c', ...)) OR (...)
   *        ^^^^^^^^^^prefix^^^^^^^^^               ^^^^^^^^ins^^^^^^^
   * ```
   *
   * 2. "Plain": the last one builder mentioned above (good to always use for
   *    non-batched queries for instance).
   */
  protected createWhereBuildersFieldsEq<TInput extends object>(args: {
    prefix: string;
    fields: ReadonlyArray<Field<TTable>>;
    suffix: string;
  }): {
    plain: {
      prefix: string;
      func: (inputs: Iterable<[key: string, input: TInput]>) => string;
      suffix: string;
    };
    optimized: {
      prefix: string;
      func: (inputs: Iterable<[key: string, input: TInput]>) => string;
      suffix: string;
    };
  } {
    const plain = this.createWhereBuilderFieldsEqOrBased<TInput>(args);
    return {
      plain,
      optimized:
        args.fields.length > 1 &&
        args.fields.every((field) => !this.schema.table[field].allowNull)
          ? this.createWhereBuilderFieldsEqTuplesBased<TInput>(args)
          : plain,
    };
  }

  /**
   * Returns a newly created JS function which, when called with a Where object,
   * returns the generated SQL WHERE clause.
   *
   * - The building is relatively expensive, since it traverses the Where object
   *   at run-time and doesn't know the shape beforehand.
   * - If the Where object is undefined, skips the entire WHERE clause.
   */
  protected createWhereBuilder({
    prefix,
    suffix,
  }: {
    prefix: string;
    suffix: string;
  }): {
    prefix: string;
    func: (where: Where<TTable>) => string;
    suffix: string;
  } {
    return {
      prefix: prefix + "WHERE ",
      func: (where: Where<TTable>) =>
        this.buildWhere(this.schema.table, where, true),
      suffix,
    };
  }

  /**
   * Prepends or appends a primary key to the list of fields. In case the
   * primary key is plain (i.e. "id" field), it's just added as a field;
   * otherwise, the unique key fields are added.
   *
   * For INSERT/UPSERT operations, we want to append the primary key, since it's
   * often types pre-generated as a random-looking value. In many places, we
   * sort batched lists of rows before e.g. inserting them, so we order them by
   * their natural data order which prevents deadlocks on unique key conflict
   * when multiple concurrent transactions try to insert the same set of rows in
   * different order ("while inserting index tuple").
   *
   * For UPDATE operations though, we want to prepend the primary key, to make
   * sure we run batched updates in the same order in multiple concurrent
   * transactions. This lowers the chances of deadlocks too.
   */
  protected addPK(
    fields: ReadonlyArray<Field<TTable>>,
    mode: "prepend" | "append",
  ): string[] {
    const pkFields = this.schema.table[ID] ? [ID] : this.schema.uniqueKey;
    fields = difference(fields, pkFields);
    return mode === "prepend"
      ? [...pkFields, ...fields]
      : [...fields, ...pkFields];
  }

  constructor(
    public readonly schema: Schema<TTable>,
    private client: PgClient,
  ) {
    super(schema.name);

    // For tables with composite primary key and no explicit "id" column, we
    // still need an ID escaper (where id looks like "(1,2)" anonymous row).
    for (const field of [ID, ...Object.keys(this.schema.table)]) {
      const body = "return " + this.createEscapeCode(field, "$value");
      this.escapers[field] = this.newFunction("$value", body);
      this.oneOfBuilders[field] = this.createOneOfBuilder(field);
    }

    for (const [field, { type }] of Object.entries(this.schema.table)) {
      if (hasKey("dbValueToJs", type) && hasKey("stringify", type)) {
        this.dbValueToJs.push([field, type.dbValueToJs.bind(type)]);
        this.stringify[field] = type.stringify.bind(type);
      }
    }
  }

  delayForSingleQueryRetryOnError(
    e: unknown,
  ): number | "immediate_retry" | "no_retry" {
    // Deadlocks may happen when a simple query involves multiple rows (e.g.
    // deleting a row by ID, but this row has foreign keys, especially with ON
    // DELETE CASCADE).
    return e instanceof PgError && e.message.includes(ERROR_DEADLOCK)
      ? random(DEADLOCK_RETRY_MS_MIN, DEADLOCK_RETRY_MS_MAX)
      : e instanceof PgError && e.message.includes(ERROR_CONFLICT_RECOVERY)
        ? "immediate_retry"
        : "no_retry";
  }

  shouldDebatchOnError(e: unknown): boolean {
    return (
      // Debatch some of SQL WRITE query errors.
      (e instanceof PgError && e.message.includes(ERROR_DEADLOCK)) ||
      (e instanceof PgError && e.message.includes(ERROR_FK)) ||
      // Debatch "conflict with recovery" errors (we support retries only after
      // debatching, so have to return true here).
      (e instanceof PgError && e.message.includes(ERROR_CONFLICT_RECOVERY))
    );
  }

  /**
   * Given a list of fields, returns a newly created JS function which, when
   * called with a row set, returns the following SQL clause:
   *
   * ```
   * WHERE (field1='a' AND field2='b' AND field3 IN('a', 'b', 'c', ...)) OR (...)
   *        ^^^^^^^^^^prefix^^^^^^^^^               ^^^^^^^^ins^^^^^^^
   * ```
   *
   * The assumption is that the last field in the list is the most variable,
   * whilst all previous fields compose a more or less static prefix
   *
   * - ATTENTION: if at least one OR is produced, it will likely result in a
   *   slower Bitmap Index Scan.
   * - Used in runSingle() (no ORs there) or when optimized builder is not
   *   available (e.g. when unique key contains nullable fields).
   */
  private createWhereBuilderFieldsEqOrBased<TInput extends object>({
    prefix,
    fields,
    suffix,
  }: {
    prefix: string;
    fields: ReadonlyArray<Field<TTable>>;
    suffix: string;
  }): {
    prefix: string;
    func: (inputs: Iterable<[key: string, input: TInput]>) => string;
    suffix: string;
  } {
    const lastField = last(fields)!;

    // fieldN IN('aa', 'bb', 'cc', ...)
    const lastFieldOneOf = this.createOneOfBuilder(
      lastField,
      `$value[1].${lastField}`,
    );

    if (fields.length === 1) {
      // If we have only one field, we can use the plain oneOfBuilder (which is
      // either an IN(...) or =ANY(...) clause).
      return {
        prefix: prefix + "WHERE ",
        func: lastFieldOneOf,
        suffix,
      };
    }

    return {
      prefix: prefix + "WHERE ",
      func: (inputs: Iterable<[key: string, input: TInput]>) => {
        const insByPrefix = new Map<
          string,
          Array<[key: string, input: TInput]>
        >();
        for (const input of inputs) {
          let prefix = "";
          for (let i = 0; i < fields.length - 1; i++) {
            const field = fields[i];
            if (prefix !== "") {
              prefix += " AND ";
            }

            const value = (input[1] as Record<string, unknown>)[field];
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
      },
      suffix,
    };
  }

  /**
   * Given a list of fields, returns a newly created JS function which, when
   * called with a row set, returns the following SQL clause:
   *
   * ```
   * WHERE (field1, field2) IN(VALUES
   *   ((NULL::tbl).field1, (NULL::tbl).field2),
   *   ('aa', 'bb'),
   *   ('cc', 'dd'))
   * ```
   *
   * The assumption is that all fields are non-nullable.
   *
   * - This clause always produces an Index Scan (not Bitmap Index Scan).
   * - Used in most of the cases in runBatch(), e.g. when unique key has >1
   *   fields, and they are all non-nullable.
   */
  private createWhereBuilderFieldsEqTuplesBased<TInput extends object>({
    prefix,
    fields,
    suffix,
  }: {
    prefix: string;
    fields: ReadonlyArray<Field<TTable>>;
    suffix: string;
  }): {
    prefix: string;
    func: (entries: Iterable<[key: string, input: TInput]>) => string;
    suffix: string;
  } {
    const escapedFields = fields.map((f) => this.escapeField(f));
    return this.createValuesBuilder<TInput>({
      prefix:
        prefix +
        `WHERE (${escapedFields.join(", ")}) IN(VALUES\n` +
        "  (" +
        escapedFields.map((f) => this.fmt(`(NULL::%T).${f}`)).join(", ") +
        "),",
      indent: "  ",
      fields,
      skipSorting: true, // for JS perf
      suffix: ")" + suffix,
    });
  }

  private buildWhere(
    specs: TTable,
    where: Where<TTable>,
    isTopLevel: boolean = false,
  ): string {
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

      if (hasKey("$isDistinctFrom", value)) {
        pieces.push(this.buildFieldIsDistinctFrom(key, value.$isDistinctFrom));
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
      pieces.push("(" + escapeLiteral(where.$literal) + ")");
    }

    if (!pieces.length) {
      // This is for cases like { [$and]: [{}, {}] }
      pieces.push("true");
    }

    const sql = pieces.join(" AND ");
    return pieces.length > 1 && !isTopLevel ? "(" + sql + ")" : sql;
  }

  private buildFieldBinOp<TField extends Field<TTable>>(
    field: TField,
    binOp: string,
    value: NonNullable<Value<TTable[TField]>>,
  ): string {
    return this.escapeField(field) + binOp + this.escapeValue(field, value);
  }

  private buildFieldIsDistinctFrom<TField extends Field<TTable>>(
    field: TField,
    value: Value<TTable[TField]>,
  ): string {
    return (
      this.escapeField(field) +
      " IS DISTINCT FROM " +
      this.escapeValue(field, value)
    );
  }

  private buildFieldEq<TField extends Field<TTable>>(
    field: TField,
    value: Where<TTable>[TField],
  ): string {
    if (value === null) {
      return this.escapeField(field) + " IS NULL";
    } else if (value instanceof Array) {
      const inBuilder = this.nullThrowsUnknownField(
        this.oneOfBuilders[field],
        field,
      );
      return inBuilder(value);
    } else {
      return this.escapeField(field) + "=" + this.escapeValue(field, value);
    }
  }

  private buildLogical(
    specs: TTable,
    op: "OR" | "AND",
    items: ReadonlyArray<Where<TTable>>,
  ): string {
    const clause = op === "OR" ? " OR " : " AND ";
    if (items.length === 0) {
      return ` false /* Empty${clause}*/ `;
    }

    const sql = items.map((item) => this.buildWhere(specs, item)).join(clause);
    return items.length > 1 ? "(" + sql + ")" : sql;
  }

  private buildNot(specs: TTable, where: Where<TTable>): string {
    return "NOT " + this.buildWhere(specs, where);
  }

  private buildFieldNe<TField extends Field<TTable>>(
    field: TField,
    value: Value<TTable[TField]> | ReadonlyArray<Value<TTable[TField]>>,
  ): string {
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

  /**
   * Returns a newly created JS function which, when called with an array of
   * values, returns one of following SQL clauses:
   *
   * - $field=ANY('{aaa,bbb,ccc}')
   * - ($field=ANY('{aaa,bbb}') OR $field IS NULL)
   * - $field='aaa' (see below, why)
   * - ($field='aaa' OR $field IS NULL)
   * - $field IS NULL
   * - false
   */
  private createAnyBuilder(
    field: Field<TTable>,
    fieldValCode = "$value",
  ): ($values: Iterable<unknown>) => string {
    // Notes:
    //
    // - See arrayfuncs.c, array_out() function (needquote logic):
    //   https://github.com/postgres/postgres/blob/4ddfbd2/src/backend/utils/adt/arrayfuncs.c#L1136-L1156
    // - Why will it work not worse (index wise) than multi-value IN():
    //   https://www.postgresql.org/message-id/1761901.1668657080%40sss.pgh.pa.us
    // - We can't easily use a general-purpose quoting function here, because we
    //   must exclude nulls from the values, to add an explicit "OR IS NULL"
    //   clause instead.
    // - We sacrifice performance a little and not quote everything blindly.
    //   This is to gain the generated SQL queries some more readability.
    //
    // Also one more thing. Imagine we have a `btree(a, b)` index. Compare two
    // queries for one-element use case;
    //
    //   1. `a='aaa' AND b=ANY('{bbb}')`
    //   2. `a='aaa' AND b IN('bbb')`
    //
    // They may produce different plans: IN() always coalesces to `field='aaa'`
    // in the plan, whilst =ANY() always remains =ANY(). This causes PG to
    // choose a "post-filtering" plan sometimes:
    //
    //   1. For =ANY: Index Cond: (a='aaa'); Filter: b=ANY('{bbb}')
    //   2. For IN(): Index Cond: (a='aaa') AND (b='bbb')
    //
    // So to be on a safe side, we never emit a 1-element =ANY().
    //
    const escapedFieldCode = JSON.stringify(this.escapeField(field));
    const body = `
      let sql = '';
      let lastValue = null;
      let nonNullCount = 0;
      let hasIsNull = false;
      for (const $value of $values) {
        if (${fieldValCode} != null) {
          if (sql) sql += ',';
          nonNullCount++;
          lastValue = "" + ${fieldValCode};
          sql += lastValue.match(/^$|^NULL$|[ \\t\\n\\r\\v\\f]|["\\\\{},]/is)
            ? '"' + lastValue.replace(/\\\\/g, '\\\\\\\\').replace(/"/g, '\\\\"') + '"'
            : lastValue;
        } else {
          hasIsNull = true;
        }
      }
      if (sql) {
        if (nonNullCount > 1) {
          sql = '{' + sql + '}';
          sql = ${escapedFieldCode} + '=ANY(' + this.escapeString(sql) + ')';
        } else {
          sql = ${escapedFieldCode} + '=' + this.escapeString(lastValue);
        }
      }
      return sql && hasIsNull
        ? '(' + sql + ' OR ' + ${escapedFieldCode} + ' IS NULL)'
        : hasIsNull
        ? ${escapedFieldCode} + ' IS NULL'
        : sql
        ? sql
        : 'false/*empty_ANY*/';
    `;
    return this.newFunction("$values", body);
  }

  /**
   * Returns a newly created JS function which, when called with an array of
   * values, returns one of following SQL clauses:
   *
   * - $field IN('aaa', 'bbb', 'ccc')
   * - ($field IN('aaa', 'bbb') OR $field IS NULL)
   * - $field IS NULL
   * - false
   *
   * This only works for primitive types.
   */
  private createInBuilder(
    field: Field<TTable>,
    fieldValCode = "$value",
  ): ($values: Iterable<unknown>) => string {
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

  /**
   * For codegen, returns the following piece of JS code:
   *
   * '($fieldValCode !== undefined ? this.escapeXyz($fieldValCode) : "$defSQL")'
   *
   * It's expected that, while running the generated code, `this` points to an
   * object with a) `escapeXyz()` functions, b) `stringify` object containing
   * the table fields custom to-string converters.
   */
  private createEscapeCode(
    field: Field<TTable>,
    fieldValCode: string,
    defSQL?: string,
  ): string {
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
                    ? `this.escapeStringify(${fieldValCode}, this.stringify.${field})`
                    : (() => {
                        throw Error(
                          `BUG: unknown spec type ${specType} for field ${field}`,
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
  private newFunction(...argsAndBody: string[]): (...args: unknown[]) => never {
    return new Function(...argsAndBody).bind({
      escapeComposite,
      escapeBoolean,
      escapeDate,
      escapeID,
      escapeString,
      escapeStringify,
      stringify: this.stringify,
    });
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
  private unfoldCompositePK<TInput extends object>(inputIn: TInput): TInput {
    let input = inputIn as Record<string, string | null>;
    if (!this.schema.table[ID] && typeof input[ID] === "string") {
      const compositePK = parseCompositeRow(input[ID]);
      input = { ...input };
      for (const [i, field] of this.schema.uniqueKey.entries()) {
        input[field] = compositePK[i];
      }
    }

    return input as TInput;
  }

  /**
   * Some data types are different between PG and JS. Here we have a chance to
   * "normalize" them. E.g. in JS, Date is truncated to milliseconds (3 digits),
   * whilst in PG, it's by default of 6 digits precision (so if we didn't
   * normalize, then JS Date would've been never equal to a PG timestamp).
   */
  private normalizeSQLExpr(field: Field<TTable>, sql: string): string {
    const spec = this.nullThrowsUnknownField(this.schema.table[field], field);
    if (spec.type === Date) {
      // Notice that `CAST(x AS timestamptz(3))` does ROUNDING, and we need
      // TRUNCATION, since it's the default behavior of postgres-date (they
      // changed it to rounding once, but then reverted intentionally) and
      // node-postgres. See https://github.com/brianc/node-postgres/issues/1200
      sql = `date_trunc('ms', ${sql})`;
    }

    return sql;
  }

  /**
   * Throws an exception about some field being not mentioned in the table
   * schema if the passed data is undefined. Notice that ID is treated as always
   * available in this message.
   */
  private nullThrowsUnknownField<T>(
    data: T,
    field: Field<TTable>,
  ): Exclude<T, null | undefined> {
    if (data === null || data === undefined) {
      throw Error(
        `Unknown field: ${field}; allowed fields: ` +
          [ID, ...Object.keys(this.schema.table)],
      );
    } else {
      return data as Exclude<T, null | undefined>;
    }
  }
}
