"use client";

import type { ReactNode } from "react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";

type Props = {
  label: string;
  helper?: string;
  optionalLabel?: string;
  error?: string | null;
  children: ReactNode;
  htmlFor?: string;
};

export function SetupField({
  label,
  helper,
  optionalLabel,
  error,
  children,
  htmlFor,
}: Props) {
  const { colors } = useThemeTokens();
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2">
        <label
          htmlFor={htmlFor}
          className="text-xs font-semibold tracking-wide"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </label>
        {optionalLabel ? (
          <span className="text-[10px] font-medium uppercase tracking-wide opacity-50">
            {optionalLabel}
          </span>
        ) : null}
      </div>
      {helper ? (
        <p className="text-xs leading-relaxed opacity-70" style={{ color: colors.textSecondary }}>
          {helper}
        </p>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs" style={{ color: colors.error }} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
