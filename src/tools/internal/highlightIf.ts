import chalk from "chalk";

export function highlightIf(
  message: string,
  color: typeof chalk.Color | typeof chalk.Modifiers,
  condition: () => boolean,
): string {
  return condition() ? chalk[color](message) : message;
}
