"use client";

import { Bell, Check, Home, Plus, Search, Settings, Users } from "lucide-react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import type { BusinessWorkspaceSummary } from "@/lib/api/business";

type CompanySwitcherProps = {
  open: boolean;
  onClose: () => void;
  workspaces: BusinessWorkspaceSummary[];
  selectedId: string | null;
  onSelect: (workspaceId: string) => void;
  onSearch: () => void;
  onNotifications: () => void;
  onCompanySettings: () => void;
  onOpenCompanyHome: () => void;
  onCreate: () => void;
  onJoin: () => void;
};

export function CompanySwitcher({
  open,
  onClose,
  workspaces,
  selectedId,
  onSelect,
  onSearch,
  onNotifications,
  onCompanySettings,
  onOpenCompanyHome,
  onCreate,
  onJoin,
}: CompanySwitcherProps) {
  const tokens = useThemeTokens();
  const { colors, radius } = tokens;

  if (!open) return null;

  const divider = {
    borderTop: `1px solid color-mix(in srgb, ${colors.border} 40%, transparent)`,
  };

  return (
    <div
      className="fixed inset-0 z-[80] font-[family-name:var(--font-plus-jakarta)]"
      role="dialog"
      aria-label="Switch company"
      data-momentra-context="business"
    >
      <button
        type="button"
        className="absolute inset-0"
        style={{ background: "rgba(11, 16, 32, 0.72)" }}
        aria-label="Close company switcher"
        onClick={onClose}
      />
      <div
        className="absolute left-3 right-3 top-16 mx-auto max-w-sm overflow-hidden shadow-xl"
        style={{
          background: colors.surfaceElevated,
          border: `1px solid color-mix(in srgb, ${colors.border} 50%, transparent)`,
          borderRadius: radius.xl,
          color: colors.textPrimary,
        }}
      >
        <div
          className="px-4 py-3"
          style={{
            borderBottom: `1px solid color-mix(in srgb, ${colors.border} 40%, transparent)`,
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.1em]"
            style={{ color: colors.textSecondary }}
          >
            Companies
          </p>
        </div>
        <ul className="max-h-64 overflow-y-auto py-1">
          {workspaces.map((ws) => {
            const selected = ws.id === selectedId;
            return (
              <li key={ws.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    background: selected
                      ? colors.primaryContainer
                      : "transparent",
                  }}
                  onClick={() => {
                    onSelect(ws.id);
                    onClose();
                  }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center text-sm font-semibold"
                    style={{
                      background: colors.surfaceContainer,
                      color: colors.onPrimaryContainer,
                      borderRadius: radius.md,
                    }}
                  >
                    {(ws.name || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-[15px] font-semibold"
                      style={{ color: colors.textPrimary }}
                    >
                      {ws.name}
                    </span>
                    <span
                      className="block text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {ws.role}
                    </span>
                  </span>
                  {selected ? (
                    <Check
                      className="h-4 w-4 shrink-0"
                      style={{ color: colors.brandPrimary }}
                      strokeWidth={2.5}
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
          {workspaces.length === 0 ? (
            <li
              className="px-4 py-6 text-center text-sm"
              style={{ color: colors.textSecondary }}
            >
              No companies yet
            </li>
          ) : null}
        </ul>

        <div className="py-1" style={divider}>
          <p
            className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: colors.textSecondary }}
          >
            Quick actions
          </p>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] font-semibold"
            style={{ color: colors.textPrimary }}
            onClick={() => {
              onClose();
              onSearch();
            }}
          >
            <Search className="h-4 w-4" strokeWidth={2.5} style={{ color: colors.brandPrimary }} />
            Search
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] font-semibold"
            style={{ color: colors.textPrimary }}
            onClick={() => {
              onClose();
              onNotifications();
            }}
          >
            <Bell className="h-4 w-4" strokeWidth={2.5} style={{ color: colors.brandPrimary }} />
            Notifications
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] font-semibold disabled:opacity-50"
            style={{ color: colors.textPrimary }}
            disabled={!selectedId}
            onClick={() => {
              onClose();
              onCompanySettings();
            }}
          >
            <Settings className="h-4 w-4" strokeWidth={2.5} style={{ color: colors.brandPrimary }} />
            Company Settings
          </button>
        </div>

        <div className="py-1" style={divider}>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] font-semibold disabled:opacity-50"
            style={{ color: colors.textPrimary }}
            disabled={!selectedId}
            onClick={() => {
              onClose();
              onOpenCompanyHome();
            }}
          >
            <Home className="h-4 w-4" strokeWidth={2.5} style={{ color: colors.brandPrimary }} />
            Company Home
          </button>
        </div>

        <div className="py-1" style={divider}>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] font-semibold"
            style={{ color: colors.textPrimary }}
            onClick={() => {
              onClose();
              onCreate();
            }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} style={{ color: colors.brandPrimary }} />
            Create Company
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] font-semibold"
            style={{ color: colors.textPrimary }}
            onClick={() => {
              onClose();
              onJoin();
            }}
          >
            <Users className="h-4 w-4" strokeWidth={2.5} style={{ color: colors.brandPrimary }} />
            Join Company
          </button>
        </div>
      </div>
    </div>
  );
}
