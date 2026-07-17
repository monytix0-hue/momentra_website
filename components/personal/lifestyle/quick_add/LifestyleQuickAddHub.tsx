"use client";

import { useEffect, useMemo, useState } from "react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { personalTypography } from "@/components/personal/empty/shared/emptyStyles";
import { SkeletonQuickAddSheet } from "@/components/personal/shared/skeleton/SkeletonBlocks";
import { useQuickAddOptions } from "@/hooks/useQuickAddOptions";
import { getQuickAddBundleByContext } from "@/lib/quick_add/registry";
import {
  createPersonalQuickAdd,
  type PersonalFutureBuildingQuickAddFieldGroup,
  type PersonalQuickAddOptionsResponse,
  type PersonalQuickAddTab,
} from "@/lib/api/client";

type LifestyleQuickAddHubProps = {
  initialEventType?: string | null;
  momentId?: string | null;
  open?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type FieldState = Record<string, string>;
type MultiFieldState = Record<string, Set<string>>;

function tabFieldsFor(
  options: PersonalQuickAddOptionsResponse,
  eventType: string,
): PersonalFutureBuildingQuickAddFieldGroup[] {
  return (
    options.metadata?.lifestyle_tabs?.find((t) => t.event_type === eventType)?.field_groups ?? []
  );
}

function canSubmit(
  tab: string,
  values: FieldState,
  multi: MultiFieldState,
): boolean {
  switch (tab) {
    case "LIFESTYLE_EXPENSE":
      return Boolean(values.amount?.trim());
    case "EXPERIENCE":
      return Boolean(values.experience_type);
    case "WELLBEING":
      return Boolean(values.wellbeing_state) && (multi.wellbeing_areas?.size ?? 0) > 0;
    case "DISCOVERY":
      return Boolean(values.discovery_type);
    case "CREATIVE":
      return Boolean(values.creation_type);
    case "LIFESTYLE_ADJUST":
      return Boolean(values.adjustment_area);
    default:
      return Boolean(values.notes?.trim());
  }
}

function buildLifestylePayload(values: FieldState, multi: MultiFieldState) {
  const trim = (key: string) => values[key]?.trim() || undefined;
  const raw = (key: string) => values[key] || undefined;
  const wellbeingAreas = Array.from(multi.wellbeing_areas ?? []).sort();
  return {
    notes: trim("notes"),
    amount: trim("amount"),
    spend_category: raw("spend_category"),
    experience_type: raw("experience_type"),
    experience_quality: raw("experience_quality"),
    energy_impact: raw("energy_impact"),
    people_context: raw("people_context"),
    location_context: raw("location_context"),
    value_received: raw("value_received"),
    wellbeing_area: wellbeingAreas[0],
    wellbeing_areas: wellbeingAreas,
    wellbeing_state: raw("wellbeing_state"),
    contributors: Array.from(multi.contributors ?? []).sort(),
    discovery_type: raw("discovery_type"),
    discovery_impact: raw("discovery_impact"),
    curiosity_level: raw("curiosity_level"),
    creation_type: raw("creation_type"),
    satisfaction_level: raw("satisfaction_level"),
    time_invested: raw("time_invested"),
    adjustment_area: raw("adjustment_area"),
    priority_level: raw("priority_level"),
    confidence_level: raw("confidence_level"),
  };
}

function FieldGroupView({
  group,
  values,
  multi,
  onValue,
  onToggle,
  columns = 2,
}: {
  group: PersonalFutureBuildingQuickAddFieldGroup;
  values: FieldState;
  multi: MultiFieldState;
  onValue: (key: string, value: string) => void;
  onToggle: (key: string, value: string) => void;
  columns?: number;
}) {
  const tokens = useThemeTokens();
  const { colors } = tokens;

  if (group.field_type === "amount") {
    return (
      <label className="block">
        <span style={{ ...personalTypography.labelSm, color: colors.textSecondary }}>{group.label}</span>
        <input
          type="number"
          inputMode="decimal"
          value={values[group.group_key] ?? ""}
          onChange={(e) => onValue(group.group_key, e.target.value)}
          className="mt-2 w-full rounded-xl border bg-transparent px-4 py-4 text-2xl font-bold outline-none"
          style={{ borderColor: colors.border, color: colors.brandPrimary }}
          placeholder="₹0"
        />
      </label>
    );
  }

  if (group.field_type === "textarea") {
    return (
      <label className="block">
        <span style={{ ...personalTypography.labelSm, color: colors.textSecondary }}>{group.label}</span>
        <textarea
          value={values[group.group_key] ?? ""}
          onChange={(e) => onValue(group.group_key, e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-xl border bg-transparent px-4 py-3 outline-none"
          style={{ borderColor: colors.border, color: colors.textPrimary }}
        />
      </label>
    );
  }

  const isMulti = group.field_type === "multi_select";
  const options = group.options ?? [];
  const rows = Array.from({ length: Math.ceil(options.length / columns) }, (_, i) =>
    options.slice(i * columns, i * columns + columns),
  );

  return (
    <div>
      <p style={{ ...personalTypography.sectionHeader, color: colors.textSecondary }}>{group.label}</p>
      <div className="mt-3 space-y-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {row.map((option) => {
              const active = isMulti
                ? multi[group.group_key]?.has(option.value)
                : values[group.group_key] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => (isMulti ? onToggle(group.group_key, option.value) : onValue(group.group_key, option.value))}
                  className="rounded-xl border px-3 py-3 text-sm font-medium transition-colors"
                  style={{
                    borderColor: active ? colors.brandPrimary : colors.border,
                    background: active ? `${colors.brandPrimary}22` : colors.surfaceContainer,
                    color: active ? colors.brandPrimary : colors.textPrimary,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperienceTypeField({
  group,
  values,
  onValue,
}: {
  group: PersonalFutureBuildingQuickAddFieldGroup;
  values: FieldState;
  onValue: (key: string, value: string) => void;
}) {
  const { colors } = useThemeTokens();
  return (
    <div>
      <p style={{ ...personalTypography.sectionHeader, color: colors.textSecondary }}>{group.label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(group.options ?? []).map((option) => {
          const active = values[group.group_key] === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onValue(group.group_key, option.value)}
              className="rounded-full border px-4 py-2 text-sm"
              style={{
                borderColor: active ? colors.brandPrimary : colors.border,
                color: active ? colors.brandPrimary : colors.textSecondary,
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TabFields({
  selectedTab,
  options,
  values,
  multi,
  onValue,
  onToggle,
}: {
  selectedTab: string;
  options: PersonalQuickAddOptionsResponse;
  values: FieldState;
  multi: MultiFieldState;
  onValue: (key: string, value: string) => void;
  onToggle: (key: string, value: string) => void;
}) {
  const groups = tabFieldsFor(options, selectedTab);
  const columnsFor = (key: string) => {
    if (key === "creation_type") return 3;
    if (key === "experience_type") return 0;
    return 2;
  };

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        if (group.group_key === "experience_type") {
          return (
            <ExperienceTypeField
              key={group.group_key}
              group={group}
              values={values}
              onValue={onValue}
            />
          );
        }
        return (
          <FieldGroupView
            key={group.group_key}
            group={group}
            values={values}
            multi={multi}
            onValue={onValue}
            onToggle={onToggle}
            columns={columnsFor(group.group_key) || 2}
          />
        );
      })}
    </div>
  );
}

export function LifestyleQuickAddHub({
  initialEventType,
  momentId,
  open = true,
  onClose,
  onSuccess,
}: LifestyleQuickAddHubProps) {
  const tokens = useThemeTokens();
  const { colors } = tokens;

  const {
    options,
    loading,
    error,
    reload: reloadOptions,
  } = useQuickAddOptions({ momentId, enabled: open });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(
    initialEventType?.toUpperCase() || "LIFESTYLE_EXPENSE",
  );
  const [values, setValues] = useState<FieldState>({});
  const [multi, setMulti] = useState<MultiFieldState>({});

  useEffect(() => {
    if (!options) return;
    if (!initialEventType) {
      setSelectedTab(options.tabs?.[0]?.event_type ?? "LIFESTYLE_EXPENSE");
    }
  }, [options, initialEventType]);

  useEffect(() => {
    setValues({});
    setMulti({});
  }, [selectedTab]);

  const fallbackTabs = useMemo(
    () =>
      (getQuickAddBundleByContext("LIFESTYLE")?.actions ?? []).map((action) => ({
        event_type: action.action_id,
        label: action.label,
        tab_code: action.tab_code ?? action.action_id,
        description: action.label,
        hero_title: action.label,
        hero_subtitle: "",
        cta_label: action.cta_label,
      })),
    [],
  );

  const displayTabs = options?.tabs?.length ? options.tabs : fallbackTabs;

  const activeTab: PersonalQuickAddTab | undefined = useMemo(
    () => options?.tabs?.find((t) => t.event_type === selectedTab),
    [options, selectedTab],
  );

  const lifestyleMoment =
    options?.moments.find((m) => m.moment_type_code === "LIFESTYLE") ??
    options?.moments.find((m) => m.moment_id === momentId) ??
    options?.moments[0] ??
    null;

  async function handleSubmit() {
    if (!lifestyleMoment || !activeTab) return;
    setSubmitting(true);
    try {
      await createPersonalQuickAdd({
        moment_id: lifestyleMoment.moment_id,
        event_type: selectedTab,
        event_title: activeTab.label,
        lifestyle: buildLifestylePayload(values, multi),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Quick Add failed.");
      setSubmitting(false);
    }
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
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl border sm:rounded-2xl"
        style={{ borderColor: colors.border, background: colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-5 py-4" style={{ borderColor: colors.border }}>
          <h2 style={{ ...personalTypography.heroTitle, color: colors.brandPrimary, fontSize: 22 }}>
            Capture Lifestyle
          </h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {(displayTabs ?? []).map((tab) => {
              const active = tab.event_type === selectedTab;
              return (
                <button
                  key={tab.event_type}
                  type="button"
                  onClick={() => setSelectedTab(tab.event_type)}
                  className="shrink-0 rounded-full border px-4 py-2 text-xs font-semibold"
                  style={{
                    borderColor: active ? colors.brandPrimary : colors.border,
                    background: active ? `${colors.brandPrimary}18` : "transparent",
                    color: active ? colors.brandPrimary : colors.textSecondary,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading && !options ? (
            <SkeletonQuickAddSheet />
          ) : error && !options ? (
            <div className="space-y-2">
              <p style={{ color: colors.error }}>{error}</p>
              <button type="button" onClick={() => void reloadOptions()} className="text-sm underline">
                Retry
              </button>
            </div>
          ) : !lifestyleMoment ? (
            <p style={{ color: colors.textSecondary }}>Activate a lifestyle moment first.</p>
          ) : (
            <>
              {activeTab ? (
                <div className="mb-5">
                  <h3 style={{ ...personalTypography.screenTitle, color: colors.textPrimary }}>
                    {activeTab.hero_title ?? activeTab.label}
                  </h3>
                  <p className="mt-1" style={{ ...personalTypography.bodyMd, color: colors.textSecondary }}>
                    {activeTab.hero_subtitle ?? activeTab.description}
                  </p>
                </div>
              ) : null}
              {options ? (
                <TabFields
                  selectedTab={selectedTab}
                  options={options}
                  values={values}
                  multi={multi}
                  onValue={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
                  onToggle={(key, value) =>
                    setMulti((prev) => {
                      const current = new Set(prev[key] ?? []);
                      if (current.has(value)) current.delete(value);
                      else current.add(value);
                      return { ...prev, [key]: current };
                    })
                  }
                />
              ) : null}
              {activeTab?.teaches_items?.length ? (
                <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: colors.border }}>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.brandPrimary }}>
                    This teaches
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeTab.teaches_items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border px-3 py-1 text-xs"
                        style={{ borderColor: colors.border, color: colors.textSecondary }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  {activeTab.insight_body ? (
                    <p className="mt-3 text-sm italic" style={{ color: colors.textSecondary }}>
                      {activeTab.insight_body}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {submitError ? <p className="mt-4 text-sm" style={{ color: colors.error }}>{submitError}</p> : null}
            </>
          )}
        </div>

        <div className="space-y-2 border-t px-5 py-4" style={{ borderColor: colors.border }}>
          <button
            type="button"
            disabled={submitting || !lifestyleMoment || !canSubmit(selectedTab, values, multi)}
            onClick={() => void handleSubmit()}
            className="w-full rounded-xl py-3 font-semibold disabled:opacity-50"
            style={{ background: colors.brandPrimary, color: colors.brandOnPrimary }}
          >
            {submitting ? "Saving…" : activeTab?.cta_label ?? "Save Entry"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border py-3"
            style={{ borderColor: colors.border, color: colors.textSecondary }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
