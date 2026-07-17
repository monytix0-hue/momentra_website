"use client";

import { useEffect } from "react";
import { Brain } from "lucide-react";
import { GroupSkeletonBlocks } from "@/components/group/shared/skeleton/GroupSkeletonBlocks";
import { useGroupLivingMoments, useGroupMoments, useGroupPurchaseMoments } from "@/hooks/useGroupTabCache";
import type {
  LivingMomentsViewResponse,
  PurchaseMomentsViewResponse,
  TripMomentsViewResponse,
} from "@/lib/api/group";
import { ExperienceGlassCard } from "./ui/ExperienceGlassCard";
import { MaterialIcon } from "./ui/MaterialIcon";
import { SectionLabel, SunsetCta, ExperienceScrollShell } from "./ui/ExperienceUiParts";
import { tripStitchShellStyle, tripStitchTheme } from "./ui/tripStitchTheme";

type ActiveMemoryProps = {
  momentId: string;
  onQuickAdd?: () => void;
  bottomPadding?: number;
  reloadKey?: number;
  source?: "trip" | "purchase" | "living";
};

export function ActiveMemory({
  momentId,
  onQuickAdd,
  bottomPadding = 0,
  reloadKey = 0,
  source = "trip",
}: ActiveMemoryProps) {
  const isPurchase = source === "purchase";
  const isLiving = source === "living";
  const isTrip = !isPurchase && !isLiving;
  const tripHook = useGroupMoments(isTrip ? momentId : null, isTrip);
  const purchaseHook = useGroupPurchaseMoments(isPurchase ? momentId : null, isPurchase);
  const livingHook = useGroupLivingMoments(isLiving ? momentId : null, isLiving);
  const moments = (isPurchase ? purchaseHook.data : isLiving ? livingHook.data : tripHook.data) as
    | TripMomentsViewResponse
    | PurchaseMomentsViewResponse
    | LivingMomentsViewResponse
    | null
    | undefined;
  const loading = isPurchase ? purchaseHook.loading : isLiving ? livingHook.loading : tripHook.loading;
  const error = isPurchase ? purchaseHook.error : isLiving ? livingHook.error : tripHook.error;
  const reload = isPurchase ? purchaseHook.reload : isLiving ? livingHook.reload : tripHook.reload;

  useEffect(() => {
    if (reloadKey > 0) void reload();
  }, [reloadKey, reload]);

  if (loading && !moments) {
    return (
      <ExperienceScrollShell bottomPadding={bottomPadding}>
        <GroupSkeletonBlocks variant="memory" />
      </ExperienceScrollShell>
    );
  }

  if (error && !moments) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center" style={tripStitchShellStyle}>
        <Brain size={40} style={{ color: tripStitchTheme.onSurfaceVariant }} />
        <p className="mt-3 text-sm" style={{ color: tripStitchTheme.onSurfaceVariant }}>
          {error || "Unable to load this section."}
        </p>
        <button type="button" className="mt-3 text-sm font-semibold underline" onClick={() => void reload()}>
          Retry
        </button>
      </div>
    );
  }

  const hub = moments?.memory_hub;
  const fallbackName =
    moments && "trip_name" in moments && moments.trip_name
      ? moments.trip_name
      : moments && "moment_name" in moments
        ? moments.moment_name
        : "Untitled moment";
  const tripName = hub?.hero?.moment_name?.trim() || fallbackName;
  const chips = hub?.hero?.chips ?? [];
  const timeline = hub?.timeline ?? [];
  const milestones = hub?.milestone_wall ?? [];
  const people = hub?.people_impact ?? [];
  const gallery = hub?.gallery ?? [];
  const highlights = hub?.highlights ?? [];
  const intelligence = hub?.intelligence;
  const budget = hub?.budget_reflection;

  return (
    <ExperienceScrollShell bottomPadding={bottomPadding} style={tripStitchShellStyle}>
      <ExperienceGlassCard glow accentBorder="left" className="relative min-h-[280px] overflow-hidden">
        <div className="relative z-10 flex h-full flex-col justify-end">
          <h2 className="mb-4 text-4xl font-bold" style={{ color: tripStitchTheme.onSurface }}>
            {tripName}
          </h2>
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: `${tripStitchTheme.primary}22`, color: tripStitchTheme.primary }}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </ExperienceGlassCard>

      {intelligence?.insight ? (
        <ExperienceGlassCard>
          <SectionLabel icon="auto_awesome">Memory Intelligence</SectionLabel>
          <p className="text-sm leading-relaxed" style={{ color: tripStitchTheme.onSurface }}>
            {intelligence.insight}
          </p>
          <div className="mt-4 flex gap-6">
            {(intelligence.metrics ?? []).map((m) => (
              <div key={m.label}>
                <p
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: tripStitchTheme.onSurfaceVariant }}
                >
                  {m.label}
                </p>
                <p className="font-bold" style={{ color: tripStitchTheme.primary }}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </ExperienceGlassCard>
      ) : null}

      {timeline.length > 0 ? (
        <div>
          <SectionLabel action="VIEW ALL">Memory Timeline</SectionLabel>
          <ExperienceGlassCard>
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={item.event_id ?? item.title} className="flex items-center gap-3">
                  <MaterialIcon
                    name={item.is_complete || index === 0 ? "check_circle" : "radio_button_unchecked"}
                    style={{ color: tripStitchTheme.primary }}
                  />
                  <div>
                    <p className="font-semibold" style={{ color: tripStitchTheme.onSurface }}>
                      {item.title}
                    </p>
                    {item.date_label ? (
                      <p className="text-xs" style={{ color: tripStitchTheme.onSurfaceVariant }}>
                        {item.date_label}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </ExperienceGlassCard>
        </div>
      ) : null}

      {milestones.length > 0 ? (
        <div>
          <SectionLabel>Milestone Wall</SectionLabel>
          <div className="flex gap-4">
            {milestones.map((m) => (
              <div key={m.milestone_id ?? m.label} className="text-center">
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: tripStitchTheme.surfaceContainerHigh }}
                >
                  <MaterialIcon name={m.icon ?? "star"} style={{ color: tripStitchTheme.primary }} />
                </div>
                <p className="mt-2 text-xs" style={{ color: tripStitchTheme.onSurface }}>
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {people.length > 0 ? (
        <div>
          <SectionLabel>People Impact</SectionLabel>
          <ExperienceGlassCard>
            <div className="space-y-3">
              {people.map((person) => (
                <div key={person.display_name} className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: tripStitchTheme.surfaceContainerHigh }}
                  >
                    <MaterialIcon name="person" style={{ color: tripStitchTheme.primary }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: tripStitchTheme.onSurface }}>
                      {person.display_name}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: tripStitchTheme.primary }}
                    >
                      {person.impact_label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ExperienceGlassCard>
        </div>
      ) : null}

      {gallery.length > 0 ? (
        <div>
          <SectionLabel>Memory Gallery</SectionLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {gallery.slice(0, 4).map((item) => (
              <div
                key={item.memory_id ?? item.title}
                className="aspect-square rounded-xl"
                style={{ background: tripStitchTheme.surfaceContainerHigh }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {hub?.lessons_pattern ? (
        <ExperienceGlassCard>
          <p
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: tripStitchTheme.onSurfaceVariant }}
          >
            Lessons & Patterns
          </p>
          <p className="mt-2 italic" style={{ color: tripStitchTheme.onSurface }}>
            {hub.lessons_pattern}
          </p>
        </ExperienceGlassCard>
      ) : null}

      {hub?.group_identity ? (
        <ExperienceGlassCard>
          <p
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: tripStitchTheme.onSurfaceVariant }}
          >
            Group Identity
          </p>
          <p className="mt-2 text-xl font-bold" style={{ color: tripStitchTheme.onSurface }}>
            {hub.group_identity}
          </p>
        </ExperienceGlassCard>
      ) : null}

      {highlights.length > 0 ? (
        <div>
          <SectionLabel>Memory Highlights</SectionLabel>
          {highlights.map((h) => (
            <ExperienceGlassCard key={h.highlight_id ?? h.label} className="mb-3 !p-4">
              <p className="text-sm" style={{ color: tripStitchTheme.onSurface }}>
                {h.label}
              </p>
            </ExperienceGlassCard>
          ))}
        </div>
      ) : null}

      {budget ? (
        <ExperienceGlassCard>
          <p
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: tripStitchTheme.onSurfaceVariant }}
          >
            Budget Reflection
          </p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs" style={{ color: tripStitchTheme.onSurfaceVariant }}>
                Planned
              </p>
              <p style={{ color: tripStitchTheme.onSurface }}>{budget.planned_budget}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: tripStitchTheme.onSurfaceVariant }}>
                Actual
              </p>
              <p style={{ color: tripStitchTheme.primary }}>{budget.actual_spend}</p>
            </div>
          </div>
          <p className="mt-2 text-sm" style={{ color: tripStitchTheme.onSurface }}>
            Accuracy: {budget.budget_accuracy}
          </p>
          {budget.summary ? (
            <p className="mt-1 text-sm" style={{ color: tripStitchTheme.primary }}>
              {budget.summary}
            </p>
          ) : null}
        </ExperienceGlassCard>
      ) : null}

      <SunsetCta eyebrow="Add Memory" title="Preserve this moment" icon="add" onClick={onQuickAdd} />
    </ExperienceScrollShell>
  );
}
