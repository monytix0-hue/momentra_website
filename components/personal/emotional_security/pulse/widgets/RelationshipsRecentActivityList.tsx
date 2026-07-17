"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { personalGlassCardStyle, personalTypography } from "@/components/personal/empty/shared/emptyStyles";
import type { PersonalLiveRecentActivityItem } from "@/lib/api/personal";
import { relationshipsPulseCopy } from "@/lib/personal/emotional_security/pulse/relationshipsPulseCopy";
import { resolveActivityIcon } from "@/lib/personal/life_operations/pulse/pulseIcons";
import { Pencil } from "lucide-react";

type RelationshipsRecentActivityListProps = {
  items: PersonalLiveRecentActivityItem[];
  emptyMessage?: string | null;
  onViewAll?: () => void;
  onEditActivity?: (id: string, eventType: string) => void;
};

export function RelationshipsRecentActivityList({ items, emptyMessage, onViewAll, onEditActivity }: RelationshipsRecentActivityListProps) {
  const tokens = useThemeTokens();
  const { colors } = tokens;
  const visible = items.slice(0, 3);

  return (
    <section style={{ ...personalGlassCardStyle(tokens), borderRadius: 16, padding: 12 }}>
      <div className="mb-3 flex items-center justify-between">
        <h3 style={{ ...personalTypography.sectionHeader, color: colors.textPrimary }}>
          {relationshipsPulseCopy.recentActivityTitle}
        </h3>
        <button type="button" onClick={onViewAll} className="text-[10px] font-bold uppercase" style={{ color: colors.brandPrimary, background: "none", border: "none" }}>
          {relationshipsPulseCopy.viewAll}
        </button>
      </div>
      {visible.length === 0 ? (
        <p style={{ ...personalTypography.bodyMd, opacity: 0.7 }}>{emptyMessage ?? relationshipsPulseCopy.recentActivityEmpty}</p>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => {
            const Icon = resolveActivityIcon(item.event_type, null);
            return (
              <div key={item.id} className="group flex cursor-pointer items-center gap-3 border-b pb-3 last:border-0 transition-transform hover:scale-[1.02] active:scale-95" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex size-9 items-center justify-center rounded-lg" style={{ background: `${colors.brandPrimary}1a` }}>
                  <Icon size={16} color={colors.brandPrimary} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <p className="text-sm font-bold" style={{ color: colors.textPrimary }}>{item.detail_line}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] opacity-50">{item.relative_time}</span>
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
                  <p className="mt-1 text-xs font-medium" style={{ color: colors.brandTertiary }}>
                    {item.category_label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
