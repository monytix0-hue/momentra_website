"use client";

import { useEffect } from "react";
import { Image } from "lucide-react";
import { GroupSkeletonBlocks } from "@/components/group/shared/skeleton/GroupSkeletonBlocks";
import { useGroupLivingMoments, useGroupMoments, useGroupPurchaseMoments } from "@/hooks/useGroupTabCache";
import type {
  GroupMomentsStatTile,
  LivingMomentsViewResponse,
  PurchaseMomentsViewResponse,
  TripMomentsViewResponse,
} from "@/lib/api/group";
import { ExperienceGlassCard } from "./ui/ExperienceGlassCard";
import { MaterialIcon } from "./ui/MaterialIcon";
import { MetricTile, SectionLabel, ExperienceScrollShell } from "./ui/ExperienceUiParts";
import { tripStitchShellStyle, tripStitchTheme } from "./ui/tripStitchTheme";

type ActiveMomentsProps = {
  momentId: string;
  onQuickAdd?: () => void;
  bottomPadding?: number;
  reloadKey?: number;
  source?: "trip" | "purchase" | "living";
};

export function ActiveMoments({
  momentId,
  onQuickAdd,
  bottomPadding = 0,
  reloadKey = 0,
  source = "trip",
}: ActiveMomentsProps) {
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
        <GroupSkeletonBlocks variant="moments" />
      </ExperienceScrollShell>
    );
  }

  if (error && !moments) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center" style={tripStitchShellStyle}>
        <Image size={40} style={{ color: tripStitchTheme.onSurfaceVariant }} />
        <p className="mt-3 text-sm" style={{ color: tripStitchTheme.onSurfaceVariant }}>
          {error || "Unable to load this section."}
        </p>
        <button type="button" className="mt-3 text-sm font-semibold underline" onClick={() => void reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!moments) return null;

  const hub = moments.operations_hub;
  const displayName =
    "trip_name" in moments && moments.trip_name
      ? moments.trip_name
      : "moment_name" in moments
        ? moments.moment_name
        : "Untitled moment";
  const statTiles = heroStatTiles(moments);
  const eyebrow = hub.core_summary.eyebrow;

  return (
    <ExperienceScrollShell
      bottomPadding={bottomPadding}
      className="font-[family-name:var(--font-plus-jakarta)]"
      style={tripStitchShellStyle}
    >
      <ExperienceGlassCard glow accentBorder="left" className="relative overflow-hidden">
        <div className="relative z-10">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: tripStitchTheme.primary }}
              >
                {(eyebrow || (isPurchase ? "Shared Purchase" : isLiving ? "Shared Living" : "Shared Experience")).toUpperCase()}
              </span>
              <h2 className="text-2xl font-semibold" style={{ color: tripStitchTheme.onSurface }}>
                {displayName}
              </h2>
            </div>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-medium uppercase"
              style={{ background: `${tripStitchTheme.primary}33`, color: tripStitchTheme.primary }}
            >
              {moments.stage_badge}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {statTiles.map((tile) => (
              <MetricTile
                key={`${tile.label}-${tile.value}`}
                label={tile.label}
                value={tile.value}
                valueColor={tile.highlight ? tripStitchTheme.primary : undefined}
              />
            ))}
          </div>
        </div>
      </ExperienceGlassCard>

      <SectionLabel action="View all">People & Roles</SectionLabel>
      <ExperienceGlassCard>
        {hub.people_roles?.primary ? (
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: tripStitchTheme.surfaceContainerHigh }}
            >
              <MaterialIcon name="star" style={{ color: tripStitchTheme.primary }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: tripStitchTheme.onSurface }}>
                {hub.people_roles.primary.display_name}
              </p>
              <p
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: tripStitchTheme.primary }}
              >
                {hub.people_roles.primary.role_label}
              </p>
            </div>
          </div>
        ) : null}
        <div className="flex gap-4">
          {(hub.people_roles?.role_counts ?? []).map((role) => (
            <div
              key={role.label}
              className="rounded-full px-5 py-3 text-center"
              style={{ background: tripStitchTheme.surfaceContainerHigh }}
            >
              <p className="text-lg font-bold" style={{ color: tripStitchTheme.onSurface }}>
                {role.count}
              </p>
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: tripStitchTheme.onSurfaceVariant }}
              >
                {role.label}
              </p>
            </div>
          ))}
        </div>
      </ExperienceGlassCard>

      <SectionLabel action="View all">Money Status</SectionLabel>
      <ExperienceGlassCard>
        <p className="mb-3 text-sm" style={{ color: tripStitchTheme.onSurfaceVariant }}>
          {hub.money_status?.progress_label}
        </p>
        <div className="mb-4 h-2 overflow-hidden rounded-full" style={{ background: tripStitchTheme.surfaceContainerHigh }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${hub.money_status?.progress_percent ?? 0}%`, background: tripStitchTheme.primary }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(hub.money_status?.columns ?? []).map((col) => (
            <div key={col.label} className="text-center">
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: tripStitchTheme.onSurfaceVariant }}
              >
                {col.label}
              </p>
              <p
                className="font-semibold"
                style={{ color: col.highlight ? tripStitchTheme.primary : tripStitchTheme.onSurface }}
              >
                {col.value}
              </p>
            </div>
          ))}
        </div>
      </ExperienceGlassCard>

      <SectionLabel action="View all">Activity & Operations</SectionLabel>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(hub.activity_ops ?? []).map((tile) => (
          <ExperienceGlassCard key={tile.tile_id ?? tile.label} className="!p-4 text-center">
            <MaterialIcon name={tile.icon ?? "event"} style={{ color: tripStitchTheme.primary }} />
            <p className="mt-2 text-xl font-bold" style={{ color: tripStitchTheme.onSurface }}>
              {tile.value}
            </p>
            <p
              className="text-[10px] uppercase tracking-wider"
              style={{ color: tripStitchTheme.onSurfaceVariant }}
            >
              {tile.label}
            </p>
          </ExperienceGlassCard>
        ))}
      </div>

      {(hub.assets ?? []).length > 0 ? (
        <>
          <SectionLabel action="View all">Assets & Resources</SectionLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {hub.assets!.map((asset) => (
              <div key={asset.asset_id ?? asset.label} className="text-center">
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: tripStitchTheme.surfaceContainerHigh }}
                >
                  <MaterialIcon name={asset.icon ?? "folder"} style={{ color: tripStitchTheme.primary }} />
                </div>
                <p className="mt-2 text-[10px]" style={{ color: tripStitchTheme.onSurfaceVariant }}>
                  {asset.label}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {(hub.decisions ?? []).length > 0 ? (
        <>
          <SectionLabel action="VIEW ALL">Decisions & Governance</SectionLabel>
          <div className="space-y-3">
            {hub.decisions!.map((d) => (
              <ExperienceGlassCard key={d.decision_id ?? d.title} className="!p-4">
                <div className="flex items-center gap-3">
                  <MaterialIcon
                    name={d.icon ?? "how_to_vote"}
                    style={{ color: d.is_active ? tripStitchTheme.primary : tripStitchTheme.onSurfaceVariant }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: tripStitchTheme.onSurface }}>
                      {d.title}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-wider"
                      style={{
                        color: d.is_active ? tripStitchTheme.primary : tripStitchTheme.onSurfaceVariant,
                      }}
                    >
                      {d.status_label}
                    </p>
                  </div>
                </div>
              </ExperienceGlassCard>
            ))}
          </div>
        </>
      ) : null}

      <ExperienceGlassCard glow accentBorder="left">
        <h3 className="mb-2 text-lg font-bold" style={{ color: tripStitchTheme.onSurface }}>
          Current State Snapshot
        </h3>
        <p className="mb-4 text-sm" style={{ color: tripStitchTheme.onSurfaceVariant }}>
          Stage: {hub.current_state?.stage_label}
        </p>
        <ul className="mb-4 space-y-2">
          {(hub.current_state?.focus_items ?? []).map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm" style={{ color: tripStitchTheme.onSurface }}>
              <MaterialIcon
                name={item.is_complete ? "check_circle" : "radio_button_unchecked"}
                style={{
                  color: item.is_complete ? tripStitchTheme.primary : tripStitchTheme.onSurfaceVariant,
                }}
              />
              {item.label}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onQuickAdd}
          className="w-full rounded-2xl py-3 text-sm font-bold uppercase tracking-wide"
          style={{ background: `${tripStitchTheme.primary}22`, color: tripStitchTheme.primary }}
        >
          {hub.current_state?.cta_label || "TAKE NEXT ACTION"}
        </button>
      </ExperienceGlassCard>
    </ExperienceScrollShell>
  );
}

function heroStatTiles(moments: {
  operations_hub: { core_summary: { stat_tiles?: GroupMomentsStatTile[] } };
}): GroupMomentsStatTile[] {
  const tiles = moments.operations_hub.core_summary.stat_tiles ?? [];
  if (tiles.length > 0) return tiles;
  return [
    { label: "Participants", value: "0" },
    { label: "Bookings", value: "0" },
    { label: "Activities", value: "0" },
    { label: "Expenses", value: "—" },
  ];
}
