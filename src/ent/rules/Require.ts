import type { VC } from "../VC";
import type { RuleResult } from "./Rule";
import { Rule, RuleDecision } from "./Rule";

/**
 * Returns TOLERATE if the predicate succeeds, otherwise DENY.
 * - Used mostly for write permission checks.
 * - This rule may still throw an exception if it's a wild one (i.e. not derived
 *   from EntAccessError).
 */
export class Require<TInput extends object> extends Rule<TInput> {
  readonly _TAG!: "Require";

  async evaluate(vc: VC, input: TInput): Promise<RuleResult> {
    return (await this.predicate.check(vc, input))
      ? { decision: RuleDecision.TOLERATE, rule: this, cause: null }
      : { decision: RuleDecision.DENY, rule: this, cause: null };
  }
}
