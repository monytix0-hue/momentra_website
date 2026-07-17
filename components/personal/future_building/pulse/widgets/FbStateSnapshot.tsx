"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { personalGlassCardStyle, personalTypography } from "@/components/personal/empty/shared/emptyStyles";
import { ArcGauge } from "@/components/personal/life_operations/pulse/widgets/ArcGauge";
import { fbPulseCopy } from "@/lib/personal/future_building/pulse/fbPulseCopy";

type Gauge = { gauge_id: string; label: string; percent: number };

type Props = { gauges: Gauge[] };

export function FbStateSnapshot({ gauges }: Props) {
  const tokens = useThemeTokens();
  const { colors } = tokens;

  return (
    <section style={{ ...personalGlassCardStyle(tokens), borderRadius: 20, padding: 16, textAlign: "center" }}>
      <h3 style={{ ...personalTypography.sectionHeader, color: colors.textPrimary, marginBottom: 12 }}>{fbPulseCopy.stateGaugesTitle}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {gauges.map((gauge) => (
          <ArcGauge key={gauge.gauge_id} gaugeId={gauge.gauge_id} percent={gauge.percent} label={gauge.label} />
        ))}
      </div>
    </section>
  );
}
