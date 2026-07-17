"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { personalGlassCardStyle, personalTypography } from "@/components/personal/empty/shared/emptyStyles";
import type { PulseDashboardRecentItem } from "@/lib/api/personal";
import { lifestylePulseCopy } from "@/lib/personal/lifestyle/pulse/lifestylePulseCopy";
import { resolveLifestyleActivityIcon } from "@/lib/personal/lifestyle/pulse/lifestylePulseIcons";
import { Pencil } from "lucide-react";

type Props = {
  items: PulseDashboardRecentItem[];
  emptyMessage?: string | null;
  onViewAll?: () => void;
  onEditActivity?: (id: string, eventType: string) => void;
};

export function LifestyleActivityFeedGrid({ items, emptyMessage, onViewAll, onEditActivity }: Props) {
  const tokens = useThemeTokens();
  const { colors } = tokens;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 style={{ ...personalTypography.sectionHeader, color: colors.textPrimary }}>
          {lifestylePulseCopy.recentActivityFeedTitle}
        </h3>
        <button type="button" onClick={onViewAll} style={{ ...personalTypography.labelSm, fontWeight: 700, color: colors.brandPrimary, background: "none", border: "none" }}>
          {lifestylePulseCopy.viewAll}
        </button>
      </div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.slice(0, 4).map((item) => {
            const Icon = resolveLifestyleActivityIcon(item.activity_type, item.icon);
            return (
              <div
                key={item.id}
                style={{ ...personalGlassCardStyle(tokens), borderRadius: 12, padding: 10 }}
                className="group cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
              >
                <div className="mb-1 flex items-center gap-2">
                  <Icon size={14} color={colors.brandPrimary} />
                  <span className="text-[10px] font-bold uppercase opacity-60">{item.relative_time}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-xs font-semibold">{item.subtitle}</p>
                  {onEditActivity ? (
                    <button
                      type="button"
                      onClick={() => onEditActivity(item.id, item.edit_event_type ?? item.activity_type.toUpperCase())}
                      className="shrink-0 border-0 bg-transparent p-0 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Edit activity"
                    >
                      <Pencil size={14} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                    </button>
                  ) : null}
                </div>
                {item.impact_label ? (
                  <p className="mt-1 text-[10px]" style={{ color: colors.tertiary }}>
                    Impact: {item.impact_label}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ ...personalTypography.bodyMd, color: colors.textSecondary, opacity: 0.7 }}>
          {emptyMessage ?? lifestylePulseCopy.recentActivityEmptyFallback}
        </p>
      )}
    </section>
  );
}
