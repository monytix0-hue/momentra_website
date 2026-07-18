/** Extract invite JWT from QR payload / deep link / pasted text. */
export function extractInviteToken(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  try {
    const url = new URL(s);
    const host = url.hostname.toLowerCase();
    const pathParts = url.pathname.split("/").filter(Boolean);
    const isInviteHost = host === "invite";
    const inviteIdx = pathParts.findIndex((p) => p.toLowerCase() === "invite");
    const isMomentraHttps =
      url.protocol === "https:" &&
      (host === "momentra.tech" || host === "www.momentra.tech");

    if (
      url.protocol === "momentra:" ||
      isInviteHost ||
      inviteIdx >= 0 ||
      isMomentraHttps
    ) {
      const q = url.searchParams.get("token");
      if (q?.trim()) return q.trim();
      if (isInviteHost) {
        const token = pathParts[0] || url.pathname.replace(/^\//, "");
        return token && token.toLowerCase() !== "invite" ? token : null;
      }
      if (inviteIdx >= 0 && pathParts[inviteIdx + 1]) {
        return pathParts[inviteIdx + 1];
      }
      const last = pathParts[pathParts.length - 1];
      if (last && last.toLowerCase() !== "invite") return last;
    }
  } catch {
    /* not a URL — treat as raw token */
  }

  if (s.length >= 8) return s;
  return null;
}

export function isBusinessMomentType(momentType: string | null | undefined): boolean {
  const t = (momentType || "").toUpperCase();
  return t.includes("BUSINESS") || t.startsWith("BIZ") || t === "ORG";
}
