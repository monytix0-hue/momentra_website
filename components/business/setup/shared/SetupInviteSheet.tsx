"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { setupChoices } from "@/lib/business/setupCatalog";

type Props = {
  open: boolean;
  onClose: () => void;
  memberName?: string;
  currentMethod?: string;
  onSelect: (method: string) => void;
};

export function SetupInviteSheet({
  open,
  onClose,
  memberName,
  currentMethod,
  onSelect,
}: Props) {
  const { colors } = useThemeTokens();
  if (!open) return null;

  const methods = setupChoices("invite_methods");

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close invite sheet"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-t-2xl p-4 sm:rounded-2xl"
        style={{ background: colors.background, color: colors.textPrimary }}
        role="dialog"
        aria-label="Invite method"
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Invite{memberName ? ` ${memberName}` : ""}</p>
            <p className="text-xs opacity-60">Choose how to send the invitation.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2"
            style={{ background: colors.surfaceContainer }}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-2">
          {methods.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => {
                onSelect(m.value);
                onClose();
              }}
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold"
              style={{
                background:
                  currentMethod === m.value
                    ? `color-mix(in srgb, ${colors.primary} 16%, transparent)`
                    : colors.surfaceContainer,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type InviteButtonProps = {
  memberName?: string;
  method?: string;
  onSelect: (method: string) => void;
};

export function SetupInviteButton({ memberName, method, onSelect }: InviteButtonProps) {
  const { colors } = useThemeTokens();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg px-3 py-1.5 text-xs font-semibold"
        style={{ background: colors.surfaceContainer }}
      >
        Invite
      </button>
      <SetupInviteSheet
        open={open}
        onClose={() => setOpen(false)}
        memberName={memberName}
        currentMethod={method}
        onSelect={onSelect}
      />
    </>
  );
}
