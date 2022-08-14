import { inspect } from "util";
import { sanitizeIDForDebugPrinting } from "../../helpers";
import { EntAccessError } from "./EntAccessError";

/**
 * Error: non-existing ID in the database.
 */
export class EntNotFoundError extends EntAccessError {
  constructor(
    public readonly entName: string,
    public readonly idOrUniqueKey: any,
    messageSuffix?: string
  ) {
    super(
      entName +
        " not found: " +
        (typeof idOrUniqueKey === "string"
          ? `"${sanitizeIDForDebugPrinting(idOrUniqueKey)}"`
          : inspect(idOrUniqueKey, { breakLength: Infinity })) +
        (messageSuffix ? ": " + messageSuffix : "")
    );
  }
}
