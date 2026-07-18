"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import type { SetupChoice } from "@/components/setup/shared/setupControlTypes";
import { SetupField } from "@/components/setup/shared/SetupField";
import { GuidedSetupExplainer } from "@/components/setup/GuidedSetupExplainer";
import { useGuidedSetupTheme } from "@/components/setup/GuidedSetupTheme";

type Props = {
  label: string;
  helper?: string;
  optionalLabel?: string;
  error?: string | null;
  value: string;
  options: SetupChoice[];
  onChange: (value: string) => void;
  disabled?: boolean;
  explainer?: { title: string; body: string } | null;
  multi?: false;
};

/** Card-style single select for short option sets (team size, stage, scope, etc.). */
export function SetupChoiceCards({
  label,
  helper,
  optionalLabel,
  error,
  value,
  options,
  onChange,
  disabled,
  explainer,
}: Props) {
  const { colors } = useThemeTokens();
  const setupTheme = useGuidedSetupTheme();

  return (
    <SetupField
      label={label}
      helper={helper}
      optionalLabel={optionalLabel}
      error={error}
      explainer={
        explainer ? (
          <GuidedSetupExplainer title={explainer.title} body={explainer.body} />
        ) : undefined
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              title={opt.description}
              onClick={() => onChange(opt.value)}
              className="min-h-11 rounded-2xl border px-3 py-3 text-left transition-colors disabled:opacity-50"
              style={{
                borderColor: selected
                  ? setupTheme.accentColor
                  : `color-mix(in srgb, ${colors.border} 45%, transparent)`,
                background: selected ? setupTheme.selectedCard : colors.background,
              }}
              aria-pressed={selected}
            >
              <span className="block text-sm font-semibold">{opt.label}</span>
              {opt.description ? (
                <span className="mt-0.5 block text-[11px] leading-snug opacity-65">
                  {opt.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </SetupField>
  );
}
