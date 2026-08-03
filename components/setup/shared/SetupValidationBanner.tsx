"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";

function summaryMessage(errors: Record<string, string>): string {
  const values = Object.values(errors);
  if (values.length === 0) return "";
  if (values.length === 1) return values[0] ?? "";
  return `Complete ${values.length} required fields before continuing.`;
}

/** Shown when Continue fails client validation — explains why the step did not advance. */
export function SetupValidationBanner({
  errors,
}: {
  errors: Record<string, string>;
}) {
  const { colors, radius } = useThemeTokens();
  const keys = Object.keys(errors);
  if (keys.length === 0) return null;
  const message = summaryMessage(errors);
  const details = keys.slice(0, 4);

  return (
    <div
      role="alert"
      className="flex gap-2.5 border px-3 py-3 text-sm"
      style={{
        borderRadius: radius.md,
        borderColor: `${colors.error}73`,
        background: `${colors.error}1F`,
        color: colors.error,
      }}
      aria-label={message}
    >
      <span aria-hidden className="mt-0.5 font-semibold">
        !
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-semibold">{message}</p>
        {keys.length > 1
          ? details.map((key) => (
              <p key={key} className="text-xs opacity-90">
                • {errors[key]}
              </p>
            ))
          : null}
      </div>
    </div>
  );
}
