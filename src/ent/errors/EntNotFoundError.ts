import { sanitizeIDForDebugPrinting } from "../../helpers/misc";
import { EntAccessError } from "./EntAccessError";

/**
 * Error: non-existing ID in the database.
 */
export class EntNotFoundError extends EntAccessError {
  constructor(
    entName: string,
    public readonly where: Record<string, unknown>,
    cause: unknown = null
  ) {
    super(entName, `${entName} not found: ${whereToText(where)}`, cause);
  }
}

function whereToText(where: Record<string, unknown>): string {
  if (Object.keys(where).length === 1) {
    const [k, v] = Object.entries(where)[0];
    return `${k}=${sanitizeIDForDebugPrinting(v)}`;
  }

  return (
    "(" +
    Object.keys(where).join(",") +
    ")=(" +
    Object.values(where).map(sanitizeIDForDebugPrinting).join(",") +
    ")"
  );
}
