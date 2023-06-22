import { inspect } from "util";
import { indent, mapJoin } from "../../helpers/misc";
import { EntAccessError } from "../errors/EntAccessError";
import type { VC } from "../VC";
import type { Rule, RuleResult } from "./Rule";
import { RuleDecision } from "./Rule";

/**
 * This is a hearth of permissions checking, a machine which evaluates the rules
 * chain from top to bottom (one after another) and makes the decision based on
 * the following logic:
 * - ALLOW immediately allows the chain, the rest of the rules are not checked.
 *   It's an eager allowance.
 * - DENY immediately denies the chain, the rest of the rules are not checked.
 *   It's an eager denial.
 * - TOLERATE delegates the decision to the next rules; if it's the last
 *   decision in the chain, then allows the chain. I.e. it's like an allowance,
 *   but only if everyone else is tolerant.
 * - SKIP also delegates the decision to the next rules, but if it's the last
 *   rule in the chain (i.e. nothing to skip to anymore), denies the chain. I.e.
 *   it's "I don't vote here, please ask others".
 * - An empty chain is always denied.
 *
 * Having TOLERATE decision may sound superfluous, but unfortunately it's not.
 * The TOLERATE enables usage of the same machinery for both read-like checks
 * (where we typically want ANY of the rules to be okay with the row) and for
 * write-like checks (where we typically want ALL rules to be okay with the
 * row). Having the same logic for everything simplifies the code.
 *
 * If parallel argument is true, all the rules are run at once in concurrent
 * promises before the machine starts. This doesn't affect the final result,
 * just speeds up processing if we know that there is a high chance that most of
 * the rules will likely return TOLERATE and we'll anyway need to evaluate all
 * of them (e.g. most of the rules are Require, like in write operations). As
 * opposed, for read operation, there is a high chance for the first rule (which
 * is often AllowIf) to succeed, so we evaluate the rules sequentially, not in
 * parallel (to minimize the number of DB queries).
 *
 * Example of a chain (the order of rules always matters!):
 * - new AllowIf(new VCHasFlavor(VCAdmin))
 * - new Require(new OutgoingEdgePointsToVC("user_id"))
 * - new Require(new CanReadOutgoingEdge("post_id", EntPost))
 *
 * Example of a chain:
 * - new AllowIf(new OutgoingEdgePointsToVC("user_id"))
 * - new AllowIf(new CanReadOutgoingEdge("post_id", EntPost))
 *
 * Example of a chain:
 * - new AllowIf(new VCHasFlavor(VCAdmin))
 * - new DenyIf(new UserIsPendingApproval())
 * - new AllowIf(new OutgoingEdgePointsToVC("user_id"))
 */
export async function evaluate<TInput extends object>(
  vc: VC,
  input: TInput,
  rules: Array<Rule<TInput>>,
  fashion: "parallel" | "sequential"
): Promise<{
  allow: boolean;
  results: RuleResult[];
  cause: string;
}> {
  const results =
    fashion === "parallel"
      ? await mapJoin(rules, async (rule) => ruleEvaluate(rule, vc, input))
      : [];
  let lastResult: RuleResult | null = null;
  for (let i = 0; i < rules.length; i++) {
    if (!results[i]) {
      results[i] = await ruleEvaluate(rules[i], vc, input);
    }

    lastResult = results[i];
    switch (lastResult.decision) {
      case RuleDecision.ALLOW:
        return {
          allow: true,
          results,
          cause: resultsToCause(results),
        };
      case RuleDecision.DENY:
        return {
          allow: false,
          results,
          cause: resultsToCause(results),
        };
      case RuleDecision.TOLERATE:
      case RuleDecision.SKIP:
        continue;
      default:
        throw Error("BUG: weird RuleResult " + inspect(lastResult));
    }
  }

  const cause = resultsToCause(results);

  if (!lastResult) {
    return { allow: false, results, cause };
  }

  if (lastResult.decision === RuleDecision.SKIP) {
    return { allow: false, results, cause };
  }

  if (lastResult.decision === RuleDecision.TOLERATE) {
    return { allow: true, results, cause };
  }

  throw Error("BUG: weird last rule result: " + inspect(lastResult));
}

/**
 * Evaluates one rule turning all EntAccessError exceptions (if they happen)
 * into DENY decision (and annotating them with the rule name which caused the
 * exception). All "wild" (non-EntAccessError) are thrown through.
 */
async function ruleEvaluate<TInput extends object>(
  rule: Rule<TInput>,
  vc: VC,
  input: TInput
): Promise<RuleResult> {
  try {
    return await rule.evaluate(vc, input);
  } catch (error) {
    if (error instanceof EntAccessError) {
      return {
        decision: RuleDecision.DENY,
        rule,
        cause: error,
      };
    }

    throw error;
  }
}

/**
 * A helper function which returns a debugging text for a list of rule
 * evaluation results.
 */
function resultsToCause(results: RuleResult[]): string {
  return results.length === 0
    ? `No rules defined`
    : results
        .map(
          ({ rule, decision, cause }) =>
            `Rule ${rule.name} returned ${decision}` +
            (cause ? ", because:\n" + indent(cause.message) : "")
        )
        .join("\n");
}
