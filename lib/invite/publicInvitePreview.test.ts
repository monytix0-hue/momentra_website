import { describe, expect, it } from "vitest";
import {
  isTerminalInviteStatus,
  safePreviewFields,
  terminalMessage,
} from "./publicInvitePreview";

describe("publicInvitePreview", () => {
  it("detects terminal statuses", () => {
    expect(isTerminalInviteStatus("ACTIVE")).toBe(false);
    expect(isTerminalInviteStatus("EXPIRED")).toBe(true);
    expect(isTerminalInviteStatus("REVOKED")).toBe(true);
    expect(isTerminalInviteStatus("EXHAUSTED")).toBe(true);
  });

  it("maps terminal copy", () => {
    expect(terminalMessage({ status: "EXPIRED" })).toMatch(/expired/i);
    expect(terminalMessage({ status: "REVOKED" })).toMatch(/revoked/i);
    expect(terminalMessage({ result_code: "ALREADY_MEMBER", status: "ACTIVE" })).toMatch(
      /already a member/i,
    );
  });

  it("exposes only safe preview fields", () => {
    const fields = safePreviewFields({
      invite_type: "COMPANY",
      status: "ACTIVE",
      company: { display_name: "Acme", logo_url: "/logo.png" },
      inviter: { display_name: "Alex" },
      role: { code: "MANAGER", display_name: "Manager" },
      expires_at: "2026-08-01T00:00:00Z",
    });
    expect(fields).toEqual({
      companyName: "Acme",
      companyLogo: "/logo.png",
      inviterName: "Alex",
      roleLabel: "Manager",
      expiresAt: "2026-08-01T00:00:00Z",
      status: "ACTIVE",
      inviteType: "COMPANY",
    });
  });
});
