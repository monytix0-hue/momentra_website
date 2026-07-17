"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { personalGlassCardStyle, personalTypography } from "@/components/personal/empty/shared/emptyStyles";
import type { PulseDashboardRecentItem } from "@/lib/api/personal";
import { lifeOpsPulseCopy } from "@/lib/personal/life_operations/pulse/lifeOpsPulseCopy";
import { resolveActivityIcon } from "@/lib/personal/life_operations/pulse/pulseIcons";
import { Pencil } from "lucide-react";

type RecentActivityListProps = {
  items: PulseDashboardRecentItem[];
  emptyMessage?: string | null;
  onViewAll?: () => void;
  onEditActivity?: (id: string, eventType: string) => void;
};

function impactColor(direction: string | null | undefined, colors: ReturnType<typeof useThemeTokens>["colors"]) {
  const d = (direction ?? "").toLowerCase();
  if (d === "negative" || d === "down") return colors.error;
  if (d === "neutral") return colors.brandTertiary;
  return colors.brandPrimary;
}

export function RecentActivityList({ items, emptyMessage, onViewAll, onEditActivity }: RecentActivityListProps) {
  const tokens = useThemeTokens();
  const { colors } = tokens;
  const visible = items.slice(0, 5);

  return (
    <section style={{ ...personalGlassCardStyle(tokens), borderRadius: 16, padding: 12 }}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 style={{ ...personalTypography.sectionHeader, color: colors.textPrimary }}>
            {lifeOpsPulseCopy.recentActivityListTitle}
          </h3>
          <p style={{ ...personalTypography.labelSm, fontSize: 11, color: colors.textSecondary, opacity: 0.6, marginTop: 1 }}>
            {lifeOpsPulseCopy.recentActivityListSubtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          style={{
            ...personalTypography.labelSm,
            fontWeight: 700,
            fontSize: 10,
            textTransform: "uppercase",
            color: colors.brandPrimary,
            background: "none",
            border: "none",
          }}
        >
          {lifeOpsPulseCopy.viewAll}
        </button>
      </div>

      {visible.length > 0 ? (
        <div className="space-y-0">
          {visible.map((item, index) => {
            const Icon = resolveActivityIcon(item.activity_type, item.icon);
            const accent = impactColor(item.impact_direction, colors);
            const isLast = index === visible.length - 1;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 ${isLast ? "" : "border-b pb-3"} ${index > 0 ? "pt-3" : ""}`}
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onEditActivity?.(item.id, item.edit_event_type ?? item.activity_type.toUpperCase());
                }}
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${colors.brandPrimary}1a` }}
                >
                  <Icon size={18} color={colors.brandPrimary} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="truncate"
                      style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}
                    >
                      {item.subtitle}
                    </p>
                    <span
                      className="shrink-0 uppercase"
                      style={{ fontSize: 10, fontWeight: 500, color: colors.textSecondary, opacity: 0.4 }}
                    >
                      {item.relative_time}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between">
                    {item.impact_label ? (
                      <p style={{ fontSize: 11, fontWeight: 500, color: accent }}>{item.impact_label}</p>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        onEditActivity?.(item.id, item.edit_event_type ?? item.activity_type.toUpperCase())
                      }
                      className="border-0 bg-transparent p-0"
                      aria-label="Edit activity"
                    >
                      <Pencil size={16} color={colors.textSecondary} style={{ opacity: 0.4 }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ ...personalTypography.bodyMd, color: colors.textSecondary, opacity: 0.7 }}>
          {emptyMessage ?? lifeOpsPulseCopy.recentActivityEmptyFallback}
        </p>
      )}
    </section>
  );
}
