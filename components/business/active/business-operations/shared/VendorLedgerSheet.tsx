"use client";

import { useEffect, useState } from "react";
import type { VendorLedgerResponse } from "@/lib/api/businessActive";
import { formatMinorCurrency } from "@/lib/business/opsApiMappers";
import { BusinessActiveRepository } from "@/repositories/BusinessActiveRepository";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { OPS } from "./opsTheme";
import { formatOccurredAt } from "./opsTheme";

function statusLabel(status: string): string {
  switch (status) {
    case "paid_full":
      return "Paid completely";
    case "paid_partial":
      return "Partially paid";
    case "unpaid":
      return "Complete credit";
    default:
      return status.replace(/_/g, " ");
  }
}

function methodLabel(method: string): string {
  if (method === "upi") return "Online";
  if (method === "cash") return "Cash";
  if (method === "credit") return "Credit";
  return method;
}

export function VendorLedgerSheet({
  open,
  momentId,
  vendorName,
  onClose,
}: {
  open: boolean;
  momentId: string;
  vendorName: string | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ledger, setLedger] = useState<VendorLedgerResponse | null>(null);

  useEffect(() => {
    if (!open || !vendorName || !momentId) {
      setLedger(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const data = await BusinessActiveRepository.getVendorLedger(momentId, vendorName);
        if (!cancelled) setLedger(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load vendor ledger");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, momentId, vendorName]);

  const currency = ledger?.currency_code ?? "INR";

  return (
    <BottomSheet open={open} onClose={onClose} ariaLabelledBy="vendor-ledger-title">
      <div className="flex max-h-[85vh] flex-col gap-4 overflow-y-auto p-4" style={{ color: OPS.onSurface }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="vendor-ledger-title" className="text-lg font-semibold">
              {ledger?.vendor_name || vendorName || "Vendor"}
            </h2>
            {ledger && ledger.balance_due_minor > 0 ? (
              <p className="mt-1 text-sm font-medium" style={{ color: OPS.secondary }}>
                Balance due · {formatMinorCurrency(ledger.balance_due_minor, currency)}
              </p>
            ) : ledger ? (
              <p className="mt-1 text-sm" style={{ color: OPS.onVariant }}>
                Settled · no balance due
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm"
            style={{ background: OPS.surfaceHigh, color: OPS.onSurface }}
          >
            Close
          </button>
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: OPS.onVariant }}>
            Loading purchases…
          </p>
        ) : null}
        {error ? (
          <p className="text-sm" style={{ color: OPS.error }}>
            {error}
          </p>
        ) : null}

        {ledger ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Spent", ledger.total_spent_minor],
                ["Paid", ledger.total_paid_minor],
                ["Due", ledger.balance_due_minor],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-xl p-3"
                  style={{ background: OPS.surfaceLow }}
                >
                  <p className="text-[10px] uppercase" style={{ color: OPS.onVariant }}>
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatMinorCurrency(Number(value), currency)}
                  </p>
                </div>
              ))}
            </div>

            {ledger.months.length === 0 ? (
              <p className="text-sm" style={{ color: OPS.onVariant }}>
                No purchases recorded for this vendor yet.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {ledger.months.map((month) => (
                  <section key={month.month} className="space-y-2">
                    <div className="flex items-end justify-between gap-2">
                      <h3 className="text-sm font-semibold">{month.label}</h3>
                      <p className="text-[11px]" style={{ color: OPS.onVariant }}>
                        Spent {formatMinorCurrency(month.month_spent_minor, currency)}
                        {" · "}
                        Paid {formatMinorCurrency(month.month_paid_minor, currency)}
                        {month.month_due_minor > 0
                          ? ` · Due ${formatMinorCurrency(month.month_due_minor, currency)}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {month.items.map((item) => (
                        <div
                          key={item.spend_entry_id}
                          className="rounded-xl p-3"
                          style={{ background: OPS.surfaceLow }}
                        >
                          <p className="text-sm font-semibold">{item.title}</p>
                          <p className="mt-1 text-[11px]" style={{ color: OPS.onVariant }}>
                            Amount {formatMinorCurrency(item.amount_minor, currency)}
                            {" · "}
                            Paid {formatMinorCurrency(item.amount_paid_minor, currency)}
                            {" · "}
                            {statusLabel(item.payment_status)}
                          </p>
                          <p className="mt-0.5 text-[11px]" style={{ color: OPS.onVariant }}>
                            {methodLabel(item.payment_method)}
                            {" · "}
                            {formatOccurredAt(item.occurred_at || item.spend_date)}
                          </p>
                          {item.amount_due_minor > 0 ? (
                            <p className="mt-1 text-[11px] font-medium" style={{ color: OPS.secondary }}>
                              Balance due · {formatMinorCurrency(item.amount_due_minor, currency)}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </BottomSheet>
  );
}
