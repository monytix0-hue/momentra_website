/** Lightweight CTA analytics hook — ready for a vendor later. */

export type MarketingCtaEvent =
  | "start_a_moment"
  | "start_first_moment"
  | "open_app"
  | "explore_personal"
  | "explore_group"
  | "explore_business"
  | "read_the_book"
  | "see_how_moments_work";

declare global {
  interface Window {
    momentraMarketing?: {
      track?: (event: string, props?: Record<string, unknown>) => void;
    };
  }
}

export function trackMarketingCta(
  event: string,
  props?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  try {
    window.momentraMarketing?.track?.(event, props);
    window.dispatchEvent(
      new CustomEvent("momentra:cta", { detail: { event, ...props } }),
    );
  } catch {
    /* no-op */
  }
}
