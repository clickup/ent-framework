import { ClientError } from "../abstract/ClientError";

export class PgError extends ClientError {
  constructor(
    cause: null | undefined | {},
    where: string,
    public readonly sql: string,
    public readonly table: string,
  ) {
    super(cause, where, "fail", "data-on-server-is-unchanged", "pg_error");

    Object.defineProperty(this, "sql", {
      value: sql,
      writable: false,
      enumerable: false,
    });
  }

  isFKError(fkName?: string): boolean {
    return (
      this.message.includes("foreign key constraint") &&
      (!fkName || this.message.includes(fkName))
    );
  }
}
