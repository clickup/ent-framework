import { inspect } from "util";
import type { Row, Table, UpdateInput } from "../../types";
import type { Validation } from "../Validation";
import { VC } from "../VC";
import { VCWithQueryCache } from "../VCFlavor";

const vcTestGuest =
  VC.createGuestPleaseDoNotUseCreationPointsMustBeLimited().withTransitiveMasterFreshness();

/**
 * Creates a test VC.
 */
export function createVC(): VC {
  const vc = vcTestGuest.withFlavor(new VCWithQueryCache({ maxQueries: 1000 }));
  (vc as any).freshness = null;
  return vc;
}

/**
 * Normalizes the text before matching the snapshot.
 */
export function expectToMatchSnapshot(
  str: string,
  snapshotName?: string
): void {
  const exp = expect(
    str.replace(/\b(vc:\w+)\(\d+\)/g, "$1").replace(/\d{10,}/g, "<id>")
  );
  snapshotName ? exp.toMatchSnapshot(snapshotName) : exp.toMatchSnapshot();
}

/**
 * A helper class to log some predicate response (plus the row argument) and
 * return it, see how it's used in the code.
 *
 * - Q: "If we have a class which validates a validation, who'd be validating
 *   the function which validates the validation?"
 * - A: "TS & Jest"
 */
export class ValidationTester {
  private log: string[] = [];

  respond(predName: string, response: boolean | Error, row?: unknown): boolean {
    predName += row ? " " + inspect(row) : "";
    if (response instanceof Error) {
      this.log.push(`[${predName} threw] ${response}`);
      throw response;
    } else {
      this.log.push(`[${predName} returned] ${response}`);
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
    updateInput: UpdateInput<TTable> = {},
    vc = vcTestGuest
  ): Promise<void> {
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
        await validation.validateUpdate(vc, row, updateInput);
      } else {
        await validation[method](vc, row as any);
      }

      res = "OK";
    } catch (e: unknown) {
      res = "Failure\n--- (error returned to client) ---\n" + e;
    }

    res += "\n--- (what actually happened) ---\n" + this.log.join("\n");
    expect(res.replace(/\b(vc:\w+)\(\d+\)/g, "$1")).toMatchSnapshot();
  }
}
