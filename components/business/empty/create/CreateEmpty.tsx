"use client";

import { Loader2, X } from "lucide-react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { businessCardStyle } from "@/components/business/empty/shared/emptyStyles";
import type { BusinessCreateOptionCard, BusinessCreateOptionsResponse } from "@/lib/api/business";

type CreateEmptyProps = {
  options?: BusinessCreateOptionsResponse | null;
  onCreateMoment: (typeCode?: string) => void;
  onClose: () => void;
  /** Set while createDraft is in flight — shows Loading setup… and disables interaction. */
  creatingType?: string | null;
};

const CREATE_IMAGE_BY_TYPE: Record<string, string> = {
  TEAM_OPERATIONS: "/business/create-team.jpg",
  BUSINESS_RUNWAY: "/business/create-runway.jpg",
  BUSINESS_OPERATIONS: "/business/create-department.jpg",
  DEPARTMENT_OPERATIONS: "/business/create-department.jpg",
  PROJECT_OPERATIONS: "/business/create-project.jpg",
  EVENT_OPERATIONS: "/business/create-event.jpg",
  VENDOR_OPERATIONS: "/business/create-vendor.jpg",
  CUSTOM_OPERATIONAL_MOMENT: "/business/create-custom.jpg",
};

/** Fallback when API cards not yet loaded — v1 + gated unsupported only. */
const FALLBACK_CARDS: BusinessCreateOptionCard[] = [
  {
    moment_type_id: "fallback-team",
    moment_type_code: "TEAM_OPERATIONS",
    moment_type_name: "Team Operations",
    badge_label: "START HERE",
    create_tagline: "Align teams, track activities and execute together.",
    accent_main: "#5B5CEB",
    accent_soft_tint: "#E8EDFF",
    display_order: 1,
    is_available: true,
    implementation_status: "active",
  },
  {
    moment_type_id: "fallback-runway",
    moment_type_code: "BUSINESS_RUNWAY",
    moment_type_name: "Business Runway",
    badge_label: "MOST POPULAR",
    create_tagline: "Track cash, burn and runway to stay ahead.",
    accent_main: "#10B981",
    accent_soft_tint: "#D1FAE5",
    display_order: 2,
    is_available: true,
    implementation_status: "active",
  },
  {
    moment_type_id: "fallback-ops",
    moment_type_code: "BUSINESS_OPERATIONS",
    moment_type_name: "Business Operations",
    badge_label: "START HERE",
    create_tagline: "Run daily operations smoothly and improve efficiency.",
    accent_main: "#F97316",
    accent_soft_tint: "#FFEDD5",
    display_order: 3,
    is_available: true,
    implementation_status: "active",
  },
  {
    moment_type_id: "fallback-project",
    moment_type_code: "PROJECT_OPERATIONS",
    moment_type_name: "Project Operations",
    badge_label: "COMING SOON",
    accent_main: "#00CED1",
    accent_soft_tint: "#CFFAFE",
    display_order: 10,
    is_available: false,
    implementation_status: "coming_soon",
  },
  {
    moment_type_id: "fallback-event",
    moment_type_code: "EVENT_OPERATIONS",
    moment_type_name: "Event Operations",
    badge_label: "COMING SOON",
    accent_main: "#F59E0B",
    accent_soft_tint: "#FEF3C7",
    display_order: 11,
    is_available: false,
    implementation_status: "coming_soon",
  },
  {
    moment_type_id: "fallback-vendor",
    moment_type_code: "VENDOR_OPERATIONS",
    moment_type_name: "Vendor Operations",
    badge_label: "COMING SOON",
    accent_main: "#8B5CF6",
    accent_soft_tint: "#EDE9FE",
    display_order: 12,
    is_available: false,
    implementation_status: "coming_soon",
  },
  {
    moment_type_id: "fallback-custom",
    moment_type_code: "CUSTOM_OPERATIONAL_MOMENT",
    moment_type_name: "Custom Operational Moment",
    badge_label: "COMING SOON",
    accent_main: "#5B5CEB",
    accent_soft_tint: "#E8EDFF",
    display_order: 13,
    is_available: false,
    implementation_status: "coming_soon",
  },
];

const journeySteps = [
  { step: "1", title: "Select Moment", description: "Choose Team Operations, Runway, or Business Operations" },
  { step: "2", title: "Configure Setup", description: "Define scope and parameters" },
  { step: "3", title: "Go Live", description: "Start recording activity" },
  { step: "4", title: "Track Progress", description: "Monitor pulse and moments" },
  { step: "5", title: "Build Memory", description: "Intelligence compounds over time" },
] as const;

