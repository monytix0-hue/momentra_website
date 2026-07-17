"use client";

import { useMemo, useState } from "react";
import type { BusinessMemoryEvent, BusinessMemoryResponse } from "@/lib/api/businessActive";
import { MEMORY_BUCKET_LABELS, MEMORY_BUCKET_ORDER } from "@/lib/business/teamOpsApiMappers";
import {
  TeamOpsEmptyLine,
  TeamOpsScrollShell,
  TeamOpsStatusBanner,
} from "@/components/business/active/team-operations/shared/shared";
import {
  LmBucketSection,
  LmFilterChips,
  LmGlassCard,
  LmInsightCards,
  LmMemoryHero,
  LmNumberedHeader,
  LmPatternPills,
  LmQuickActions,
  LmTimeline,
  LmTimelineFeed,
} from "@/components/business/life-memory/LifeMemoryStitchComponents";
import { TEAM_OPS } from "@/components/business/active/team-operations/shared/teamOpsTheme";

type Props = {
  data: BusinessMemoryResponse | null;
  loading: boolean;
  refreshing?: boolean;
  error: string | null;
  bottomPadding?: number;
  onRetry: () => void;
  onQuickAdd?: () => void;
  onCreateMoment?: () => void;
};

function matchesFilter(
  event: BusinessMemoryEvent,
  filterKey: string,
  momentTypes: string[],
): boolean {
  if (filterKey === "all" || momentTypes.length === 0) return true;
  const t = (event.source_moment_type || "").toUpperCase().replace(/ /g, "_");
  return momentTypes.includes(t);
}

export function TeamOperationsMemoryContribution({
  data,
  loading,
  refreshing,
  error,
  bottomPadding = 0,
  onRetry,
  onQuickAdd,
  onCreateMoment,
}: Props) {
  const [filterKey, setFilterKey] = useState("all");

  const filters = data?.source_filters?.length
    ? data.source_filters
    : [{ key: "all", label: "All", moment_types: [] as string[] }];

  const activeFilter = filters.find((f) => f.key === filterKey) ?? filters[0];
  const momentTypes = activeFilter?.moment_types ?? [];

  const filteredEvents = useMemo(() => {
    const events = data?.events ?? [];
    return events.filter((e) => matchesFilter(e, activeFilter?.key ?? "all", momentTypes));
  }, [data?.events, activeFilter?.key, momentTypes]);

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

  const patterns = Array.isArray(data.patterns) ? data.patterns : [];
  const success = data.success_memory ?? [];
  const risk = data.risk_memory ?? [];
  const journey = data.journey ?? [];

  let n = 2; // hero is 1
  const timelineN = n++;
  const patternsN = patterns.length ? n++ : 0;
  const insightN = success.length || risk.length ? n++ : 0;
  const bucketKeys = MEMORY_BUCKET_ORDER.filter((key) => key in (data.buckets ?? {}));
  const bucketStart = n;
  n += bucketKeys.length;
  const journeyN = journey.length ? n++ : 0;
  const momentsN = data.moments?.length ? n++ : 0;
  const actionsN = onQuickAdd || onCreateMoment ? n++ : 0;

  return (
    <TeamOpsScrollShell bottomPadding={bottomPadding}>
      {refreshing ? (
        <TeamOpsStatusBanner loading={false} refreshing error={null} onRetry={onRetry} />
      ) : null}

      <LmFilterChips
        filters={filters}
        activeKey={activeFilter?.key ?? "all"}
        onChange={setFilterKey}
      />

      <LmMemoryHero
        summary={data.summary}
        activeMomentCount={data.active_moment_count}
        eventCount={data.events?.length ?? 0}
      />

      <LmTimelineFeed items={filteredEvents.slice(0, 40)} sectionIndex={timelineN} />

      {patternsN ? <LmPatternPills patterns={patterns} sectionIndex={patternsN} /> : null}

      {insightN ? (
        <LmInsightCards success={success} risk={risk} sectionIndex={insightN} />
      ) : null}

      {bucketKeys.map((key, i) => {
        const items = (data.buckets?.[key]?.items ?? []).filter((e) =>
          matchesFilter(e, activeFilter?.key ?? "all", momentTypes),
        );
        const label = MEMORY_BUCKET_LABELS[key] ?? key;
        return (
          <LmBucketSection
            key={key}
            index={bucketStart + i}
            title={label}
            items={items}
          />
        );
      })}

      {journeyN ? (
        <LmTimeline items={journey} sectionIndex={journeyN} title="Knowledge journey" />
      ) : null}

      {momentsN && data.moments?.length ? (
        <LmGlassCard>
          <LmNumberedHeader index={momentsN} title="Source moments" />
          <ul className="space-y-2">
            {data.moments.map((m) => (
              <li
                key={m.moment_id}
                className="rounded-xl border px-3 py-3 text-sm"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: `${TEAM_OPS.outline}22`,
                  color: TEAM_OPS.onSurface,
                }}
              >
                {m.moment_name || m.moment_type} · {m.status}
              </li>
            ))}
          </ul>
        </LmGlassCard>
      ) : null}

      {actionsN ? (
        <LmQuickActions
          sectionIndex={actionsN}
          onQuickAdd={onQuickAdd}
          onCreateMoment={onCreateMoment}
        />
      ) : null}
    </TeamOpsScrollShell>
  );
}

export function BusinessMemory(props: Props) {
  return <TeamOperationsMemoryContribution {...props} />;
}
