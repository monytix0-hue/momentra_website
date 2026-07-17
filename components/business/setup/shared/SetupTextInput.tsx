"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { SetupField } from "@/components/business/setup/shared/SetupField";

type Props = {
  label: string;
  helper?: string;
  optionalLabel?: string;
  error?: string | null;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  multiline?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  id?: string;
};

export function SetupTextInput({
  label,
  helper,
  optionalLabel,
  error,
  value,
  onChange,
  placeholder,
  disabled,
  multiline,
  inputMode,
  id,
}: Props) {
  const { colors } = useThemeTokens();
  const style = {
    borderColor: `color-mix(in srgb, ${colors.border} 40%, transparent)`,
    background: colors.background,
  } as const;

  return (
    <SetupField
      label={label}
      helper={helper}
      optionalLabel={optionalLabel}
      error={error}
      htmlFor={id}
    >
      {multiline ? (
        <textarea
          id={id}
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none disabled:opacity-50"
          style={style}
        />
      ) : (
        <input
          id={id}
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none disabled:opacity-50"
          style={style}
        />
      )}
    </SetupField>
  );
}
