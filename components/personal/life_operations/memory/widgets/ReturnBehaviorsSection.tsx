"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { PersonalGlassGlowSection } from "@/components/personal/empty/shared/PersonalGlassGlowSection";
import {
  memoryMicroLabelStyle,
  personalTypography,
} from "@/components/personal/empty/shared/emptyStyles";
import type { PersonalLifeOpsReturnBehaviors } from "@/lib/api/personal";
import { lifeOpsMemoryCopy, type PersonalMemoryCopy } from "@/lib/personal/life_operations/memory/lifeOpsMemoryCopy";

type Props = { copy?: PersonalMemoryCopy; behaviors?: PersonalLifeOpsReturnBehaviors | null };

export function ReturnBehaviorsSection({ behaviors, copy }: Props) {
  const tokens = useThemeTokens();
  const memoryCopy = copy ?? lifeOpsMemoryCopy;
  const { colors } = tokens;
  if (!behaviors) return null;

  return (
    <PersonalGlassGlowSection tokens={tokens} cornerRadius={16} innerStyle={{ padding: tokens.spacing.md }}>
      <p style={memoryMicroLabelStyle(tokens)}>{memoryCopy.sectionLabels.returnBehaviors}</p>
      <h3 style={{ ...personalTypography.sectionHeader, color: colors.textPrimary, marginTop: tokens.spacing.md }}>
        {behaviors.title}
      </h3>
      <p style={{ ...personalTypography.labelSm, color: colors.textSecondary }}>{behaviors.roi_label}</p>
      <div className="mt-3 flex h-24 items-end gap-2">
        {behaviors.bars.map((bar, i) => (
          <div
            key={bar.behavior_code}
            className="flex-1 rounded-t-lg"
            style={{
              height: `${Math.max(12, bar.height_fraction * 100)}%`,
              background: colors.brandPrimary,
              opacity: 1 - i * 0.2,
            }}
            title={bar.label}
          />
        ))}
      </div>
    </PersonalGlassGlowSection>
  );
}

