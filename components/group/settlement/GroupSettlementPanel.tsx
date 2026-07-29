"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, Scale } from "lucide-react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import {
  getTripSettlementContext,
  markTripSettlementPaid,
  restoreTripSettlement,
  type TripSettlementContext,
  type TripSettlementTransferSuggestion,
} from "@/lib/api/group";
import { dedupeFetch } from "@/lib/cache/cacheStore";
import { tripStitchTheme } from "@/components/group/active/experience/ui/tripStitchTheme";

type GroupSettlementPanelProps = {
  momentId: string;
  /** When set, render as full-screen details overlay with back control. */
  onBack?: () => void;
  onChanged?: () => void;
};

function formatMinor(amountMinor: number, currency = "INR"): string {
  if (!Number.isFinite(amountMinor)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(0)} ${currency}`;
  }
}

function splitMethodLabel(method?: string): string {
  const raw = (method || "EQUAL").toUpperCase();
  if (raw === "EQUAL") return "Equal";
  if (raw === "PERCENTAGE") return "percentage";
  if (raw === "EXACT") return "exact";
  if (raw === "SHARES") return "shares";
  return raw.toLowerCase();
}

function initialOf(name: string): string {
  const t = name.trim();
  return t ? t[0]!.toUpperCase() : "?";
}

function contributionLabel(status: string, netMinor: number, currency: string): { amount: string; caption: string; color: string } {
  if (netMinor > 0 || status === "will_receive") {
    return {
      amount: `+${formatMinor(Math.abs(netMinor), currency)}`,
      caption: "Will Receive",
      color: tripStitchTheme.primary,
    };
  }
  if (netMinor < 0 || status === "needs_to_pay") {
    return {
      amount: `-${formatMinor(Math.abs(netMinor), currency)}`,
      caption: "Needs to Pay",
      color: tripStitchTheme.error,
    };
  }
  return {
    amount: formatMinor(0, currency),
    caption: "Settled",
    color: tripStitchTheme.onSurfaceVariant,
  };
}

export function GroupSettlementPanel({ momentId, onBack, onChanged }: GroupSettlementPanelProps) {
  const tokens = useThemeTokens();
  const { colors } = tokens;
  const [data, setData] = useState<TripSettlementContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(
    async (opts?: { soft?: boolean }) => {
      try {
        if (opts?.soft) setRefreshing(true);
        else setLoading(true);
        const key = `group:trip-settlement:${momentId}`;
        const ctx = opts?.soft
          ? await getTripSettlementContext(momentId)
          : await dedupeFetch(key, () => getTripSettlementContext(momentId));
        setData(ctx);
        setError(null);
      } catch {
        setError("Unable to load this section.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [momentId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function handleMarkPaid(transfer: TripSettlementTransferSuggestion) {
    const key = `${transfer.from_user_id}:${transfer.to_user_id}:${transfer.amount_minor}`;
    setBusyKey(key);
    try {
      const next = await markTripSettlementPaid(momentId, {
        from_user_id: transfer.from_user_id,
        to_user_id: transfer.to_user_id,
        amount_minor: transfer.amount_minor,
        currency_code: transfer.currency_code || data?.currency_code || "INR",
        client_request_id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `mark-${Date.now()}`,
      });
      setData(next);
      setError(null);
      onChanged?.();
    } catch {
      setError("Unable to mark as paid. Try again.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleRestore() {
    setBusyKey("restore");
    try {
      const next = await restoreTripSettlement(momentId);
      setData(next);
      setError(null);
      onChanged?.();
    } catch {
      setError("Unable to restore balances. Try again.");
    } finally {
      setBusyKey(null);
    }
  }

  const body = (() => {
    if (loading && !data) {
      return (
        <div
          className="rounded-2xl p-4 text-sm"
          style={{ background: colors.surfaceContainer, color: colors.textSecondary }}
          role="status"
          aria-live="polite"
        >
          Loading settlements…
        </div>
      );
    }

    if (error && !data) {
      return (
        <div className="rounded-2xl p-4 text-sm space-y-2" style={{ background: colors.surfaceContainer }}>
          <p style={{ color: colors.error }}>{error}</p>
          <button
            type="button"
            className="text-sm font-semibold underline"
            style={{ color: colors.brandPrimary }}
            onClick={() => void load()}
          >
            Retry
          </button>
        </div>
      );
    }

    if (!data) return null;

    const currency = data.currency_code ?? "INR";
    const contributions = data.member_contributions ?? [];
    const suggestions =
      (data.suggestions && data.suggestions.length > 0
        ? data.suggestions
        : data.suggested_transfer
          ? [data.suggested_transfer]
          : []) ?? [];
    const pending = data.pending_settlement_minor ?? data.unsettled_minor ?? 0;
    const unsettled = data.unsettled_minor ?? pending;
    const hasAnyMoney =
      (data.total_expenses_minor ?? 0) > 0 ||
      (data.total_paid_minor ?? 0) > 0 ||
      pending > 0 ||
      contributions.some((c) => c.net_minor !== 0);

    return (
      <div
        className="space-y-8"
        style={{ opacity: refreshing ? 0.92 : 1 }}
        aria-busy={refreshing}
        aria-label="Group settlement"
      >
        {error ? (
          <p className="text-sm" style={{ color: colors.error }} role="alert">
            {error}
          </p>
        ) : null}

        <div>
          <h2 className="text-2xl font-semibold" style={{ color: tripStitchTheme.primary }}>
            Group Settlement
          </h2>
          <p className="mt-1 text-sm" style={{ color: tripStitchTheme.onSurfaceVariant }}>
            Manage balances and contributions for the crew.
          </p>
        </div>

        <section
          className="relative overflow-hidden rounded-[24px] border border-white/5 p-6"
          style={{
            background: tripStitchTheme.surfaceContainerHigh,
            boxShadow: "0 10px 40px rgba(255, 122, 61, 0.15)",
          }}
        >
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#ffb598]/10 blur-[80px]" />
          <div className="relative z-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: tripStitchTheme.onSurfaceVariant }}>
                Total Expenses
              </span>
              <span className="text-2xl font-semibold" style={{ color: tripStitchTheme.onSurface }}>
                {formatMinor(data.total_expenses_minor ?? 0, currency)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: tripStitchTheme.onSurfaceVariant }}>
                Total Paid
              </span>
              <span className="text-2xl font-semibold" style={{ color: tripStitchTheme.primary }}>
                {formatMinor(data.total_paid_minor ?? 0, currency)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: tripStitchTheme.onSurfaceVariant }}>
                Pending
              </span>
              <span className="text-2xl font-semibold" style={{ color: tripStitchTheme.tertiary }}>
                {formatMinor(pending, currency)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: tripStitchTheme.onSurfaceVariant }}>
                Unsettled
              </span>
              <span className="text-2xl font-semibold" style={{ color: tripStitchTheme.error }}>
                {formatMinor(unsettled, currency)}
              </span>
            </div>
          </div>
          <div className="relative z-10 mt-8 flex flex-wrap items-center gap-6 border-t border-white/10 pt-6">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: tripStitchTheme.surfaceContainerHigh }}
              >
                <Scale size={16} style={{ color: tripStitchTheme.onSurfaceVariant }} aria-hidden />
              </div>
              <span className="text-sm" style={{ color: tripStitchTheme.onSurfaceVariant }}>
                Split Method:{" "}
                <span style={{ color: tripStitchTheme.onSurface }}>{splitMethodLabel(data.split_method)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: tripStitchTheme.onSurfaceVariant }}>
                Members:{" "}
                <span style={{ color: tripStitchTheme.onSurface }}>
                  {data.members_count ?? contributions.length}
                </span>
              </span>
            </div>
          </div>
          {data.status_line ? (
            <p className="relative z-10 mt-4 text-sm" style={{ color: tripStitchTheme.onSurfaceVariant }}>
              {data.status_line}
            </p>
          ) : null}
        </section>

        <section>
          <h3 className="mb-6 text-2xl font-semibold" style={{ color: tripStitchTheme.onSurface }}>
            Member Contributions
          </h3>
          {!hasAnyMoney || contributions.length === 0 ? (
            <p className="text-sm" style={{ color: tripStitchTheme.onSurfaceVariant }}>
              No contributions yet — log an expense to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {contributions.map((row) => {
                const cur = row.currency_code || currency;
                const label = contributionLabel(row.status, row.net_minor, cur);
                const expected = row.expected_minor ?? row.owed_minor ?? 0;
                return (
                  <div
                    key={row.user_id}
                    className="flex items-center justify-between rounded-xl border border-white/5 p-4"
                    style={{ background: tripStitchTheme.surfaceContainer }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold"
                        style={{
                          background: `${tripStitchTheme.primary}20`,
                          color: tripStitchTheme.primary,
                          border: `1px solid ${tripStitchTheme.primary}33`,
                        }}
                      >
                        {initialOf(row.display_name)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium" style={{ color: tripStitchTheme.onSurface }}>
                          {row.display_name}
                        </h4>
                        <p className="text-xs" style={{ color: tripStitchTheme.onSurfaceVariant }}>
                          Paid {formatMinor(row.paid_minor, cur)} · Expected {formatMinor(expected, cur)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-medium" style={{ color: label.color }}>
                        {label.amount}
                      </span>
                      <span className="text-xs" style={{ color: `${label.color}99` }}>
                        {label.caption}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-6 text-2xl font-semibold" style={{ color: tripStitchTheme.onSurface }}>
            Settlement Suggestions
          </h3>
          {suggestions.length === 0 ? (
            <p className="text-sm" style={{ color: tripStitchTheme.onSurfaceVariant }}>
              Everyone is settled up.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {suggestions.map((s, i) => {
                const key = `${s.from_user_id}:${s.to_user_id}:${s.amount_minor}:${i}`;
                const busy = busyKey === key;
                return (
                  <div
                    key={key}
                    className="flex flex-col justify-between rounded-[24px] border border-white/10 p-6"
                    style={{ background: "rgba(255, 255, 255, 0.05)" }}
                  >
                    <div className="mb-6 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                          style={{ background: tripStitchTheme.surfaceContainerHigh, color: tripStitchTheme.error }}
                        >
                          {initialOf(s.from_display_name)}
                        </div>
                        <span className="text-sm font-medium" style={{ color: tripStitchTheme.onSurface }}>
                          {s.from_display_name}
                        </span>
                      </div>
                      <ArrowRight size={18} style={{ color: tripStitchTheme.onSurfaceVariant }} aria-hidden />
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                          style={{ background: tripStitchTheme.surfaceContainerHigh, color: tripStitchTheme.primary }}
                        >
                          {initialOf(s.to_display_name)}
                        </div>
                        <span className="text-sm font-medium" style={{ color: tripStitchTheme.onSurface }}>
                          {s.to_display_name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <span
                          className="mb-1 block text-[12px] font-medium uppercase tracking-wider"
                          style={{ color: tripStitchTheme.onSurfaceVariant }}
                        >
                          Amount
                        </span>
                        <span className="text-2xl font-semibold" style={{ color: tripStitchTheme.onSurface }}>
                          {formatMinor(s.amount_minor, s.currency_code || currency)}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={busy || busyKey === "restore"}
                        aria-label={`Mark as paid: ${s.from_display_name} to ${s.to_display_name}`}
                        className="rounded-full px-6 py-2 text-sm font-medium uppercase transition active:scale-95 disabled:opacity-50"
                        style={{
                          background: tripStitchTheme.primary,
                          color: tripStitchTheme.onPrimary,
                        }}
                        onClick={() => void handleMarkPaid(s)}
                      >
                        {busy ? "Saving…" : "Mark as Paid"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <button
          type="button"
          disabled={busyKey === "restore" || Boolean(busyKey)}
          aria-label="Restore crew balance"
          className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
          style={{ background: tripStitchTheme.primaryContainer, color: tripStitchTheme.onPrimary }}
          onClick={() => void handleRestore()}
        >
          <RefreshCw size={16} aria-hidden />
          {busyKey === "restore" ? "Restoring…" : "Restore Crew Balance"}
        </button>
      </div>
    );
  })();

  if (onBack) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{
          background: tripStitchTheme.background,
          color: tripStitchTheme.onSurface,
          fontFamily: tripStitchTheme.fontFamily,
        }}
      >
        <header
          className="relative z-10 flex items-center gap-4 border-b border-white/10 px-6 py-4"
          style={{ background: `${tripStitchTheme.background}cc` }}
        >
          <button
            type="button"
            onClick={onBack}
            className="rounded-full p-2 transition hover:bg-white/5"
            aria-label="Back"
          >
            <ArrowLeft size={22} style={{ color: tripStitchTheme.primary }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: tripStitchTheme.onSurface }}>
            {data?.trip_name || "Group Settlement"}
          </h1>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{body}</div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: colors.surfaceContainer, fontFamily: tripStitchTheme.fontFamily }}
    >
      {body}
    </div>
  );
}
