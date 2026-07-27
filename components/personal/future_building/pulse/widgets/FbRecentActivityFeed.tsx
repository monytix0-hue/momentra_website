"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { personalGlassCardStyle, personalTypography } from "@/components/personal/empty/shared/emptyStyles";
import type { PersonalLiveRecentActivityItem } from "@/lib/api/personal";
import { fbPulseCopy } from "@/lib/personal/future_building/pulse/fbPulseCopy";
import { fbActivityImpactTag } from "@/lib/personal/future_building/pulse/fbPulseUtils";
import { Flag, GraduationCap, Pencil, Rocket, Star, Footprints } from "lucide-react";

const ICONS: Record<string, typeof GraduationCap> = {
  LEARNING: GraduationCap,
  PROGRESS: Rocket,
  MILESTONE: Flag,
  OPPORTUNITY: Star,
};

type Props = {
  items: PersonalLiveRecentActivityItem[];
  onViewAll?: () => void;
  onEditActivity?: (id: string, eventType: string) => void;
};

export function FbRecentActivityFeed({ items, onViewAll, onEditActivity }: Props) {
  const tokens = useThemeTokens();
  const { colors } = tokens;

  return (
    <section style={{ ...personalGlassCardStyle(tokens), borderRadius: 20, padding: 16 }}>
      <div className="mb-4 flex items-end justify-between">
        <h3 style={{ ...personalTypography.sectionHeader, color: colors.textPrimary }}>{fbPulseCopy.recentActivityFeedTitle}</h3>
        <button type="button" onClick={onViewAll} style={{ fontSize: 10, fontWeight: 700, color: colors.brandPrimary, background: "none", border: "none", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {fbPulseCopy.viewAll}
        </button>
      </div>
      {items.length === 0 ? (
        <p style={{ ...personalTypography.bodyMd, opacity: 0.7 }}>{fbPulseCopy.recentActivityEmptyFallback}</p>
      ) : (
        <div className="space-y-4">
          {items.slice(0, 3).map((item) => {
            const Icon = ICONS[item.event_type.toUpperCase()] ?? Footprints;
            const bg =
              item.event_type.toUpperCase() === "PROGRESS"
                ? `${colors.brandSecondary}33`
                : item.event_type.toUpperCase() === "OPPORTUNITY"
                  ? `${colors.primaryContainer}4d`
                  : `${colors.brandPrimary}33`;
            const iconColor =
              item.event_type.toUpperCase() === "PROGRESS" ? colors.brandSecondary : colors.brandPrimary;
            return (
              <div key={item.id} className="group flex cursor-pointer items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95">
                <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: bg }}>
                  <Icon size={16} color={iconColor} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <p style={{ fontSize: 12, fontWeight: 700, color: colors.textPrimary }}>{item.relative_time}</p>
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: 10, fontWeight: 700, color: colors.brandTertiary }}>
                        {fbActivityImpactTag(item.event_type, item.amount_label)}
                      </p>
                      {onEditActivity ? (
                        <button
                          type="button"
                          onClick={() => onEditActivity(item.id, item.edit_event_type ?? item.event_type.toUpperCase())}
                          className="border-0 bg-transparent p-0 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label="Edit activity"
                        >
                          <Pencil size={14} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <p style={{ fontSize: 11, opacity: 0.6 }}>{item.detail_line}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
