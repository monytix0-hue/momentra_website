import type { CompanyInvitePreview } from "@/lib/api/client";

export type PublicInviteUiState =
  | "loading"
  | "preview"
  | "accepting"
  | "success"
  | "terminal"
  | "error";

export function isTerminalInviteStatus(status: string | null | undefined): boolean {
  const s = String(status || "").toUpperCase();
  return (
    s === "EXPIRED" ||
    s === "REVOKED" ||
    s === "EXHAUSTED" ||
    s === "INVALID" ||
    s === "ACCEPTED"
  );
}

export function terminalMessage(
  preview: Pick<CompanyInvitePreview, "status" | "result_code"> | null,
  fallback = "This invite is no longer available.",
): string {
  const code = String(preview?.result_code || preview?.status || "").toUpperCase();
  switch (code) {
    case "EXPIRED":
      return "This invite has expired.";
    case "REVOKED":
      return "This invite was revoked.";
    case "EXHAUSTED":
      return "This invite has reached its use limit.";
    case "ACCEPTED":
      return "This invite was already accepted.";
    case "INVALID":
      return "This invite link is invalid.";
    case "ALREADY_MEMBER":
      return "You are already a member.";
    default:
      return fallback;
  }
}

export function safePreviewFields(preview: CompanyInvitePreview | null) {
  if (!preview) return null;
  return {
    companyName: preview.company?.display_name ?? "Company",
    companyLogo: preview.company?.logo_url ?? null,
    inviterName: preview.inviter?.display_name ?? "Someone",
    roleLabel: preview.role?.display_name ?? preview.role?.code ?? "Member",
    expiresAt: preview.expires_at ?? null,
    status: preview.status,
    inviteType: preview.invite_type,
  };
}
