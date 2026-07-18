"use client";

import { useEffect, useRef, useState } from "react";
import { MomentraTopBar } from "@/components/MomentraTopBar";
import { InviteQrScanModal } from "@/components/invite/InviteQrScanModal";
import { MomentraContextSwitcher } from "@/components/shell/MomentraContextSwitcher";
import { SettingsSheet } from "@/components/settings/SettingsSheet";
import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  useAppContextState,
  useThemeTokens,
} from "@/components/theme/AppContextProvider";
import { MomentraAnalytics } from "@/lib/analytics";
import { acceptInvite } from "@/lib/api/group";
import { openBusinessCreateOverlay } from "@/lib/businessShellEvents";
import { openGroupCreateOverlay } from "@/lib/groupShellEvents";
import { openPersonalCreateOverlay } from "@/lib/personalShellEvents";
import { isBusinessMomentType } from "@/lib/invite/inviteToken";
import { consumeInviteJoinedResult, consumePendingInvite } from "@/lib/invite/pendingInvite";
import type { AppContext } from "@/lib/appContext";
import {
  clearSwitchError,
  getContextSnapshot,
  subscribeContextStore,
} from "@/stores/contextStore";

function dispatchInviteJoined(detail: {
  moment_id: string;
  moment_name: string;
  moment_type?: string | null;
  already_member?: boolean;
  participant_id?: string | null;
}) {
  window.dispatchEvent(new CustomEvent("momentra:invite-joined", { detail }));
}
type MomentraAppShellProps = {
  children: (context: AppContext) => React.ReactNode;
};

export function MomentraAppShell({ children }: MomentraAppShellProps) {
  const { context, mountedContexts, setContext } = useAppContextState();
  const tokens = useThemeTokens();
  const { user, isLoading, logout, setUser } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboardingReplay, setShowOnboardingReplay] = useState(false);
  const [showScanInvite, setShowScanInvite] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const canScanInvite = context === "group" || context === "business";
  const pendingInviteHandled = useRef(false);

  useEffect(() => {
    if (showSettings) {
      void MomentraAnalytics.logScreen("settings");
      void MomentraAnalytics.logCustomEvent("settings_open");
    }
  }, [showSettings]);

  // After login (or cold open of /app with a stashed invite), accept once and open the moment.
  // Also replay an accept result stashed by /invite/[token] once the shell is mounted.
  useEffect(() => {
    if (!user || pendingInviteHandled.current) return;

    const stashed = consumeInviteJoinedResult();
    if (stashed) {
      pendingInviteHandled.current = true;
      const biz = isBusinessMomentType(stashed.moment_type);
      setContext(biz ? "business" : "group");
      // Defer so GroupHomePlaceholder can subscribe first.
      window.setTimeout(() => dispatchInviteJoined(stashed), 0);
      return;
    }

    const token = consumePendingInvite();
    if (!token) return;
    pendingInviteHandled.current = true;
    void (async () => {
      try {
        void MomentraAnalytics.logCustomEvent("invite_deep_link_open", {
          source: "pending_after_login",
        });
        const result = await acceptInvite(token);
        void MomentraAnalytics.logCustomEvent("invite_accept_success", {
          already_member: Boolean(result.already_member),
        });
        const biz = isBusinessMomentType(result.moment_type);
        setContext(biz ? "business" : "group");
        window.setTimeout(() => dispatchInviteJoined(result), 0);
      } catch {
        void MomentraAnalytics.logCustomEvent("invite_accept_failed");
        pendingInviteHandled.current = false;
      }
    })();
  }, [user, setContext]);

  useEffect(() => {
    return subscribeContextStore(() => {
      setSwitchError(getContextSnapshot().switchError);
    });
  }, []);

  useEffect(() => {
    if (!switchError) return;
    const t = window.setTimeout(() => {
      clearSwitchError();
      setSwitchError(null);
    }, 4000);
    return () => window.clearTimeout(t);
  }, [switchError]);

  return (
    <div
      data-momentra-context={context}
      className="flex h-dvh min-h-0 flex-1 flex-col overflow-hidden"
      style={{
        background: tokens.colors.background,
        color: tokens.colors.textPrimary,
      }}
    >
      <div className="shrink-0">
        <MomentraTopBar
          user={user}
          showScanInviteButton={canScanInvite}
          onScanInviteClick={() => {
            void MomentraAnalytics.logCustomEvent("invite_scan_open", {
              app_context: context,
              source: "top_bar",
            });
            setShowScanInvite(true);
          }}
          onSettingsClick={() => setShowSettings(true)}
          onNewMomentClick={() => {
            if (context === "personal") {
              void MomentraAnalytics.logCustomEvent("create_open", {
                app_context: context,
                source: "top_bar",
              });
              openPersonalCreateOverlay();
            } else if (context === "group") {
              void MomentraAnalytics.logCustomEvent("create_open", {
                app_context: context,
                source: "top_bar",
              });
              openGroupCreateOverlay();
            } else if (context === "business") {
              void MomentraAnalytics.logCustomEvent("create_open", {
                app_context: context,
                source: "top_bar",
              });
              openBusinessCreateOverlay();
            } else {
              alert("Create moment — coming soon");
            }
          }}
        />
        <div className="h-px bg-white/10" />
        <MomentraContextSwitcher />
        <div className="h-px bg-white/10" />
        {switchError ? (
          <div
            role="status"
            className="px-4 py-2 text-center text-xs font-medium"
            style={{
              background: "rgba(180, 40, 40, 0.92)",
              color: "#fff",
            }}
          >
            {switchError}
          </div>
        ) : null}
      </div>

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {(["personal", "group", "business"] as AppContext[]).map((ctx) =>
          mountedContexts.has(ctx) ? (
            <div
              key={ctx}
              className="absolute inset-0 flex min-h-0 flex-col transition-opacity duration-300"
              style={{
                opacity: context === ctx ? 1 : 0,
                pointerEvents: context === ctx ? "auto" : "none",
              }}
              aria-hidden={context !== ctx}
            >
              {children(ctx)}
            </div>
          ) : null,
        )}
      </main>

      <InviteQrScanModal
        open={showScanInvite}
        onClose={() => setShowScanInvite(false)}
        onJoined={(result) => {
          const biz = isBusinessMomentType(result.moment_type);
          setContext(biz ? "business" : "group");
          // Defer so GroupHome can mount after context switch.
          window.setTimeout(() => dispatchInviteJoined(result), 50);
        }}
      />

      {showSettings && user ? (
        <SettingsSheet
          user={user}
          isLoading={isLoading}
          onClose={() => setShowSettings(false)}
          onSignOut={() => {
            setShowSettings(false);
            logout();
          }}
          onUserUpdated={setUser}
          onViewIntro={() => {
            void MomentraAnalytics.logCustomEvent("onboarding_replay_open");
            setShowSettings(false);
            setShowOnboardingReplay(true);
          }}
        />
      ) : null}

      {showOnboardingReplay ? (
        <OnboardingScreen
          mode="replay"
          onFinished={() => setShowOnboardingReplay(false)}
        />
      ) : null}
    </div>
  );
}
