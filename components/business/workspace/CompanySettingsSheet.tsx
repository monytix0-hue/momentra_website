"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Check, Copy, QrCode, X } from "lucide-react";
import QRCode from "react-qr-code";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { businessCardStyle } from "@/components/business/empty/shared/emptyStyles";
import type { BusinessWorkspaceSummary } from "@/lib/api/business";
import { ApiError } from "@/lib/api/client";
import {
  canRevokeInvite,
  formatInviteDate,
  formatInviteStatusLabel,
  formatUseCount,
  recoverableInviteUrl,
  type CompanyInviteInventoryItem,
} from "@/lib/invite/companyInviteInventory";
import { BusinessRepository } from "@/repositories/BusinessRepository";

type Section = "general" | "members" | "roles" | "security";

type CompanySettingsSheetProps = {
  open: boolean;
  onClose: () => void;
  workspace: BusinessWorkspaceSummary | null;
  onUpdated: () => void;
};

const SECTIONS: { id: Section; label: string }[] = [
  { id: "general", label: "General" },
  { id: "members", label: "Members" },
  { id: "roles", label: "Roles" },
  { id: "security", label: "Security" },
];

const COMING_SOON = ["Departments", "Billing", "Integrations", "Audit"];

export function CompanySettingsSheet({
  open,
  onClose,
  workspace,
  onUpdated,
}: CompanySettingsSheetProps) {
  const tokens = useThemeTokens();
  const { colors, radius } = tokens;
  const [section, setSection] = useState<Section>("general");
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<
    Array<{ member_id: string; user_id: string; role: string; status: string }>
  >([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [lastInviteId, setLastInviteId] = useState<string | null>(null);
  const [rawLinksById, setRawLinksById] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [qrInviteId, setQrInviteId] = useState<string | null>(null);

  const [invites, setInvites] = useState<CompanyInviteInventoryItem[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [invitesError, setInvitesError] = useState<string | null>(null);
  const [invitesDenied, setInvitesDenied] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const canManageInvites =
    workspace?.role === "OWNER" || workspace?.role === "MANAGER";

  const clearRawInviteSession = useCallback(() => {
    setLastInviteLink(null);
    setLastInviteId(null);
    setRawLinksById({});
    setQrInviteId(null);
    setCopied(false);
  }, []);

  const refreshInviteInventory = useCallback(async () => {
    if (!workspace || !canManageInvites) return;
    setInvitesLoading(true);
    setInvitesError(null);
    setInvitesDenied(false);
    try {
      const res = await BusinessRepository.listOpaqueInvites(workspace.id);
      setInvites((res.invites ?? []) as CompanyInviteInventoryItem[]);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 403 || e.status === 401)) {
        setInvitesDenied(true);
        setInvites([]);
      } else {
        setInvitesError(e instanceof Error ? e.message : "Could not load invites");
      }
    } finally {
      setInvitesLoading(false);
    }
  }, [workspace, canManageInvites]);

  useEffect(() => {
    if (!open || !workspace) return;
    setName(workspace.name);
    setIndustry(workspace.industry ?? "");
    setCurrency(workspace.currency ?? "INR");
    setTimezone(workspace.timezone ?? "Asia/Kolkata");
    setSection("general");
    setError(null);
    clearRawInviteSession();
    void BusinessRepository.listWorkspaceMembers(workspace.id)
      .then((res) => setMembers(res.members ?? []))
      .catch(() => setMembers([]));
  }, [open, workspace, clearRawInviteSession]);

  useEffect(() => {
    if (!open || !workspace || section !== "members" || !canManageInvites) return;
    void refreshInviteInventory();
  }, [open, workspace, section, canManageInvites, refreshInviteInventory]);

  useEffect(() => {
    if (section !== "members") {
      clearRawInviteSession();
    }
  }, [section, clearRawInviteSession]);

  if (!open || !workspace) return null;

  const fieldStyle: CSSProperties = {
    width: "100%",
    borderRadius: radius.input,
    border: `1px solid color-mix(in srgb, ${colors.border} 55%, transparent)`,
    background: colors.surfaceContainer,
    color: colors.textPrimary,
    padding: "10px 12px",
    fontFamily: "inherit",
  };

  function handleClose() {
    clearRawInviteSession();
    onClose();
  }

  async function saveGeneral() {
    setSaving(true);
    setError(null);
    try {
      await BusinessRepository.updateWorkspace(workspace!.id, {
        name,
        industry: industry || null,
        currency_code: currency,
        timezone,
      });
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function createLinkInvite() {
    setSaving(true);
    setError(null);
    setCopied(false);
    try {
      const result = await BusinessRepository.createOpaqueInvite(workspace!.id, {
        role_code: inviteRole,
        expires_in_days: 7,
        max_uses: 10,
      });
      const link =
        (typeof result.invite_url === "string" && result.invite_url) ||
        (typeof result.code === "string" && result.code
          ? `${window.location.origin}/invite/${result.code}`
          : null);
      if (link && result.invite_id) {
        setLastInviteLink(link);
        setLastInviteId(result.invite_id);
        setRawLinksById((prev) => ({ ...prev, [result.invite_id]: link }));
        setQrInviteId(result.invite_id);
      }
      await refreshInviteInventory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create invite");
    } finally {
      setSaving(false);
    }
  }

  async function sendInvite() {
    setSaving(true);
    setError(null);
    setCopied(false);
    try {
      const result = await BusinessRepository.inviteWorkspaceMember(workspace!.id, {
        email: inviteEmail,
        role: inviteRole,
      });
      const inviteId =
        typeof result.invitation_id === "string"
          ? result.invitation_id
          : typeof result.invite_id === "string"
            ? result.invite_id
            : null;
      const link =
        (typeof result.invite_link === "string" && result.invite_link) ||
        (typeof result.qr_payload === "string" && result.qr_payload) ||
        (typeof result.code === "string" && result.code
          ? `${window.location.origin}/invite/${result.code}`
          : null) ||
        (typeof result.token === "string" && result.token
          ? `${window.location.origin}/invite/${result.token}`
          : null);
      if (link) {
        setLastInviteLink(link);
        if (inviteId) {
          setLastInviteId(inviteId);
          setRawLinksById((prev) => ({ ...prev, [inviteId]: link }));
          setQrInviteId(inviteId);
        }
      }
      setInviteEmail("");
      const res = await BusinessRepository.listWorkspaceMembers(workspace!.id);
      setMembers(res.members ?? []);
      await refreshInviteInventory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not invite");
    } finally {
      setSaving(false);
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError("Could not copy link");
    }
  }

  async function revokeInvite(inviteId: string) {
    if (
      !confirm(
        "Revoke this invite? People with the link will no longer be able to join.",
      )
    ) {
      return;
    }
    setRevokingId(inviteId);
    setError(null);
    try {
      await BusinessRepository.revokeOpaqueInvite(inviteId);
      setInvites((prev) =>
        prev.map((inv) =>
          inv.invite_id === inviteId ? { ...inv, status: "REVOKED" } : inv,
        ),
      );
      if (lastInviteId === inviteId) {
        setLastInviteLink(null);
        setLastInviteId(null);
      }
      setRawLinksById((prev) => {
        const next = { ...prev };
        delete next[inviteId];
        return next;
      });
      if (qrInviteId === inviteId) setQrInviteId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not revoke invite");
      await refreshInviteInventory();
    } finally {
      setRevokingId(null);
    }
  }

  async function archiveWorkspace() {
    if (!confirm(`Archive ${workspace!.name}? This hides the company for all members.`)) {
      return;
    }
    setSaving(true);
    try {
      await BusinessRepository.updateWorkspace(workspace!.id, { status: "ARCHIVED" });
      onUpdated();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not archive");
    } finally {
      setSaving(false);
    }
  }


  return (
    <div
      className="fixed inset-0 z-[85] flex items-end justify-center font-[family-name:var(--font-plus-jakarta)] sm:items-center"
      data-momentra-context="business"
    >
      <button
        type="button"
        className="absolute inset-0"
        style={{ background: "rgba(11, 16, 32, 0.72)" }}
        aria-label="Close company settings"
        onClick={handleClose}
      />
      <div
        className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden shadow-2xl sm:rounded-2xl"
        style={{
          background: colors.surfaceElevated,
          color: colors.textPrimary,
          borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
          border: `1px solid color-mix(in srgb, ${colors.border} 45%, transparent)`,
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            borderBottom: `1px solid color-mix(in srgb, ${colors.border} 40%, transparent)`,
          }}
        >
          <div>
            <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              Company Settings
            </h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {workspace.name}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2"
            style={{ color: colors.textSecondary }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className="flex gap-1 overflow-x-auto px-3 py-2"
          style={{
            borderBottom: `1px solid color-mix(in srgb, ${colors.border} 40%, transparent)`,
          }}
        >
          {SECTIONS.map((s) => {
            const active = section === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className="shrink-0 px-3 py-1.5 text-sm font-semibold"
                style={{
                  borderRadius: radius.pill,
                  background: active ? colors.brandPrimary : colors.surfaceContainer,
                  color: active ? colors.brandOnPrimary : colors.textSecondary,
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {error ? (
            <p
              className="mb-3 px-3 py-2 text-sm"
              style={{
                background: "color-mix(in srgb, #f87171 18%, transparent)",
                color: colors.error,
                borderRadius: radius.md,
              }}
            >
              {error}
            </p>
          ) : null}

          {section === "general" ? (
            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block" style={{ color: colors.textSecondary }}>
                  Company name
                </span>
                <input style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block" style={{ color: colors.textSecondary }}>
                  Industry
                </span>
                <input
                  style={fieldStyle}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block" style={{ color: colors.textSecondary }}>
                  Currency
                </span>
                <input
                  style={fieldStyle}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  maxLength={3}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block" style={{ color: colors.textSecondary }}>
                  Timezone
                </span>
                <input
                  style={fieldStyle}
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </label>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveGeneral()}
                className="w-full py-2.5 text-sm font-semibold disabled:opacity-50"
                style={{
                  background: colors.brandPrimary,
                  color: colors.brandOnPrimary,
                  borderRadius: radius.button,
                }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              {workspace.role === "OWNER" ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void archiveWorkspace()}
                  className="w-full py-2.5 text-sm font-semibold"
                  style={{
                    border: `1px solid color-mix(in srgb, ${colors.error} 45%, transparent)`,
                    color: colors.error,
                    borderRadius: radius.button,
                  }}
                >
                  Archive workspace
                </button>
              ) : null}
            </div>
          ) : null}

          {section === "members" ? (
            <div className="space-y-4">
              <ul className="space-y-2">
                {members.map((m) => (
                  <li
                    key={m.member_id}
                    className="flex items-center justify-between px-3 py-2 text-sm"
                    style={{
                      ...businessCardStyle(tokens),
                      borderRadius: radius.md,
                    }}
                  >
                    <span
                      className="truncate font-mono text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {m.user_id.slice(0, 8)}…
                    </span>
                    <span className="font-semibold" style={{ color: colors.textPrimary }}>
                      {m.role}
                    </span>
                  </li>
                ))}
              </ul>

              {canManageInvites ? (
                <div
                  className="space-y-3 pt-3"
                  style={{
                    borderTop: `1px solid color-mix(in srgb, ${colors.border} 40%, transparent)`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      Invites
                    </p>
                    <button
                      type="button"
                      onClick={() => void refreshInviteInventory()}
                      disabled={invitesLoading}
                      className="text-xs font-semibold disabled:opacity-50"
                      style={{ color: colors.brandPrimary }}
                    >
                      Refresh
                    </button>
                  </div>

                  {invitesLoading ? (
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Loading invites…
                    </p>
                  ) : null}
                  {invitesDenied ? (
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      You do not have permission to manage invites.
                    </p>
                  ) : null}
                  {invitesError ? (
                    <div className="space-y-2">
                      <p className="text-sm" style={{ color: "#c45c5c" }}>
                        {invitesError}
                      </p>
                      <button
                        type="button"
                        onClick={() => void refreshInviteInventory()}
                        className="text-sm font-semibold"
                        style={{ color: colors.brandPrimary }}
                      >
                        Retry
                      </button>
                    </div>
                  ) : null}
                  {!invitesLoading &&
                  !invitesDenied &&
                  !invitesError &&
                  invites.length === 0 ? (
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      No invites yet. Create a link below.
                    </p>
                  ) : null}

                  <ul className="space-y-2">
                    {invites.map((inv) => {
                      const url = recoverableInviteUrl(inv, rawLinksById);
                      const showQr = qrInviteId === inv.invite_id && url;
                      return (
                        <li
                          key={inv.invite_id}
                          className="space-y-2 px-3 py-2.5 text-sm"
                          style={{
                            ...businessCardStyle(tokens),
                            borderRadius: radius.md,
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p
                                className="font-semibold"
                                style={{ color: colors.textPrimary }}
                              >
                                {inv.role_code || "MEMBER"}
                                <span
                                  className="ml-2 text-xs font-medium"
                                  style={{ color: colors.textSecondary }}
                                >
                                  {formatInviteStatusLabel(inv.status)}
                                </span>
                              </p>
                              <p
                                className="mt-0.5 text-xs"
                                style={{ color: colors.textSubtle }}
                              >
                                …{inv.code_suffix} · {formatUseCount(inv.use_count, inv.max_uses)}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: colors.textSubtle }}
                              >
                                Created {formatInviteDate(inv.created_at)} · Expires{" "}
                                {formatInviteDate(inv.expires_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {url ? (
                              <button
                                type="button"
                                onClick={() => void copyLink(url)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold"
                                style={{
                                  border: `1px solid color-mix(in srgb, ${colors.border} 55%, transparent)`,
                                  borderRadius: radius.button,
                                  color: colors.textPrimary,
                                }}
                              >
                                {copied && lastInviteId === inv.invite_id ? (
                                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" strokeWidth={2.5} />
                                )}
                                Copy link
                              </button>
                            ) : null}
                            {url ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setQrInviteId((id) =>
                                    id === inv.invite_id ? null : inv.invite_id,
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold"
                                style={{
                                  border: `1px solid color-mix(in srgb, ${colors.border} 55%, transparent)`,
                                  borderRadius: radius.button,
                                  color: colors.textPrimary,
                                }}
                              >
                                <QrCode className="h-3.5 w-3.5" strokeWidth={2.5} />
                                QR
                              </button>
                            ) : null}
                            {canRevokeInvite(inv.status) ? (
                              <button
                                type="button"
                                disabled={revokingId === inv.invite_id}
                                onClick={() => void revokeInvite(inv.invite_id)}
                                className="px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50"
                                style={{
                                  border: `1px solid color-mix(in srgb, ${colors.border} 55%, transparent)`,
                                  borderRadius: radius.button,
                                  color: colors.textPrimary,
                                }}
                              >
                                {revokingId === inv.invite_id ? "Revoking…" : "Revoke"}
                              </button>
                            ) : null}
                          </div>
                          {showQr && url ? (
                            <div
                              className="mx-auto flex items-center justify-center p-3"
                              style={{
                                background: "#fff",
                                borderRadius: radius.md,
                                width: "fit-content",
                              }}
                            >
                              <QRCode value={url} size={128} />
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>

                  <div
                    className="space-y-2 pt-3"
                    style={{
                      borderTop: `1px solid color-mix(in srgb, ${colors.border} 40%, transparent)`,
                    }}
                  >
                    <p
                      className="text-sm font-semibold"
                      style={{ color: colors.textPrimary }}
                    >
                      Invite member
                    </p>
                    <input
                      style={fieldStyle}
                      placeholder="email@company.com (optional for email path)"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <select
                      style={fieldStyle}
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="MANAGER">Manager</option>
                    </select>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void createLinkInvite()}
                      className="w-full py-2.5 text-sm font-semibold disabled:opacity-50"
                      style={{
                        background: colors.brandPrimary,
                        color: colors.brandOnPrimary,
                        borderRadius: radius.button,
                      }}
                    >
                      Create invite link
                    </button>
                    <button
                      type="button"
                      disabled={saving || !inviteEmail.includes("@")}
                      onClick={() => void sendInvite()}
                      className="w-full py-2.5 text-sm font-semibold disabled:opacity-50"
                      style={{
                        border: `1px solid color-mix(in srgb, ${colors.border} 55%, transparent)`,
                        color: colors.textPrimary,
                        borderRadius: radius.button,
                      }}
                    >
                      Send email invite
                    </button>
                    {lastInviteLink ? (
                      <div className="space-y-3 pt-2">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: colors.textPrimary }}
                        >
                          Invite link ready
                        </p>
                        <p
                          className="break-all text-xs"
                          style={{ color: colors.textSecondary }}
                        >
                          {lastInviteLink}
                        </p>
                        <button
                          type="button"
                          onClick={() => void copyLink(lastInviteLink)}
                          className="flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold"
                          style={{
                            border: `1px solid color-mix(in srgb, ${colors.border} 55%, transparent)`,
                            color: colors.textPrimary,
                            borderRadius: radius.button,
                          }}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" strokeWidth={2.5} />
                          ) : (
                            <Copy className="h-4 w-4" strokeWidth={2.5} />
                          )}
                          {copied ? "Copied" : "Copy link"}
                        </button>
                        <div
                          className="mx-auto flex items-center justify-center p-3"
                          style={{
                            background: "#fff",
                            borderRadius: radius.md,
                            width: "fit-content",
                          }}
                        >
                          <QRCode value={lastInviteLink} size={148} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {section === "roles" ? (
            <div className="space-y-3 text-sm" style={{ color: colors.textSecondary }}>
              <p>
                Workspace roles inherit into Moments. Moment membership can tighten access
                further.
              </p>
              <ul className="space-y-2">
                {[
                  ["Owner", "full admin, archive"],
                  ["Manager", "invite, edit profile"],
                  ["Member", "create and work moments"],
                ].map(([title, desc]) => (
                  <li
                    key={title}
                    className="px-3 py-2"
                    style={{
                      ...businessCardStyle(tokens),
                      borderRadius: radius.md,
                    }}
                  >
                    <strong style={{ color: colors.textPrimary }}>{title}</strong> — {desc}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {section === "security" ? (
            <div className="space-y-2 text-sm" style={{ color: colors.textSecondary }}>
              <p>Only Owners and Managers can invite people to this company.</p>
              <p>Archive requires Owner. Audit log arrives in a later phase.</p>
            </div>
          ) : null}

          <div
            className="mt-6 pt-4"
            style={{
              borderTop: `1px solid color-mix(in srgb, ${colors.border} 40%, transparent)`,
            }}
          >
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-[0.1em]"
              style={{ color: colors.textSubtle }}
            >
              Coming soon
            </p>
            <ul className="grid grid-cols-2 gap-2">
              {COMING_SOON.map((label) => (
                <li
                  key={label}
                  className="px-3 py-2 text-sm"
                  style={{
                    border: `1px dashed color-mix(in srgb, ${colors.border} 55%, transparent)`,
                    color: colors.textSubtle,
                    borderRadius: radius.md,
                  }}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
