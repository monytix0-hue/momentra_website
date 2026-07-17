"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Info, Lock, Sparkles, Wallet } from "lucide-react";
import { PersonalAtmosphericOrbs } from "@/components/personal/empty/shared/PersonalAtmosphericOrbs";
import { personalGlassCardStyle, personalTypography } from "@/components/personal/empty/shared/emptyStyles";
import { MasterExpenseSkeleton } from "@/components/personal/master_expense/MasterExpenseSkeleton";
import { MoneyInput } from "@/components/shared/MoneyInput";
import { usePersonalDomainTokens } from "@/lib/personal/personalDomainPalette";
import {
  PersonalRepository,
  invalidateAfterMasterExpense,
} from "@/repositories/PersonalRepository";
import type { PersonalMasterExpenseOptionsResponse, PersonalQuickAddFieldOption } from "@/lib/api/client";
import { buildMasterExpensePayload } from "@/lib/master_expense/payloadBuilder";
import {
  MASTER_EXPENSE_CONTEXT_REASONS,
  MASTER_EXPENSE_FEELINGS,
  MASTER_EXPENSE_RELATIONSHIP_IMPACTS,
  MASTER_EXPENSE_SCALE_LEVELS,
  MASTER_EXPENSE_SHARED_WITH,
} from "@/lib/master_expense/defaultOptions";
import {
  MasterExpenseFieldCard,
  MasterExpenseImpactTile,
  SegmentedScaleControl,
} from "@/lib/master_expense/masterExpenseUi";
import { getReferenceData } from "@/lib/reference_data/referenceDataStore";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import type { MoneyValue } from "@/lib/reference_data/types";
import { createClientRequestId } from "@/lib/quick_add/draftStore";
import { defaultOccurredAt } from "@/lib/quick_add/dateTimeDefaults";

export type MasterExpenseOrchestratorProps = {
  onBack: () => void;
  onSuccess?: () => void;
};

const FEELING_EMOJI: Record<string, string> = {
  VERY_BAD: "😡",
  BAD: "😕",
  NEUTRAL: "😐",
  GOOD: "😊",
  GREAT: "😍",
};

