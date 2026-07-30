import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bumpBusinessSessionGeneration,
  ensureBusinessBootstrap,
  ensureBusinessCreateOptions,
  getBusinessSessionSnapshot,
  resetBusinessSessionStoreForTests,
  setBusinessSelection,
  switchBusinessWorkspace,
  validateBusinessSelection,
} from "@/stores/businessSessionStore";
import type { BusinessMomentResponse } from "@/lib/api/business";

vi.mock("@/repositories/BusinessRepository", () => ({
  BusinessRepository: {
    getSessionBootstrap: vi.fn(),
    getSession: vi.fn(),
    getWorkspaceMoments: vi.fn(),
    getWorkspaceOverview: vi.fn(),
    getCreateOptions: vi.fn(),
    selectWorkspace: vi.fn(),
  },
}));

vi.mock("@/lib/cache/cacheStore", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cache/cacheStore")>(
    "@/lib/cache/cacheStore",
  );
  return {
    ...actual,
    dedupeFetch: (_key: string, fn: () => Promise<unknown>) => fn(),
    diskCacheLoad: () => null,
    diskCacheSave: () => {},
    diskCacheRemove: () => {},
  };
});

import { BusinessRepository } from "@/repositories/BusinessRepository";
import { clearBusinessMomentReseatMarks } from "@/lib/business/businessMomentAccess";

function moment(
  overrides: Partial<BusinessMomentResponse> &
    Pick<BusinessMomentResponse, "moment_id" | "moment_type_code" | "status">,
): BusinessMomentResponse {
  return {
    moment_id: overrides.moment_id,
    moment_type_id: overrides.moment_type_id ?? "t",
    moment_type_code: overrides.moment_type_code,
    moment_name: overrides.moment_name ?? overrides.moment_type_code ?? "m",
    status: overrides.status,
  };
}

