/**
 * Personal setup presentation catalog (copy only — not validation).
 */
import copyJson from "@/lib/personal/personal_setup_copy.json";
import type { GuidedSetupStep } from "@/components/setup/GuidedSetupShell";

export const PERSONAL_SETUP_COPY = copyJson;

export function personalSetupTemplate(id: "personal_default" = "personal_default") {
  return PERSONAL_SETUP_COPY.templates[id];
}

/** Evaluate simple `answers.key === value` / truthy checks for hiddenWhen. */
export function evaluateHiddenWhen(
  expression: string | undefined,
  answers: Record<string, unknown>,
): boolean {
  if (!expression?.trim()) return false;
  const eq = expression.match(/^answers\.([a-zA-Z0-9_]+)\s*===\s*(true|false|"[^"]*"|'[^']*')$/);
  if (eq) {
    const key = eq[1];
    const raw = eq[2];
    const expected =
      raw === "true" ? true : raw === "false" ? false : raw.slice(1, -1);
    return answers[key] === expected;
  }
  const truthy = expression.match(/^answers\.([a-zA-Z0-9_]+)$/);
  if (truthy) return Boolean(answers[truthy[1]]);
  return false;
}

export function personalGuidedSteps(answers: Record<string, unknown> = {}): GuidedSetupStep[] {
  return personalSetupTemplate()
    .steps.filter((s) => !evaluateHiddenWhen(s.hiddenWhen, answers))
    .map((s) => ({
      id: s.id,
      title: s.title,
      shortTitle: s.shortTitle,
      description: s.description,
      optional: s.optional,
      hiddenWhen: s.hiddenWhen,
    }));
}
