"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { PersonalGlassGlowSection } from "@/components/personal/empty/shared/PersonalGlassGlowSection";
import {
  memoryMicroLabelStyle,
  personalTypography,
} from "@/components/personal/empty/shared/emptyStyles";
import type { PersonalLifeOpsGrowthEdge } from "@/lib/api/personal";
import { lifeOpsMemoryCopy, type PersonalMemoryCopy } from "@/lib/personal/life_operations/memory/lifeOpsMemoryCopy";

type Props = { copy?: PersonalMemoryCopy;  edge: PersonalLifeOpsGrowthEdge };

export function GrowthEdgeSection({ edge, copy }: Props) {
  const tokens = useThemeTokens();
  const memoryCopy = copy ?? lifeOpsMemoryCopy;
  const { colors } = tokens;

  return (
    <PersonalGlassGlowSection
      tokens={tokens}
      cornerRadius={16}
      innerStyle={{
        padding: tokens.spacing.lg,
        borderLeft: `4px solid ${colors.brandPrimary}`,
      }}
    >
      <p style={memoryMicroLabelStyle(tokens)}>{memoryCopy.sectionLabels.growthEdge}</p>
      <h3 style={{ ...personalTypography.screenTitle, color: colors.textPrimary, marginTop: 4 }}>{edge.title}</h3>
      <p style={{ ...personalTypography.bodyMd, color: colors.textSecondary, marginTop: tokens.spacing.sm }}>
        {edge.body}
      </p>
      <button
        type="button"
        className="mt-4 w-full rounded-2xl py-3 active:scale-[0.98]"
        style={{
          ...personalTypography.labelSm,
          fontWeight: 700,
          background: colors.brandPrimary,
          color: colors.brandOnPrimary ?? "#2f009c",
        }}
      >
        {edge.cta_label}
      </button>
    </PersonalGlassGlowSection>
  );
}

