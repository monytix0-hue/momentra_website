"use client";

import { useState } from "react";
import { ArrowRight, Home, Mountain, ShoppingBag, X } from "lucide-react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { groupGlassCardStyle } from "@/components/group/empty/shared/emptyStyles";
import { groupTypography } from "@/lib/group/groupTypography";

type CreateEmptyProps = {
  onCreateMoment: () => void;
  onSharedExperience?: () => void;
  onSharedLiving?: () => void;
  onSharedPurchase?: () => void;
  onClose: () => void;
};

type CategoryTile = {
  title: string;
  description: string;
  image: string;
  cta: string;
  type: "SHARED_EXPERIENCE" | "SHARED_PURCHASE" | "SHARED_LIVING" | null;
  comingSoon?: boolean;
  wide?: boolean;
  accent: string;
};

const categoryTiles: CategoryTile[] = [
  {
    title: "Shared Experience",
    description: "Trips, weddings, celebrations, outings and events.",
    image: "/group/type-experience.jpg",
    cta: "Start Shared Experience",
    type: "SHARED_EXPERIENCE",
    wide: true,
    accent: "#FFB598",
  },
  {
    title: "Shared Purchase",
    description: "Group purchases, gifts and shared ownership.",
    image: "/group/type-purchase.jpg",
    cta: "Start a Purchase",
    type: "SHARED_PURCHASE",
    accent: "#FFB690",
  },
  {
    title: "Shared Living",
    description: "Households, families and shared living.",
    image: "/group/type-living.jpg",
    cta: "Start a Home",
    type: "SHARED_LIVING",
    accent: "#FFB951",
  },
  {
    title: "Shared Goal",
    description: "Savings goals, fundraising and milestones.",
    image: "/group/type-goal.jpg",
    cta: "Coming Soon",
    type: null,
    comingSoon: true,
    accent: "#FFB598",
  },
  {
    title: "Community Coordination",
    description: "Gatherings, clubs and community events.",
    image: "/group/type-community.jpg",
    cta: "Coming Soon",
    type: null,
    comingSoon: true,
    wide: true,
    accent: "#FFB598",
  },
];

