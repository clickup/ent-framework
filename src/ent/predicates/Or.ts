import { mapJoin } from "../../helpers/misc";
import { EntAccessError } from "../errors/EntAccessError";
import type { VC } from "../VC";
import type { Predicate } from "./Predicate";
import { FuncToPredicate } from "./Predicate";

/**
 * Checks that at least one of the children predicates succeed.
 */
export class Or<TInput> implements Predicate<TInput> {
  readonly name = this.constructor.name;
  readonly predicates: ReadonlyArray<Predicate<TInput>>;

  constructor(
    ...predicates: ReadonlyArray<
      Predicate<TInput> | ((vc: VC, input: TInput) => Promise<boolean>)
    >
  ) {
    this.predicates = predicates.map((predicate) =>
      predicate instanceof Function
        ? new FuncToPredicate<TInput>(predicate)
        : predicate
    );
  }

  async check(vc: VC, input: TInput): Promise<boolean> {
    const errorEntNames = new Set<string>();
    const results = await mapJoin(this.predicates, async (predicate) => {
      try {
        return {
          predicate,
          res: await predicate.check(vc, input),
        };
      } catch (e: unknown) {
        if (e instanceof EntAccessError) {
          errorEntNames.add(e.entName);
          return { predicate, res: e };
        } else {
          throw e;
        }
      }
    });

    if (results.some(({ res }) => res === true)) {
      return true;
    }

    throw new EntAccessError(
      [...errorEntNames].join("|"),
      results
        .map(
          ({ predicate, res }) =>
            `${predicate.name}: ` +
            (typeof res === "boolean" ? res : res.message)
        )
        .join("\n")
    );
  }
}
