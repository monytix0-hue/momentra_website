"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import type { SetupChoice } from "@/lib/business/setupCatalog";
import { SetupField } from "@/components/business/setup/shared/SetupField";

type Props = {
  label: string;
  helper?: string;
  optionalLabel?: string;
  error?: string | null;
  value: string;
  options: SetupChoice[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

/** Single-select chips for 2–7 finite choices. Stores canonical enum values. */
export function SetupChoiceChips({
  label,
  helper,
  optionalLabel,
  error,
  value,
  options,
  onChange,
  disabled,
}: Props) {
  const { colors } = useThemeTokens();
  return (
    <SetupField label={label} helper={helper} optionalLabel={optionalLabel} error={error}>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              title={opt.description}
              onClick={() => onChange(opt.value)}
              className="rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
              style={{
                borderColor: selected
                  ? colors.primary
                  : `color-mix(in srgb, ${colors.border} 45%, transparent)`,
                background: selected
                  ? `color-mix(in srgb, ${colors.primary} 18%, transparent)`
                  : colors.background,
                color: selected ? colors.primary : colors.textPrimary,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {value ? (
        (() => {
          const desc = options.find((o) => o.value === value)?.description;
          return desc ? (
            <p className="mt-1 text-xs opacity-70" style={{ color: colors.textSecondary }}>
              {desc}
            </p>
          ) : null;
        })()
      ) : null}
    </SetupField>
  );
}
