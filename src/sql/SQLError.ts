import { copyStack } from "../helpers";

export class SQLError extends Error {
  constructor(
    public readonly origError: any,
    destName: string,
    public readonly sql: string
  ) {
    super(origError.message);

    Object.defineProperty(this, "name", {
      value: this.constructor.name,
      writable: true,
      enumerable: false,
    });
    Object.defineProperty(this, "sql", {
      value: sql,
      writable: false,
      enumerable: false,
    });

    copyStack(this, origError);
    this.stack += "\n" + destName + ": " + sql.replace(/\s*\n\s*/g, " ");
    delete origError.stack;
  }

  isFKError(fkName?: string) {
    return (
      this.message.includes("foreign key constraint") &&
      (!fkName || this.message.includes(fkName))
    );
  }
}
