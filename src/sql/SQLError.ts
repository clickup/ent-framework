import { ServerError } from "../abstract/ServerError";

export class SQLError extends ServerError {
  constructor(origError: any, where: string, public readonly sql: string) {
    super(origError, where);

    Object.defineProperty(this, "sql", {
      value: sql,
      writable: false,
      enumerable: false,
    });

    this.stack += ": " + sql.replace(/\s*\n\s*/g, " ");
  }

  isFKError(fkName?: string): boolean {
    return (
      this.message.includes("foreign key constraint") &&
      (!fkName || this.message.includes(fkName))
    );
  }
}
