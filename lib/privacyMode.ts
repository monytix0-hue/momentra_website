"use client";

import { useSyncExternalStore } from "react";
import { getBootstrap, subscribeBootstrap } from "@/stores/bootstrapStore";

/** True when the user enabled privacy mode (amounts should be masked). */
export function getPrivacyModeEnabled(): boolean {
  return Boolean(getBootstrap()?.personal_preferences?.privacy_mode_enabled);
}

export function usePrivacyModeEnabled(): boolean {
  return useSyncExternalStore(
    subscribeBootstrap,
    getPrivacyModeEnabled,
    () => false,
  );
}

/** Mask a formatted money string when privacy mode is on. */
export function maybeMaskMoney(
  formatted: string,
  privacyEnabled = getPrivacyModeEnabled(),
): string {
  if (!privacyEnabled) return formatted;
  return "••••";
}

export function formatMoneyWithPrivacy(
  amountMinor: number,
  currencyCode: string,
  locale: string,
  privacyEnabled = getPrivacyModeEnabled(),
): string {
  if (privacyEnabled) return "••••";
  try {
    const major = amountMinor / 100;
    return new Intl.NumberFormat(locale || "en-IN", {
      style: "currency",
      currency: currencyCode || "INR",
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${currencyCode} ${(amountMinor / 100).toFixed(2)}`;
  }
}
