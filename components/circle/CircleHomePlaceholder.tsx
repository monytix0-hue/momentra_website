"use client";

import { useEffect } from "react";
import { CircleEmpty } from "@/components/circle/CircleEmpty";
import { CircleUpdated } from "@/components/circle/CircleUpdated";
import {
  useAppContextState,
  useThemeTokens,
} from "@/components/theme/AppContextProvider";
import { openBusinessCreateOverlay } from "@/lib/businessShellEvents";
import { openGroupCreateOverlay } from "@/lib/groupShellEvents";
import {
  ensureCircleSession,
  useCircleSessionStore,
} from "@/stores/circleSessionStore";

type CircleHomePlaceholderProps = {
  title?: string;
};

export function CircleHomePlaceholder({ title = "Circle" }: CircleHomePlaceholderProps) {
  const tokens = useThemeTokens();
  const { setContext } = useAppContextState();
  const session = useCircleSessionStore();

  useEffect(() => {
    void ensureCircleSession();
  }, []);

  function handleCreateGroupMoment() {
    setContext("group");
    window.setTimeout(() => openGroupCreateOverlay(), 50);
  }

  function handleCreateBusinessWorkspace() {
    setContext("business");
    window.setTimeout(() => openBusinessCreateOverlay(), 50);
  }

  const isEmpty = !session.loading && session.participantCount === 0;

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: tokens.colors.background, color: tokens.colors.textPrimary }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto pb-8">
        <header className="flex items-end justify-between px-5 pb-2 pt-4">
          <div>
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: tokens.colors.brandPrimary }}
            >
              {title}
            </h1>
            <p
              className="text-[11px] font-medium"
              style={{ color: tokens.colors.textSubtle }}
            >
              {isEmpty || session.loading
                ? "Your people across shared and business moments."
                : "Active State"}
            </p>
          </div>
        </header>

        {session.loading && session.participants.length === 0 ? (
          <div
            className="flex flex-1 items-center justify-center px-6 py-20 text-sm"
            style={{ color: tokens.colors.textSecondary }}
          >
            Loading Circle…
          </div>
        ) : session.error && session.participants.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
            <p className="text-sm" style={{ color: tokens.colors.textSecondary }}>
              {session.error}
            </p>
            <button
              type="button"
              className="rounded-2xl px-5 py-2.5 text-sm font-semibold"
              style={{
                background: tokens.colors.primaryContainer,
                color: tokens.colors.onPrimaryContainer,
              }}
              onClick={() => void ensureCircleSession(true)}
            >
              Retry
            </button>
          </div>
        ) : isEmpty ? (
          <CircleEmpty
            onCreateGroupMoment={handleCreateGroupMoment}
            onCreateBusinessWorkspace={handleCreateBusinessWorkspace}
          />
        ) : (
          <CircleUpdated
            participants={session.participants}
            suggestions={session.suggestions}
            recentActivity={session.recentActivity}
            participantCount={session.participantCount}
            onCreateGroupMoment={handleCreateGroupMoment}
            onCreateBusinessWorkspace={handleCreateBusinessWorkspace}
            onAddToMoment={handleCreateGroupMoment}
          />
        )}
      </div>
    </div>
  );
}
