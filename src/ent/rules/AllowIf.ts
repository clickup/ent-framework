import { EntAccessError } from "../errors/EntAccessError";
import type { VC } from "../VC";
import type { RuleResult } from "./Rule";
import { Rule } from "./Rule";

/**
 * Returns ALLOW if the predicate succeeds, otherwise SKIP.
 * - Used mostly for read permission checks.
 * - This rule may still throw an exception if the exception is a wild one (not
 *   derived from EntAccessError).
 */
export class AllowIf<TInput extends object> extends Rule<TInput> {
  readonly _TAG!: "AllowIf";

  async evaluate(vc: VC, input: TInput): Promise<RuleResult> {
    try {
      return (await this.predicate.check(vc, input))
        ? { decision: "ALLOW", rule: this, cause: null }
        : { decision: "SKIP", rule: this, cause: null };
    } catch (error: unknown) {
      if (error instanceof EntAccessError) {
        // We carry a cause for this SKIP decision too if it was due to an
        // access-related error.
        return { decision: "SKIP", rule: this, cause: error };
      }

      throw error;
    }
  }
}
