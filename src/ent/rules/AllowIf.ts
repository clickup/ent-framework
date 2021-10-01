import { EntAccessError } from "../errors/EntAccessError";
import { VC } from "../VC";
import { Rule, RuleDecision, RuleResult } from "./Rule";

/**
 * Returns ALLOW if the predicate succeeds, otherwise SKIP.
 * - Used mostly for read permission checks.
 * - This rule may still throw an exception if the exception is a wild one (not
 *   derived from EntAccessError).
 */
export class AllowIf<TInput extends object> extends Rule<TInput> {
  async evaluate(vc: VC, input: TInput): Promise<RuleResult> {
    try {
      return (await this.predicate.check(vc, input))
        ? { decision: RuleDecision.ALLOW, rule: this, cause: null }
        : { decision: RuleDecision.SKIP, rule: this, cause: null };
    } catch (error) {
      if (error instanceof EntAccessError) {
        // We carry a cause for this SKIP decision too if it was due to an
        // access-related error.
        return { decision: RuleDecision.SKIP, rule: this, cause: error };
      }

      throw error;
    }
  }
}
