/** Client-side invite share openers (WhatsApp / SMS / mailto / clipboard). */

export type InviteShareDraft = {
  invite_link?: string | null;
  qr_payload?: string | null;
  whatsapp_text?: string | null;
  sms_text?: string | null;
  email_subject?: string | null;
  email_body?: string | null;
};

export function inviteShareLink(draft: InviteShareDraft): string {
  return (draft.invite_link || draft.qr_payload || "").trim();
}

export function openInviteWhatsApp(draft: InviteShareDraft): void {
  const text = (draft.whatsapp_text || inviteShareLink(draft)).trim();
  if (!text) return;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

export function openInviteSms(draft: InviteShareDraft, phone?: string | null): void {
  const body = (draft.sms_text || draft.whatsapp_text || inviteShareLink(draft)).trim();
  if (!body) return;
  const cleaned = (phone || "").replace(/[^\d+]/g, "");
  const href = cleaned
    ? `sms:${cleaned}?&body=${encodeURIComponent(body)}`
    : `sms:?&body=${encodeURIComponent(body)}`;
  window.location.href = href;
}

/** Opens mail composer. Email optional — empty To when unknown (switcher sheet). */
export function openInviteMailto(draft: InviteShareDraft, email?: string | null): void {
  const link = inviteShareLink(draft);
  const subject = (draft.email_subject || "You're invited").trim();
  const body = (draft.email_body || link).trim();
  if (!body && !subject) return;
  const to = (email || "").trim();
  const mailto = `mailto:${to ? encodeURIComponent(to) : ""}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

export async function copyInviteLink(draft: InviteShareDraft): Promise<boolean> {
  const link = inviteShareLink(draft);
  if (!link) return false;
  await navigator.clipboard.writeText(link);
  return true;
}
