"use client";

import type { ReactNode } from "react";
import { CreditCard, Heart, Shield } from "lucide-react";
import { personalTypography } from "@/components/personal/empty/shared/emptyStyles";
import type { PersonalQuickAddFieldOption } from "@/lib/api/client";
import type { ContextThemeTokens } from "@/lib/contextTokens";

export function MasterExpenseFieldCard({
  label,
  children,
  className,
  surfaceStyle,
  labelColor,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  surfaceStyle: React.CSSProperties;
  labelColor: string;
}) {
  return (
    <label className={className ?? "rounded-xl p-3"} style={surfaceStyle}>
      <span
        className="mb-1 block text-[10px] font-bold uppercase tracking-wide"
        style={{ ...personalTypography.labelSm, color: labelColor }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

export function SegmentedScaleControl({
  options,
  value,
  onChange,
  colors,
}: {
  options: PersonalQuickAddFieldOption[];
  value: string;
  onChange: (value: string) => void;
  colors: ContextThemeTokens["colors"];
}) {
  return (
    <div
      className="grid gap-1 rounded-lg p-1"
      style={{ gridTemplateColumns: `repeat(${Math.max(options.length, 1)}, minmax(0, 1fr))`, background: "rgba(0,0,0,0.35)" }}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="pressable rounded-md py-1.5 text-xs font-medium transition-all active:scale-95"
            style={{
              background: selected ? colors.brandPrimary : "transparent",
              color: selected ? colors.onPrimary : colors.textSecondary,
              boxShadow: selected ? `0 2px 8px ${colors.brandPrimary}40` : undefined,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const IMPACT_ICONS = {
  "Life Operations": CreditCard,
  Lifestyle: Shield,
  Relationships: Heart,
} as const;

export function MasterExpenseImpactTile({
  title,
  subtitle,
  active,
  surfaceStyle,
  colors,
}: {
  title: keyof typeof IMPACT_ICONS;
  subtitle: string;
  active: boolean;
  surfaceStyle: React.CSSProperties;
  colors: ContextThemeTokens["colors"];
}) {
  const Icon = IMPACT_ICONS[title];
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{ ...surfaceStyle, opacity: active ? 1 : 0.55 }}
    >
      <div
        className="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg"
        style={{ background: `${colors.brandPrimary}18` }}
      >
        <Icon size={18} style={{ color: colors.brandPrimary }} />
      </div>
      <h4 className="text-[11px] font-bold">{title}</h4>
      <p className="mt-0.5 text-[9px] leading-tight" style={{ color: colors.textSecondary }}>
        {subtitle}
      </p>
    </div>
  );
}
