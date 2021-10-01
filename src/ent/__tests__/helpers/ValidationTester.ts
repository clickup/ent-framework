import { inspect } from "util";
import { Row, Table } from "../../../types";
import { Validation } from "../../Validation";
import { vcTestGuest } from "./test-objects";

/**
 * A helper class to log some predicate response (plus the row argument) and
 * return it, see how it's used in the code.
 *
 * - Q: "If we have a class which validates a validation, who'd be validating
 *   the function which validates the validation?"
 * - A: "TS & Jest"
 */
export default class ValidationTester {
  private log: string[] = [];

  respond(response: boolean | Error, row?: any): boolean {
    const stack = Error().stack || "";
    const predName =
      (stack.match(/at FuncToPredicate.(\w+)/) ? RegExp.$1 : "lambda") +
      (row ? " " + inspect(row) : "");
    if (response instanceof Error) {
      this.log.push(predName + " threw " + response.message);
      throw response;
    } else {
      this.log.push(predName + " returned " + response);
      return response;
    }
  }

  async matchSnapshot<TTable extends Table>(
    validation: Validation<TTable>,
    row: Row<TTable>,
    method?:
      | "validateLoad"
      | "validateInsert"
      | "validateUpdate"
      | "validateDelete",
    vc = vcTestGuest
  ) {
    let res = "";
    try {
      if (!method) {
        if (validation.load.length > 0) {
          method = "validateLoad";
        } else {
          method = "validateInsert";
        }
      }

      if (method === "validateUpdate") {
        await validation.validateUpdate(vc, row, {});
      } else {
        await validation[method](vc, row);
      }

      res = "success";
    } catch (e: any) {
      res = "failure: " + e.message;
    }

    res += "\n" + this.log.join("\n");
    expect(res.replace(/\b(vc:\w+)\(\d+\)/g, "$1")).toMatchSnapshot();
  }
}
