import { sanitizeIDForDebugPrinting } from "../../helpers";
import { EntAccessError } from "./EntAccessError";

/**
 * Error: non-existing ID in the database.
 */
export class EntNotFoundError extends EntAccessError {
  constructor(
    public readonly entName: string,
    public readonly where: Record<string, any>,
    messageSuffix?: string
  ) {
    super(
      `${entName} not found: ${whereToText(where)}` +
        (messageSuffix ? ": " + messageSuffix : "")
    );
  }
}

function whereToText(where: Record<string, any>) {
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
