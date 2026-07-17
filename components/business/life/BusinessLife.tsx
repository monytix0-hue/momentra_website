"use client";

import {
  OPS_LIFE_SLICE_KEYS,
  RUNWAY_LIFE_SLICE_KEYS,
  TEAM_OPS_LIFE_SLICE_KEYS,
  type BusinessLifeResponse,
} from "@/lib/api/businessActive";
import {
  TeamOpsEmptyLine,
  TeamOpsScrollShell,
  TeamOpsStatusBanner,
} from "@/components/business/active/team-operations/shared/shared";
import {
  LmBandHero,
  LmDimensionChips,
  LmQuickActions,
  LmSignalCards,
  LmSliceCard,
  LmTimeline,
} from "@/components/business/life-memory/LifeMemoryStitchComponents";

type Props = {
  data: BusinessLifeResponse | null;
  loading: boolean;
  refreshing?: boolean;
  error: string | null;
  bottomPadding?: number;
  onRetry: () => void;
  onQuickAdd?: () => void;
  onCreateMoment?: () => void;
};

const LIFE_SLICE_KEYS = [
  ...TEAM_OPS_LIFE_SLICE_KEYS,
  ...RUNWAY_LIFE_SLICE_KEYS,
  ...OPS_LIFE_SLICE_KEYS,
] as const;

/** Shared Business Life — stitch chrome, real bands/slices only (no composite score). */
export function TeamOperationsLifeContribution({
  data,
  loading,
  refreshing,
  error,
  bottomPadding = 0,
  onRetry,
  onQuickAdd,
  onCreateMoment,
}: Props) {
  if (loading && !data) {
    return (
      <TeamOpsScrollShell bottomPadding={bottomPadding}>
        <TeamOpsStatusBanner loading refreshing={false} error={null} onRetry={onRetry} />
      </TeamOpsScrollShell>
    );
  }
  if (error && !data) {
    return (
      <TeamOpsScrollShell bottomPadding={bottomPadding}>
        <TeamOpsStatusBanner loading={false} error={error} onRetry={onRetry} />
      </TeamOpsScrollShell>
    );
  }
  if (!data) {
    return (
      <TeamOpsScrollShell bottomPadding={bottomPadding}>
        <TeamOpsEmptyLine label="No data" />
      </TeamOpsScrollShell>
    );
  }

  const signals = Array.isArray(data.signals) ? data.signals : [];
  const dimensions = Array.isArray(data.dimensions) ? data.dimensions : [];
  const journey = Array.isArray(data.journey) ? data.journey : [];
  const uniqueSliceKeys = Array.from(new Set(LIFE_SLICE_KEYS));

  let section = 2; // hero is always 1
  const signalsIndex = signals.length ? section++ : 0;
  const dimsIndex = dimensions.some((d) => d.count > 0 || (d.band && d.band !== "empty"))
    ? section++
    : 0;
  const sliceStart = section;
  const slicesWithData = uniqueSliceKeys.filter((key) => data.slices[key]);
  section += slicesWithData.length;
  const journeyIndex = journey.length ? section++ : 0;
  const actionsIndex = onQuickAdd || onCreateMoment ? section++ : 0;

  return (
    <TeamOpsScrollShell bottomPadding={bottomPadding}>
      {refreshing ? (
        <TeamOpsStatusBanner loading={false} refreshing error={null} onRetry={onRetry} />
      ) : null}

      <LmBandHero health={data.health} activeMomentCount={data.active_moment_count} />

      {signals.length > 0 && signalsIndex ? (
        <LmSignalCards signals={signals} sectionIndex={signalsIndex} />
      ) : null}

      {dimsIndex ? (
        <LmDimensionChips dimensions={dimensions} sectionIndex={dimsIndex} />
      ) : null}

      {slicesWithData.map((key, i) => {
        const slice = data.slices[key]!;
        return (
          <LmSliceCard
            key={key}
            index={sliceStart + i}
            title={slice.label || key}
            band={slice.band}
            count={slice.count}
            state={slice.state}
            items={slice.items ?? []}
          />
        );
      })}

      {journeyIndex ? (
        <LmTimeline items={journey} sectionIndex={journeyIndex} title="Business journey" />
      ) : null}

      {actionsIndex ? (
        <LmQuickActions
          sectionIndex={actionsIndex}
          onQuickAdd={onQuickAdd}
          onCreateMoment={onCreateMoment}
        />
      ) : null}
    </TeamOpsScrollShell>
  );
}

export function BusinessLife(props: Props) {
  return <TeamOperationsLifeContribution {...props} />;
}
