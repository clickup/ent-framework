import { copyStack } from "../helpers/misc";

/**
 * Encapsulates the error message passed from the DB server. Notice that in case
 * of e.g. connection reset errors or network timeouts, this error is NOT thrown
 * (because we actually don't know whether the server applied the query or not);
 * instead, some other exception (lower level) is raised.
 */
export class ServerError extends Error {
  constructor(public readonly origError: any, destName: string) {
    super(origError.message);

    Object.defineProperty(this, "name", {
      value: this.constructor.name,
      writable: true,
      enumerable: false,
    });

    copyStack(this, origError);
    this.stack += "\n" + destName;
    delete origError.stack;
  }
}
