"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { successPulseVariants } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";
import { MOTION_DURATION_MS } from "@/lib/motion/tokens";
import { usePersonalDomainTokens } from "@/lib/personal/personalDomainPalette";
import { personalTypography } from "@/components/personal/empty/shared/emptyStyles";
import { SkeletonQuickAddSheet } from "@/components/personal/shared/skeleton/SkeletonBlocks";
import { useQuickAddOptions } from "@/hooks/useQuickAddOptions";
import { getQuickAddBundleByContext } from "@/lib/quick_add/registry";
import {
  buildLifeOpsQuickAddPayload,
  canSubmitLifeOpsTab,
  defaultLifeOpsFormState,
  type LifeOpsQuickAddFormState,
} from "@/lib/quick_add/payloadBuilders/lifeOperations";
import { PersonalRepository } from "@/repositories/PersonalRepository";
import {
  deserializeQuickAddForm,
  hasQuickAddDraft,
  loadQuickAddDraft,
  saveQuickAddDraft,
  serializeQuickAddForm,
  subscribeOnlineRetry,
} from "@/lib/quick_add/draftStore";
import { ApiError, type PersonalQuickAddAccount, type PersonalQuickAddFieldOption, type PersonalQuickAddMetadata, type PersonalQuickAddOptionsResponse, type PersonalQuickAddTab } from "@/lib/api/client";
import { getPersonalPulseCache } from "@/hooks/usePersonalPulse";
import {
  applyOptimisticPatch,
  rollbackPatch,
} from "@/lib/telemetry/optimisticPulse";
import {
  buildLifeOpsOptimisticPatch,
  isOptimisticSafeEventType,
} from "@/lib/telemetry/lifeOpsOptimisticPatch";
import { createClientRequestId } from "@/lib/quick_add/draftStore";
import { endQuickAddSaveSpan, startQuickAddSaveSpan } from "@/lib/telemetry/performanceTelemetry";
import { resolveExpenseCategoryIcon } from "@/lib/personal/life_operations/expenseCategoryIcons";
import { LifeOpsAddAccountSheet } from "@/components/personal/life_operations/quickadd/LifeOpsAddAccountSheet";
import { MoneyInput } from "@/components/shared/MoneyInput";
import { resolveExpenseCategories, resolveOptionsRef } from "@/lib/quick_add/resolveOptions";
import type { CurrencyReference, ReferenceItem } from "@/lib/reference_data/types";
import { getBootstrap } from "@/stores/bootstrapStore";

type LifeOperationsQuickAddSheetProps = {
  initialEventType?: string | null;
  defaultMomentId?: string | null;
  open?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onBeginSetup?: () => void;
};

const LIFE_OPS_BUNDLE = getQuickAddBundleByContext("LIFE_OPERATIONS")!;
const LIFE_OPS_EVENT_TYPES = new Set(
  (LIFE_OPS_BUNDLE?.actions ?? []).map((a) => a.action_id),
);

