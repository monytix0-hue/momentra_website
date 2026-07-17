"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { fbPulseCopy } from "@/lib/personal/future_building/pulse/fbPulseCopy";
import { PULSE_LINE_PROPS } from "@/lib/personal/life_operations/pulse/pulseChartTheme";
import { LineChart } from "react-gifted-charts";

type Point = { date: string; value: number };

type FbTrendLineChartProps = {
  learning: Point[];
  execution: Point[];
  progress: Point[];
};

function toData(points: Point[]) {
  return points.map((p) => ({ value: p.value }));
}

export function FbTrendLineChart({ learning, execution, progress }: FbTrendLineChartProps) {
  const { colors } = useThemeTokens();
  const count = Math.max(learning.length, execution.length, progress.length, 1);
  const spacing = count > 1 ? Math.max(4, Math.floor(320 / (count - 1))) : 8;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3 text-[9px] font-bold uppercase tracking-widest opacity-70">
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3" style={{ background: colors.brandPrimary }} />
          {fbPulseCopy.trendsLearningLegend}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3 border border-dashed" style={{ borderColor: colors.brandSecondary }} />
          {fbPulseCopy.trendsExecutionLegend}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3" style={{ background: colors.brandTertiary }} />
          {fbPulseCopy.trendsProgressLegend}
        </span>
      </div>
      <div className="relative h-48 w-full">
        <LineChart
          data={toData(learning)}
          data2={toData(execution)}
          data3={toData(progress)}
          height={192}
          spacing={spacing}
          initialSpacing={0}
          endSpacing={0}
          thickness={2}
          color1={colors.brandPrimary}
          color2={colors.brandSecondary}
          color3={colors.brandTertiary}
          strokeDashArray2={[4, 3]}
          curved
          {...PULSE_LINE_PROPS}
        />
      </div>
    </div>
  );
}
