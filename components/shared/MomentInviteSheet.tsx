"use client";

import { useMemo, useState } from "react";
import { Copy, Loader2, Mail, MessageCircle, X } from "lucide-react";
import QRCode from "react-qr-code";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { GroupSetupInviteSection } from "@/components/group/setup/shared/GroupSetupInviteSection";
import { BusinessSetupRepository } from "@/repositories/BusinessSetupRepository";
import { setupChoices } from "@/lib/business/setupCatalog";
import type { BusinessSetupInviteDraft } from "@/lib/api/business";
import {
  copyInviteLink,
  inviteShareLink,
  openInviteMailto,
  openInviteSms,
  openInviteWhatsApp,
} from "@/lib/invite/shareInviteChannels";

type MomentInviteSheetProps = {
  open: boolean;
  onClose: () => void;
  momentId: string | null;
  momentLabel?: string;
  momentTypeCode?: string | null;
  variant: "group" | "business";
};

function rolesKeyForTypeCode(
  typeCode: string | null | undefined,
): "team_roles" | "runway_roles" | "ops_roles" {
  const code = (typeCode ?? "").toUpperCase().replace(/-/g, "_");
  if (code.includes("RUNWAY")) return "runway_roles";
  if (code.includes("OPERATION") && !code.includes("TEAM")) return "ops_roles";
  return "team_roles";
}

function defaultRole(
  roles: { value: string }[],
  typeCode: string | null | undefined,
): string {
  if (roles.some((r) => r.value === "MEMBER")) return "MEMBER";
  const code = (typeCode ?? "").toUpperCase();
  if (code.includes("RUNWAY") && roles.some((r) => r.value === "CONTRIBUTOR")) {
    return "CONTRIBUTOR";
  }
  return roles[0]?.value ?? "MEMBER";
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Switcher invite surface — Group uses invite-draft panel;
 * Business: pick invitee role, then mint setup invite-draft + share channels.
 */
export function MomentInviteSheet({
  open,
  onClose,
  momentId,
  momentLabel,
  momentTypeCode,
  variant,
}: MomentInviteSheetProps) {
  const { colors, radius } = useThemeTokens();
  const roleChoices = useMemo(() => {
    const key = rolesKeyForTypeCode(momentTypeCode);
    return setupChoices(key).filter((c) => c.value !== "OWNER");
  }, [momentTypeCode]);

  const [selectedRole, setSelectedRole] = useState(() =>
    defaultRole(roleChoices, momentTypeCode),
  );
  const [bizDraft, setBizDraft] = useState<BusinessSetupInviteDraft | null>(null);
  const [bizError, setBizError] = useState<string | null>(null);
  const [bizLoading, setBizLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (!open || !momentId) return null;

  const bizLink = bizDraft ? inviteShareLink(bizDraft) : "";

  const createBusinessInvite = async () => {
    setBizLoading(true);
    setBizError(null);
    setBizDraft(null);
    setStatus(null);
    try {
      const draft = await BusinessSetupRepository.createInviteDraft(
        momentId,
        null,
        "LINK",
        selectedRole,
      );
      const link = draft.invite_link || draft.qr_payload || "";
      if (!link) {
        setBizError("Could not load invite");
        return;
      }
      setBizDraft(draft);
    } catch (e) {
      setBizError(e instanceof Error ? e.message : "Could not load invite");
    } finally {
      setBizLoading(false);
    }
  };

  const secondaryBtn = {
    background: colors.surfaceContainer,
    color: colors.textPrimary,
  } as const;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center font-[family-name:var(--font-plus-jakarta)] sm:items-center"
      role="dialog"
      aria-label="Invite to moment"
    >
      <button
        type="button"
        className="absolute inset-0"
        style={{ background: "rgba(11, 16, 32, 0.72)" }}
        aria-label="Close invite"
        onClick={onClose}
      />
      <div
        className="relative z-10 max-h-[85dvh] w-full max-w-md overflow-y-auto shadow-2xl sm:rounded-2xl"
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
            <h2 className="text-lg font-semibold">
              {variant === "business" ? "Invite teammate" : "Invite"}
            </h2>
            {momentLabel ? (
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                {momentLabel}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2"
            style={{ color: colors.textSecondary }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-4">
          {variant === "group" ? (
            <GroupSetupInviteSection momentId={momentId} />
          ) : (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold">Role for this invite</p>
                <div className="flex flex-wrap gap-2">
                  {roleChoices.map((choice) => {
                    const selected = selectedRole === choice.value;
                    return (
                      <button
                        key={choice.value}
                        type="button"
                        className="rounded-full px-3 py-1.5 text-sm"
                        style={{
                          border: `1px solid ${
                            selected
                              ? colors.primary
                              : `color-mix(in srgb, ${colors.border} 55%, transparent)`
                          }`,
                          background: selected
                            ? `color-mix(in srgb, ${colors.primary} 14%, transparent)`
                            : "transparent",
                          color: selected ? colors.primary : colors.textSecondary,
                        }}
                        onClick={() => {
                          setSelectedRole(choice.value);
                          setBizDraft(null);
                          setBizError(null);
                          setStatus(null);
                        }}
                      >
                        {choice.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {bizLoading ? (
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Preparing invite…
                </div>
              ) : bizError ? (
                <p className="text-sm" style={{ color: colors.error }}>
                  {bizError}
                </p>
              ) : bizDraft && bizLink ? (
                <div className="space-y-3">
                  <p className="break-all text-xs" style={{ color: colors.textSecondary }}>
                    {bizLink}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(
                      [
                        {
                          id: "whatsapp",
                          label: "WhatsApp",
                          icon: <WhatsAppGlyph className="size-5" />,
                          onClick: () => {
                            openInviteWhatsApp(bizDraft);
                            setStatus("Opened WhatsApp");
                          },
                        },
                        {
                          id: "sms",
                          label: "Message",
                          icon: <MessageCircle className="size-5" />,
                          onClick: () => {
                            openInviteSms(bizDraft);
                            setStatus("Opened Messages");
                          },
                        },
                        {
                          id: "email",
                          label: "Email",
                          icon: <Mail className="size-5" />,
                          onClick: () => {
                            openInviteMailto(bizDraft);
                            setStatus("Opened mail");
                          },
                        },
                        {
                          id: "copy",
                          label: "Copy Link",
                          icon: <Copy className="size-5" />,
                          onClick: () => {
                            void copyInviteLink(bizDraft).then((ok) => {
                              if (ok) setStatus("Copied");
                            });
                          },
                        },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-[11px] font-medium"
                        style={secondaryBtn}
                        onClick={item.onClick}
                      >
                        {item.icon}
                        <span className="text-center leading-tight">{item.label}</span>
                      </button>
                    ))}
                  </div>
                  {status ? (
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      {status}
                    </p>
                  ) : null}
                  <div
                    className="mx-auto flex items-center justify-center p-3"
                    style={{
                      background: "#fff",
                      borderRadius: radius.md,
                      width: "fit-content",
                    }}
                  >
                    <QRCode value={bizLink} size={148} />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full py-2.5 text-sm font-semibold text-white"
                  style={{
                    background: colors.primary,
                    borderRadius: radius.button,
                  }}
                  onClick={() => void createBusinessInvite()}
                >
                  Create invite link
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
