/**
 * Authoritative Business session store.
 *
 * Owns: moments inventory, selectedMomentId/Type, createOptions, load state, lastLoadedAt.
 * Clients must not keep a separate selected-moment copy.
 */
import { useSyncExternalStore } from "react";
import {
  dedupeFetch,
  diskCacheLoad,
  diskCacheRemove,
  diskCacheSave,
} from "@/lib/cache/cacheStore";
import type {
  BusinessCreateOptionCard,
  BusinessCreateOptionsResponse,
  BusinessMomentResponse,
  BusinessSessionBootstrapResponse,
  BusinessWorkspaceSummary,
} from "@/lib/api/business";
import { BusinessRepository } from "@/repositories/BusinessRepository";
import { logBusinessLoad } from "@/lib/telemetry/businessLoadTelemetry";
import {
  isActiveBusinessMomentStatus,
  resolveBusinessMomentSwitcherOptions,
  type BusinessMomentSwitcherOption,
} from "@/components/business/shared/businessMomentRouting";
import {
  areAllBusinessMomentsReseated,
  clearBusinessMomentReseatMarks,
  getBusinessMomentReseatedIds,
} from "@/lib/business/businessMomentAccess";
import { businessProjectionSchemaSegment } from "@/lib/business/businessProjectionSchema";

const CREATE_OPTIONS_FRESH_MS = 60_000;
const BOOTSTRAP_FRESH_MS = 60_000;
/** Stale-while-revalidate disk window — paint immediately, refresh in background. */
const BOOTSTRAP_DISK_TTL_MS = 24 * 60 * 60 * 1000;

function bootstrapDiskKey(workspaceId?: string | null): string {
  const schema = businessProjectionSchemaSegment();
  return workspaceId
    ? `business:${schema}:session_bootstrap:${workspaceId}`
    : `business:${schema}:session_bootstrap`;
}

function persistBootstrapDisk(bootstrap: BusinessSessionBootstrapResponse): void {
  const wsId = bootstrap.selected_workspace?.id ?? null;
  diskCacheSave(bootstrapDiskKey(wsId), bootstrap);
  if (wsId) diskCacheSave(bootstrapDiskKey(null), bootstrap);
}

/** Personal-parity link priority: ACTIVE beats newer DRAFT; same status → prefer first seen (inventory order). */
function latestMomentByTypeCode(
  moments: BusinessMomentResponse[],
): Map<string, BusinessMomentResponse> {
  const rank = (status: string): number => {
    const s = status.toUpperCase();
    if (s === "ACTIVE") return 0;
    if (s === "PAUSED") return 1;
    if (s === "COMPLETED") return 2;
    if (s === "SETUP") return 3;
    if (s === "DRAFT") return 4;
    return 99;
  };
  const best = new Map<string, BusinessMomentResponse>();
  for (const m of moments) {
    const code = (m.moment_type_code ?? "").trim();
    if (!code || !m.moment_id) continue;
    const existing = best.get(code);
    if (!existing) {
      best.set(code, m);
      continue;
    }
    if (rank(m.status ?? "") < rank(existing.status ?? "")) {
      best.set(code, m);
    }
  }
  return best;
}

/** Attach inventory links onto catalog-only create/options payload. */
export function attachCreateOptionLinksFromInventory(
  options: BusinessCreateOptionsResponse,
  moments: BusinessMomentResponse[],
): BusinessCreateOptionsResponse {
  const latest = latestMomentByTypeCode(moments);
  const cards: BusinessCreateOptionCard[] = (options.cards ?? []).map((card) => {
    const linked = latest.get(card.moment_type_code);
    const status = (linked?.status ?? "").trim();
    return {
      ...card,
      linked_moment_id: linked?.moment_id ?? null,
      linked_moment_status: linked ? status || null : null,
      is_active: Boolean(linked && isActiveBusinessMomentStatus(status || "ACTIVE")),
    };
  });
  const activeCount = moments.filter((m) =>
    isActiveBusinessMomentStatus(m.status ?? ""),
  ).length;
  return {
    ...options,
    cards,
    is_empty: activeCount === 0,
    active_moment_count: activeCount,
  };
}

function hydrateBootstrapFromDisk(workspaceId?: string | null): boolean {
  if (snapshot.bootstrap != null) return false;
  const cached =
    diskCacheLoad<BusinessSessionBootstrapResponse>(
      bootstrapDiskKey(workspaceId),
      BOOTSTRAP_DISK_TTL_MS,
    ) ??
    diskCacheLoad<BusinessSessionBootstrapResponse>(
      bootstrapDiskKey(null),
      BOOTSTRAP_DISK_TTL_MS,
    );
  if (!cached) return false;
  applyInventorySelection(cached);
  return true;
}

