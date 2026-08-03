"use client";

import type { CSSProperties, ReactNode } from "react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";

export function settingsFieldStyle(
  colors: ReturnType<typeof useThemeTokens>["colors"],
  radius: ReturnType<typeof useThemeTokens>["radius"],
): CSSProperties {
  return {
    width: "100%",
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`,
    background: colors.surfaceContainer,
    color: colors.textPrimary,
    padding: "10px 12px",
    fontSize: 14,
  };
}

export function SettingsSectionShell({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: ReactNode;
}) {
  const { colors, radius } = useThemeTokens();
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium"
        style={{ color: colors.brandPrimary }}
      >
        ← Back
      </button>
      <div>
        <h3
          className="text-base font-semibold"
          style={{ color: colors.textPrimary }}
        >
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
            {subtitle}
          </p>
        ) : null}
      </div>
      <div
        className="space-y-4 rounded-xl p-4"
        style={{
          background: colors.surfaceElevated,
          borderRadius: radius.lg,
          border: `1px solid ${colors.border}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function SettingsPrimaryButton({
  children,
  disabled,
  onClick,
  danger,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  danger?: boolean;
}) {
  const { colors, radius } = useThemeTokens();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full px-4 py-2.5 text-sm font-medium disabled:opacity-60"
      style={{
        borderRadius: radius.pill ?? radius.lg,
        background: danger ? colors.error : colors.brandPrimary,
        color: danger ? "#fff" : colors.brandOnPrimary,
      }}
    >
      {children}
    </button>
  );
}

export function SettingsSecondaryButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const { colors, radius } = useThemeTokens();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full px-4 py-2.5 text-sm font-medium disabled:opacity-60"
      style={{
        borderRadius: radius.pill ?? radius.lg,
        border: `1px solid ${colors.border}`,
        background: "transparent",
        color: colors.textPrimary,
      }}
    >
      {children}
    </button>
  );
}

export function SettingsToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  const { colors } = useThemeTokens();
  return (
    <label className="flex items-start justify-between gap-3">
      <span>
        <span
          className="block text-sm font-medium"
          style={{ color: colors.textPrimary }}
        >
          {label}
        </span>
        {description ? (
          <span
            className="mt-0.5 block text-xs"
            style={{ color: colors.textSubtle }}
          >
            {description}
          </span>
        ) : null}
      </span>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
