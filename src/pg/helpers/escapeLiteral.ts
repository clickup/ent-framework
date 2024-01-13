import { inspectCompact } from "../../internal/misc";
import type { Literal } from "../../types";
import { escapeAny } from "../internal/escapeAny";
import { escapeID } from "../internal/escapeID";

/**
 * Builds a part of SQL query using ?-placeholders to prevent SQL Injection.
 * Everywhere where we want to accept a piece of SQL, we should instead accept a
 * Literal tuple.
 *
 * The function converts a Literal tuple [fmt, ...args] into a string, escaping
 * the args and interpolating them into the format SQL where "?" is a
 * placeholder for the replacing value.
 */
export function escapeLiteral(literal: Literal): string {
  if (
    !(literal instanceof Array) ||
    literal.length === 0 ||
    typeof literal[0] !== "string"
  ) {
    throw Error(
      "Invalid literal value (must be an array with 1st element as a format): " +
        inspectCompact(literal),
    );
  }

  if (literal.length === 1) {
    return literal[0];
  }

  const [fmt, ...args] = literal;
  return fmt.replace(/\?([i]?)/g, (_, flag) =>
    flag === "i" ? escapeID("" + args.shift()) : escapeAny(args.shift()),
  );
}