function labelFor(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type ChipOptionSource = string | PersonalQuickAddFieldOption | Record<string, unknown>;

function normalizeChipOptions(items: ChipOptionSource[]): Array<{ value: string; label: string }> {
  return items.map((item) => {
    if (typeof item === "string") {
      return { value: item, label: labelFor(item) };
    }
    const record = item as Record<string, unknown>;
    const value = String(record.value ?? "");
    const label = String(record.label ?? record.value ?? "");
    return { value, label };
  });
}

function ChipSelect({
  label,
  options,
  value,
  onChange,
  multi = false,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string | string[];
  onChange: (value: string) => void;
  multi?: boolean;
}) {
  const { colors } = usePersonalDomainTokens();
  const selected = multi ? new Set(Array.isArray(value) ? value : []) : value;

  return (
    <div className="space-y-2">
      <label style={{ ...personalTypography.sectionHeader, color: colors.textSecondary }}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = multi
            ? (selected as Set<string>).has(opt.value)
            : selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className="rounded-lg px-3 py-2 text-xs font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-95"
              style={{
                border: `1px solid ${isSelected ? colors.brandPrimary : colors.border}`,
                background: isSelected ? "rgba(108, 78, 242, 0.15)" : "transparent",
                color: isSelected ? colors.brandPrimary : colors.textSecondary,
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

function ReferenceCategoryChips({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: ReferenceItem[];
  value: string;
  onChange: (code: string) => void;
}) {
  const { colors } = usePersonalDomainTokens();
  return (
    <div className="space-y-2">
      <label style={{ ...personalTypography.sectionHeader, color: colors.textSecondary }}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const selected = value === item.code;
          const Icon = resolveExpenseCategoryIcon(
            item.icon,
            item.parent_code ?? item.code,
            item.parent_code ? item.code : undefined,
          );
          const accent = item.color || colors.brandPrimary;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => onChange(item.code)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-95"
              style={{
                border: `1px solid ${selected ? accent : colors.border}`,
                background: selected ? `${accent}22` : "transparent",
                color: selected ? accent : colors.textSecondary,
              }}
            >
              <Icon size={14} aria-hidden />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const { colors } = usePersonalDomainTokens();
  const style = {
    borderColor: colors.border,
    background: colors.surfaceContainerLowest ?? "#0e0d16",
    color: colors.textPrimary,
  };
  return (
    <div className="space-y-2">
      <label style={{ ...personalTypography.sectionHeader, color: colors.textSecondary }}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full rounded-xl border p-3 input-focus-glow"
          style={style}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border px-3 py-3 input-focus-glow"
          style={style}
        />
      )}
    </div>
  );
}

function optionsFromFieldOptions(items: PersonalQuickAddFieldOption[]): Array<{ value: string; label: string }> {
  return normalizeChipOptions(items);
}

function canSubmitTab(tab: string, state: FormState): boolean {
  return canSubmitLifeOpsTab(tab, state);
}

type FormState = LifeOpsQuickAddFormState;

function defaultFormState(): FormState {
  const bootstrap = getBootstrap();
  return defaultLifeOpsFormState(bootstrap?.preferences.default_currency_code ?? "INR");
}

function ExpenseTab({
  meta,
  options,
  state,
  setState,
  colors,
  onAddAccount,
}: {
  meta: PersonalQuickAddMetadata;
  options: PersonalQuickAddOptionsResponse;
  state: FormState;
  setState: (patch: Partial<FormState>) => void;
  colors: ReturnType<typeof usePersonalDomainTokens>["colors"];
  onAddAccount: () => void;
}) {
  const bootstrap = getBootstrap();
  const currencies = (options.currencies ?? []) as CurrencyReference[];
  const defaultCurrency =
    options.default_currency_code ??
    bootstrap?.preferences.default_currency_code ??
    "INR";
  const locale = bootstrap?.preferences.locale ?? "en-IN";
  const expenseCategories = resolveExpenseCategories(options as unknown as Record<string, unknown>);

  return (
    <div className="space-y-5">
      {meta.expense_entry_types?.length ? (
        <ChipSelect
          label="Entry Type"
          options={optionsFromFieldOptions(meta.expense_entry_types)}
          value={state.transactionType}
          onChange={(v) => setState({ transactionType: v })}
        />
      ) : null}
      <MoneyInput
        label="Amount"
        currencies={currencies}
        defaultCurrencyCode={defaultCurrency}
        locale={locale}
        value={{ amount_minor: state.amountMinor, currency_code: state.currencyCode }}
        onChange={(v) =>
          setState({ amountMinor: v.amount_minor, currencyCode: v.currency_code })
        }
      />
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label style={{ ...personalTypography.sectionHeader, color: colors.textSecondary }}>
            Account
          </label>
          <button
            type="button"
            onClick={onAddAccount}
            className="text-xs font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-95"
            style={{ color: colors.brandPrimary }}
          >
            Add account ›
          </button>
        </div>
        {options.accounts?.length ? (
          <select
            value={state.accountId}
            onChange={(e) => setState({ accountId: e.target.value })}
            className="w-full rounded-xl border px-3 py-3"
            style={{
              borderColor: colors.border,
              background: colors.surfaceContainerLowest ?? "#0e0d16",
              color: colors.textPrimary,
            }}
          >
            {options.accounts.map((a) => (
              <option key={a.account_id} value={a.account_id}>
                {a.account_name}
              </option>
            ))}
          </select>
        ) : (
          <button
            type="button"
            onClick={onAddAccount}
            className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition-transform duration-200 hover:scale-[1.02] active:scale-95"
            style={{
              background: colors.surfaceContainerLowest ?? "#0e0d16",
              color: colors.textPrimary,
            }}
          >
            <span>Add your first account</span>
            <span style={{ color: colors.brandPrimary }}>›</span>
          </button>
        )}
      </div>
      {expenseCategories.length > 0 ? (
        <ReferenceCategoryChips
          label="Category"
          items={expenseCategories}
          value={state.categoryCode}
          onChange={(v) => setState({ categoryCode: v, subcategoryCode: "" })}
        />
      ) : null}
      {(() => {
        const selected = expenseCategories.find((c) => c.code === state.categoryCode);
        const children = (selected?.children ?? []).filter((c) => c.is_active !== false);
        if (!children.length) return null;
        return (
          <ReferenceCategoryChips
            label="Subcategory"
            items={children}
            value={state.subcategoryCode}
            onChange={(v) => setState({ subcategoryCode: v })}
          />
        );
      })()}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label style={{ ...personalTypography.sectionHeader, color: colors.textSecondary }}>Date</label>
          <input
            type="date"
            value={state.occurredDate}
            onChange={(e) => setState({ occurredDate: e.target.value })}
            className="w-full rounded-xl border px-3 py-3"
            style={{
              borderColor: colors.border,
              background: colors.surfaceContainerLowest ?? "#0e0d16",
              color: colors.textPrimary,
            }}
          />
        </div>
        <div className="space-y-2">
          <label style={{ ...personalTypography.sectionHeader, color: colors.textSecondary }}>Time</label>
          <input
            type="time"
            value={state.occurredTime}
            onChange={(e) => setState({ occurredTime: e.target.value })}
            className="w-full rounded-xl border px-3 py-3"
            style={{
              borderColor: colors.border,
              background: colors.surfaceContainerLowest ?? "#0e0d16",
              color: colors.textPrimary,
            }}
          />
        </div>
      </div>
      {meta.pressure_impact_chips?.length ? (
        <ChipSelect
          label="Financial Impact"
          options={normalizeChipOptions(meta.pressure_impact_chips)}
          value={state.pressureImpact}
          onChange={(v) => setState({ pressureImpact: v })}
        />
      ) : null}
    </div>
  );
}

function CommitmentTab({
  meta,
  state,
  setState,
}: {
  meta: PersonalQuickAddMetadata;
  state: FormState;
  setState: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-5">
      <TextField
        label="Attention Name"
        value={state.commitmentName}
        onChange={(v) => setState({ commitmentName: v })}
        placeholder="What needs attention?"
      />
      {meta.commitment_types?.length ? (
        <ChipSelect
          label="Attention Type"
          options={optionsFromFieldOptions(meta.commitment_types)}
          value={state.commitmentType}
          onChange={(v) => setState({ commitmentType: v })}
        />
      ) : null}
      {meta.attention_focus_areas?.length ? (
        <ChipSelect
          label="Focus Area"
          options={normalizeChipOptions(meta.attention_focus_areas)}
          value={state.focusArea}
          onChange={(v) => setState({ focusArea: v })}
        />
      ) : null}
      {meta.commitment_status_options?.length ? (
        <ChipSelect
          label="Status"
          options={optionsFromFieldOptions(meta.commitment_status_options ?? [])}
          value={state.commitmentStatus}
          onChange={(v) => setState({ commitmentStatus: v })}
        />
      ) : null}
    </div>
  );
}

function ReflectionTab({
  meta,
  state,
  setState,
}: {
  meta: PersonalQuickAddMetadata;
  state: FormState;
  setState: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-5">
      {meta.mood_feeling_options?.length ? (
        <ChipSelect
          label="Mood"
          options={optionsFromFieldOptions(meta.mood_feeling_options)}
          value={state.feelingState}
          onChange={(v) => setState({ feelingState: v })}
        />
      ) : null}
      {meta.reflection_tags?.length ? (
        <ChipSelect
          label="Tags"
          options={normalizeChipOptions(meta.reflection_tags)}
          value={state.reflectionTag}
          onChange={(v) => setState({ reflectionTag: v })}
        />
      ) : null}
      <TextField
        label="Notes"
        value={state.reflectionNote}
        onChange={(v) => setState({ reflectionNote: v })}
        placeholder="What shaped today?"
        multiline
      />
    </div>
  );
}

function RecoveryTab({
  meta,
  state,
  setState,
}: {
  meta: PersonalQuickAddMetadata;
  state: FormState;
  setState: (patch: Partial<FormState>) => void;
}) {
  const durationOptions = meta.recovery_duration_options?.length
    ? optionsFromFieldOptions(meta.recovery_duration_options)
    : [
        { value: "15", label: "15 min" },
        { value: "30", label: "30 min" },
        { value: "60", label: "1 hour" },
      ];

  return (
    <div className="space-y-5">
      {meta.recovery_types?.length ? (
        <ChipSelect
          label="Recovery Type"
          options={optionsFromFieldOptions(meta.recovery_types)}
          value={state.recoveryType}
          onChange={(v) => setState({ recoveryType: v })}
        />
      ) : null}
      <ChipSelect
        label="Duration"
        options={durationOptions}
        value={state.recoveryDuration}
        onChange={(v) => setState({ recoveryDuration: v })}
      />
      {meta.energy_impact_options?.length ? (
        <ChipSelect
          label="Energy Impact"
          options={normalizeChipOptions(meta.energy_impact_options)}
          value={state.recoveryEnergyImpact}
          onChange={(v) => setState({ recoveryEnergyImpact: v })}
        />
      ) : null}
      <TextField
        label="Notes"
        value={state.recoveryNotes}
        onChange={(v) => setState({ recoveryNotes: v })}
        placeholder="What helped you recover?"
        multiline
      />
    </div>
  );
}

function RhythmTab({
  meta,
  state,
  setState,
}: {
  meta: PersonalQuickAddMetadata;
  state: FormState;
  setState: (patch: Partial<FormState>) => void;
}) {
  const rhythmOptions = meta.rhythm_actions?.length
    ? optionsFromFieldOptions(meta.rhythm_actions)
    : [];

  return (
    <div className="space-y-5">
      {rhythmOptions.length > 0 ? (
        <ChipSelect
          label="Adjustments"
          options={rhythmOptions}
          value={Array.from(state.rhythmActions)}
          onChange={(v) => {
            const next = new Set(state.rhythmActions);
            if (next.has(v)) next.delete(v);
            else next.add(v);
            setState({ rhythmActions: next });
          }}
          multi
        />
      ) : null}
      {meta.runtime_modes?.length ? (
        <ChipSelect
          label="Runtime Mode"
          options={normalizeChipOptions(meta.runtime_modes)}
          value={state.runtimeMode}
          onChange={(v) => setState({ runtimeMode: v })}
        />
      ) : null}
    </div>
  );
}

export function LifeOperationsQuickAddSheet({
  initialEventType,
  defaultMomentId,
  open = true,
  onClose,
  onSuccess,
  onBeginSetup,
}: LifeOperationsQuickAddSheetProps) {
  const { colors } = usePersonalDomainTokens();
  const reducedMotion = useReducedMotion();

  const {
    options,
    loading,
    error: loadError,
    reload: reloadOptions,
  } = useQuickAddOptions({ momentId: defaultMomentId, enabled: open });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState(false);
  const [selectedTab, setSelectedTab] = useState("EXPENSE");
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [successPulse, setSuccessPulse] = useState(false);

  const patchForm = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    if (!options) return;
    const initial = initialEventType?.toUpperCase();
    if (initial && LIFE_OPS_EVENT_TYPES.has(initial)) {
      setSelectedTab(initial);
    } else if (options.tabs?.[0]?.event_type) {
      setSelectedTab(options.tabs[0].event_type);
    }
    const primary =
      options.accounts?.find((a: PersonalQuickAddAccount) => a.is_primary)?.account_id ?? options.accounts?.[0]?.account_id ?? "";
    const firstCategory =
      (options.expense_categories?.[0] as ReferenceItem | undefined)?.code ?? "";
    setForm((prev) => ({
      ...prev,
      accountId: primary,
      currencyCode: options.default_currency_code ?? prev.currencyCode,
      categoryCode: firstCategory || prev.categoryCode,
    }));
  }, [options, initialEventType]);

  const selectedTabInitialized = useRef(false);
  useEffect(() => {
    if (!selectedTabInitialized.current) {
      selectedTabInitialized.current = true;
      return;
    }
    setForm(defaultFormState());
    if (options?.accounts?.length) {
      const primary =
        options.accounts.find((a: PersonalQuickAddAccount) => a.is_primary)?.account_id ?? options.accounts[0]?.account_id ?? "";
      setForm((prev) => ({ ...prev, accountId: primary }));
    }
  }, [selectedTab, options?.accounts]);

  useEffect(() => {
    const accounts = options?.accounts;
    if (!accounts?.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronize selected account with available accounts
    setForm((prev) => {
      if (prev.accountId && accounts.some((a: PersonalQuickAddAccount) => a.account_id === prev.accountId)) {
        return prev;
      }
      const primary =
        accounts.find((a: PersonalQuickAddAccount) => a.is_primary)?.account_id ?? accounts[0]?.account_id ?? "";
      return { ...prev, accountId: primary };
    });
  }, [options?.accounts]);

  const moment = useMemo(() => {
    if (!options?.moments.length) return null;
    if (defaultMomentId) {
      return options.moments.find((m) => m.moment_id === defaultMomentId) ?? options.moments[0];
    }
    return (
      options.moments.find((m) => m.moment_type_code === "LIFE_OPERATIONS") ?? options.moments[0]
    );
  }, [defaultMomentId, options]);

  const tabs: PersonalQuickAddTab[] = useMemo(() => {
    if (options?.tabs?.length) return options.tabs;
    return (LIFE_OPS_BUNDLE?.actions ?? []).map((action) => ({
      event_type: action.action_id,
      label: action.label,
      tab_code: action.tab_code ?? action.action_id,
      description: action.label,
      hero_title: action.label,
      hero_subtitle: action.impact_preview.summary_template,
      cta_label: action.cta_label,
    }));
  }, [options?.tabs]);
  const activeTab: PersonalQuickAddTab | undefined = tabs.find((t) => t.event_type === selectedTab);
  const meta = options?.metadata ?? {};
  const submitEnabled = moment && canSubmitTab(selectedTab, form);

  const submitQuickAddEntry = useCallback(
    async (draftClientRequestId?: string) => {
      if (!moment || !submitEnabled) return;
      setSubmitting(true);
      setSubmitError(null);
      const title = activeTab?.label ?? selectedTab.replace(/_/g, " ");
      const payload = buildLifeOpsQuickAddPayload(
        selectedTab,
        moment.moment_id,
        title,
        form,
      );
      const clientRequestId = draftClientRequestId ?? createClientRequestId();
      const currentPulse = getPersonalPulseCache("LIFE_OPERATIONS");
      let optimisticApplied = false;
      if (isOptimisticSafeEventType(selectedTab)) {
        const patch = buildLifeOpsOptimisticPatch(
          selectedTab,
          form,
          title,
          moment.moment_id,
          clientRequestId,
          currentPulse,
        );
        if (patch) {
          applyOptimisticPatch("LIFE_OPERATIONS", clientRequestId, currentPulse, patch);
          optimisticApplied = true;
        }
      }
      startQuickAddSaveSpan();
      try {
        await PersonalRepository.submitQuickAdd(payload, {
          clientRequestId,
          momentId: moment.moment_id,
          tab: selectedTab,
          form: serializeQuickAddForm(form),
          momentTypeCode: "LIFE_OPERATIONS",
        });
        endQuickAddSaveSpan();
        setPendingDraft(false);
        setSuccessPulse(true);
        window.setTimeout(() => {
          setSuccessPulse(false);
          onSuccess?.();
          onClose();
        }, reducedMotion ? 0 : MOTION_DURATION_MS.slow);
      } catch (err) {
        endQuickAddSaveSpan();
        if (optimisticApplied) {
          rollbackPatch(clientRequestId);
        }
        const networkDraft = hasQuickAddDraft(moment.moment_id, selectedTab);
        setPendingDraft(networkDraft);
        let message = "Quick Add failed.";
        if (err instanceof ApiError) {
          message = err.userMessage;
        } else if (err instanceof Error) {
          message =
            err.message === "Failed to fetch"
              ? "Could not reach the server. Your entry was saved — tap Retry when you're back online."
              : err.message;
        }
        setSubmitError(message);
        setSubmitting(false);
      }
    },
    [activeTab?.label, form, moment, onClose, onSuccess, reducedMotion, selectedTab, submitEnabled],
  );

  useEffect(() => {
    if (!moment) return;
    const draft = loadQuickAddDraft(moment.moment_id, selectedTab);
    if (!draft) {
      setPendingDraft(false);
      return;
    }
    setPendingDraft(true);
    setForm((prev) => deserializeQuickAddForm(draft.form, prev));
    setSubmitError("You have an unsaved entry. Tap Retry to submit.");
  }, [moment, selectedTab]);

  useEffect(() => {
    if (!moment || !submitEnabled) return;
    const draft = loadQuickAddDraft(moment.moment_id, selectedTab);
    if (!draft) return;
    const title = activeTab?.label ?? selectedTab.replace(/_/g, " ");
    const payload = buildLifeOpsQuickAddPayload(
      selectedTab,
      moment.moment_id,
      title,
      form,
    );
    saveQuickAddDraft({
      momentId: moment.moment_id,
      tab: selectedTab,
      form: serializeQuickAddForm(form),
      payload,
      clientRequestId: draft.clientRequestId,
      savedAt: new Date().toISOString(),
    });
  }, [activeTab?.label, form, moment, selectedTab, submitEnabled]);

  useEffect(() => {
    if (!moment || !pendingDraft) return undefined;
    return subscribeOnlineRetry(() => {
      const draft = loadQuickAddDraft(moment.moment_id, selectedTab);
      if (!draft) return;
      void submitQuickAddEntry(draft.clientRequestId);
    });
  }, [moment, pendingDraft, selectedTab, submitQuickAddEntry]);

  async function handleSubmit() {
    const draft = moment ? loadQuickAddDraft(moment.moment_id, selectedTab) : null;
    await submitQuickAddEntry(draft?.clientRequestId);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && submitEnabled && !submitting) {
        e.preventDefault();
        void (async () => {
          const draft = moment ? loadQuickAddDraft(moment.moment_id, selectedTab) : null;
          await submitQuickAddEntry(draft?.clientRequestId);
        })();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moment, selectedTab, submitEnabled, submitting, submitQuickAddEntry]);

  function renderTabContent() {
    switch (selectedTab) {
      case "EXPENSE":
        return (
          <ExpenseTab
            meta={meta}
            options={options!}
            state={form}
            setState={patchForm}
            colors={colors}
            onAddAccount={() => setShowAddAccount(true)}
          />
        );
      case "COMMITMENT":
        return <CommitmentTab meta={meta} state={form} setState={patchForm} />;
      case "REFLECTION":
        return <ReflectionTab meta={meta} state={form} setState={patchForm} />;
      case "RECOVERY":
        return <RecoveryTab meta={meta} state={form} setState={patchForm} />;
      case "RHYTHM":
        return <RhythmTab meta={meta} state={form} setState={patchForm} />;
      default:
        return null;
    }
  }

  if (!open) return null;

  return (
    <>
    <BottomSheet open={open} onClose={onClose} panelClassName="flex flex-col border" ariaLabelledBy="life-ops-quick-add-title">
      <div
        className="flex max-h-[92dvh] w-full flex-col"
        style={{ borderColor: colors.border, background: colors.surface }}
      >
        <div className="shrink-0 border-b px-5 pb-3 pt-5" style={{ borderColor: colors.border }}>
          <h2 id="life-ops-quick-add-title" style={{ ...personalTypography.heroTitle, color: colors.brandPrimary }}>
            Intelligence OS
          </h2>
          <div className="mt-3 flex gap-4 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const active = tab.event_type === selectedTab;
              return (
                <button
                  key={tab.event_type}
                  type="button"
                  aria-label={tab.label}
                  aria-pressed={active}
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
          ) : loadError && !options ? (
            <div className="space-y-2">
              <p style={{ color: colors.error }}>{loadError}</p>
              <button type="button" onClick={() => void reloadOptions()} className="text-sm underline">
                Retry
              </button>
            </div>
          ) : !moment ? (
            <div className="space-y-3">
              <p style={{ ...personalTypography.bodyMd, color: colors.textSecondary }}>
                Activate a Life Operations moment to use Quick Add.
              </p>
              {onBeginSetup ? (
                <button
                  type="button"
                  onClick={onBeginSetup}
                  className="rounded-xl px-4 py-2 text-sm font-semibold"
                  style={{ background: colors.brandPrimary, color: colors.onPrimary }}
                >
                  Set up Life Operations
                </button>
              ) : null}
            </div>
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

              {activeTab?.context_banner ? (
                <section
                  className="rounded-2xl border p-4 text-sm"
                  style={{ borderColor: colors.border, background: "rgba(108, 78, 242, 0.08)" }}
                >
                  {activeTab.context_banner}
                </section>
              ) : null}

              <div>{renderTabContent()}</div>

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
                    {activeTab.insight_title ?? "Intelligence Insight"}
                  </p>
                  <p style={{ ...personalTypography.bodyMd, color: colors.textPrimary }}>
                    {activeTab.insight_body}
                  </p>
                </section>
              ) : null}

              {submitError ? (
                <div className="space-y-2">
                  <p style={{ color: colors.error }}>{submitError}</p>
                  {pendingDraft ? (
                    <button
                      type="button"
                      disabled={submitting || !submitEnabled}
                      onClick={() => void handleSubmit()}
                      className="w-full rounded-xl border py-2 text-sm font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                      style={{ borderColor: colors.brandPrimary, color: colors.brandPrimary }}
                    >
                      {submitting ? "Retrying…" : "Retry save"}
                    </button>
                  ) : null}
                </div>
              ) : null}

              <motion.button
                type="button"
                disabled={!submitEnabled || submitting}
                onClick={() => void handleSubmit()}
                className="w-full rounded-2xl py-3 font-semibold transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]"
                style={{
                  background: colors.brandPrimaryContainer ?? colors.brandPrimary,
                  color: colors.brandOnPrimary,
                  opacity: !submitEnabled || submitting ? 0.6 : 1,
                }}
                variants={successPulseVariants(reducedMotion)}
                animate={successPulse ? "pulse" : "idle"}
              >
                {submitting ? "Saving…" : successPulse ? "Saved!" : activeTab?.cta_label ?? "Save Entry"}
              </motion.button>
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
    </BottomSheet>
    {showAddAccount ? (
      <LifeOpsAddAccountSheet
        accountTypes={(options?.account_types ?? []) as ReferenceItem[]}
        currencies={(options?.currencies ?? []) as CurrencyReference[]}
        defaultCurrencyCode={options?.default_currency_code}
        onClose={() => setShowAddAccount(false)}
        onCreated={async (account) => {
          setForm((prev) => ({ ...prev, accountId: account.account_id }));
          await reloadOptions();
          setForm((prev) => ({ ...prev, accountId: account.account_id }));
        }}
      />
    ) : null}
    </>
  );
}
