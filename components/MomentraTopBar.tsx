"use client";

import { Plus, ScanLine } from "lucide-react";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { brandTokens } from "@/lib/brandTokens";
import type { UserResponse } from "@/lib/api/types";

type MomentraTopBarProps = {
  user?: UserResponse | null;
  onSettingsClick?: () => void;
  onNewMomentClick?: () => void;
  /** Show QR join scanner (Group / Business). */
  showScanInviteButton?: boolean;
  onScanInviteClick?: () => void;
};

export function MomentraTopBar({
  user,
  onSettingsClick,
  onNewMomentClick,
  showScanInviteButton = false,
  onScanInviteClick,
}: MomentraTopBarProps) {
  return (
    <header
      className="flex h-14 shrink-0 items-center gap-2 px-4"
      style={{ backgroundColor: brandTokens.brand }}
    >
      <img
        src="/momentra_logo_dark.svg"
        alt="Momentra"
        className="h-8 w-auto max-w-[140px]"
      />
      <div className="flex-1" />
      {showScanInviteButton ? (
        <button
          type="button"
          onClick={onScanInviteClick}
          aria-label="Scan invite QR"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-white shadow-md"
          style={{ backgroundColor: `${brandTokens.cta}CC` }}
        >
          <ScanLine className="h-4 w-4" strokeWidth={2.5} />
        </button>
      ) : null}
      <button
        type="button"
        onClick={onNewMomentClick}
        aria-label="New moment"
        className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-white shadow-md"
        style={{ backgroundColor: brandTokens.cta }}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
      <UserAvatar
        photoUrl={user?.photo_url}
        displayName={user?.display_name}
        email={user?.email}
        size={40}
        onClick={onSettingsClick}
      />
    </header>
  );
}
