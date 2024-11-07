import type { EntAccessError } from "../errors/EntAccessError";
import type { Predicate } from "../predicates/Predicate";
import { FuncToPredicate } from "../predicates/Predicate";
import type { VC } from "../VC";

/**
 * Each Rule evaluates to some Decision (or throws).
 */
export type RuleDecision = "ALLOW" | "TOLERATE" | "SKIP" | "DENY";

/**
 * A full debug info about some Rule decision (which Rule produced this
 * decision, what was thrown etc.).
 */
export interface RuleResult {
  decision: RuleDecision;
  rule: Rule<object>;
  cause: EntAccessError | null;
}

/**
 * A base class which can e.g. accept not only a predicate, but also a plain JS
 * lambda function as a predicate. Also has a logic of "glueing" the rule name
 * with the predicate name.
 *
 * Each Rule must either:
 * - throw (or return DENY) if it disallows access immediately,
 * - return ALLOW if the access is granted (so no other rules will run),
 * - return TOLERATE if it's okay with the row, but wants others' votes too,
 * - or return SKIP to fully delegate the decision to the next rule.
 *
 * See more comments in rules.ts.
 *
 * Each rule carries a predicate which it calls and then decides, how to
 * interpret the result.
 */
export abstract class Rule<TInput> {
  readonly predicate: Predicate<TInput>;
  readonly name: string;

  abstract evaluate(vc: VC, input: TInput): Promise<RuleResult>;

  constructor(
    predicate:
      | Predicate<TInput>
      | ((vc: VC, input: TInput) => Promise<boolean>),
  ) {
    this.predicate =
      predicate instanceof Function
        ? new FuncToPredicate<TInput>(predicate)
        : predicate;
    this.name = this.constructor.name + ":" + this.predicate.name;
  }
}
