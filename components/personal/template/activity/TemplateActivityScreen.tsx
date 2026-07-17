"use client";

import { useMemo, useState } from "react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { PersonalAtmosphericOrbs } from "@/components/personal/empty/shared/PersonalAtmosphericOrbs";
import { personalGlassCardStyle, personalTypography } from "@/components/personal/empty/shared/emptyStyles";
import { resolveActivityIcon } from "@/lib/personal/life_operations/pulse/pulseIcons";
import { lifeOpsActivityCopy } from "@/lib/personal/life_operations/activity/lifeOpsActivityCopy";
import type { PersonalMomentTypeCode } from "@/lib/personal/personalMomentSession";
import { useTemplateActivity } from "@/hooks/useTemplateActivity";
import type { TemplateActivityItem } from "@/lib/personal/template/activity/types";
import { ArrowLeft, Pencil, Search } from "lucide-react";

type TemplateActivityScreenProps = {
  momentTypeCode: PersonalMomentTypeCode;
  momentId: string;
  onBack: () => void;
  onEditActivity: (id: string, eventType: string) => void;
};

function groupLabel(
  iso: string,
  labels: { groupToday: string; groupYesterday: string; groupThisWeek: string; groupEarlier: string },
): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  if (d >= startOfToday) return labels.groupToday;
  if (d >= startOfYesterday) return labels.groupYesterday;
  if (d >= startOfWeek) return labels.groupThisWeek;
  return labels.groupEarlier;
}

export function TemplateActivityScreen({
  momentTypeCode,
  momentId,
  onBack,
  onEditActivity,
}: TemplateActivityScreenProps) {
  const tokens = useThemeTokens();
  const { colors } = tokens;
  const { adapter, loading, error, items, summary, reload } = useTemplateActivity(
    momentTypeCode,
    momentId,
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(adapter.filters[0]?.id ?? "all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return items.filter((item) => {
      if (!adapter.filterMatches(filter, item.activity_type)) return false;
      if (filter === "thisMonth" && new Date(item.occurred_at) < monthStart) return false;
      if (!q) return true;
      const hay = `${item.title} ${item.subtitle} ${item.amount_minor}`.toLowerCase();
      return hay.includes(q);
    });
  }, [adapter, filter, items, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, TemplateActivityItem[]>();
    for (const item of filtered) {
      const key = groupLabel(item.occurred_at, adapter);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    const order = [adapter.groupToday, adapter.groupYesterday, adapter.groupThisWeek, adapter.groupEarlier];
    return order.filter((k) => map.has(k)).map((k) => ({ label: k, items: map.get(k)! }));
  }, [adapter, filtered]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: colors.background, color: colors.textPrimary }}
    >
      <PersonalAtmosphericOrbs />
      <header
        className="relative z-10 flex items-center gap-3 border-b px-5 py-4"
        style={{ borderColor: "rgba(255,255,255,0.1)", background: `${colors.background}cc` }}
      >
        <button type="button" onClick={onBack} className="border-0 bg-transparent p-0" aria-label="Back to Pulse">
          <ArrowLeft size={22} color={colors.brandPrimary} />
        </button>
        <div>
          <h1 style={{ ...personalTypography.screenTitle, color: colors.textPrimary }}>
            {adapter.screenTitle}
          </h1>
          <p style={{ ...personalTypography.labelSm, opacity: 0.6 }}>{adapter.screenSubtitle}</p>
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <p style={{ opacity: 0.7 }}>Loading activity…</p>
        ) : error ? (
          <div className="space-y-3">
            <p style={{ color: colors.error }}>{error}</p>
            <button type="button" onClick={() => void reload()} className="text-sm underline">
              Retry
            </button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                color={colors.textSecondary}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={adapter.searchPlaceholder}
                className="w-full rounded-2xl border-0 py-4 pl-12 pr-4"
                style={{
                  background: colors.surfaceContainerLowest,
                  color: colors.textPrimary,
                  ...personalTypography.bodyMd,
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                [lifeOpsActivityCopy.totalLogs, String(summary.total_logs), colors.brandPrimary],
                [lifeOpsActivityCopy.thisMonth, String(summary.this_month), colors.brandTertiary],
                [lifeOpsActivityCopy.totalAmount, adapter.formatAmount(summary.total_amount_minor), colors.brandSecondary],
              ].map(([label, value, accent]) => (
                <div
                  key={label}
                  className="rounded-2xl p-4 text-center"
                  style={{ ...personalGlassCardStyle(tokens) }}
                >
                  <p style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, textTransform: "uppercase" }}>{label}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: accent }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {adapter.filters.map((chip) => {
                const active = filter === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setFilter(chip.id)}
                    className="shrink-0 rounded-full px-5 py-2 text-xs font-bold"
                    style={{
                      background: active ? colors.brandPrimary : colors.surfaceContainerHigh,
                      color: active ? colors.brandOnPrimary : colors.textSecondary,
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {grouped.length === 0 ? (
              <p style={{ ...personalTypography.bodyMd, opacity: 0.7 }}>{adapter.emptyMessage}</p>
            ) : (
              grouped.map((group) => (
                <section key={group.label}>
                  <h3
                    className="mb-4 flex items-center gap-3 uppercase"
                    style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", opacity: 0.4 }}
                  >
                    <span>{group.label}</span>
                    <span className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
                  </h3>
                  <div className="space-y-3">
                    {group.items.map((item) => {
                      const Icon = resolveActivityIcon(item.activity_type, item.icon);
                      const amountLabel =
                        item.amount_minor > 0 ? adapter.formatAmount(item.amount_minor) : null;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => item.can_edit && onEditActivity(item.id, item.edit_event_type)}
                          className="flex w-full items-center justify-between rounded-2xl p-4 text-left"
                          style={{ ...personalGlassCardStyle(tokens), border: "none" }}
                        >
                          <div className="flex min-w-0 items-center gap-4">
                            <div
                              className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                              style={{ background: `${colors.brandPrimary}1a` }}
                            >
                              <Icon size={18} color={colors.brandPrimary} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold" style={{ fontSize: 14 }}>
                                {item.subtitle || item.title}
                              </p>
                              <p style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                                {item.title}
                                {amountLabel ? ` · ${amountLabel}` : ""}
                                {item.impact_label ? ` · ${item.impact_label}` : ""}
                              </p>
                              <p style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>
                                {item.relative_time ?? new Date(item.occurred_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {item.can_edit ? (
                            <Pencil size={16} color={colors.textSecondary} style={{ opacity: 0.4 }} />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
