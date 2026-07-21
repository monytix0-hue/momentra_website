"use client";

import { Bell, ChevronDown, Plus, ScanLine, Search, Settings } from "lucide-react";
import { Life360Mark } from "@/components/life360/Life360Mark";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { brandTokens } from "@/lib/brandTokens";
import type { UserResponse } from "@/lib/api/types";

type MomentraTopBarProps = {
  user?: UserResponse | null;
  onSettingsClick?: () => void;
  onNewMomentClick?: () => void;
  onLife360Click?: () => void;
  /** Show QR join scanner (Group / Business). */
  showScanInviteButton?: boolean;
  onScanInviteClick?: () => void;
  /** Business company workspace chrome */
  businessMode?: boolean;
  companyName?: string | null;
  onCompanySwitcherClick?: () => void;
  onCompanySettingsClick?: () => void;
  onCompanySearchClick?: () => void;
  onCompanyNotificationsClick?: () => void;
};

export function MomentraTopBar({
  user,
  onSettingsClick,
  onNewMomentClick,
  onLife360Click,
  showScanInviteButton = false,
  onScanInviteClick,
  businessMode = false,
  companyName = null,
  onCompanySwitcherClick,
  onCompanySettingsClick,
  onCompanySearchClick,
  onCompanyNotificationsClick,
}: MomentraTopBarProps) {
  return (
    <header
      className="relative flex h-14 shrink-0 items-center gap-2 px-4"
      style={{ backgroundColor: brandTokens.brand }}
    >
      <img
        src="/momentra_logo_dark.svg"
        alt="Momentra"
        className="relative z-10 h-8 w-auto max-w-[140px] shrink-0"
      />

      {businessMode ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex h-14 items-center justify-center px-28">
          <button
            type="button"
            onClick={onCompanySwitcherClick}
            className="pointer-events-auto flex max-w-[min(220px,42vw)] items-center gap-1 rounded-lg px-2 py-1 text-white hover:bg-white/10"
            aria-label="Switch company"
          >
            <span className="truncate text-[15px] font-semibold">
              {companyName || "Select company"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.5} />
          </button>
        </div>
      ) : null}

      <div className="flex-1" />
      {businessMode ? (
        <>
          <button
            type="button"
            onClick={onCompanySearchClick}
            aria-label="Search in company"
            className="relative z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          >
            <Search className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onCompanyNotificationsClick}
            aria-label="Company notifications"
            className="relative z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          >
            <Bell className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onCompanySettingsClick}
            aria-label="Company settings"
            className="relative z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full text-white/90 hover:bg-white/10"
          >
            <Settings className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </>
      ) : null}
      <button
        type="button"
        onClick={onLife360Click}
        aria-label="Life 360"
        className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
      >
        <Life360Mark size={24} />
      </button>
      {showScanInviteButton ? (
        <button
          type="button"
          onClick={onScanInviteClick}
          aria-label="Scan invite QR"
          className="relative z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full text-white shadow-md"
          style={{ backgroundColor: `${brandTokens.cta}CC` }}
        >
          <ScanLine className="h-4 w-4" strokeWidth={2.5} />
        </button>
      ) : null}
      <button
        type="button"
        onClick={onNewMomentClick}
        aria-label="New moment"
        className="relative z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full text-white shadow-md"
        style={{ backgroundColor: brandTokens.cta }}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
      <div className="relative z-10">
        <UserAvatar
          photoUrl={user?.photo_url}
          displayName={user?.display_name}
          email={user?.email}
          size={40}
          onClick={onSettingsClick}
        />
      </div>
    </header>
  );
}
