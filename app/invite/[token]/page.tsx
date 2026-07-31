"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { acceptInvite } from "@/lib/api/group";
import {
  ApiError,
  acceptBusinessWorkspaceInvite,
  previewCompanyInvite,
  type CompanyInvitePreview,
} from "@/lib/api/client";
import { extractInviteToken } from "@/lib/invite/inviteToken";
import {
  clearPendingInviteState,
  stashInviteJoinedResult,
  stashPendingCompanyInvite,
  stashPendingInvite,
} from "@/lib/invite/pendingInvite";
import { resolveInviteAcceptTarget } from "@/lib/invite/inviteAcceptNavigation";
import {
  isTerminalInviteStatus,
  safePreviewFields,
  terminalMessage,
} from "@/lib/invite/publicInvitePreview";
import { MomentraAnalytics } from "@/lib/analytics";

const OPAQUE_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6,16}$/i;
const PENDING_COMPANY_SWITCH_KEY = "momentra:pending-company-switch";

function resolveToken(rawParam: string): string | null {
  const decoded = (() => {
    try {
      return decodeURIComponent(rawParam);
    } catch {
      return rawParam;
    }
  })();
  return extractInviteToken(decoded) ?? extractInviteToken(rawParam);
}

export default function PublicInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const { user, isRestoring } = useAuth();
  const [preview, setPreview] = useState<CompanyInvitePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const acceptOnceRef = useRef(false);
  const autoAcceptTriedRef = useRef(false);
  const tokenRef = useRef<string | null>(null);

  const rawParam = typeof params.token === "string" ? params.token : "";
  const token = resolveToken(rawParam);
  tokenRef.current = token;

  useEffect(() => {
    if (!token) {
      setLoadingPreview(false);
      setPreviewError("This invite link is invalid.");
      return;
    }

    let cancelled = false;
    setLoadingPreview(true);
    setPreviewError(null);

    void (async () => {
      // Opaque codes: public preview (no access token).
      if (OPAQUE_RE.test(token)) {
        try {
          const p = await previewCompanyInvite(token);
          if (cancelled) return;
          setPreview(p);
          setLoadingPreview(false);
          return;
        } catch (err) {
          if (cancelled) return;
          // Not a company/group opaque preview — may still be legacy JWT path.
          if (err instanceof ApiError && (err.status === 404 || err.code === "INVALID")) {
            setPreview(null);
            setLoadingPreview(false);
            // Legacy JWT: no public preview; show continue-to-auth shell.
            return;
          }
          setPreviewError(
            err instanceof Error ? err.message : "Could not load invite preview",
          );
          setLoadingPreview(false);
          return;
        }
      }
      // Legacy JWT / workspace token — no public preview payload.
      setPreview(null);
      setLoadingPreview(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const clearAndGoHome = useCallback(() => {
    clearPendingInviteState();
    try {
      sessionStorage.removeItem(PENDING_COMPANY_SWITCH_KEY);
    } catch {
      /* ignore */
    }
    router.replace("/app");
  }, [router]);

  const continueToAuth = useCallback(() => {
    if (!token) return;
    clearPendingInviteState();
    if (preview?.invite_type === "COMPANY" || OPAQUE_RE.test(token)) {
      // Prefer company stash when preview says COMPANY; opaque unknown falls through
      // to company preview on resume via AppShell company + moment drains.
      if (preview?.invite_type === "COMPANY") {
        stashPendingCompanyInvite(token);
      } else {
        stashPendingInvite(token);
      }
    } else {
      stashPendingInvite(token);
    }
    void MomentraAnalytics.logCustomEvent("invite_continue_to_auth", {
      invite_type: preview?.invite_type ?? "UNKNOWN",
    });
    router.replace("/app");
  }, [token, preview, router]);

  const acceptInviteOnce = useCallback(async () => {
    if (!token || acceptOnceRef.current || accepting) return;
    acceptOnceRef.current = true;
    setAccepting(true);
    setAcceptError(null);
    setStatusLine("Joining…");

    try {
      void MomentraAnalytics.logCustomEvent("invite_deep_link_open", {
        source: "web_route",
        legacy_or_opaque: OPAQUE_RE.test(token) ? "OPAQUE_CODE" : "LEGACY_JWT",
      });

      if (preview?.invite_type === "COMPANY" || (OPAQUE_RE.test(token) && !preview)) {
        try {
          const p = preview ?? (await previewCompanyInvite(token));
          if (p.invite_type === "COMPANY") {
            if (isTerminalInviteStatus(p.status) && p.status !== "ACCEPTED") {
              setAcceptError(terminalMessage(p));
              setStatusLine(null);
              clearPendingInviteState();
              return;
            }
            const result = await acceptBusinessWorkspaceInvite(token);
            void MomentraAnalytics.logCustomEvent("company_invite_accept_success", {
              result: "ACCEPTED",
            });
            clearPendingInviteState();
            try {
              sessionStorage.setItem(
                PENDING_COMPANY_SWITCH_KEY,
                String((result as { id?: string }).id || ""),
              );
            } catch {
              /* ignore */
            }
            setStatusLine("Joined company");
            router.replace("/app");
            return;
          }
        } catch (err) {
          if (err instanceof ApiError && err.code === "ALREADY_MEMBER") {
            clearPendingInviteState();
            setStatusLine("Already a member");
            router.replace("/app");
            return;
          }
          // Fall through to moment accept when preview was not company.
          if (preview?.invite_type === "COMPANY") throw err;
        }
      }

      const result = await acceptInvite(token);
      void MomentraAnalytics.logCustomEvent("invite_accept_response_received");
      const target = resolveInviteAcceptTarget(result);
      if (!target) {
        void MomentraAnalytics.logCustomEvent("invite_accept_failed");
        setAcceptError("Could not resolve joined moment");
        setStatusLine(null);
        return;
      }
      void MomentraAnalytics.logCustomEvent("invite_target_resolved");
      void MomentraAnalytics.logCustomEvent("invite_accept_success", {
        already_member: target.alreadyMember ? "true" : "false",
      });
      clearPendingInviteState();
      stashInviteJoinedResult({
        moment_id: target.momentId,
        moment_name: target.momentName,
        moment_type: target.momentType,
        already_member: target.alreadyMember,
        result: target.outcome,
        target_id: target.momentId,
      });
      setStatusLine(
        target.alreadyMember
          ? `Already a member of ${target.momentName}`
          : `Joined ${target.momentName}`,
      );
      router.replace("/app");
    } catch (err) {
      acceptOnceRef.current = false;
      void MomentraAnalytics.logCustomEvent("invite_accept_failed");
      const code =
        err instanceof ApiError ? String(err.code || "").toUpperCase() : "";
      if (
        code === "EXPIRED" ||
        code === "REVOKED" ||
        code === "EXHAUSTED" ||
        code === "INVALID"
      ) {
        clearPendingInviteState();
        setAcceptError(terminalMessage({ status: code, result_code: code }));
      } else if (code === "ALREADY_MEMBER") {
        clearPendingInviteState();
        setStatusLine("Already a member");
        router.replace("/app");
        return;
      } else {
        setAcceptError(err instanceof Error ? err.message : "Could not accept invite");
      }
      setStatusLine(null);
    } finally {
      setAccepting(false);
    }
  }, [token, preview, accepting, router]);

  // Authenticated auto-accept only after restore settles and preview loaded
  // (or legacy path with no preview). Company/group ACTIVE previews require CTA.
  useEffect(() => {
    if (isRestoring || loadingPreview || !user || !token) return;
    if (preview?.status === "ACTIVE") return;
    if (preview && isTerminalInviteStatus(preview.status)) return;
    if (autoAcceptTriedRef.current) return;
    autoAcceptTriedRef.current = true;
    void acceptInviteOnce();
  }, [isRestoring, loadingPreview, user, token, preview, acceptInviteOnce]);

  const fields = safePreviewFields(preview);
  const terminal =
    preview && isTerminalInviteStatus(preview.status) && preview.status !== "ACTIVE";

  if (!token) {
    return (
      <Shell>
        <p className="text-sm text-red-300">This invite link is invalid.</p>
        <button type="button" className="mt-3 text-sm underline opacity-80" onClick={clearAndGoHome}>
          Go to Momentra
        </button>
      </Shell>
    );
  }

  if (isRestoring || loadingPreview) {
    return (
      <Shell>
        <Loader2 className="size-8 animate-spin opacity-80" aria-hidden />
        <p className="text-sm opacity-90">Opening invite…</p>
      </Shell>
    );
  }

  if (previewError) {
    return (
      <Shell>
        <p className="text-sm text-red-300">{previewError}</p>
        <button
          type="button"
          className="mt-3 text-sm underline opacity-80"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
        <button type="button" className="mt-2 text-sm underline opacity-80" onClick={clearAndGoHome}>
          Cancel
        </button>
      </Shell>
    );
  }

  if (terminal && fields) {
    return (
      <Shell>
        <PreviewCard fields={fields} />
        <p className="mt-4 text-sm text-amber-200">{terminalMessage(preview)}</p>
        <button type="button" className="mt-3 text-sm underline opacity-80" onClick={clearAndGoHome}>
          Go to Momentra
        </button>
      </Shell>
    );
  }

  if (fields && preview?.status === "ACTIVE") {
    return (
      <Shell>
        <PreviewCard fields={fields} />
        {acceptError ? <p className="mt-3 text-sm text-red-300">{acceptError}</p> : null}
        {statusLine ? <p className="mt-3 text-sm opacity-90">{statusLine}</p> : null}
        {!user ? (
          <button
            type="button"
            onClick={continueToAuth}
            className="mt-6 w-full max-w-xs rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={accepting}
            onClick={() => void acceptInviteOnce()}
            className="mt-6 w-full max-w-xs rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-50"
          >
            {accepting ? "Joining…" : "Accept invite"}
          </button>
        )}
        <button
          type="button"
          className="mt-3 text-sm underline opacity-70"
          onClick={clearAndGoHome}
        >
          Cancel
        </button>
      </Shell>
    );
  }

  // Legacy / no preview — auth resume or auto-accept in progress
  return (
    <Shell>
      {!acceptError ? <Loader2 className="size-8 animate-spin opacity-80" aria-hidden /> : null}
      {statusLine ? <p className="text-sm opacity-90">{statusLine}</p> : null}
      {!user && !acceptError ? (
        <>
          <p className="text-sm opacity-90">Sign in to join this invite.</p>
          <button
            type="button"
            onClick={continueToAuth}
            className="mt-6 w-full max-w-xs rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black"
          >
            Continue
          </button>
        </>
      ) : null}
      {acceptError ? (
        <>
          <p className="text-sm text-red-300">{acceptError}</p>
          <button type="button" className="mt-3 text-sm underline opacity-80" onClick={clearAndGoHome}>
            Go to Momentra
          </button>
        </>
      ) : null}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-[#0c0c0e] px-6 text-center text-white">
      <p className="mb-4 text-lg font-semibold tracking-tight">Momentra</p>
      {children}
    </div>
  );
}

function PreviewCard({
  fields,
}: {
  fields: NonNullable<ReturnType<typeof safePreviewFields>>;
}) {
  return (
    <div className="w-full max-w-sm space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
      <div className="flex items-center gap-3">
        {fields.companyLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fields.companyLogo}
            alt=""
            className="h-12 w-12 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-lg font-bold">
            {fields.companyName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-base font-semibold">{fields.companyName}</p>
          <p className="text-xs opacity-70">
            {fields.inviteType === "COMPANY" ? "Company invite" : "Invite"}
          </p>
        </div>
      </div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="opacity-60">Invited by</dt>
          <dd>{fields.inviterName}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="opacity-60">Role</dt>
          <dd>{fields.roleLabel}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="opacity-60">Expires</dt>
          <dd>
            {fields.expiresAt
              ? new Date(fields.expiresAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="opacity-60">Status</dt>
          <dd>{fields.status}</dd>
        </div>
      </dl>
    </div>
  );
}
