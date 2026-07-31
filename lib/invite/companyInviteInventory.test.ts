import { describe, expect, it } from "vitest";
import {
  canRevokeInvite,
  formatInviteDate,
  formatInviteStatusLabel,
  formatUseCount,
  recoverableInviteUrl,
  type CompanyInviteInventoryItem,
} from "./companyInviteInventory";

function item(
  overrides: Partial<CompanyInviteInventoryItem> = {},
): CompanyInviteInventoryItem {
  return {
    invite_id: "inv-1",
    code_suffix: "ABCD",
    invite_type: "COMPANY",
    role_code: "MEMBER",
    status: "ACTIVE",
    created_at: "2026-07-01T00:00:00Z",
    expires_at: "2026-08-01T00:00:00Z",
    max_uses: 5,
    use_count: 1,
    invite_url: null,
    ...overrides,
  };
}

describe("companyInviteInventory", () => {
  it("labels known statuses", () => {
    expect(formatInviteStatusLabel("ACTIVE")).toBe("Active");
    expect(formatInviteStatusLabel("EXHAUSTED")).toBe("Exhausted");
  });

  it("only ACTIVE invites can revoke", () => {
    expect(canRevokeInvite("ACTIVE")).toBe(true);
    expect(canRevokeInvite("REVOKED")).toBe(false);
    expect(canRevokeInvite("EXPIRED")).toBe(false);
  });

  it("does not invent copy URLs without recoverable raw code", () => {
    expect(recoverableInviteUrl(item(), {})).toBeNull();
    expect(
      recoverableInviteUrl(item({ invite_url: null }), { "other": "https://x" }),
    ).toBeNull();
  });

  it("uses session raw link or API invite_url when present", () => {
    expect(
      recoverableInviteUrl(item(), {
        "inv-1": "https://www.momentra.tech/invite/ABC123",
      }),
    ).toBe("https://www.momentra.tech/invite/ABC123");
    expect(
      recoverableInviteUrl(
        item({ invite_url: "https://www.momentra.tech/invite/XYZ" }),
        {},
      ),
    ).toBe("https://www.momentra.tech/invite/XYZ");
  });

  it("formats use counts and dates", () => {
    expect(formatUseCount(2, 10)).toBe("2 / 10");
    expect(formatInviteDate("not-a-date")).toBe("—");
    expect(formatInviteDate("2026-07-15T12:00:00Z")).toMatch(/2026/);
  });
});
