import { describe, expect, it } from "vitest";
import {
  resolveInviteAcceptTarget,
  shouldFlagPendingMismatch,
} from "./inviteAcceptNavigation";

describe("inviteAcceptNavigation", () => {
  it("resolves ACCEPTED target", () => {
    const t = resolveInviteAcceptTarget({
      moment_id: "m-1",
      moment_type: "SHARED_EXPERIENCE",
      result: "ACCEPTED",
      moment_name: "Wedding",
    });
    expect(t).toEqual({
      momentId: "m-1",
      momentType: "SHARED_EXPERIENCE",
      outcome: "ACCEPTED",
      alreadyMember: false,
      momentName: "Wedding",
    });
  });

  it("opens ALREADY_MEMBER via target_id", () => {
    const t = resolveInviteAcceptTarget({
      target_id: "m-2",
      result: "ALREADY_MEMBER",
      already_member: true,
      moment_name: "Trip",
    });
    expect(t?.momentId).toBe("m-2");
    expect(t?.outcome).toBe("ALREADY_MEMBER");
  });

  it("flags pending code mismatch", () => {
    expect(shouldFlagPendingMismatch("CJ6NQ9EQ", "DB3T56M6")).toBe(true);
    expect(shouldFlagPendingMismatch("db3t56m6", "DB3T56M6")).toBe(false);
    expect(shouldFlagPendingMismatch(null, "DB3T56M6")).toBe(false);
  });
});
