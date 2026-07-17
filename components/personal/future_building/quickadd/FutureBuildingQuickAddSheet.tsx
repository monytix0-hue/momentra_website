"use client";

import { useEffect, useMemo, useState } from "react";
import { usePersonalDomainTokens } from "@/lib/personal/personalDomainPalette";
import type { ContextThemeTokens } from "@/lib/contextTokens";
import { personalTypography } from "@/components/personal/empty/shared/emptyStyles";
import { SkeletonQuickAddSheet } from "@/components/personal/shared/skeleton/SkeletonBlocks";
import { useQuickAddOptions } from "@/hooks/useQuickAddOptions";
import {
  createPersonalQuickAdd,
  type PersonalFutureBuildingQuickAddFieldGroup,
  type PersonalQuickAddOptionsResponse,
  type PersonalQuickAddTab,
} from "@/lib/api/client";

const FB_EVENT_TYPES = new Set([
  "CONTRIBUTION",
  "MILESTONE",
  "OPPORTUNITY",
  "PIVOT",
  "PROGRESS",
  "LEARNING",
]);

const FIELD_TO_PAYLOAD_KEY: Record<string, string> = {
  notes: "notes",
  amount: "amount",
  category_name: "category_name",
  impact_level: "impact_level",
  learning_type: "learning_type",
  application: "application",
  milestone_nature: "milestone_nature",
  celebration_level: "celebration_level",
  opportunity_source: "opportunity_source",
  opportunity_status: "opportunity_status",
  pivot_change: "pivot_change",
  pivot_reason: "pivot_reason",
  confidence_level: "confidence_level",
  progress_type: "progress_type",
  time_invested: "time_invested",
  effort_level: "effort_level",
};

function requiredKeysForTab(tab: string): Set<string> {
  switch (tab) {
    case "CONTRIBUTION":
      return new Set(["amount"]);
    case "LEARNING":
      return new Set(["learning_type"]);
    case "MILESTONE":
      return new Set(["milestone_nature"]);
    case "OPPORTUNITY":
      return new Set(["opportunity_source"]);
    case "PIVOT":
      return new Set(["pivot_change", "notes"]);
    case "PROGRESS":
      return new Set(["progress_type"]);
    default:
      return new Set();
  }
}

function canSubmit(
  tab: string,
  groups: PersonalFutureBuildingQuickAddFieldGroup[],
  values: Record<string, string>,
): boolean {
  if (groups.length === 0) {
    return Boolean(values.notes?.trim());
  }
  return [...requiredKeysForTab(tab)].every((key) => Boolean(values[key]?.trim()));
}

function buildFutureBuildingPayload(values: Record<string, string>) {
  const payload: Record<string, string> = {};
  for (const [fieldKey, payloadKey] of Object.entries(FIELD_TO_PAYLOAD_KEY)) {
    const trimmed = values[fieldKey]?.trim();
    if (trimmed) payload[payloadKey] = trimmed;
  }
  if (values.impact_level?.trim()) {
    payload.impact_level = values.impact_level.trim();
  }
  return payload;
}

