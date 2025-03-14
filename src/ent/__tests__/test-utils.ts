import { inspect } from "util";
import type { InsertInput, Row, Table, UpdateInput } from "../../types";
import { EntValidationError } from "../errors/EntValidationError";
import type { Validation } from "../Validation";
import { VC } from "../VC";
import { VCWithQueryCache } from "../VCFlavor";

const vcTestGuest =
  VC.createGuestPleaseDoNotUseCreationPointsMustBeLimited().withTransitiveMasterFreshness();

/**
 * Creates a test VC.
 */
export function createVC(): VC {
  const vc = vcTestGuest
    .withFlavor(new VCWithQueryCache({ maxQueries: 1000 }))
    .withDefaultFreshness();
  return vc;
}

/**
 * Normalizes the text before matching the snapshot.
 */
export function expectToMatchSnapshot(
  str: string,
  snapshotName?: string,
): void {
  const exp = expect(
    str.replace(/\b(vc:\w+)\(\d+\)/g, "$1").replace(/\d{10,}/g, "<id>"),
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

  respond<TRes>(
    predName: string,
    response: TRes,
    row?: unknown,
  ): TRes extends Error ? boolean : TRes {
    predName += row ? " " + inspect(row) : "";
    if (response instanceof Error) {
      this.log.push(`[${predName} threw] ${response}`);
      throw response;
    } else {
      this.log.push(
        `[${predName} returned] ` +
          (typeof response === "object"
            ? inspect(
                response instanceof Promise
                  ? response.constructor.name // hide e.g. Datadog guts
                  : { ...response },
                { compact: true, depth: 10, breakLength: 10000 },
              )
            : response),
      );
      return response as TRes extends Error ? boolean : TRes;
    }
  }

  async matchSnapshot<TTable extends Table>({
    validation,
    row,
    method,
    updateInput,
    vc = vcTestGuest,
  }: {
    validation: Validation<TTable>;
    row: Row<TTable>;
    vc?: VC;
  } & (
    | {
        method: "validateLoad" | "validateInsert" | "validateDelete";
        updateInput?: never;
      }
    | {
        method: "validateUpdate";
        updateInput: UpdateInput<TTable>;
      }
  )): Promise<boolean> {
    let res = "";
    let allow = false;
    try {
      if (method === "validateUpdate") {
        await validation.validateUpdate(vc, row, updateInput);
      } else {
        await validation[method](vc, row as InsertInput<TTable> & Row<TTable>);
      }

      res = "OK";
      allow = true;
    } catch (e: unknown) {
      const severity =
        e instanceof EntValidationError ? "Failure" : "Error Thrown Through";
      res = `${severity}\n--- (error returned to client) ---\n${e}`;
    }

    res += "\n--- (what actually happened) ---\n" + this.log.join("\n");
    expect(res.replace(/\b(vc:\w+)\(\d+\)/g, "$1")).toMatchSnapshot();
    return allow;
  }
}
