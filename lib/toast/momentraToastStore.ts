"use client";

/**
 * Imperative Momentra toast store — one toast at a time.
 * Host subscribes via useSyncExternalStore; call showToast / dismissToast from anywhere.
 */

export type ToastTone = "success" | "error" | "warning" | "info" | "loading";

export type ToastInput = {
  message: string;
  tone?: ToastTone;
  /** 0 = sticky (loading). Defaults by tone. */
  durationMs?: number;
  id?: string;
};

export type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
  durationMs: number;
};

type Listener = () => void;

let current: ToastItem | null = null;
const listeners = new Set<Listener>();
let dismissTimer: ReturnType<typeof setTimeout> | null = null;

function defaultDuration(tone: ToastTone): number {
  switch (tone) {
    case "error":
    case "warning":
      return 4000;
    case "loading":
      return 0;
    case "info":
      return 3500;
    case "success":
    default:
      return 2500;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function clearTimer() {
  if (dismissTimer != null) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
}

export function getToastSnapshot(): ToastItem | null {
  return current;
}

export function subscribeToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function showToast(input: ToastInput | string): string {
  const normalized: ToastInput =
    typeof input === "string" ? { message: input, tone: "success" } : input;
  const message = normalized.message.trim();
  if (!message) return "";

  const tone = normalized.tone ?? "success";
  const durationMs = normalized.durationMs ?? defaultDuration(tone);
  const id = normalized.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  clearTimer();
  current = { id, message, tone, durationMs };
  emit();

  if (durationMs > 0) {
    dismissTimer = setTimeout(() => {
      if (current?.id === id) {
        current = null;
        emit();
      }
    }, durationMs);
  }

  return id;
}

export function dismissToast(id?: string) {
  if (!current) return;
  if (id && current.id !== id) return;
  clearTimer();
  current = null;
  emit();
}

/** Convenience helpers */
export const toast = {
  show: showToast,
  dismiss: dismissToast,
  success: (message: string, durationMs?: number) =>
    showToast({ message, tone: "success", durationMs }),
  error: (message: string, durationMs?: number) =>
    showToast({ message, tone: "error", durationMs }),
  warning: (message: string, durationMs?: number) =>
    showToast({ message, tone: "warning", durationMs }),
  info: (message: string, durationMs?: number) =>
    showToast({ message, tone: "info", durationMs }),
  loading: (message: string, id?: string) =>
    showToast({ message, tone: "loading", durationMs: 0, id }),
};
