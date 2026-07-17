"use client";

import { ArrowRight, ChevronRight, Loader2, Sparkles, X } from "lucide-react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { glassCardStyle } from "@/components/personal/empty/shared/emptyStyles";
import type { PersonalCreateOptionsResponse } from "@/lib/api/personal";
import {
  PERSONAL_CREATE_HERO_IMAGE,
  createCardImageForType,
} from "@/lib/personal/empty/create/createAssets";
import type { PersonalMomentTypeCode } from "@/lib/personal/personalMomentSession";

type CreateEmptyProps = {
  options: PersonalCreateOptionsResponse | null;
  loadingOptions: boolean;
  creatingTypeCode: PersonalMomentTypeCode | null;
  createError: string | null;
  onBeginMoment: (typeCode: PersonalMomentTypeCode) => void;
  onClose: () => void;
};

const LIFE_OPS_CODE: PersonalMomentTypeCode = "LIFE_OPERATIONS";

const FALLBACK_OTHER_TYPES: Array<{
  moment_type_code: PersonalMomentTypeCode;
  title: string;
  description: string;
}> = [
  {
    moment_type_code: "FUTURE_BUILDING",
    title: "Future Building",
    description: "Strategic planning for your long-term vision.",
  },
  {
    moment_type_code: "LIFESTYLE",
    title: "Lifestyle",
    description: "Design experiences that bring joy and adventure.",
  },
  {
    moment_type_code: "RELATIONSHIPS",
    title: "Relationships",
    description: "Deepening connections and fostering bonds.",
  },
];

export function CreateEmpty({
  options,
  loadingOptions,
  creatingTypeCode,
  createError,
  onBeginMoment,
  onClose,
}: CreateEmptyProps) {
  const tokens = useThemeTokens();
  const { colors, shadows } = tokens;

  const featured = options?.cards.find((c) => c.moment_type_code === LIFE_OPS_CODE);
  const heroImage =
    options?.featured_hero_image_url?.trim() || PERSONAL_CREATE_HERO_IMAGE;
  const heroTitle = featured?.moment_type_name ?? "Life Operations";
  const heroBadge = options?.hero_badge_label ?? "RECOMMENDED FIRST MOMENT";
  const heroSubtitle =
    options?.hero_subtitle ??
    "Choose the system that will guide this part of your life.";
  const heroCtaLabel = options?.cta_label ?? "Begin Journey";
  const otherCards =
    options?.cards.filter((c) => c.moment_type_code !== LIFE_OPS_CODE) ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      style={{ background: colors.background, color: colors.textPrimary }}
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

      <section className="relative min-h-[75dvh] w-full">
        <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent, color-mix(in srgb, ${colors.background} 30%, transparent), ${colors.background})`,
          }}
        />
        <div className="relative flex min-h-[75dvh] flex-col items-center justify-end px-5 pb-12 pt-16 text-center">
          <span
            className="mb-6 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest"
            style={{
              background: `color-mix(in srgb, ${colors.primaryContainer} 40%, transparent)`,
              color: colors.onPrimaryContainer,
              border: `1px solid color-mix(in srgb, ${colors.brandPrimary} 30%, transparent)`,
            }}
          >
            {heroBadge.toUpperCase()}
          </span>
          <h2 className="mb-4 text-[42px] font-bold leading-[48px] tracking-tight text-white">
            {heroTitle}
          </h2>
          <p className="mb-8 max-w-[280px] text-base opacity-90" style={{ color: colors.textSecondary }}>
            {heroSubtitle}
          </p>
          {createError ? (
            <p className="mb-4 text-sm" style={{ color: colors.error }}>
              {createError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => onBeginMoment(LIFE_OPS_CODE)}
            disabled={creatingTypeCode != null}
            className="flex w-full max-w-xs items-center justify-center gap-3 rounded-xl px-8 py-4 text-[17px] font-semibold transition-transform enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:opacity-60"
            style={{
              background: colors.primaryContainer,
              color: colors.brandOnPrimary,
              boxShadow: `0 10px 30px ${shadows.glowColor}`,
            }}
          >
            {creatingTypeCode === LIFE_OPS_CODE ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                {heroCtaLabel}
                <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-lg px-5 pb-12 pt-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-px flex-1 opacity-30" style={{ background: colors.border }} />
          <span
            className="whitespace-nowrap text-[11px] font-medium tracking-[0.2em] opacity-70"
            style={{ color: colors.textSecondary }}
          >
            {(options?.section_title ?? "OTHER MOMENT TYPES").toUpperCase()}
          </span>
          <div className="h-px flex-1 opacity-30" style={{ background: colors.border }} />
        </div>

        <div className="space-y-4">
          {(otherCards.length > 0
            ? otherCards.map((card) => ({
                key: card.moment_type_id,
                typeCode: card.moment_type_code as PersonalMomentTypeCode,
                title: card.moment_type_name,
                description: card.create_tagline ?? "",
                image:
                  card.background_image_url?.trim() ||
                  createCardImageForType(card.moment_type_code),
              }))
            : FALLBACK_OTHER_TYPES.map((type) => ({
                key: type.moment_type_code,
                typeCode: type.moment_type_code,
                title: type.title,
                description: type.description,
                image: createCardImageForType(type.moment_type_code),
              }))
          ).map((type) => (
            <button
              key={type.key}
              type="button"
              onClick={() => onBeginMoment(type.typeCode)}
              disabled={creatingTypeCode != null}
              className="flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-transform enabled:hover:scale-[1.01] enabled:active:scale-[0.98] disabled:opacity-60"
              style={glassCardStyle(tokens)}
            >
              <img
                src={type.image}
                alt=""
                className="size-16 shrink-0 rounded-xl object-cover shadow-lg"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-[17px] font-semibold">{type.title}</h4>
                <p className="text-xs leading-relaxed opacity-70" style={{ color: colors.textSecondary }}>
                  {type.description}
                </p>
              </div>
              {creatingTypeCode === type.typeCode ? (
                <Loader2 className="size-5 shrink-0 animate-spin opacity-70" />
              ) : (
                <ChevronRight className="size-5 shrink-0 opacity-60" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Sparkles className="mx-auto mb-3 size-5 opacity-60" style={{ color: colors.brandPrimary }} />
          <h5
            className="mb-2 text-[11px] font-medium tracking-[0.2em] opacity-80"
            style={{ color: colors.textSecondary }}
          >
            {(options?.footer_badge ?? "INTENTIONAL DESIGN").toUpperCase()}
          </h5>
          <p className="text-[13px] italic leading-relaxed opacity-60" style={{ color: colors.textSecondary }}>
            {options?.footer_quote ??
              "Every moment you create is a step toward your personal operating system's harmony."}
          </p>
        </div>
      </section>
    </div>
  );
}
