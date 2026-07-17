"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { personalGlassCardStyle, personalTypography } from "@/components/personal/empty/shared/emptyStyles";
import { fbPulseCopy } from "@/lib/personal/future_building/pulse/fbPulseCopy";
import { Brain } from "lucide-react";

type Props = { insightText: string; confidencePercent: number };

export function FbAiInsightSection({ insightText }: Props) {
  const tokens = useThemeTokens();
  const { colors } = tokens;

  return (
    <section
      className="relative"
      style={{
        ...personalGlassCardStyle(tokens),
        borderRadius: 20,
        padding: 16,
        border: `1px solid ${colors.brandPrimary}33`,
        boxShadow: `0 0 20px ${colors.brandPrimary}1a`,
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="relative flex size-12 items-center justify-center rounded-full"
          style={{ background: `${colors.brandPrimary}26`, border: `1px solid ${colors.brandPrimary}4d` }}
        >
          <Brain size={24} color={colors.brandPrimary} />
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full border opacity-20"
            style={{ borderColor: colors.brandPrimary }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h5 style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: colors.brandPrimary }}>
              {fbPulseCopy.aiInsightEngineTitle}
            </h5>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>
          <p style={{ ...personalTypography.bodyMd, fontSize: 12, fontStyle: "italic", opacity: 0.9 }}>&ldquo;{insightText}&rdquo;</p>
        </div>
      </div>
    </section>
  );
}