function ChipRow({
  label,
  options,
  value,
  onChange,
  multi = false,
}: {
  label: string;
  options: PersonalQuickAddFieldOption[];
  value: string | string[];
  onChange: (value: string) => void;
  multi?: boolean;
}) {
  const { colors } = usePersonalDomainTokens();
  const selected = multi ? new Set(Array.isArray(value) ? value : []) : value;

  return (
    <div className="space-y-2">
      {label ? (
        <p style={{ ...personalTypography.sectionHeader, color: colors.textSecondary }}>{label}</p>
      ) : null}
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
              className="pressable rounded-xl px-3 py-2 text-xs font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-95"
              style={{
                border: `1px solid ${isSelected ? colors.brandPrimary : colors.border}`,
                background: isSelected
                  ? "linear-gradient(135deg, rgba(108, 78, 242, 0.35), rgba(108, 78, 242, 0.15))"
                  : "rgba(255,255,255,0.03)",
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

function StepHeader({ step, title }: { step: number; title: string }) {
  const { colors } = usePersonalDomainTokens();
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex size-6 items-center justify-center rounded-full text-xs font-bold"
        style={{ background: colors.brandPrimary, color: colors.onPrimary }}
      >
        {step}
      </span>
      <h3 style={{ ...personalTypography.sectionHeader, color: colors.textPrimary }}>{title}</h3>
    </div>
  );
}

export function MasterExpenseOrchestrator({ onBack, onSuccess }: MasterExpenseOrchestratorProps) {
  const tokens = useThemeTokens();
  const { colors } = usePersonalDomainTokens();
  const referenceData = getReferenceData();
  const currencies = referenceData?.currencies ?? [];

  const [options, setOptions] = useState<PersonalMasterExpenseOptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState("");
  const [money, setMoney] = useState<MoneyValue>({ amount_minor: 0, currency_code: "INR" });
  const [accountId, setAccountId] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [subcategoryCode, setSubcategoryCode] = useState("");
  const [occurredAt, setOccurredAt] = useState(defaultOccurredAt);
  const [feeling, setFeeling] = useState("");
  const [meaningfulness, setMeaningfulness] = useState("");
  const [memorability, setMemorability] = useState("");
  const [sharedEnabled, setSharedEnabled] = useState(true);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [relationshipImpact, setRelationshipImpact] = useState<string[]>([]);
  const [contextReason, setContextReason] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PersonalRepository.getMasterExpenseOptions();
      setOptions(data);
      if (data.accounts[0]) setAccountId(data.accounts[0].account_id);
      if (data.categories[0]) setCategoryCode(data.categories[0].category_id);
      const accountCurrency = data.accounts[0]?.currency_code;
      if (accountCurrency) {
        setMoney((prev) => ({ ...prev, currency_code: accountCurrency }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load options.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resolvedOptions = useMemo(() => {
    if (!options) return null;
    return {
      ...options,
      feelings: options.feelings?.length ? options.feelings : MASTER_EXPENSE_FEELINGS,
      scale_levels: options.scale_levels?.length ? options.scale_levels : MASTER_EXPENSE_SCALE_LEVELS,
      shared_with: options.shared_with?.length ? options.shared_with : MASTER_EXPENSE_SHARED_WITH,
      relationship_impacts: options.relationship_impacts?.length
        ? options.relationship_impacts
        : MASTER_EXPENSE_RELATIONSHIP_IMPACTS,
      context_reasons: options.context_reasons?.length
        ? options.context_reasons
        : MASTER_EXPENSE_CONTEXT_REASONS,
    };
  }, [options]);

  const fieldSurface = personalGlassCardStyle(tokens);

  const canSave = useMemo(() => {
    if (!resolvedOptions?.life_operations_moment_id) return false;
    if (!resolvedOptions?.lifestyle_moment_id) return false;
    return Boolean(title.trim() && money.amount_minor > 0 && accountId && categoryCode);
  }, [resolvedOptions, title, money.amount_minor, accountId, categoryCode]);

  // Honest pre-submit preview: fan-out targets only — no invented ₹ / budget deltas.
  const impactPreview = useMemo(
    () => [
      {
        title: "Life Operations",
        subtitle: "Will refresh Pulse & Activity",
        active: Boolean(resolvedOptions?.life_operations_moment_id),
      },
      {
        title: "Lifestyle",
        subtitle: "Will refresh Pulse & Moments",
        active: Boolean(resolvedOptions?.lifestyle_moment_id),
      },
      {
        title: "Relationships",
        subtitle: sharedEnabled
          ? "Will refresh Pulse & Moments"
          : "Skipped (not shared)",
        active: sharedEnabled && Boolean(resolvedOptions?.emotional_security_moment_id),
      },
    ],
    [sharedEnabled, resolvedOptions],
  );

  function clearAll() {
    setTitle("");
    setMoney((prev) => ({ ...prev, amount_minor: 0 }));
    setOccurredAt(defaultOccurredAt());
    setFeeling("");
    setMeaningfulness("");
    setMemorability("");
    setSharedWith([]);
    setRelationshipImpact([]);
    setContextReason("");
    setNotes("");
  }

  function toggleSharedWith(value: string) {
    setSharedWith((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function toggleRelationshipImpact(value: string) {
    setRelationshipImpact((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const payload = buildMasterExpensePayload(
      {
        title,
        amountMinor: money.amount_minor,
        currencyCode: money.currency_code,
        accountId,
        categoryCode,
        subcategoryCode,
        occurredAt,
        feeling,
        meaningfulness,
        memorability,
        sharedEnabled,
        sharedWith,
        relationshipImpact,
        contextReason,
        notes,
      },
      createClientRequestId(),
    );

    try {
      await PersonalRepository.createMasterExpense(payload);
      invalidateAfterMasterExpense(sharedEnabled);
      setSaved(true);
      onSuccess?.();
      setTimeout(() => onBack(), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save expense.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-[120] flex flex-col"
        style={{ background: tokens.colors.background }}
      >
        <MasterExpenseSkeleton />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex flex-col"
      style={{ background: tokens.colors.background, color: colors.textPrimary }}
    >
      <PersonalAtmosphericOrbs />
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 backdrop-blur-md"
        style={{ background: `${tokens.colors.background}e6` }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="pressable rounded-lg p-2 transition-opacity hover:opacity-80"
            aria-label="Back"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="flex size-10 items-center justify-center rounded-xl"
              style={{ background: colors.brandPrimary, boxShadow: `0 4px 12px ${colors.brandPrimary}40` }}
            >
              <Wallet size={18} color={colors.onPrimary} />
            </div>
            <div>
              <h1 className="flex items-center gap-1" style={personalTypography.screenTitle}>
                Master Expense
                <Sparkles size={14} style={{ color: colors.brandTertiary }} />
              </h1>
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                One expense. Impact across your life.
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="text-sm font-semibold"
          style={{ color: colors.brandPrimary }}
        >
          Clear All
        </button>
      </header>

      <main className="relative flex-1 space-y-6 overflow-y-auto px-5 pb-36 pt-2">
        {error ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        {saved ? (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Expense saved across your life templates.
          </p>
        ) : null}

        {!resolvedOptions?.life_operations_moment_id ? (
          <div className="rounded-2xl p-4 text-sm" style={personalGlassCardStyle(tokens)}>
            Activate Life Operations, Lifestyle, and Relationships moments to use Master Expense.
          </div>
        ) : null}

        <section
          className="flex items-start gap-4 rounded-2xl p-4"
          style={personalGlassCardStyle(tokens, { glow: true })}
        >
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(108, 78, 242, 0.15)", border: "1px solid rgba(108, 78, 242, 0.25)" }}
          >
            <Info size={22} style={{ color: colors.brandPrimary }} />
          </div>
          <div className="flex-1">
            <h2 style={{ ...personalTypography.bodyMd, fontWeight: 600 }}>Why Master Expense?</h2>
            <p style={{ ...personalTypography.labelSm, color: colors.textSecondary, marginTop: 4 }}>
              This single entry will update Life Operations, Lifestyle and Relationships automatically.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <StepHeader step={1} title="Transaction Details" />
          <div className="grid grid-cols-2 gap-3">
            <MasterExpenseFieldCard
              label="Expense Title"
              className="col-span-2"
              surfaceStyle={fieldSurface}
              labelColor={colors.textSecondary}
            >
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-sm font-medium outline-none"
                placeholder="Dinner Celebration"
              />
            </MasterExpenseFieldCard>
            <MasterExpenseFieldCard label="Amount" surfaceStyle={fieldSurface} labelColor={colors.textSecondary}>
              <MoneyInput
                label=""
                value={money}
                onChange={setMoney}
                currencies={currencies}
                defaultCurrencyCode={money.currency_code}
                className="!space-y-0"
              />
            </MasterExpenseFieldCard>
            <MasterExpenseFieldCard label="Account" surfaceStyle={fieldSurface} labelColor={colors.textSecondary}>
              <select
                value={accountId}
                onChange={(e) => {
                  setAccountId(e.target.value);
                  const account = resolvedOptions?.accounts.find((a) => a.account_id === e.target.value);
                  if (account?.currency_code) {
                    setMoney((prev) => ({ ...prev, currency_code: account.currency_code }));
                  }
                }}
                className="w-full bg-transparent text-sm font-medium outline-none"
              >
                {resolvedOptions?.accounts.map((a) => (
                  <option key={a.account_id} value={a.account_id} className="bg-[#14121b]">
                    {a.account_name}
                  </option>
                ))}
              </select>
            </MasterExpenseFieldCard>
            <MasterExpenseFieldCard
              label="Category"
              className="col-span-2"
              surfaceStyle={fieldSurface}
              labelColor={colors.textSecondary}
            >
              <select
                value={categoryCode}
                onChange={(e) => {
                  setCategoryCode(e.target.value);
                  setSubcategoryCode("");
                }}
                className="w-full bg-transparent text-sm font-medium outline-none"
              >
                {resolvedOptions?.categories.map((c) => (
                  <option key={c.category_id} value={c.category_id} className="bg-[#14121b]">
                    {c.category_name}
                  </option>
                ))}
              </select>
            </MasterExpenseFieldCard>
            {(resolvedOptions?.categories.find((c) => c.category_id === categoryCode)?.children?.length ?? 0) >
            0 ? (
              <MasterExpenseFieldCard
                label="Subcategory"
                className="col-span-2"
                surfaceStyle={fieldSurface}
                labelColor={colors.textSecondary}
              >
                <select
                  value={subcategoryCode}
                  onChange={(e) => setSubcategoryCode(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none"
                >
                  <option value="" className="bg-[#14121b]">
                    Optional
                  </option>
                  {resolvedOptions?.categories
                    .find((c) => c.category_id === categoryCode)
                    ?.children?.map((c) => (
                      <option key={c.category_id} value={c.category_id} className="bg-[#14121b]">
                        {c.category_name}
                      </option>
                    ))}
                </select>
              </MasterExpenseFieldCard>
            ) : null}
            <MasterExpenseFieldCard
              label="Date & Time"
              className="col-span-2"
              surfaceStyle={fieldSurface}
              labelColor={colors.textSecondary}
            >
              <input
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                className="w-full bg-transparent text-sm font-medium outline-none"
              />
            </MasterExpenseFieldCard>
          </div>
        </section>

        <section className="space-y-4">
          <StepHeader step={2} title="Experience" />
          <div className="space-y-5 rounded-2xl p-4" style={personalGlassCardStyle(tokens)}>
            <div>
              <p style={{ ...personalTypography.labelSm, color: colors.textSecondary, marginBottom: 12 }}>
                How did this make you feel?
              </p>
              <div className="grid grid-cols-5 gap-2">
                {(resolvedOptions?.feelings ?? []).map((opt) => {
                  const isSelected = feeling === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFeeling(opt.value)}
                      className="pressable flex flex-col items-center gap-1 rounded-xl border p-2 transition-transform active:scale-95"
                      style={{
                        borderColor: isSelected ? "transparent" : colors.border,
                        background: isSelected
                          ? `linear-gradient(135deg, ${colors.brandPrimary} 0%, ${colors.brandPrimary}cc 100%)`
                          : "transparent",
                        color: isSelected ? colors.onPrimary : undefined,
                      }}
                    >
                      <span className="text-xl">{FEELING_EMOJI[opt.value] ?? "😐"}</span>
                      <span
                        className="text-[9px] font-bold uppercase"
                        style={{ color: isSelected ? colors.onPrimary : colors.textSecondary }}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p style={{ ...personalTypography.labelSm, color: colors.textSecondary, marginBottom: 8 }}>
                How meaningful was this experience?
              </p>
              <SegmentedScaleControl
                options={resolvedOptions?.scale_levels ?? []}
                value={meaningfulness}
                onChange={setMeaningfulness}
                colors={colors}
              />
            </div>
            <div>
              <p style={{ ...personalTypography.labelSm, color: colors.textSecondary, marginBottom: 8 }}>
                How memorable was this?
              </p>
              <SegmentedScaleControl
                options={resolvedOptions?.scale_levels ?? []}
                value={memorability}
                onChange={setMemorability}
                colors={colors}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <StepHeader step={3} title="Shared Experience" />
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={sharedEnabled}
                onChange={(e) => setSharedEnabled(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:bg-white after:transition-all peer-checked:translate-x-full peer-checked:bg-[#6c4ef2]" />
            </label>
          </div>
          {sharedEnabled ? (
            <div className="space-y-5 rounded-2xl p-4" style={personalGlassCardStyle(tokens)}>
              <ChipRow
                label="Shared With"
                options={resolvedOptions?.shared_with ?? []}
                value={sharedWith}
                onChange={toggleSharedWith}
                multi
              />
              <ChipRow
                label="What was the impact on this relationship?"
                options={resolvedOptions?.relationship_impacts ?? []}
                value={relationshipImpact}
                onChange={toggleRelationshipImpact}
                multi
              />
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <StepHeader step={4} title="Context" />
          <div className="rounded-2xl p-4" style={personalGlassCardStyle(tokens)}>
            <p style={{ ...personalTypography.labelSm, color: colors.textSecondary, marginBottom: 12 }}>
              Why did this happen?
            </p>
            <ChipRow
              label=""
              options={resolvedOptions?.context_reasons ?? []}
              value={contextReason}
              onChange={setContextReason}
            />
          </div>
        </section>

        <section className="space-y-4">
          <StepHeader step={5} title="Notes (Optional)" />
          <div className="rounded-2xl p-4" style={personalGlassCardStyle(tokens)}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 200))}
              placeholder="Add any additional notes..."
              className="min-h-[60px] w-full resize-none bg-transparent text-xs outline-none"
              style={{ color: colors.textSecondary }}
            />
            <div className="text-right text-[10px]" style={{ color: colors.textSecondary, opacity: 0.6 }}>
              {notes.length}/200
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 pt-4">
          <p
            className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: colors.textSecondary }}
          >
            This will impact
          </p>
          <div className="grid grid-cols-3 gap-3">
            {impactPreview.map((card) => (
              <MasterExpenseImpactTile
                key={card.title}
                title={card.title as "Life Operations" | "Lifestyle" | "Relationships"}
                subtitle={card.subtitle}
                active={card.active}
                surfaceStyle={fieldSurface}
                colors={colors}
              />
            ))}
          </div>
        </section>
      </main>

      <footer
        className="sticky bottom-0 space-y-4 px-5 py-6 backdrop-blur-lg"
        style={{ background: `${tokens.colors.background}f2` }}
      >
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="pressable flex-1 rounded-2xl border py-4 text-sm font-bold tracking-wide transition-transform active:scale-95"
            style={{ borderColor: colors.border, background: "rgba(255,255,255,0.05)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSave || saving}
            className="pressable flex-[2] rounded-2xl py-4 text-sm font-bold tracking-wide transition-transform active:scale-95 disabled:opacity-50"
            style={{
              background: colors.brandPrimary,
              color: colors.onPrimary,
              boxShadow: `0 8px 24px ${colors.brandPrimary}40`,
            }}
          >
            {saving ? "Saving…" : "Save Expense"}
          </button>
        </div>
        <div
          className="flex items-center justify-center gap-1.5 text-[10px]"
          style={{ color: colors.textSecondary, opacity: 0.6 }}
        >
          <Lock size={12} />
          Your data is private and secure
        </div>
      </footer>
    </div>
  );
}