export function CreateEmpty({
  onSharedExperience,
  onSharedLiving,
  onSharedPurchase,
  onClose,
}: CreateEmptyProps) {
  const tokens = useThemeTokens();
  const { colors, gradients } = tokens;
  const [selectedType, setSelectedType] = useState<string | null>(null);

  function selectType(type: CategoryTile["type"]) {
    if (!type) return;
    setSelectedType(type);
    if (type === "SHARED_EXPERIENCE") onSharedExperience?.();
    else if (type === "SHARED_PURCHASE") onSharedPurchase?.();
    else if (type === "SHARED_LIVING") onSharedLiving?.();
  }

  return (
    <div
      data-momentra-context="group"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      style={{ background: colors.background, color: colors.textPrimary, fontFamily: groupTypography.display.fontFamily }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full"
        style={{ background: `color-mix(in srgb, ${colors.surfaceContainer} 90%, transparent)` }}
      >
        <X className="size-5" />
      </button>

      <div className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-16 md:px-16">
        <section className="grid grid-cols-1 items-center gap-8 py-8 md:grid-cols-2 md:gap-12 md:py-12">
          <div className="order-2 md:order-1">
            <h2
              className="mb-4 text-[28px] font-bold leading-9 tracking-tight md:text-[40px] md:leading-[1.15]"
              style={{ fontFamily: groupTypography.display.fontFamily }}
            >
              What would you like to create together?
            </h2>
            <p className="mb-8 max-w-lg text-base opacity-80 md:text-lg" style={{ color: colors.textSecondary }}>
              Choose the kind of shared journey you want to start. Coordinate together, manage money, and keep memories
              in one place.
            </p>
            <button
              type="button"
              onClick={() => selectType("SHARED_EXPERIENCE")}
              className="rounded-2xl px-8 py-4 text-sm font-semibold uppercase tracking-widest transition-transform active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${gradients.heroStart} 0%, ${gradients.heroEnd} 100%)`,
                color: colors.brandOnPrimary,
                boxShadow: "0 10px 40px rgba(255, 122, 61, 0.15)",
              }}
            >
              Start Shared Experience
            </button>
          </div>
          <div className="order-1 relative aspect-[4/3] overflow-hidden rounded-3xl md:order-2">
            <img
              src="/group/create-hero.jpg"
              alt=""
              className="size-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, color-mix(in srgb, ${colors.background} 90%, transparent) 0%, transparent 60%)`,
              }}
            />
            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3">
              <div
                className="flex size-10 items-center justify-center rounded-lg border"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderColor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Mountain className="size-5" style={{ color: colors.brandPrimary }} />
              </div>
              <span className="text-sm font-medium">Join others planning shared moments today</span>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {categoryTiles.map((tile) => {
            const selected = tile.type != null && selectedType === tile.type;
            const enabled = !tile.comingSoon;
            return (
              <button
                key={tile.title}
                type="button"
                disabled={!enabled}
                onClick={() => selectType(tile.type)}
                className={`group relative h-[280px] overflow-hidden rounded-3xl border text-left transition-all duration-200 md:h-[300px] ${
                  tile.wide ? "md:col-span-2" : ""
                } ${enabled ? "hover:-translate-y-1" : "cursor-not-allowed opacity-80"}`}
                style={{
                  borderColor: selected
                    ? `color-mix(in srgb, ${colors.primaryContainer} 50%, transparent)`
                    : "rgba(255,255,255,0.05)",
                  boxShadow: selected ? "0 10px 40px rgba(255, 122, 61, 0.15)" : undefined,
                }}
              >
                <img
                  src={tile.image}
                  alt=""
                  className={`absolute inset-0 size-full object-cover transition-transform duration-500 ${
                    enabled ? "group-hover:scale-105" : "opacity-60"
                  }`}
                />
                <div
                  className="absolute inset-0 transition-colors"
                  style={{
                    background: tile.comingSoon
                      ? "rgba(0,0,0,0.6)"
                      : "linear-gradient(to top, rgba(19,19,19,0.92) 0%, rgba(19,19,19,0.25) 55%, transparent 100%)",
                  }}
                />
                {tile.comingSoon ? (
                  <span
                    className="absolute right-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-semibold"
                    style={{
                      background: `color-mix(in srgb, ${colors.surfaceContainerHigh} 80%, transparent)`,
                      color: colors.textSecondary,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    Coming Soon
                  </span>
                ) : null}
                <div className="relative flex h-full flex-col justify-end p-5">
                  <div
                    className="mb-3 flex size-10 items-center justify-center rounded-xl"
                    style={{
                      background: tile.comingSoon
                        ? `color-mix(in srgb, ${colors.primaryContainer} 30%, transparent)`
                        : colors.primaryContainer,
                    }}
                  >
                    {tile.type === "SHARED_PURCHASE" ? (
                      <ShoppingBag className="size-5" style={{ color: colors.brandOnPrimary }} />
                    ) : tile.type === "SHARED_LIVING" ? (
                      <Home className="size-5" style={{ color: colors.brandOnPrimary }} />
                    ) : (
                      <Mountain className="size-5" style={{ color: colors.brandOnPrimary }} />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold">{tile.title}</h3>
                  <p className="mt-1 text-sm opacity-80" style={{ color: colors.textSecondary }}>
                    {tile.description}
                  </p>
                  {enabled ? (
                    <span
                      className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
                      style={{
                        borderColor: `color-mix(in srgb, ${tile.accent} 30%, transparent)`,
                        background: `color-mix(in srgb, ${tile.accent} 20%, transparent)`,
                        color: tile.accent,
                      }}
                    >
                      <ArrowRight className="size-3.5" />
                      {tile.cta}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </section>

        <div className="mt-8 rounded-2xl p-5" style={groupGlassCardStyle(tokens)}>
          <h3 className="font-semibold">Not sure where to start?</h3>
          <p className="mt-2 text-sm opacity-80" style={{ color: colors.textSecondary }}>
            Describe your moment and Momentra will recommend the best shared type when setup opens.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled
              className="flex-1 cursor-not-allowed rounded-xl py-3 text-sm font-semibold opacity-60"
              style={{ background: colors.primaryContainer, color: colors.brandOnPrimary }}
            >
              Describe My Moment
            </button>
            <button
              type="button"
              disabled
              className="flex-1 cursor-not-allowed rounded-xl border py-3 text-sm font-semibold opacity-60"
              style={{ borderColor: `color-mix(in srgb, ${colors.border} 30%, transparent)` }}
            >
              Browse Examples
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
