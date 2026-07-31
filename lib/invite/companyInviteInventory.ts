/** Helpers for company invite inventory display (no raw codes). */

export type CompanyInviteStatus =
  | "ACTIVE"
  | "ACCEPTED"
  | "EXPIRED"
  | "REVOKED"
  | "EXHAUSTED"
  | string;

export type CompanyInviteInventoryItem = {
  invite_id: string;
  code_suffix: string;
  invite_type: string;
  role_code: string | null;
  status: CompanyInviteStatus;
  created_at: string;
  expires_at: string;
  max_uses: number;
  use_count: number;
  invite_url: string | null;
};

export function formatInviteStatusLabel(status: CompanyInviteStatus): string {
  const s = String(status || "").toUpperCase();
  switch (s) {
    case "ACTIVE":
      return "Active";
    case "ACCEPTED":
      return "Accepted";
    case "EXPIRED":
      return "Expired";
    case "REVOKED":
      return "Revoked";
    case "EXHAUSTED":
      return "Exhausted";
    default:
      return s ? s.charAt(0) + s.slice(1).toLowerCase() : "Unknown";
  }
}

export function canRevokeInvite(status: CompanyInviteStatus): boolean {
  return String(status || "").toUpperCase() === "ACTIVE";
}

/** Copy/QR only when a recoverable raw URL exists for this row. */
export function recoverableInviteUrl(
  item: CompanyInviteInventoryItem,
  rawById: Record<string, string>,
): string | null {
  const fromCreate = rawById[item.invite_id]?.trim();
  if (fromCreate) return fromCreate;
  const fromApi = item.invite_url?.trim();
  if (fromApi) return fromApi;
  return null;
}

export function formatUseCount(useCount: number, maxUses: number): string {
  const u = Number.isFinite(useCount) ? useCount : 0;
  const m = Number.isFinite(maxUses) ? maxUses : 0;
  return `${u} / ${m}`;
}

export function formatInviteDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
