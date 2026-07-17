"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import {
  neuralLineBackground,
  personalGlassCardStyle,
  personalGlowWrapperStyle,
  personalTypography,
} from "@/components/personal/empty/shared/emptyStyles";
import type { PersonalLifestylePulseMetrics } from "@/lib/api/personal";
import { lifestylePulseCopy } from "@/lib/personal/lifestyle/pulse/lifestylePulseCopy";
import { Activity, TrendingUp } from "lucide-react";

type Props = {
  metrics: PersonalLifestylePulseMetrics;
};

function VitalityArc({ percent, size = 224 }: { percent: number; size?: number }) {
  const tokens = useThemeTokens();
  const { colors } = tokens;
  const r = 44;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r={r} fill="none" stroke={`${colors.surfaceContainer}`} strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={colors.brandPrimary}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ filter: "drop-shadow(0 0 12px rgba(108,78,242,0.6))" }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Current Score</span>
        <span className="text-3xl font-bold">{percent}%</span>
      </div>
    </div>
  );
}

export function LifestyleVitalityHero({ metrics }: Props) {
  const tokens = useThemeTokens();
  const { colors } = tokens;
  const statusLabel = lifestylePulseCopy.statusBands[metrics.status_band] ?? metrics.status_band;

  return (
    <section style={personalGlowWrapperStyle(tokens)}>
      <div
        style={{
          ...personalGlassCardStyle(tokens),
          ...neuralLineBackground(),
          borderRadius: 20,
          padding: 20,
          minHeight: 440,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
              {lifestylePulseCopy.vitalityTitle}
            </h2>
            <div className="flex items-baseline gap-1">
              <span className="text-[42px] font-bold leading-none">{metrics.vitality_index}</span>
              <span className="text-lg font-semibold opacity-40">{lifestylePulseCopy.vitalitySuffix}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5" style={{ color: colors.tertiary }}>
              <TrendingUp size={20} />
              <span className="text-sm font-semibold">{statusLabel}</span>
              {metrics.vitality_delta_month != null && metrics.vitality_delta_month !== 0 ? (
                <span className="ml-1 text-[11px] opacity-60">↑ {metrics.vitality_delta_month} this month</span>
              ) : null}
            </div>
          </div>
          <div
            className="flex size-12 items-center justify-center rounded-full"
            style={{ background: `${colors.brandPrimary}1a` }}
          >
            <Activity size={24} color={colors.brandPrimary} fill={colors.brandPrimary} />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-4">
          <VitalityArc percent={metrics.vitality_index} />
        </div>

        <div
          className="mt-6 grid grid-cols-2 gap-4 border-t pt-6"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          {[
            { label: lifestylePulseCopy.statSpend, value: lifestylePulseCopy.formatInrMinor(metrics.capacity.lifestyle_spend_minor) },
            { label: lifestylePulseCopy.statExperiences, value: metrics.capacity.experience_count },
            { label: lifestylePulseCopy.statDiscoveries, value: metrics.capacity.discovery_count },
            { label: lifestylePulseCopy.statCreative, value: metrics.capacity.creative_session_count },
          ].map((stat) => (
            <div key={stat.label}>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-40">{stat.label}</span>
              <div className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
