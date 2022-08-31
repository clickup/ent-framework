import { EntAccessError } from "../errors/EntAccessError";
import type { VC } from "../VC";
import type { RuleResult } from "./Rule";
import { Rule, RuleDecision } from "./Rule";

/**
 * Returns DENY if the predicate succeeds, otherwise SKIP.
 * - Used mostly to early block some read/write access.
 * - EntAccessError exception will be treated as a DENY signal (so it will abort
 *   processing immediately).
 * - This rule may still throw an exception if the exception is a wild one (not
 *   derived from EntAccessError).
 */
export class DenyIf<TInput extends object> extends Rule<TInput> {
  async evaluate(vc: VC, input: TInput): Promise<RuleResult> {
    try {
      return (await this.predicate.check(vc, input))
        ? { decision: RuleDecision.DENY, rule: this, cause: null }
        : { decision: RuleDecision.SKIP, rule: this, cause: null };
    } catch (error) {
      if (error instanceof EntAccessError) {
        // We carry a cause for this DENY decision too if it was due to an
        // access-related error.
        return { decision: RuleDecision.DENY, rule: this, cause: error };
      }

      throw error;
    }
  }
}
