"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { InfoCommentBubble } from "@/components/shared/InfoCommentBubble";
import { getWidgetExplainer } from "@/lib/personal/widgetExplainers";
import { getGroupWidgetExplainer } from "@/lib/group/widgetExplainers";
import { getBusinessWidgetExplainer } from "@/lib/business/widgetExplainers";
import { personalTypography } from "@/components/personal/empty/shared/emptyStyles";

type WidgetInfoButtonProps = {
  explainerId: string;
  momentTypeCode?: string | null;
  /** Catalog domain; defaults to personal My Money. */
  domain?: "personal" | "group" | "business";
  label?: string;
};

/** Accessible "i" comment bubble: What / Why / How for Personal, Group, or Business widgets. */
export function WidgetInfoButton({
  explainerId,
  momentTypeCode,
  domain = "personal",
  label = "About this widget",
}: WidgetInfoButtonProps) {
  const { colors } = useThemeTokens();
  const explainer =
    domain === "group"
      ? getGroupWidgetExplainer(explainerId, momentTypeCode)
      : domain === "business"
        ? getBusinessWidgetExplainer(explainerId, momentTypeCode)
        : getWidgetExplainer(explainerId, momentTypeCode);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!explainer) return null;

  return (
    <span className="relative inline-flex align-middle">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-full"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <Info
          className="size-3.5 opacity-70"
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
        title={explainer.title}
        panelId={panelId}
        sections={[
          { label: "What it shows", body: explainer.what },
          { label: "Why it matters", body: explainer.why },
          { label: "How we calculate it", body: explainer.how },
        ]}
      />
    </span>
  );
}

type PersonalWidgetSectionHeaderProps = {
  title: string;
  explainerId?: string;
  momentTypeCode?: string | null;
  trailing?: ReactNode;
  uppercase?: boolean;
  className?: string;
};

/** Section title with optional widget info (i) control. */
export function PersonalWidgetSectionHeader({
  title,
  explainerId,
  momentTypeCode,
  trailing,
  uppercase = false,
  className = "",
}: PersonalWidgetSectionHeaderProps) {
  const tokens = useThemeTokens();
  const { colors } = tokens;
  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <div className="flex min-w-0 items-center gap-0.5">
        <h3
          style={{
            ...personalTypography.sectionHeader,
            color: colors.textPrimary,
            ...(uppercase
              ? {
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: 11,
                  opacity: 0.7,
                }
              : {}),
          }}
        >
          {title}
        </h3>
        {explainerId ? (
          <WidgetInfoButton
            explainerId={explainerId}
            momentTypeCode={momentTypeCode}
            domain="personal"
          />
        ) : null}
      </div>
      {trailing}
    </div>
  );
}