function createImageFor(typeCode: string): string {
  return CREATE_IMAGE_BY_TYPE[typeCode] ?? "/business/create-custom.jpg";
}

export function CreateEmpty({
  options,
  onCreateMoment,
  onClose,
  creatingType = null,
}: CreateEmptyProps) {
  const tokens = useThemeTokens();
  const { colors } = tokens;
  const creating = Boolean(creatingType);
  const cards =
    options?.cards && options.cards.length > 0
      ? [...options.cards].sort((a, b) => a.display_order - b.display_order)
      : FALLBACK_CARDS;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      style={{ background: colors.background, color: colors.textPrimary }}
      aria-busy={creating}
    >
      {creating ? (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
          style={{ background: `color-mix(in srgb, ${colors.background} 82%, transparent)` }}
          role="status"
          aria-live="polite"
        >
          <Loader2 className="size-8 animate-spin opacity-80" aria-hidden />
          <p className="text-sm font-medium">Loading setup…</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onClose}
        disabled={creating}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full disabled:opacity-50"
        style={{ background: colors.surfaceContainer }}
      >
        <X className="size-5" />
      </button>

      <div className="mx-auto w-full max-w-[1080px] px-5 pb-12 pt-16 md:px-20">
        <section className="mb-8 text-center">
          <h2 className="text-[32px] font-bold leading-9">Create Business Moment</h2>
          <p className="mx-auto mt-3 max-w-md text-sm opacity-80" style={{ color: colors.textSecondary }}>
            Choose what you want to run and Momentra will help you track, coordinate and improve it.
          </p>
          <p className="mt-2 text-xs opacity-60">You can create multiple operational moments later.</p>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cards.map((card) => {
            const available = card.is_available !== false && !creating;
            const wide = card.moment_type_code === "CUSTOM_OPERATIONAL_MOMENT";
            const image = createImageFor(card.moment_type_code);
            return (
              <button
                key={card.moment_type_code}
                type="button"
                disabled={!available}
                onClick={() => {
                  if (available) onCreateMoment(card.moment_type_code);
                }}
                className={`group relative overflow-hidden rounded-2xl text-left ${wide ? "md:col-span-2" : "h-40"} ${
                  available ? "hover:-translate-y-0.5" : "cursor-not-allowed"
                }`}
                style={{ minHeight: wide ? 120 : undefined }}
              >
                <img
                  src={image}
                  alt=""
                  className={`absolute inset-0 size-full object-cover transition-transform duration-500 ${
                    available ? "group-hover:scale-105" : "opacity-60"
                  }`}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: available
                      ? `linear-gradient(to top, color-mix(in srgb, ${colors.background} 92%, transparent), color-mix(in srgb, ${colors.background} 20%, transparent))`
                      : "rgba(0,0,0,0.55)",
                  }}
                />
                <div className="relative flex h-full min-h-[10rem] flex-col justify-between p-4">
                  <span className="text-[9px] font-bold tracking-widest opacity-80">
                    {card.badge_label ?? (card.is_available !== false ? "AVAILABLE" : "COMING SOON")}
                  </span>
                  <div>
                    <h3 className="font-semibold">{card.moment_type_name}</h3>
                    {card.create_tagline ? (
                      <p className="mt-1 text-xs opacity-80">{card.create_tagline}</p>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <section className="mt-8 rounded-2xl p-5" style={businessCardStyle(tokens)}>
          <h3 className="font-semibold">What Happens After Activation?</h3>
          <div className="mt-4 space-y-3">
            {journeySteps.map((step) => (
              <div key={step.title} className="flex gap-3">
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: "#5B5CEB", color: "#fff" }}
                >
                  {step.step}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs opacity-70">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={creating}
              onClick={() => onCreateMoment("TEAM_OPERATIONS")}
              className="flex-1 rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
              style={{ background: colors.primaryContainer, color: colors.brandOnPrimary }}
            >
              Continue Setup
            </button>
            <button
              type="button"
              disabled={creating}
              onClick={onClose}
              className="flex-1 rounded-xl border py-3 text-sm font-semibold disabled:opacity-50"
              style={{ borderColor: `color-mix(in srgb, ${colors.border} 30%, transparent)` }}
            >
              Explore Later
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
