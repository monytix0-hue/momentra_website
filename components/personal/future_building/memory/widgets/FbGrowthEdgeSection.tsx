"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { personalGlassCardStyle, personalTypography } from "@/components/personal/empty/shared/emptyStyles";
import type { PersonalLifeOpsGrowthEdge } from "@/lib/api/personal";
import { fbMemoryCopy } from "@/lib/personal/future_building/memory/fbMemoryCopy";
import { TrendingUp } from "lucide-react";

type Props = { edge: PersonalLifeOpsGrowthEdge };

export function FbGrowthEdgeSection({ edge }: Props) {
  const tokens = useThemeTokens();
  const { colors } = tokens;

  return (
    <section
      className="mb-8 rounded-2xl border-l-4 p-6"
      style={{
        ...personalGlassCardStyle(tokens),
        borderLeftColor: colors.brandPrimary,
        background: `linear-gradient(135deg, ${colors.brandPrimary}0d, transparent)`,
      }}
    >
      <span style={{ ...personalTypography.labelSm, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.7, display: "block", marginBottom: 16 }}>
        {fbMemoryCopy.sections.growthEdge}
      </span>
      <div className="flex items-start gap-5">
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-full shadow-lg"
          style={{ background: colors.primaryContainer, boxShadow: `0 0 16px ${colors.brandPrimary}33` }}
        >
          <TrendingUp size={28} color="#fff" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>{edge.title}</h3>
          <p style={{ ...personalTypography.bodyMd, fontSize: 12, color: colors.textSecondary, marginBottom: 16 }}>{edge.body}</p>
          {edge.cta_label ? (
            <span style={{ fontSize: 12, fontWeight: 700, color: colors.brandPrimary }}>{edge.cta_label}</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
