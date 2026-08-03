"use client";

import { useId, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { InfoCommentBubble } from "@/components/shared/InfoCommentBubble";

type Props = {
  title: string;
  body: string;
  label?: string;
};

/** Accessible "?" comment bubble for jargon fields. */
export function GuidedSetupExplainer({
  title,
  body,
  label = "More information",
}: Props) {
  const { colors } = useThemeTokens();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <span className="relative inline-flex align-middle">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-full"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <HelpCircle
          className="size-4 opacity-70"
          aria-hidden
          style={{ color: colors.textSecondary }}
        />
      </button>
      <InfoCommentBubble
        open={open}
        onClose={() => {
          setOpen(false);
          buttonRef.current?.focus();
        }}
        triggerRef={buttonRef}
        title={title}
        panelId={panelId}
        body={body}
      />
    </span>
  );
}
