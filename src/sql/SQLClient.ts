import { Client } from "../abstract/Client";
import { QueryAnnotation } from "../abstract/QueryAnnotation";

const MAX_BIGINT = "9223372036854775807";
const MAX_BIGINT_RE = new RegExp("^\\d{1," + MAX_BIGINT.length + "}$");

export function isBigintStr(str: string) {
  return (
    !!str.match(MAX_BIGINT_RE) &&
    (str.length < MAX_BIGINT.length || str <= MAX_BIGINT)
  );
}

export function escapeIdent(ident: any): string {
  return ident.match(/^[a-z_][a-z_0-9]*$/is)
    ? ident
    : '"' + ident.replace(/"/g, '""') + '"';
}

export function escapeAny(v: any): string {
  // Try to not use this function; although it protects against SQL injections,
  // it's not aware of the actual field type, so it e.g. cannot prevent a bigint
  // overflow SQL error.
  return v === null || v === undefined
    ? "NULL"
    : typeof v === "number"
    ? "" + v
    : typeof v === "boolean"
    ? escapeBoolean(v)
    : v instanceof Date
    ? escapeDate(v)
    : escapeString(v);
}

export function escapeID(v: string | null | undefined): string {
  if (v === null || v === undefined) {
    return "NULL";
  }

  const str = "" + v;
  if (!isBigintStr(str)) {
    return "'-1'/*bad_bigint*/";
  }

  return escapeString(str);
}

export function escapeString(v: string | null | undefined): string {
  return v === null || v === undefined
    ? "NULL"
    : // Postgres doesn't like ASCII NUL character (error message is "unterminated
      // quoted string" or "invalid message format"), so we remove it too.
      "'" + ("" + v).replace(/\0/g, "").replace(/'/g, "''") + "'";
}

export function escapeDate(v: Date | null | undefined, field?: string): string {
  try {
    return v === null || v === undefined ? "NULL" : "'" + v.toISOString() + "'";
  } catch (e) {
    throw Error(`Failed to perform escapeDate for "${field}": ${e}`);
  }
}

export function escapeBoolean(v: boolean | null | undefined): string {
  return v === null || v === undefined ? "NULL" : v ? "true" : "false";
}

export function escapeStringify(v: any, stringify: (v: any) => string): string {
  return v === null || v === undefined ? "NULL" : escapeString(stringify(v));
}

export function parseLsn(lsn: string | null | undefined) {
  if (!lsn) {
    return null;
  }

  const [a, b] = lsn.split("/").map((x) => BigInt(parseInt(x, 16)));
  return (a << BigInt(32)) + b;
}

export interface SQLClient extends Client {
  query<TRow>(
    query: string | { query: string; hints: Record<string, string> },
    op: string,
    table: string,
    annotations: QueryAnnotation[],
    batchFactor: number
  ): Promise<TRow[]>;
}
