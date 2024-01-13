import { escapeString } from "./escapeString";

/**
 * Escapes an array of strings.
 */
export function escapeArray(
  obj: Array<string | null> | null | undefined,
): string {
  return obj === null || obj === undefined
    ? "NULL"
    : escapeString(
        "{" +
          obj
            .map((v) =>
              v === null
                ? "NULL"
                : `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`,
            )
            .join(",") +
          "}",
      );
}