type FutureBuildingQuickAddSheetProps = {
  initialEventType?: string | null;
  defaultMomentId?: string | null;
  open?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function FutureBuildingQuickAddSheet({
  initialEventType,
  defaultMomentId,
  open = true,
  onClose,
  onSuccess,
}: FutureBuildingQuickAddSheetProps) {
  const tokens = usePersonalDomainTokens();
  const { colors } = tokens;

  const { options, loading, error } = useQuickAddOptions({ momentId: defaultMomentId, enabled: open });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("CONTRIBUTION");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!options) return;
    const initial = initialEventType?.toUpperCase();
    if (initial && FB_EVENT_TYPES.has(initial)) {
      setSelectedTab(initial);
    } else if (options.tabs?.[0]?.event_type) {
      setSelectedTab(options.tabs[0].event_type);
    }
  }, [options, initialEventType]);

  useEffect(() => {
    setFieldValues({});
  }, [selectedTab]);

  const moment = useMemo(() => {
    if (!options?.moments.length) return null;
    if (defaultMomentId) {
      return options.moments.find((m) => m.moment_id === defaultMomentId) ?? options.moments[0];
    }
    return (
      options.moments.find((m) => m.moment_type_code === "FUTURE_BUILDING") ?? options.moments[0]
    );
  }, [defaultMomentId, options]);

  const tabs = options?.tabs ?? [];
  const activeTab: PersonalQuickAddTab | undefined = tabs.find((t) => t.event_type === selectedTab);
  const tabFields =
    options?.metadata?.future_building_tabs?.find((t) => t.event_type === selectedTab) ??
    { event_type: selectedTab, field_groups: [] };

  const submitEnabled = moment && canSubmit(selectedTab, tabFields.field_groups, fieldValues);

  async function handleSubmit() {
    if (!moment || !submitEnabled) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createPersonalQuickAdd({
        moment_id: moment.moment_id,
        event_type: selectedTab,
        event_title: activeTab?.label ?? selectedTab.replace(/_/g, " "),
        future_building: buildFutureBuildingPayload(fieldValues),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Quick Add failed.");
      setSubmitting(false);
    }
  }

  function setField(key: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl border sm:rounded-2xl"
        style={{ borderColor: colors.border, background: colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="shrink-0 border-b px-5 pb-3 pt-5"
          style={{ borderColor: colors.border }}
        >
          <h2 style={{ ...personalTypography.heroTitle, color: colors.brandPrimary }}>
            Build Momentum
          </h2>
          <div className="mt-3 flex gap-4 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const active = tab.event_type === selectedTab;
              return (
                <button
                  key={tab.event_type}
                  type="button"
                  onClick={() => setSelectedTab(tab.event_type)}
                  className="shrink-0 border-b-2 pb-2 text-xs font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                  style={{
                    color: active ? colors.brandPrimary : colors.textSecondary,
                    borderColor: active ? colors.brandPrimary : "transparent",
                    opacity: active ? 1 : 0.5,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
          {loading && !options ? (
            <SkeletonQuickAddSheet />
          ) : error && !options ? (
            <p style={{ color: colors.error }}>{error}</p>
          ) : !moment ? (
            <p style={{ ...personalTypography.bodyMd, color: colors.textSecondary }}>
              Activate a Future Building moment to use Quick Add.
            </p>
          ) : (
            <div className="space-y-5">
              {activeTab ? (
                <div className="space-y-2">
                  <h3 style={{ ...personalTypography.sectionHeader, color: colors.textPrimary }}>
                    {activeTab.hero_title ?? activeTab.label}
                  </h3>
                  <p style={{ ...personalTypography.bodyMd, color: colors.textSecondary }}>
                    {activeTab.hero_subtitle ?? activeTab.description}
                  </p>
                </div>
              ) : null}

              {tabFields.field_groups.map((group) => (
                <FieldGroup
                  key={group.group_key}
                  group={group}
                  value={fieldValues[group.group_key] ?? ""}
                  onChange={(value) => setField(group.group_key, value)}
                  colors={colors}
                />
              ))}

              {activeTab?.teaches_items?.length ? (
                <section
                  className="rounded-2xl border p-4"
                  style={{ borderColor: "rgba(108, 78, 242, 0.2)", background: "rgba(108, 78, 242, 0.08)" }}
                >
                  <p
                    className="mb-2 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: colors.brandPrimary }}
                  >
                    This teaches
                  </p>
                  <ul className="space-y-1">
                    {activeTab.teaches_items.map((item) => (
                      <li key={item} style={{ ...personalTypography.bodyMd, color: colors.textSecondary }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {activeTab?.insight_body ? (
                <section
                  className="rounded-2xl border p-4"
                  style={{ borderColor: colors.border, background: "rgba(255,255,255,0.03)" }}
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.brandPrimary }}>
                    {activeTab.insight_title ?? "Runtime Insight"}
                  </p>
                  <p style={{ ...personalTypography.bodyMd, color: colors.textPrimary }}>
                    {activeTab.insight_body}
                  </p>
                </section>
              ) : null}

              {submitError ? (
                <p className="text-sm" style={{ color: colors.error }}>
                  {submitError}
                </p>
              ) : null}

              <button
                type="button"
                disabled={!submitEnabled || submitting}
                onClick={() => void handleSubmit()}
                className="w-full rounded-2xl py-3 font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                style={{
                  background: colors.brandPrimaryContainer ?? colors.brandPrimary,
                  color: colors.brandOnPrimary,
                  opacity: !submitEnabled || submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "Saving…" : activeTab?.cta_label ?? "Save Entry"}
              </button>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t px-5 py-4" style={{ borderColor: colors.border }}>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border py-3 transition-transform duration-200 hover:scale-[1.02] active:scale-95"
            style={{ borderColor: colors.border, color: colors.textSecondary }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({
  group,
  value,
  onChange,
  colors,
}: {
  group: PersonalFutureBuildingQuickAddFieldGroup;
  value: string;
  onChange: (value: string) => void;
  colors: ContextThemeTokens["colors"];
}) {
  const labelStyle = { ...personalTypography.sectionHeader, color: colors.textSecondary };

      if (group.field_type === "amount") {
        return (
          <div className="space-y-2">
            <label style={labelStyle}>{group.label}</label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold"
                style={{ color: colors.brandPrimary }}
              >
                ₹
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-2xl border-none py-6 pl-12 pr-4 text-3xl font-bold input-focus-glow"
                style={{ background: colors.surfaceContainerLowest ?? "#0e0d16", color: colors.textPrimary }}
              />
            </div>
          </div>
        );
      }

      if (group.field_type === "textarea") {
        return (
          <div className="space-y-2">
            <label style={labelStyle}>{group.label}</label>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={3}
              className="w-full rounded-xl border p-3 input-focus-glow"
              style={{
                borderColor: colors.border,
                background: colors.surfaceContainerLowest ?? "#0e0d16",
                color: colors.textPrimary,
              }}
            />
          </div>
        );
      }

  if (group.field_type === "slider" || group.field_type === "single_select" || group.field_type === "chip_grid") {
    return (
      <div className="space-y-2">
        <label style={labelStyle}>{group.label}</label>
        <div className="flex flex-wrap gap-2">
          {(group.options ?? []).map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className="rounded-lg px-3 py-2 text-xs font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                style={{
                  border: `1px solid ${selected ? colors.brandPrimary : colors.border}`,
                  background: selected ? "rgba(108, 78, 242, 0.15)" : "transparent",
                  color: selected ? colors.brandPrimary : colors.textSecondary,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label style={labelStyle}>{group.label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-3 py-3"
        style={{
          borderColor: colors.border,
          background: colors.surfaceContainerLowest ?? "#0e0d16",
          color: colors.textPrimary,
        }}
      />
    </div>
  );
}

export function isFutureBuildingQuickAddEventType(eventType?: string | null): boolean {
  return Boolean(eventType && FB_EVENT_TYPES.has(eventType.toUpperCase()));
}

export function shouldUseFutureBuildingQuickAdd(
  options: PersonalQuickAddOptionsResponse,
  initialEventType?: string | null,
): boolean {
  if (isFutureBuildingQuickAddEventType(initialEventType)) return true;
  if (options.metadata?.future_building_tabs?.length) return true;
  if (options.tabs?.[0]?.event_type === "CONTRIBUTION") {
    const onlyFb =
      options.moments.length > 0 &&
      options.moments.every((m) => m.moment_type_code === "FUTURE_BUILDING");
    if (onlyFb) return true;
  }
  return false;
}
