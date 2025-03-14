import { EntValidationError } from "../../errors/EntValidationError";
import type {
  ValidatorPlainResult,
  ValidatorStandardSchemaResult,
  ValidatorZodSafeParseResult,
} from "../AbstractIs";

export function maybeThrowEntValidationError({
  name,
  field,
  res,
  allowRichResult,
}: {
  name: string;
  field: string | null;
  res:
    | ValidatorPlainResult
    | ValidatorStandardSchemaResult
    | ValidatorZodSafeParseResult;
  allowRichResult: boolean;
}): boolean {
  if (typeof res === "boolean") {
    return res;
  }

  const issues =
    "issues" in res ? res.issues : "error" in res ? res.error?.issues : [];
  if (issues?.length) {
    throw new EntValidationError(
      name,
      issues.map(({ message, path }) => ({
        field:
          path
            ?.map((part) => (typeof part === "object" ? part.key : part))
            .join(".") || field,
        message,
      })),
    );
  }

  if (allowRichResult) {
    return true;
  }

  throw Error(
    "BUG: validator must return true, false or one of Validator*Result values",
  );
}
