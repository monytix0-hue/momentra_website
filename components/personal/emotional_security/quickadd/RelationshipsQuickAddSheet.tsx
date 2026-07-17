"use client";

import { useEffect, useMemo, useState } from "react";
import { usePersonalDomainTokens } from "@/lib/personal/personalDomainPalette";
import type { ContextThemeTokens } from "@/lib/contextTokens";
import {
  personalGlassCardStyle,
  personalTypography,
} from "@/components/personal/empty/shared/emptyStyles";
import { SkeletonQuickAddSheet } from "@/components/personal/shared/skeleton/SkeletonBlocks";
import { useQuickAddOptions } from "@/hooks/useQuickAddOptions";
import {
  createPersonalQuickAdd,
  type PersonalEmotionalSecurityQuickAddFieldGroup,
  type PersonalQuickAddOptionsResponse,
  type PersonalQuickAddTab,
} from "@/lib/api/client";

const RS_EVENT_TYPES = new Set([
  "CONNECTION",
  "SUPPORT",
  "SHARED_EXPERIENCE",
  "RELATIONSHIP_INVESTMENT",
  "RELATIONSHIP_ADJUST",
]);

const FIELD_TO_PAYLOAD_KEY: Record<string, string> = {
  notes: "notes",
  amount: "amount",
  spend_category: "spend_category",
  connection_type: "connection_type",
  relationship_type: "relationship_type",
  connection_quality: "connection_quality",
  emotional_tone: "emotional_tone",
  time_invested: "time_invested",
  support_type: "support_type",
  support_direction: "support_direction",
  support_impact: "support_impact",
  experience_type: "experience_type",
  value_received: "value_received",
  investment_type: "investment_type",
  investment_purpose: "investment_purpose",
  perceived_value: "perceived_value",
  adjustment_area: "adjustment_area",
  relationship_focus: "relationship_focus",
  priority_level: "priority_level",
  confidence_level: "confidence_level",
};

const VALUE_CARD_SUBTITLES: Record<string, string> = {
  WORTH_IT: "Expected return",
  LIFE_ENRICHING: "Profound impact",
};

function requiredKeysForTab(tab: string): Set<string> {
  switch (tab) {
    case "CONNECTION":
      return new Set(["connection_type"]);
    case "SUPPORT":
      return new Set(["support_type", "support_direction"]);
    case "SHARED_EXPERIENCE":
      return new Set(["experience_type", "notes"]);
    case "RELATIONSHIP_INVESTMENT":
      return new Set(["investment_type"]);
    case "RELATIONSHIP_ADJUST":
      return new Set(["adjustment_area", "notes"]);
    default:
      return new Set();
  }
}

function canSubmit(
  tab: string,
  groups: PersonalEmotionalSecurityQuickAddFieldGroup[],
  values: Record<string, string>,
): boolean {
  if (groups.length === 0) {
    return Boolean(values.notes?.trim());
  }
  return [...requiredKeysForTab(tab)].every((key) => Boolean(values[key]?.trim()));
}

function buildEmotionalSecurityPayload(values: Record<string, string>) {
  const payload: Record<string, string> = {};
  for (const [fieldKey, payloadKey] of Object.entries(FIELD_TO_PAYLOAD_KEY)) {
    const trimmed = values[fieldKey]?.trim();
    if (trimmed) payload[payloadKey] = trimmed;
  }
  return payload;
}