describe("businessSessionStore", () => {
  beforeEach(() => {
    resetBusinessSessionStoreForTests();
    clearBusinessMomentReseatMarks();
    vi.mocked(BusinessRepository.getSessionBootstrap).mockReset();
    vi.mocked(BusinessRepository.getSession).mockReset();
    vi.mocked(BusinessRepository.getWorkspaceMoments).mockReset();
    vi.mocked(BusinessRepository.getWorkspaceOverview).mockReset();
    vi.mocked(BusinessRepository.getCreateOptions).mockReset();
    vi.mocked(BusinessRepository.selectWorkspace).mockReset();
    // Cold chrome fails → full bootstrap fallback (keeps existing recovery coverage).
    vi.mocked(BusinessRepository.getSession).mockRejectedValue(new Error("no chrome"));
  });

  it("ACTIVE startup prefers thin session chrome and skips create-options", async () => {
    vi.mocked(BusinessRepository.getSession).mockResolvedValue({
      selected_workspace: {
        id: "ws1",
        name: "Acme",
        role: "OWNER",
      },
      workspaces: [{ id: "ws1", name: "Acme", role: "OWNER" }],
      module_tiles: [],
    });
    vi.mocked(BusinessRepository.getWorkspaceMoments).mockResolvedValue({
      workspace_id: "ws1",
      moments_home: { is_empty: false, active_moment_count: 1, cards: [] },
      moments: [
        moment({
          moment_id: "m1",
          moment_type_code: "TEAM_OPERATIONS",
          status: "ACTIVE",
        }),
      ],
    });
    vi.mocked(BusinessRepository.getWorkspaceOverview).mockResolvedValue({
      workspace_id: "ws1",
      dashboard: {
        open_moments: 1,
        pending_approvals: 0,
        member_count: 1,
      },
    });
    await ensureBusinessBootstrap();
    expect(BusinessRepository.getSession).toHaveBeenCalledTimes(1);
    expect(BusinessRepository.getSessionBootstrap).not.toHaveBeenCalled();
    expect(BusinessRepository.getCreateOptions).not.toHaveBeenCalled();
    expect(getBusinessSessionSnapshot().selectedMomentId).toBe("m1");
  });

  it("Opening Create lazily performs at most one create-options request and attaches inventory links", async () => {
    vi.mocked(BusinessRepository.getSessionBootstrap).mockResolvedValue({
      moments_home: { is_empty: false, active_moment_count: 1, cards: [] },
      moments: [
        moment({
          moment_id: "m1",
          moment_type_code: "TEAM_OPERATIONS",
          status: "ACTIVE",
        }),
      ],
    });
    await ensureBusinessBootstrap(true);
    vi.mocked(BusinessRepository.getCreateOptions).mockResolvedValue({
      is_empty: true,
      active_moment_count: 0,
      cards: [
        {
          moment_type_id: "t1",
          moment_type_code: "TEAM_OPERATIONS",
          moment_type_name: "Team Operations",
          display_order: 1,
          linked_moment_id: null,
          linked_moment_status: null,
          is_active: false,
        },
      ],
    });
    await ensureBusinessCreateOptions();
    await ensureBusinessCreateOptions();
    expect(BusinessRepository.getCreateOptions).toHaveBeenCalledTimes(1);
    const card = getBusinessSessionSnapshot().createOptions?.cards?.[0];
    expect(card?.linked_moment_id).toBe("m1");
    expect(card?.is_active).toBe(true);
  });

  it("Changing selected moment bumps generation so old responses can be ignored", () => {
    const g0 = getBusinessSessionSnapshot().generation;
    setBusinessSelection("TEAM_OPERATIONS", "m1");
    const g1 = getBusinessSessionSnapshot().generation;
    bumpBusinessSessionGeneration();
    expect(g1).toBeGreaterThan(g0);
    expect(getBusinessSessionSnapshot().generation).toBeGreaterThan(g1);
  });

  it("validateSelection prefers persisted valid id over type re-resolve", () => {
    const moments = [
      moment({
        moment_id: "m-runway",
        moment_type_code: "BUSINESS_RUNWAY",
        status: "ACTIVE",
      }),
      moment({
        moment_id: "m-team",
        moment_type_code: "TEAM_OPERATIONS",
        status: "ACTIVE",
      }),
    ];
    const next = validateBusinessSelection(moments, "m-team", "BUSINESS_RUNWAY");
    expect(next.selectedMomentId).toBe("m-team");
    expect(next.selectedMomentType).toBe("TEAM_OPERATIONS");
  });

  it("Runtime mutations do not require create-options reload for bootstrap refresh", async () => {
    vi.mocked(BusinessRepository.getSessionBootstrap).mockResolvedValue({
      moments_home: { is_empty: false, active_moment_count: 1, cards: [] },
      moments: [
        moment({
          moment_id: "m1",
          moment_type_code: "TEAM_OPERATIONS",
          status: "ACTIVE",
        }),
      ],
    });
    await ensureBusinessBootstrap(true);
    expect(BusinessRepository.getCreateOptions).not.toHaveBeenCalled();
  });

  it("inaccessible last moment clears selection and marks inventory empty", async () => {
    const { handleBusinessMomentInaccessible } = await import(
      "@/stores/businessSessionStore"
    );
    vi.mocked(BusinessRepository.getSessionBootstrap)
      .mockResolvedValueOnce({
        moments_home: { is_empty: false, active_moment_count: 1, cards: [] },
        moments: [
          moment({
            moment_id: "gone",
            moment_type_code: "TEAM_OPERATIONS",
            status: "ACTIVE",
          }),
        ],
      })
      .mockResolvedValueOnce({
        moments_home: { is_empty: true, active_moment_count: 0, cards: [] },
        moments: [],
      });

    await ensureBusinessBootstrap();
    expect(getBusinessSessionSnapshot().selectedMomentId).toBe("gone");

    const result = await handleBusinessMomentInaccessible("gone", "access_denied");
    expect(result.selectedMomentId).toBeNull();
    expect(getBusinessSessionSnapshot().selectedMomentId).toBeNull();

    // Second call (already reseated) still clears ghost selection
    setBusinessSelection("TEAM_OPERATIONS", "gone");
    const again = await handleBusinessMomentInaccessible("gone", "access_denied");
    expect(again.selectedMomentId).toBeNull();
    expect(getBusinessSessionSnapshot().selectedMomentId).toBeNull();
  });

  it("cascade inaccessible moments settle to empty without re-arming inventory", async () => {
    const { handleBusinessMomentInaccessible } = await import(
      "@/stores/businessSessionStore"
    );
    const threeMoments = {
      moments_home: { is_empty: false, active_moment_count: 3, cards: [] },
      moments: [
        moment({
          moment_id: "ops",
          moment_type_code: "BUSINESS_OPERATIONS",
          status: "ACTIVE",
        }),
        moment({
          moment_id: "runway",
          moment_type_code: "BUSINESS_RUNWAY",
          status: "ACTIVE",
        }),
        moment({
          moment_id: "team",
          moment_type_code: "TEAM_OPERATIONS",
          status: "ACTIVE",
        }),
      ],
    };
    vi.mocked(BusinessRepository.getSessionBootstrap).mockResolvedValue(threeMoments);
    await ensureBusinessBootstrap();
    setBusinessSelection("BUSINESS_OPERATIONS", "ops");

    await handleBusinessMomentInaccessible("ops", "invalid_member");
    await handleBusinessMomentInaccessible("runway", "invalid_member");
    const result = await handleBusinessMomentInaccessible("team", "invalid_member");

    expect(result.selectedMomentId).toBeNull();
    const snap = getBusinessSessionSnapshot();
    expect(snap.selectedMomentId).toBeNull();
    expect(snap.bootstrap?.moments_home?.is_empty).toBe(true);
    expect(snap.bootstrap?.moments).toEqual([]);
  });

  it("company switch uses soft workspace reload without forced fat bootstrap", async () => {
    vi.mocked(BusinessRepository.getSessionBootstrap).mockResolvedValue({
      moments_home: { is_empty: false, active_moment_count: 1, cards: [] },
      moments: [
        moment({
          moment_id: "m1",
          moment_type_code: "TEAM_OPERATIONS",
          status: "ACTIVE",
        }),
      ],
      selected_workspace: { id: "ws1", name: "Acme", role: "OWNER" },
      workspaces: [
        { id: "ws1", name: "Acme", role: "OWNER" },
        { id: "ws2", name: "Beta", role: "OWNER" },
      ],
    });
    await ensureBusinessBootstrap(true);
    vi.mocked(BusinessRepository.getSessionBootstrap).mockClear();
    vi.mocked(BusinessRepository.selectWorkspace).mockResolvedValue(undefined as never);
    vi.mocked(BusinessRepository.getWorkspaceMoments).mockResolvedValue({
      workspace_id: "ws2",
      moments_home: { is_empty: true, active_moment_count: 0, cards: [] },
      moments: [],
    });
    vi.mocked(BusinessRepository.getWorkspaceOverview).mockResolvedValue({
      workspace_id: "ws2",
      dashboard: { open_moments: 0, pending_approvals: 0, member_count: 1 },
    });

    await switchBusinessWorkspace("ws2");

    expect(BusinessRepository.selectWorkspace).toHaveBeenCalledWith("ws2");
    expect(BusinessRepository.getWorkspaceMoments).toHaveBeenCalledWith("ws2");
    expect(BusinessRepository.getSessionBootstrap).not.toHaveBeenCalled();
    expect(getBusinessSessionSnapshot().selectedWorkspaceId).toBe("ws2");
    expect(getBusinessSessionSnapshot().bootstrap?.selected_workspace?.id).toBe(
      "ws2",
    );
  });

  it("ensureBusinessBootstrap excludes reseated moments from inventory", async () => {
    const { markBusinessMomentReseated, clearBusinessMomentReseatMarks } = await import(
      "@/lib/business/businessMomentAccess"
    );
    clearBusinessMomentReseatMarks();
    markBusinessMomentReseated("ops");
    vi.mocked(BusinessRepository.getSessionBootstrap).mockResolvedValue({
      moments_home: { is_empty: false, active_moment_count: 2, cards: [] },
      moments: [
        moment({
          moment_id: "ops",
          moment_type_code: "BUSINESS_OPERATIONS",
          status: "ACTIVE",
        }),
        moment({
          moment_id: "team",
          moment_type_code: "TEAM_OPERATIONS",
          status: "ACTIVE",
        }),
      ],
    });
    await ensureBusinessBootstrap(true);
    const snap = getBusinessSessionSnapshot();
    expect(snap.bootstrap?.moments?.map((m) => m.moment_id)).toEqual(["team"]);
    expect(snap.selectedMomentId).toBe("team");
    clearBusinessMomentReseatMarks();
  });
});
