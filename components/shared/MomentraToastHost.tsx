"use client";

import { useEffect, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import {
  dismissToast,
  getToastSnapshot,
  showToast,
  subscribeToast,
  type ToastItem,
  type ToastTone,
  toast,
} from "@/lib/toast/momentraToastStore";

export type { ToastTone, ToastItem };
export { showToast, dismissToast, toast };

function toneIcon(tone: ToastTone) {
  switch (tone) {
    case "success":
      return CheckCircle2;
    case "error":
      return XCircle;
    case "warning":
      return AlertTriangle;
    case "loading":
      return Loader2;
    case "info":
    default:
      return Info;
  }
}

function MomentraToastView({ item }: { item: ToastItem }) {
  const { colors, radius } = useThemeTokens();
  const reduceMotion = useReducedMotion();
  const Icon = toneIcon(item.tone);

  const accent =
    item.tone === "success"
      ? colors.success
      : item.tone === "error"
        ? colors.error
        : item.tone === "warning"
          ? colors.warning
          : item.tone === "loading"
            ? colors.brandPrimary
            : colors.info ?? colors.brandPrimary;

  const surface = colors.surfaceContainerHigh ?? colors.surfaceElevated ?? colors.surface;
  const fg = colors.textPrimary;

  return (
    <motion.div
      role={item.tone === "error" ? "alert" : "status"}
      aria-live={item.tone === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      className="pointer-events-auto fixed left-1/2 z-[90] flex w-[min(92vw,420px)] -translate-x-1/2 items-center gap-3 border px-4 py-3 shadow-xl backdrop-blur-md"
      style={{
        bottom: "max(5.5rem, calc(env(safe-area-inset-bottom) + 4.5rem))",
        background: `${surface}f2`,
        borderColor: `${accent}55`,
        borderRadius: radius.pill,
        color: fg,
        boxShadow: `0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px ${accent}22`,
      }}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: `${accent}22`, color: accent }}
        aria-hidden
      >
        <Icon className={`size-5 ${item.tone === "loading" ? "animate-spin" : ""}`} />
      </span>
      <p className="flex-1 text-sm font-semibold leading-snug" style={{ color: fg }}>
        {item.message}
      </p>
      {item.tone !== "loading" ? (
        <button
          type="button"
          onClick={() => dismissToast(item.id)}
          aria-label="Dismiss"
          className="flex size-8 shrink-0 items-center justify-center rounded-full opacity-70 transition hover:opacity-100"
          style={{ color: fg }}
        >
          <X className="size-4" />
        </button>
      ) : null}
    </motion.div>
  );
}

/** Mount once under AppContextProvider (e.g. AuthGate). */
export function MomentraToastHost() {
  const item = useSyncExternalStore(subscribeToast, getToastSnapshot, () => null);

  return (
    <AnimatePresence mode="wait">
      {item ? <MomentraToastView key={item.id} item={item} /> : null}
    </AnimatePresence>
  );
}

/**
 * Back-compat presentational toast used by personal QA sheets.
 * Prefer imperative `toast.success(...)` / `showToast` for new call sites.
 */
export type AppToastTone = ToastTone;

export type AppToastProps = {
  message: string;
  tone?: ToastTone;
  open: boolean;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
};

export function AppToast({
  message,
  tone = "success",
  open,
  onDismiss,
  durationMs,
}: AppToastProps) {
  useEffect(() => {
    if (!open || !message.trim()) return;
    const id = showToast({ message, tone, durationMs });
    return () => {
      dismissToast(id);
    };
  }, [open, message, tone, durationMs]);

  // Sync local dismiss when store auto-clears
  const item = useSyncExternalStore(subscribeToast, getToastSnapshot, () => null);
  useEffect(() => {
    if (open && onDismiss && !item) {
      onDismiss();
    }
  }, [open, item, onDismiss]);

  return null;
}
