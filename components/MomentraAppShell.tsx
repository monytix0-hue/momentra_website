"use client";

import { useEffect, useState } from "react";
import { MomentraTopBar } from "@/components/MomentraTopBar";
import { InviteQrScanModal } from "@/components/invite/InviteQrScanModal";
import { MomentraContextSwitcher } from "@/components/shell/MomentraContextSwitcher";
import { SettingsSheet } from "@/components/settings/SettingsSheet";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  useAppContextState,
  useThemeTokens,
} from "@/components/theme/AppContextProvider";
import { MomentraAnalytics } from "@/lib/analytics";
import { openBusinessCreateOverlay } from "@/lib/businessShellEvents";
import { openGroupCreateOverlay } from "@/lib/groupShellEvents";
import { openPersonalCreateOverlay } from "@/lib/personalShellEvents";
import { isBusinessMomentType } from "@/lib/invite/inviteToken";
import type { AppContext } from "@/lib/appContext";
import {
  clearSwitchError,
  getContextSnapshot,
  subscribeContextStore,
} from "@/stores/contextStore";

type MomentraAppShellProps = {
  children: (context: AppContext) => React.ReactNode;
};

export function MomentraAppShell({ children }: MomentraAppShellProps) {
  const { context, mountedContexts, setContext } = useAppContextState();
  const tokens = useThemeTokens();
  const { user, isLoading, logout, setUser } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showScanInvite, setShowScanInvite] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const canScanInvite = context === "group" || context === "business";

  useEffect(() => {
    if (showSettings) {
      void MomentraAnalytics.logScreen("settings");
      void MomentraAnalytics.logCustomEvent("settings_open");
    }
  }, [showSettings]);

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
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("momentra:invite-joined", {
                detail: result,
              }),
            );
          }
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
        />
      ) : null}
    </div>
  );
}
