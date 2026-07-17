"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Check, ChevronRight, List, X } from "lucide-react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";

export type GuidedSetupStep = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  optional?: boolean;
  hiddenWhen?: string;
};

export type GuidedSetupSaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export type GuidedSetupSummaryRow = {
  label: string;
  value: string;
};

export type GuidedSetupShellProps = {
  templateId?: string;
  momentTypeCode?: string;
  title: string;
  subtitle?: string;
  estimatedDuration?: number;
  currentStep: number;
  steps: GuidedSetupStep[];
  saveState?: GuidedSetupSaveState;
  canGoBack?: boolean;
  canContinue?: boolean;
  canPreview?: boolean;
  liveSummary?: GuidedSetupSummaryRow[];
  contextHelp?: string | null;
  footerPrimaryLabel?: string;
  footerSecondaryLabel?: string;
  error?: string | null;
  submitting?: boolean;
  canActivate?: boolean;
  interactionsDisabled?: boolean;
  activationSuccess?: boolean;
  activationSuccessMessage?: string;
  onActivationSuccessDone?: () => void;
  onBack?: () => void;
  onContinue?: () => void;
  onClose: () => void;
  onRetrySave?: () => void;
  onOpenSummary?: () => void;
  onPreview?: () => void;
  onActivate?: () => void;
  children: ReactNode;
};

function stepVisualState(
  index: number,
  currentStep: number,
): "incomplete" | "current" | "complete" {
  const n = index + 1;
  if (n === currentStep) return "current";
  if (n < currentStep) return "complete";
  return "incomplete";
}

