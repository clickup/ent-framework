import { ClientError } from "../abstract/ClientError";

export class PgError extends ClientError {
  constructor(
    cause: null | undefined | {},
    where: string,
    public readonly sql: string,
  ) {
    super(cause, where, "fail", "data-on-server-is-unchanged");

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