export type BusinessSessionSnapshot = {
  bootstrap: BusinessSessionBootstrapResponse | null;
  createOptions: BusinessCreateOptionsResponse | null;
  selectedMomentId: string | null;
  selectedMomentType: string;
  selectedWorkspaceId: string | null;
  /** After activate: skip empty-inventory wipe until inventory includes this id. */
  postActivatePinnedMomentId: string | null;
  loading: boolean;
  createOptionsLoading: boolean;
  error: string | null;
  lastLoadedAt: number | null;
  createOptionsLastLoadedAt: number | null;
  generation: number;
};

let snapshot: BusinessSessionSnapshot = {
  bootstrap: null,
  createOptions: null,
  selectedMomentId: null,
  selectedMomentType: "",
  selectedWorkspaceId: null,
  postActivatePinnedMomentId: null,
  loading: false,
  createOptionsLoading: false,
  error: null,
  lastLoadedAt: null,
  createOptionsLastLoadedAt: null,
  generation: 0,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

function setSnapshot(patch: Partial<BusinessSessionSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  notify();
}

export function getBusinessSessionSnapshot(): BusinessSessionSnapshot {
  return snapshot;
}

export function subscribeBusinessSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useBusinessSessionStore(): BusinessSessionSnapshot {
  return useSyncExternalStore(
    subscribeBusinessSession,
    getBusinessSessionSnapshot,
    getBusinessSessionSnapshot,
  );
}

export function bumpBusinessSessionGeneration(): number {
  const next = snapshot.generation + 1;
  setSnapshot({ generation: next });
  return next;
}

function inventoryMoments(): BusinessMomentResponse[] {
  return snapshot.bootstrap?.moments ?? [];
}

/**
 * Selection fallback (once per inventory change):
 * persisted valid → first ACTIVE → PAUSED/COMPLETED → setup draft → none
 * Never silently re-resolve by type alone after validation.
 */
export function validateBusinessSelection(
  moments: BusinessMomentResponse[],
  currentId: string | null,
  currentType: string,
): { selectedMomentId: string | null; selectedMomentType: string } {
  const activeFamily = moments.filter((m) => {
    const status = (m.status ?? "").trim();
    if (!status) return true;
    return isActiveBusinessMomentStatus(status);
  });

  if (currentId) {
    const persisted = activeFamily.find((m) => m.moment_id === currentId);
    if (persisted) {
      return {
        selectedMomentId: persisted.moment_id,
        selectedMomentType:
          (persisted.moment_type_code ?? "").trim() || currentType,
      };
    }
  }

  const firstActive = activeFamily.find(
    (m) => (m.status ?? "").trim().toUpperCase() === "ACTIVE" || !(m.status ?? "").trim(),
  );
  if (firstActive?.moment_id) {
    return {
      selectedMomentId: firstActive.moment_id,
      selectedMomentType: (firstActive.moment_type_code ?? "").trim(),
    };
  }

  const firstPausedOrCompleted = activeFamily.find((m) => {
    const s = (m.status ?? "").trim().toUpperCase();
    return s === "PAUSED" || s === "COMPLETED";
  });
  if (firstPausedOrCompleted?.moment_id) {
    return {
      selectedMomentId: firstPausedOrCompleted.moment_id,
      selectedMomentType: (firstPausedOrCompleted.moment_type_code ?? "").trim(),
    };
  }

  const draft = moments.find((m) => {
    const s = (m.status ?? "").trim().toUpperCase();
    return s === "SETUP" || s === "DRAFT";
  });
  if (draft?.moment_id) {
    // Setup draft for routing only — not switcher chips.
    return {
      selectedMomentId: draft.moment_id,
      selectedMomentType: (draft.moment_type_code ?? "").trim() || currentType,
    };
  }

  return { selectedMomentId: null, selectedMomentType: currentType };
}

function isBusinessInventoryEmpty(
  bootstrap: BusinessSessionBootstrapResponse | null | undefined,
): boolean {
  if (!bootstrap) return true;
  const moments = bootstrap.moments ?? [];
  const home = bootstrap.moments_home;
  return (
    home?.is_empty === true ||
    (typeof home?.active_moment_count === "number" && home.active_moment_count === 0) ||
    moments.length === 0
  );
}

function filterBootstrapByExcludedIds(
  bootstrap: BusinessSessionBootstrapResponse,
  excludeIds: ReadonlySet<string>,
): BusinessSessionBootstrapResponse {
  if (excludeIds.size === 0) return bootstrap;
  const moments = (bootstrap.moments ?? []).filter((m) => !excludeIds.has(m.moment_id));
  const cards = (bootstrap.moments_home?.cards ?? []).filter(
    (c) => !c.linked_moment_id || !excludeIds.has(c.linked_moment_id),
  );
  const activeCount = moments.filter((m) =>
    isActiveBusinessMomentStatus(m.status ?? ""),
  ).length;
  const empty = moments.length === 0 || activeCount === 0;
  return {
    ...bootstrap,
    moments,
    moments_home: bootstrap.moments_home
      ? {
          ...bootstrap.moments_home,
          cards,
          active_moment_count: activeCount,
          is_empty: empty,
        }
      : bootstrap.moments_home,
  };
}

function applyInventorySelection(bootstrap: BusinessSessionBootstrapResponse) {
  const reseated = getBusinessMomentReseatedIds();
  const inventory =
    reseated.size > 0 ? filterBootstrapByExcludedIds(bootstrap, reseated) : bootstrap;
  const moments = inventory.moments ?? [];
  const next = validateBusinessSelection(
    moments,
    isBusinessInventoryEmpty(inventory) ? null : snapshot.selectedMomentId,
    snapshot.selectedMomentType,
  );
  const selectedWorkspaceId =
    inventory.selected_workspace?.id ?? snapshot.selectedWorkspaceId;
  setSnapshot({
    bootstrap: inventory,
    selectedMomentId: next.selectedMomentId,
    selectedMomentType: next.selectedMomentType,
    selectedWorkspaceId,
    lastLoadedAt: Date.now(),
    error: null,
  });
}

function applyEmptyBusinessSession(typeCode: string): void {
  bumpBusinessSessionGeneration();
  setSnapshot({
    selectedMomentId: null,
    selectedMomentType: typeCode,
    bootstrap: snapshot.bootstrap
      ? {
          ...snapshot.bootstrap,
          moments: [],
          moments_home: snapshot.bootstrap.moments_home
            ? {
                ...snapshot.bootstrap.moments_home,
                cards: [],
                is_empty: true,
                active_moment_count: 0,
              }
            : snapshot.bootstrap.moments_home,
        }
      : null,
  });
}

export function setBusinessSelection(
  typeCode: string,
  momentId: string | null,
): void {
  bumpBusinessSessionGeneration();
  setSnapshot({
    selectedMomentType: typeCode,
    selectedMomentId: momentId,
  });
}

/** Pin selection after activate so soft/empty inventory races cannot clear it. */
export function pinBusinessPostActivateSelection(
  typeCode: string,
  momentId: string,
): void {
  if (!momentId || !typeCode) return;
  bumpBusinessSessionGeneration();
  setSnapshot({
    selectedMomentType: typeCode,
    selectedMomentId: momentId,
    postActivatePinnedMomentId: momentId,
  });
}

export function clearBusinessPostActivatePin(momentId?: string | null): void {
  const pinned = snapshot.postActivatePinnedMomentId;
  if (!pinned) return;
  if (momentId == null || momentId === pinned) {
    setSnapshot({ postActivatePinnedMomentId: null });
  }
}

export function hasBusinessPostActivatePin(): boolean {
  return Boolean(snapshot.postActivatePinnedMomentId);
}

export function getBusinessSwitcherOptions(): BusinessMomentSwitcherOption[] {
  return resolveBusinessMomentSwitcherOptions(
    snapshot.bootstrap?.moments_home?.cards ?? [],
    snapshot.createOptions?.cards ?? [],
    inventoryMoments(),
  );
}

export async function ensureBusinessBootstrap(
  force = false,
  workspaceId?: string | null,
): Promise<BusinessSessionBootstrapResponse | null> {
  const gen = snapshot.generation;
  const targetWs = workspaceId ?? snapshot.selectedWorkspaceId;
  // Paint disk/session cache immediately — never block chrome on network.
  const paintedFromDisk = hydrateBootstrapFromDisk(targetWs);

  const fresh =
    !force &&
    snapshot.bootstrap != null &&
    snapshot.lastLoadedAt != null &&
    Date.now() - snapshot.lastLoadedAt < BOOTSTRAP_FRESH_MS &&
    snapshot.error == null &&
    (targetWs == null ||
      snapshot.bootstrap.selected_workspace?.id === targetWs ||
      snapshot.selectedWorkspaceId === targetWs);
  if (fresh) return snapshot.bootstrap;

  // Never block first paint on network — empty shell or disk cache paints immediately.
  setSnapshot({ loading: false, error: null });

  const t0 = performance.now();
  try {
    const wsHint =
      targetWs ??
      snapshot.selectedWorkspaceId ??
      snapshot.bootstrap?.selected_workspace?.id ??
      null;

    // Soft path: workspace moments + overview when company is known.
    if (!force && wsHint) {
      await softRefreshBusinessSession(wsHint);
      if (gen === snapshot.generation && snapshot.bootstrap?.workspaces?.length) {
        persistBootstrapDisk(snapshot.bootstrap);
        setSnapshot({ loading: false });
        logBusinessLoad({
          tab: "session",
          requestKey: "session_soft",
          reason: paintedFromDisk ? "disk_revalidate" : "open",
          cacheSource: paintedFromDisk ? "disk" : "network",
          durationMs: Math.round(performance.now() - t0),
          generation: snapshot.generation,
          success: true,
          momentId: snapshot.selectedMomentId,
          momentType: snapshot.selectedMomentType,
        });
        return snapshot.bootstrap;
      }
    }

    // Cold chrome: thin session then soft inventory (avoid fat bootstrap when possible).
    if (!force) {
      try {
        const session = await dedupeFetch(
          wsHint ? `business:session_chrome:${wsHint}` : "business:session_chrome",
          () =>
            BusinessRepository.getSession(
              wsHint ? { workspaceId: wsHint } : undefined,
            ),
        );
        if (gen !== snapshot.generation) return snapshot.bootstrap;
        const prev = snapshot.bootstrap;
        const chromeBootstrap: BusinessSessionBootstrapResponse = {
          moments_home: prev?.moments_home ?? {
            is_empty: true,
            active_moment_count: 0,
            cards: [],
          },
          moments: prev?.moments ?? [],
          selected_workspace: session.selected_workspace ?? prev?.selected_workspace ?? null,
          workspaces: session.workspaces ?? prev?.workspaces ?? [],
          module_tiles: session.module_tiles ?? prev?.module_tiles ?? [],
          dashboard: prev?.dashboard,
        };
        applyInventorySelection(chromeBootstrap);
        const selectedId =
          chromeBootstrap.selected_workspace?.id ??
          snapshot.selectedWorkspaceId ??
          null;
        if (selectedId) {
          await softRefreshBusinessSession(selectedId);
        }
        if (snapshot.bootstrap) persistBootstrapDisk(snapshot.bootstrap);
        setSnapshot({ loading: false });
        logBusinessLoad({
          tab: "session",
          requestKey: "session_chrome",
          reason: "open",
          cacheSource: "network",
          durationMs: Math.round(performance.now() - t0),
          generation: snapshot.generation,
          success: true,
          momentId: snapshot.selectedMomentId,
          momentType: snapshot.selectedMomentType,
        });
        return snapshot.bootstrap;
      } catch {
        // Fall through to full bootstrap.
      }
    }

    const cacheKey = targetWs
      ? `business:session_bootstrap:${targetWs}`
      : "business:session_bootstrap";
    const bootstrap = await dedupeFetch(cacheKey, () =>
      BusinessRepository.getSessionBootstrap(
        targetWs ? { workspaceId: targetWs } : undefined,
      ),
    );
    if (gen !== snapshot.generation && !force) {
      // Still apply — recovery/force paths need inventory; gen bump is rare here.
    }
    applyInventorySelection(bootstrap);
    persistBootstrapDisk(bootstrap);
    setSnapshot({ loading: false });
    logBusinessLoad({
      tab: "session",
      requestKey: "session_bootstrap",
      reason: force ? "force" : "open",
      cacheSource: "network",
      durationMs: Math.round(performance.now() - t0),
      generation: snapshot.generation,
      success: true,
      momentId: snapshot.selectedMomentId,
      momentType: snapshot.selectedMomentType,
    });
    return snapshot.bootstrap;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load Business";
    // Keep painted shell on refresh failure.
    setSnapshot({
      loading: false,
      error: snapshot.bootstrap != null ? null : message,
    });
    logBusinessLoad({
      tab: "session",
      requestKey: "session_bootstrap",
      reason: force ? "force" : "open",
      cacheSource: "network",
      durationMs: Math.round(performance.now() - t0),
      generation: snapshot.generation,
      success: false,
      errorCode: "bootstrap_failed",
    });
    return snapshot.bootstrap;
  }
}

export function getSelectedBusinessWorkspace(): BusinessWorkspaceSummary | null {
  return snapshot.bootstrap?.selected_workspace ?? null;
}

export function getBusinessWorkspaces(): BusinessWorkspaceSummary[] {
  return snapshot.bootstrap?.workspaces ?? [];
}

export async function switchBusinessWorkspace(
  workspaceId: string,
): Promise<BusinessSessionBootstrapResponse | null> {
  bumpBusinessSessionGeneration();
  const prev = snapshot.bootstrap;
  const selected =
    prev?.workspaces?.find((w) => w.id === workspaceId) ?? null;
  setSnapshot({
    selectedWorkspaceId: workspaceId,
    selectedMomentId: null,
    selectedMomentType: "",
    loading: false,
    error: null,
    bootstrap: prev
      ? {
          ...prev,
          selected_workspace: selected ?? {
            id: workspaceId,
            name: "Company",
            role: "MEMBER",
          },
          moments: [],
          moments_home: {
            is_empty: true,
            active_moment_count: 0,
            cards: [],
          },
        }
      : null,
  });
  try {
    await BusinessRepository.selectWorkspace(workspaceId);
  } catch {
    // Preference persist may fail offline; still soft-reload scoped inventory.
  }
  await softRefreshBusinessSession(workspaceId);
  if (snapshot.bootstrap) persistBootstrapDisk(snapshot.bootstrap);
  return snapshot.bootstrap;
}

export async function createAndSelectBusinessWorkspace(name: string): Promise<
  BusinessSessionBootstrapResponse | null
> {
  const created = await BusinessRepository.createWorkspace({ name });
  bumpBusinessSessionGeneration();
  const prev = snapshot.bootstrap;
  const workspaces = [...(prev?.workspaces ?? []).filter((w) => w.id !== created.id), created];
  setSnapshot({
    selectedWorkspaceId: created.id,
    selectedMomentId: null,
    selectedMomentType: "",
    bootstrap: {
      moments_home: prev?.moments_home ?? {
        is_empty: true,
        active_moment_count: 0,
        cards: [],
      },
      moments: [],
      selected_workspace: created,
      workspaces,
      module_tiles: prev?.module_tiles ?? [],
      dashboard: prev?.dashboard ?? {
        open_moments: 0,
        pending_approvals: 0,
        member_count: 1,
      },
    },
    lastLoadedAt: Date.now(),
    error: null,
  });
  // Background soft reconcile — do not block create UX on a forced bootstrap.
  void softRefreshBusinessSession(created.id);
  return snapshot.bootstrap;
}

/**
 * Soft background refresh: prefers workspace moments/overview endpoints when
 * a company is selected; falls back to cached bootstrap TTL (never force).
 */
export async function softRefreshBusinessSession(
  workspaceId?: string | null,
): Promise<void> {
  const wsId =
    workspaceId ??
    snapshot.selectedWorkspaceId ??
    snapshot.bootstrap?.selected_workspace?.id ??
    null;
  if (!wsId) {
    // Cold open without a company id — fat bootstrap once for chrome + inventory.
    const cacheKey = "business:session_bootstrap";
    const bootstrap = await dedupeFetch(cacheKey, () =>
      BusinessRepository.getSessionBootstrap(),
    );
    applyInventorySelection(bootstrap);
    persistBootstrapDisk(bootstrap);
    return;
  }
  const gen = snapshot.generation;
  try {
    const [momentsPayload, overview] = await Promise.all([
      BusinessRepository.getWorkspaceMoments(wsId),
      BusinessRepository.getWorkspaceOverview(wsId),
    ]);
    if (gen !== snapshot.generation) return;
    const prev = snapshot.bootstrap;
    const selectedFromList =
      prev?.workspaces?.find((w) => w.id === wsId) ?? null;
    const selectedWorkspace =
      selectedFromList ??
      (prev?.selected_workspace?.id === wsId
        ? prev.selected_workspace
        : prev?.selected_workspace) ??
      null;
    const next: BusinessSessionBootstrapResponse = {
      moments_home:
        momentsPayload.moments_home ??
        prev?.moments_home ?? {
          is_empty: true,
          active_moment_count: 0,
          cards: [],
        },
      moments: momentsPayload.moments ?? prev?.moments ?? [],
      selected_workspace: selectedWorkspace,
      workspaces: prev?.workspaces ?? [],
      module_tiles: prev?.module_tiles ?? [],
      dashboard: overview.dashboard ?? prev?.dashboard,
    };
    applyInventorySelection(next);
    if (snapshot.createOptions) {
      setSnapshot({
        createOptions: attachCreateOptionLinksFromInventory(
          snapshot.createOptions,
          next.moments ?? [],
        ),
      });
    }
    persistBootstrapDisk(next);
  } catch {
    // Soft failure: try thin chrome + retry once; avoid forced fat bootstrap loops.
    try {
      const session = await BusinessRepository.getSession({ workspaceId: wsId });
      if (gen !== snapshot.generation) return;
      const prev = snapshot.bootstrap;
      applyInventorySelection({
        moments_home: prev?.moments_home ?? {
          is_empty: true,
          active_moment_count: 0,
          cards: [],
        },
        moments: prev?.moments ?? [],
        selected_workspace: session.selected_workspace ?? prev?.selected_workspace ?? null,
        workspaces: session.workspaces ?? prev?.workspaces ?? [],
        module_tiles: session.module_tiles ?? prev?.module_tiles ?? [],
        dashboard: prev?.dashboard,
      });
    } catch {
      /* keep painted shell */
    }
  }
}

/** Bootstrap only after manage/setup — soft by default (force reserved for recovery). */
export async function refreshBusinessSessionInventory(
  force = false,
): Promise<void> {
  if (force) {
    await ensureBusinessBootstrap(true);
    return;
  }
  await softRefreshBusinessSession();
}

export function patchBusinessWorkspaceInStore(
  workspace: BusinessWorkspaceSummary,
): void {
  const prev = snapshot.bootstrap;
  if (!prev) {
    setSnapshot({
      selectedWorkspaceId: workspace.id,
      bootstrap: {
        moments_home: { is_empty: true, active_moment_count: 0, cards: [] },
        moments: [],
        selected_workspace: workspace,
        workspaces: [workspace],
        module_tiles: [],
        dashboard: {
          open_moments: 0,
          pending_approvals: 0,
          member_count: 1,
        },
      },
      lastLoadedAt: Date.now(),
    });
    return;
  }
  const workspaces = (prev.workspaces ?? []).map((w) =>
    w.id === workspace.id ? { ...w, ...workspace } : w,
  );
  const has = workspaces.some((w) => w.id === workspace.id);
  setSnapshot({
    bootstrap: {
      ...prev,
      selected_workspace:
        prev.selected_workspace?.id === workspace.id
          ? { ...prev.selected_workspace, ...workspace }
          : prev.selected_workspace,
      workspaces: has ? workspaces : [...workspaces, workspace],
    },
  });
}

export function patchBusinessMomentInInventory(
  moment: BusinessMomentResponse,
): void {
  const prev = snapshot.bootstrap;
  if (!prev) return;
  const moments = [...(prev.moments ?? [])];
  const idx = moments.findIndex((m) => m.moment_id === moment.moment_id);
  if (idx >= 0) moments[idx] = { ...moments[idx], ...moment };
  else moments.unshift(moment);
  const activeCount = moments.filter((m) =>
    isActiveBusinessMomentStatus(m.status ?? ""),
  ).length;
  setSnapshot({
    bootstrap: {
      ...prev,
      moments,
      moments_home: prev.moments_home
        ? {
            ...prev.moments_home,
            is_empty: activeCount === 0,
            active_moment_count: activeCount,
          }
        : prev.moments_home,
      dashboard: prev.dashboard
        ? { ...prev.dashboard, open_moments: moments.length }
        : prev.dashboard,
    },
    lastLoadedAt: Date.now(),
  });
}

export async function ensureBusinessCreateOptions(
  force = false,
): Promise<BusinessCreateOptionsResponse | null> {
  const inventory = inventoryMoments();
  const fresh =
    !force &&
    snapshot.createOptions != null &&
    snapshot.createOptionsLastLoadedAt != null &&
    Date.now() - snapshot.createOptionsLastLoadedAt < CREATE_OPTIONS_FRESH_MS;
  if (fresh) {
    // Re-attach links in case inventory changed while catalog TTL was still fresh.
    const merged = attachCreateOptionLinksFromInventory(
      snapshot.createOptions,
      inventory,
    );
    setSnapshot({ createOptions: merged });
    return merged;
  }

  const gen = snapshot.generation;
  setSnapshot({ createOptionsLoading: true });
  const t0 = performance.now();
  try {
    const options = await dedupeFetch("business:create_options", () =>
      BusinessRepository.getCreateOptions(),
    );
    if (gen !== snapshot.generation) {
      // Still cache catalog; selection is authoritative elsewhere.
    }
    const merged = attachCreateOptionLinksFromInventory(
      options,
      inventoryMoments(),
    );
    setSnapshot({
      createOptions: merged,
      createOptionsLastLoadedAt: Date.now(),
    });
    logBusinessLoad({
      tab: "create",
      requestKey: "create_options",
      reason: force ? "force" : "lazy_create",
      cacheSource: "network",
      durationMs: Math.round(performance.now() - t0),
      generation: snapshot.generation,
      success: true,
    });
    return merged;
  } catch {
    logBusinessLoad({
      tab: "create",
      requestKey: "create_options",
      reason: force ? "force" : "lazy_create",
      cacheSource: "network",
      durationMs: Math.round(performance.now() - t0),
      generation: snapshot.generation,
      success: false,
      errorCode: "create_options_failed",
    });
    return snapshot.createOptions
      ? attachCreateOptionLinksFromInventory(snapshot.createOptions, inventory)
      : null;
  } finally {
    setSnapshot({ createOptionsLoading: false });
  }
}

export function clearBusinessSessionStore(): void {
  const wsId = snapshot.selectedWorkspaceId ?? snapshot.bootstrap?.selected_workspace?.id;
  diskCacheRemove(bootstrapDiskKey(wsId));
  diskCacheRemove(bootstrapDiskKey(null));
  snapshot = {
    bootstrap: null,
    createOptions: null,
    selectedMomentId: null,
    selectedMomentType: "",
    selectedWorkspaceId: null,
    postActivatePinnedMomentId: null,
    loading: false,
    createOptionsLoading: false,
    error: null,
    lastLoadedAt: null,
    createOptionsLastLoadedAt: null,
    generation: snapshot.generation + 1,
  };
  notify();
}

/**
 * Selected moment is deleted / archived / membership revoked (403).
 * Remove from local inventory, clear selection, pick replacement or empty, refresh once.
 */
export async function handleBusinessMomentInaccessible(
  momentId: string,
  reason = "access_denied",
): Promise<{
  selectedMomentId: string | null;
  selectedMomentType: string;
}> {
  const {
    markBusinessMomentReseated,
    wasBusinessMomentReseated,
    clearBusinessMomentReseatMarks,
    areAllBusinessMomentsReseated: allMomentsReseated,
  } = await import("@/lib/business/businessMomentAccess");

  if (!momentId) {
    const snap = getBusinessSessionSnapshot();
    return {
      selectedMomentId: snap.selectedMomentId,
      selectedMomentType: snap.selectedMomentType,
    };
  }

  const inventoryEmptyNow = isBusinessInventoryEmpty(snapshot.bootstrap);

  if (wasBusinessMomentReseated(momentId)) {
    // Ghost selection: prior reseat early-returned without clearing — force clear.
    if (snapshot.selectedMomentId === momentId || inventoryEmptyNow) {
      const remaining = (snapshot.bootstrap?.moments ?? []).filter(
        (m) => m.moment_id !== momentId,
      );
      const forceEmpty =
        remaining.length === 0 || allMomentsReseated(remaining);
      if (forceEmpty) {
        clearBusinessMomentReseatMarks();
        applyEmptyBusinessSession(snapshot.selectedMomentType);
      } else {
        const remainingActive = remaining.filter((m) =>
          isActiveBusinessMomentStatus(m.status ?? ""),
        ).length;
        const empty = remaining.length === 0 || remainingActive === 0;
        bumpBusinessSessionGeneration();
        setSnapshot({
          selectedMomentId: null,
          selectedMomentType: snapshot.selectedMomentType,
          bootstrap: snapshot.bootstrap
            ? {
                ...snapshot.bootstrap,
                moments: remaining,
                moments_home: snapshot.bootstrap.moments_home
                  ? {
                      ...snapshot.bootstrap.moments_home,
                      is_empty: empty,
                      active_moment_count: remainingActive,
                      cards: (snapshot.bootstrap.moments_home.cards ?? []).filter(
                        (c) => c.linked_moment_id !== momentId,
                      ),
                    }
                  : snapshot.bootstrap.moments_home,
              }
            : null,
        });
      }
      try {
        const { invalidateBusinessActiveCaches } = await import(
          "@/hooks/useBusinessActiveTabs"
        );
        invalidateBusinessActiveCaches(momentId);
      } catch {
        /* ignore */
      }
    }
    const snap = getBusinessSessionSnapshot();
    return {
      selectedMomentId: snap.selectedMomentId,
      selectedMomentType: snap.selectedMomentType,
    };
  }
  markBusinessMomentReseated(momentId);

  const bootstrap = snapshot.bootstrap;
  const filteredMoments = (bootstrap?.moments ?? []).filter(
    (m) => m.moment_id !== momentId,
  );
  const filteredCards = (bootstrap?.moments_home?.cards ?? []).filter(
    (c) => c.linked_moment_id !== momentId,
  );
  const effectiveEmpty =
    filteredMoments.length === 0 || allMomentsReseated(filteredMoments);

  if (effectiveEmpty) {
    clearBusinessMomentReseatMarks();
    applyEmptyBusinessSession(snapshot.selectedMomentType);
    try {
      const { invalidateBusinessActiveCaches } = await import(
        "@/hooks/useBusinessActiveTabs"
      );
      invalidateBusinessActiveCaches(momentId);
    } catch {
      /* ignore */
    }
    logBusinessLoad({
      tab: "session",
      requestKey: "moment_inaccessible",
      reason,
      cacheSource: "network",
      durationMs: 0,
      generation: snapshot.generation,
      success: true,
      momentId,
      momentType: snapshot.selectedMomentType,
    });
    const snap = getBusinessSessionSnapshot();
    return {
      selectedMomentId: snap.selectedMomentId,
      selectedMomentType: snap.selectedMomentType,
    };
  }

  const reseated = getBusinessMomentReseatedIds();
  const accessibleMoments = filteredMoments.filter(
    (m) => !reseated.has(m.moment_id),
  );
  if (accessibleMoments.length === 0) {
    clearBusinessMomentReseatMarks();
    applyEmptyBusinessSession(snapshot.selectedMomentType);
    try {
      const { invalidateBusinessActiveCaches } = await import(
        "@/hooks/useBusinessActiveTabs"
      );
      invalidateBusinessActiveCaches(momentId);
    } catch {
      /* ignore */
    }
    logBusinessLoad({
      tab: "session",
      requestKey: "moment_inaccessible",
      reason,
      cacheSource: "network",
      durationMs: 0,
      generation: snapshot.generation,
      success: true,
      momentId,
      momentType: snapshot.selectedMomentType,
    });
    const snap = getBusinessSessionSnapshot();
    return {
      selectedMomentId: snap.selectedMomentId,
      selectedMomentType: snap.selectedMomentType,
    };
  }

  const activeCount = filteredMoments.filter((m) =>
    isActiveBusinessMomentStatus(m.status ?? ""),
  ).length;
  const emptyAfterFilter = filteredMoments.length === 0 || activeCount === 0;

  const nextBootstrap: BusinessSessionBootstrapResponse | null = bootstrap
    ? {
        ...bootstrap,
        moments: filteredMoments,
        moments_home: bootstrap.moments_home
          ? {
              ...bootstrap.moments_home,
              cards: filteredCards,
              active_moment_count: activeCount,
              is_empty: emptyAfterFilter,
            }
          : bootstrap.moments_home,
      }
    : null;

  const next = emptyAfterFilter
    ? { selectedMomentId: null as string | null, selectedMomentType: snapshot.selectedMomentType }
    : validateBusinessSelection(
        accessibleMoments,
        snapshot.selectedMomentId === momentId ? null : snapshot.selectedMomentId,
        snapshot.selectedMomentType,
      );

  bumpBusinessSessionGeneration();
  setSnapshot({
    bootstrap: nextBootstrap,
    selectedMomentId: next.selectedMomentId,
    selectedMomentType: next.selectedMomentType,
  });

  try {
    const { invalidateBusinessActiveCaches } = await import(
      "@/hooks/useBusinessActiveTabs"
    );
    invalidateBusinessActiveCaches(momentId);
  } catch {
    // ignore circular import timing
  }

  logBusinessLoad({
    tab: "session",
    requestKey: "moment_inaccessible",
    reason,
    cacheSource: "network",
    durationMs: 0,
    generation: snapshot.generation,
    success: true,
    momentId,
    momentType: snapshot.selectedMomentType,
  });

  // One forced inventory refresh — applyInventorySelection excludes reseated ids.
  await ensureBusinessBootstrap(true);

  const snap = getBusinessSessionSnapshot();
  return {
    selectedMomentId: snap.selectedMomentId,
    selectedMomentType: snap.selectedMomentType,
  };
}

/** Test helper */
export function resetBusinessSessionStoreForTests(): void {
  clearBusinessSessionStore();
  clearBusinessMomentReseatMarks();
}
