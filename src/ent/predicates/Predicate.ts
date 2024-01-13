import { IDsCache } from "../IDsCache";
import type { VC } from "../VC";

/**
 * A predicate evaluates against some input (typically a row) and returns true
 * or false (or throws which is considering the similar way as returning false).
 *
 * I.e. Predicate is a "yes/no" logic. If it resolves to "no", then the
 * framework may disallow some Ent operation and include predicate object's
 * properties (like name or any other info) to the exception.
 *
 * Also, some predicates try to use caches in vc to make the decision faster
 * based on the previously computed results. E.g. CanReadOutgoingEdge predicate
 * knows that it already returned true for some ID once, it returns true again
 * immediately. This saves us lots of database operations.
 */
export interface Predicate<TInput> {
  readonly name: string;
  check(vc: VC, input: TInput): Promise<boolean>;
}

/**
 * Sometimes, instead of passing a well-known predicate like OutgoingEdgePointsToVC
 * or CanUpdateOutgoingEdge, we want to pass just a function which accepts a row
 * and returns true or false. This class represents a Predicate which delegates
 * its work to such a function. The name of the function becomes the name of the
 * predicate.
 */
export class FuncToPredicate<TInput> implements Predicate<TInput> {
  readonly name;

  constructor(private func: (vc: VC, input: TInput) => Promise<boolean>) {
    this.name = this.func.name || "lambda";
  }

  async check(vc: VC, input: TInput): Promise<boolean> {
    return this.func(vc, input);
  }
}

// Ent.ts may populate these caches too when it loads some ent from the DB,
// because often times we then load some dependent Ent.

export class IDsCacheReadable extends IDsCache {}
export class IDsCacheUpdatable extends IDsCache {}
export class IDsCacheCanReadIncomingEdge extends IDsCache {}
