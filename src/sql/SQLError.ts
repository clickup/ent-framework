import { copyStack } from "../helpers";

export class SQLError extends Error {
  #sql: string;

  constructor(public readonly origError: any, destName: string, sql: string) {
    super(origError.message);

    Object.defineProperty(this, "name", {
      value: this.constructor.name,
      writable: true,
      enumerable: false,
    });
    this.#sql = sql;

    copyStack(this, origError);
    this.stack += "\n" + destName + ": " + sql.replace(/\s*\n\s*/g, " ");
    delete origError.stack;
  }

  /**
   * We could've just make this.sql a readonly property (and not #sql) instead,
   * but then it'd be exposed when printing the error via inspect() or
   * console.log(), which we don't want to. So instead, we define it as a getter
   * function (which is "invisible" when using e.g. console.log()).
   */
  sql() {
    return this.#sql;
  }

  isFKError(fkName?: string) {
    return (
      this.message.includes("foreign key constraint") &&
      (!fkName || this.message.includes(fkName))
    );
  }
}