export function GuidedSetupShell({
  title,
  subtitle,
  estimatedDuration,
  currentStep,
  steps,
  saveState = "idle",
  canGoBack = false,
  canContinue = false,
  canPreview = false,
  liveSummary = [],
  contextHelp,
  footerPrimaryLabel = "Continue",
  footerSecondaryLabel = "Preview",
  error,
  submitting = false,
  canActivate = true,
  interactionsDisabled = false,
  activationSuccess = false,
  activationSuccessMessage = "Moment activated",
  onActivationSuccessDone,
  onBack,
  onContinue,
  onClose,
  onRetrySave,
  onOpenSummary,
  onPreview,
  onActivate,
  children,
}: GuidedSetupShellProps) {
  const { colors } = useThemeTokens();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const totalSteps = Math.max(1, steps.length);
  const active = steps[Math.min(currentStep, totalSteps) - 1];
  const isReview = currentStep >= totalSteps;

  const saveLabel =
    saveState === "dirty"
      ? "Unsaved changes"
      : saveState === "saving"
        ? "Saving…"
        : saveState === "saved"
          ? "✓ Saved"
          : saveState === "error"
            ? "Couldn't save"
            : "";

  useEffect(() => {
    if (!activationSuccess || !onActivationSuccessDone) return;
    const timer = window.setTimeout(() => onActivationSuccessDone(), 1200);
    return () => window.clearTimeout(timer);
  }, [activationSuccess, onActivationSuccessDone]);

  const summaryPanel =
    liveSummary.length > 0 || contextHelp ? (
      <aside
        className="space-y-4 rounded-2xl border p-4"
        style={{
          borderColor: `color-mix(in srgb, ${colors.border} 40%, transparent)`,
          background: colors.surfaceContainer,
        }}
        aria-label="Live summary"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Summary</p>
        {liveSummary.length === 0 ? (
          <p className="text-sm opacity-60">Answers appear here as you go.</p>
        ) : (
          <dl className="space-y-2">
            {liveSummary.map((row) => (
              <div key={row.label} className="flex justify-between gap-3 text-sm">
                <dt className="opacity-60">{row.label}</dt>
                <dd className="max-w-[60%] truncate text-right font-medium">{row.value || "—"}</dd>
              </div>
            ))}
          </dl>
        )}
        {contextHelp ? (
          <p className="text-xs leading-relaxed opacity-75" style={{ color: colors.textSecondary }}>
            {contextHelp}
          </p>
        ) : null}
        {estimatedDuration ? (
          <p className="text-[10px] opacity-50">About {estimatedDuration} minutes</p>
        ) : null}
      </aside>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col motion-safe:animate-in motion-safe:fade-in"
      style={{ background: colors.background, color: colors.textPrimary }}
      data-guided-setup-shell
    >
      {activationSuccess ? (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${colors.background} 88%, transparent)` }}
          role="status"
          aria-live="polite"
        >
          <div
            className="mx-6 flex max-w-sm flex-col items-center gap-3 rounded-2xl px-8 py-7 text-center shadow-lg"
            style={{ background: colors.primaryContainer, color: colors.brandOnPrimary }}
          >
            <span
              className="flex size-12 items-center justify-center rounded-full"
              style={{ background: "color-mix(in srgb, white 22%, transparent)" }}
            >
              <Check className="size-6" strokeWidth={2.5} />
            </span>
            <p className="text-lg font-bold">{activationSuccessMessage}</p>
            <p className="text-sm opacity-90">Your moment is live on Pulse.</p>
          </div>
        </div>
      ) : null}

      <header
        className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur"
        style={{
          borderColor: `color-mix(in srgb, ${colors.border} 40%, transparent)`,
          background: `color-mix(in srgb, ${colors.background} 92%, transparent)`,
        }}
      >
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-widest opacity-60">
            Step {currentStep} of {totalSteps}
            {estimatedDuration ? ` · About ${estimatedDuration} minutes` : ""}
          </p>
          <h2 className="truncate text-lg font-semibold">{title}</h2>
          {subtitle ? (
            <p className="truncate text-xs opacity-60" style={{ color: colors.textSecondary }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {onOpenSummary || liveSummary.length > 0 ? (
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full lg:hidden"
              style={{ background: colors.surfaceContainer }}
              aria-label="Open summary"
              onClick={() => {
                onOpenSummary?.();
                setSummaryOpen(true);
              }}
            >
              <List className="size-5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close setup"
            className="flex size-10 items-center justify-center rounded-full"
            style={{ background: colors.surfaceContainer }}
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      {error ? (
        <div
          className="mx-4 mt-3 shrink-0 rounded-xl px-3 py-2 text-sm"
          style={{ background: "rgba(239,68,68,0.12)", color: colors.error }}
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <nav
        className="shrink-0 overflow-x-auto border-b px-4 py-2"
        style={{ borderColor: `color-mix(in srgb, ${colors.border} 30%, transparent)` }}
        aria-label="Setup steps"
      >
        <ol className="flex min-w-max items-center gap-1">
          {steps.map((step, index) => {
            const state = stepVisualState(index, currentStep);
            return (
              <li key={step.id} className="flex items-center gap-1">
                {index > 0 ? <ChevronRight className="size-3.5 opacity-40" aria-hidden /> : null}
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background:
                      state === "current"
                        ? colors.primaryContainer
                        : state === "complete"
                          ? `color-mix(in srgb, ${colors.primary} 18%, transparent)`
                          : colors.surfaceContainer,
                    color: state === "current" ? colors.brandOnPrimary : colors.textPrimary,
                    opacity: state === "incomplete" ? 0.55 : 1,
                  }}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  {step.shortTitle}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1100px] gap-6 px-4 pb-32 pt-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            {active ? (
              <div className="mb-6 space-y-2">
                <h3 className="text-xl font-semibold">{active.title}</h3>
                <p className="text-sm leading-relaxed opacity-75" style={{ color: colors.textSecondary }}>
                  {active.description}
                </p>
              </div>
            ) : null}
            {children}
          </div>
          <div className="hidden lg:block">{summaryPanel}</div>
        </div>
      </div>

      {summaryOpen ? (
        <div
          className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Setup summary"
          onClick={() => setSummaryOpen(false)}
        >
          <div
            className="max-h-[70vh] overflow-y-auto rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            style={{ background: colors.background }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Summary</p>
              <button type="button" aria-label="Close summary" onClick={() => setSummaryOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            {summaryPanel}
          </div>
        </div>
      ) : null}

      <footer
        className="sticky bottom-0 z-10 shrink-0 border-t px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur"
        style={{
          borderColor: `color-mix(in srgb, ${colors.border} 40%, transparent)`,
          background: `color-mix(in srgb, ${colors.background} 94%, transparent)`,
        }}
      >
        <div className="mx-auto flex w-full max-w-[1100px] flex-wrap items-center gap-2">
          {canGoBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              disabled={interactionsDisabled}
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
              style={{ borderColor: `color-mix(in srgb, ${colors.border} 40%, transparent)` }}
            >
              Back
            </button>
          ) : null}

          <div className="min-w-0 flex-1 px-1">
            {saveState === "error" && onRetrySave ? (
              <button type="button" onClick={onRetrySave} className="text-xs font-semibold underline opacity-80">
                {saveLabel} — Retry
              </button>
            ) : saveLabel ? (
              <span className="text-xs opacity-60" aria-live="polite">
                {saveLabel}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canPreview && onPreview ? (
              <button
                type="button"
                onClick={onPreview}
                disabled={interactionsDisabled}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                style={{ background: colors.surfaceContainer }}
              >
                {footerSecondaryLabel}
              </button>
            ) : null}
            {isReview && onActivate ? (
              <button
                type="button"
                disabled={!canActivate || submitting || interactionsDisabled}
                onClick={onActivate}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                style={{ background: colors.primaryContainer, color: colors.brandOnPrimary }}
              >
                {submitting ? "Activating…" : footerPrimaryLabel}
              </button>
            ) : canContinue && onContinue ? (
              <button
                type="button"
                onClick={onContinue}
                disabled={interactionsDisabled}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
                style={{ background: colors.primaryContainer, color: colors.brandOnPrimary }}
              >
                {footerPrimaryLabel}
              </button>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}