type RelationshipsQuickAddSheetProps = {
  initialEventType?: string | null;
  defaultMomentId?: string | null;
  open?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function RelationshipsQuickAddSheet({
  initialEventType,
  defaultMomentId,
  open = true,
  onClose,
  onSuccess,
}: RelationshipsQuickAddSheetProps) {
  const tokens = usePersonalDomainTokens();
  const { colors } = tokens;

  const { options, loading, error } = useQuickAddOptions({ momentId: defaultMomentId, enabled: open });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("SHARED_EXPERIENCE");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!options) return;
    const initial = initialEventType?.toUpperCase();
    if (initial && RS_EVENT_TYPES.has(initial)) {
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
      options.moments.find((m) => m.moment_type_code === "RELATIONSHIPS" || m.moment_type_code === "EMOTIONAL_SECURITY") ?? options.moments[0]
    );
  }, [defaultMomentId, options]);

  const tabs = options?.tabs ?? [];
  const activeTab: PersonalQuickAddTab | undefined = tabs.find((t) => t.event_type === selectedTab);
  const tabFields =
    options?.metadata?.emotional_security_tabs?.find((t) => t.event_type === selectedTab) ??
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
        emotional_security: buildEmotionalSecurityPayload(fieldValues),
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

  const expenseCostGroups = tabFields.field_groups.filter((g) =>
    ["amount", "spend_category"].includes(g.group_key),
  );
  const expenseOtherGroups = tabFields.field_groups.filter(
    (g) => !["amount", "spend_category"].includes(g.group_key),
  );

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
        <div className="shrink-0 border-b px-5 pb-3 pt-5" style={{ borderColor: colors.border }}>
          <h2 style={{ ...personalTypography.heroTitle, color: colors.brandPrimary }}>
            Capture Relationships
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
              Activate a Relationships moment to use Quick Add.
            </p>
          ) : (
            <div className="space-y-5">
              {selectedTab === "CONNECTION" && activeTab?.insight_body ? (
                <section
                  style={{ ...personalGlassCardStyle(tokens), borderRadius: 16, padding: 16 }}
                >
                  <div className="flex gap-3">
                    <span aria-hidden>⚡</span>
                    <div>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>
                        {activeTab.insight_title ?? "Runtime Insight"}
                      </p>
                      <p style={{ ...personalTypography.bodyMd, color: colors.textSecondary }}>
                        {activeTab.insight_body}
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              {activeTab ? (
                <div className="space-y-2">
                  <h3 style={{ ...personalTypography.sectionHeader, color: colors.brandPrimary }}>
                    {activeTab.hero_title ?? activeTab.label}
                  </h3>
                  <p style={{ ...personalTypography.bodyMd, color: colors.textSecondary }}>
                    {activeTab.hero_subtitle ?? activeTab.description}
                  </p>
                </div>
              ) : null}

              {selectedTab === "SHARED_EXPERIENCE" ? (
                <>
                  {expenseOtherGroups.map((group) => (
                    <FieldGroup
                      key={group.group_key}
                      group={group}
                      value={fieldValues[group.group_key] ?? ""}
                      onChange={(value) => setField(group.group_key, value)}
                      colors={colors}
                    />
                  ))}
                  {expenseCostGroups.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {expenseCostGroups.map((group) => (
                        <FieldGroup
                          key={group.group_key}
                          group={group}
                          value={fieldValues[group.group_key] ?? ""}
                          onChange={(value) => setField(group.group_key, value)}
                          colors={colors}
                        />
                      ))}
                    </div>
                  ) : null}
                </>
              ) : selectedTab === "CONNECTION" ? (
                tabFields.field_groups.map((group) =>
                  group.field_type === "textarea" ? (
                    <FieldGroup
                      key={group.group_key}
                      group={group}
                      value={fieldValues[group.group_key] ?? ""}
                      onChange={(value) => setField(group.group_key, value)}
                      colors={colors}
                    />
                  ) : (
                    <PanelFieldGroup
                      key={group.group_key}
                      group={group}
                      value={fieldValues[group.group_key] ?? ""}
                      onChange={(value) => setField(group.group_key, value)}
                      colors={colors}
                    />
                  ),
                )
              ) : (
                tabFields.field_groups.map((group) => (
                  <FieldGroup
                    key={group.group_key}
                    group={group}
                    value={fieldValues[group.group_key] ?? ""}
                    onChange={(value) => setField(group.group_key, value)}
                    colors={colors}
                  />
                ))
              )}

              {selectedTab !== "CONNECTION" && activeTab?.teaches_items?.length ? (
                <section
                  style={{ ...personalGlassCardStyle(tokens), borderRadius: 16, padding: 16 }}
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
                        • {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {selectedTab !== "CONNECTION" && activeTab?.insight_body ? (
                <section
                  style={{ ...personalGlassCardStyle(tokens), borderRadius: 16, padding: 16 }}
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.brandPrimary }}>
                    {activeTab.insight_title ?? "Runtime Insight"}
                  </p>
                  <p style={{ ...personalTypography.bodyMd, color: colors.textPrimary }}>
                    {activeTab.insight_body}
                  </p>
                </section>
              ) : null}

              {selectedTab === "CONNECTION" && activeTab?.teaches_items?.length ? (
                <section
                  style={{ ...personalGlassCardStyle(tokens), borderRadius: 16, padding: 16 }}
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
                        • {item}
                      </li>
                    ))}
                  </ul>
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

function PanelFieldGroup({
  group,
  value,
  onChange,
  colors,
}: {
  group: PersonalEmotionalSecurityQuickAddFieldGroup;
  value: string;
  onChange: (value: string) => void;
  colors: ContextThemeTokens["colors"];
}) {
  return (
    <section
      className="rounded-2xl border p-4"
      style={{ borderColor: colors.border, background: "rgba(255,255,255,0.03)" }}
    >
      <p className="mb-3 font-semibold" style={{ color: colors.textPrimary }}>
        {group.label}
      </p>
      <div className="flex flex-wrap gap-2">
        {(group.options ?? []).map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="rounded-full px-3 py-2 text-xs font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-95"
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
    </section>
  );
}

function FieldGroup({
  group,
  value,
  onChange,
  colors,
}: {
  group: PersonalEmotionalSecurityQuickAddFieldGroup;
  value: string;
  onChange: (value: string) => void;
  colors: ContextThemeTokens["colors"];
}) {
  const labelStyle = { ...personalTypography.sectionHeader, color: colors.textSecondary };

  if (group.field_type === "icon_grid") {
    return (
      <div className="space-y-2">
        {group.label ? <label style={labelStyle}>{group.label}</label> : null}
        <div className="grid grid-cols-3 gap-2">
          {(group.options ?? []).map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className="flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                style={{
                  borderColor: selected ? colors.brandPrimary : colors.border,
                  background: selected ? "rgba(108, 78, 242, 0.12)" : "rgba(255,255,255,0.03)",
                  color: selected ? colors.brandPrimary : colors.textSecondary,
                }}
              >
                <span className="text-lg" aria-hidden>
                  {experienceIcon(opt.icon_name)}
                </span>
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (group.field_type === "value_card") {
    return (
      <div className="space-y-2">
        <label style={labelStyle}>{group.label}</label>
        <div className="grid grid-cols-2 gap-2">
          {(group.options ?? []).map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className="rounded-2xl border p-4 text-left transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                style={{
                  borderColor: selected ? colors.brandPrimary : colors.border,
                  background: selected ? "rgba(108, 78, 242, 0.1)" : "rgba(255,255,255,0.03)",
                }}
              >
                <p
                  className="font-semibold"
                  style={{ color: selected ? colors.brandPrimary : colors.textPrimary }}
                >
                  {opt.label}
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  {VALUE_CARD_SUBTITLES[opt.value] ?? ""}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

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

  if (
    group.field_type === "slider" ||
    group.field_type === "single_select" ||
    group.field_type === "panel_select"
  ) {
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

function experienceIcon(iconName?: string | null): string {
  switch (iconName) {
    case "restaurant":
      return "🍽";
    case "flight":
      return "✈";
    case "celebration":
      return "🎉";
    case "theater_comedy":
      return "🎭";
    case "fitness_center":
      return "🏋";
    case "school":
      return "📚";
    default:
      return "•";
  }
}

export function isRelationshipsQuickAddEventType(eventType?: string | null): boolean {
  return Boolean(eventType && RS_EVENT_TYPES.has(eventType.toUpperCase()));
}

export function shouldUseRelationshipsQuickAdd(
  options: PersonalQuickAddOptionsResponse,
  initialEventType?: string | null,
): boolean {
  if (isRelationshipsQuickAddEventType(initialEventType)) return true;
  if (options.metadata?.emotional_security_tabs?.length) return true;
  if (options.tabs?.[0]?.event_type === "SHARED_EXPERIENCE") {
    const onlyRs =
      options.moments.length > 0 &&
      options.moments.every((m) => m.moment_type_code === "RELATIONSHIPS" || m.moment_type_code === "EMOTIONAL_SECURITY");
    if (onlyRs) return true;
  }
  return false;
}
