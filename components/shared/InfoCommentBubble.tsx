"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";

export type InfoCommentSection = {
  label: string;
  body: string;
};

export type InfoCommentPlacement = "above" | "below";

type Position = {
  top: number;
  left: number;
  placement: InfoCommentPlacement;
  caretLeft: number;
};

const MARGIN = 8;
const GAP = 8;
const MAX_WIDTH = 320;
const CARET = 8;

function computePosition(
  trigger: DOMRect,
  bubbleW: number,
  bubbleH: number,
): Position {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceBelow = vh - trigger.bottom - MARGIN;
  const spaceAbove = trigger.top - MARGIN;
  const placement: InfoCommentPlacement =
    spaceBelow >= bubbleH + GAP || spaceBelow >= spaceAbove ? "below" : "above";

  let top =
    placement === "below"
      ? trigger.bottom + GAP
      : trigger.top - bubbleH - GAP;

  let left = trigger.left;
  const maxLeft = vw - bubbleW - MARGIN;
  if (left > maxLeft) left = Math.max(MARGIN, maxLeft);
  if (left < MARGIN) left = MARGIN;

  const caretLeft = Math.min(
    Math.max(CARET + 4, trigger.left + trigger.width / 2 - left),
    bubbleW - CARET - 4,
  );

  // Clamp vertically if somehow still overflowing
  if (top < MARGIN) top = MARGIN;
  if (top + bubbleH > vh - MARGIN) top = Math.max(MARGIN, vh - bubbleH - MARGIN);

  return { top, left, placement, caretLeft };
}

type InfoCommentBubbleProps = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  title: string;
  panelId?: string;
  /** What/Why/How style blocks. */
  sections?: InfoCommentSection[];
  /** Simple body when sections are not used. */
  body?: string;
  children?: ReactNode;
};

/** Animated, auto-positioned comment-box bubble for (i) / help explainers. */
export function InfoCommentBubble({
  open,
  onClose,
  triggerRef,
  title,
  panelId,
  sections,
  body,
  children,
}: InfoCommentBubbleProps) {
  const { colors, radius, shadows } = useThemeTokens();
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Position | null>(null);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const tr = trigger.getBoundingClientRect();
    const br = panel.getBoundingClientRect();
    setPos(computePosition(tr, br.width || MAX_WIDTH, br.height || 120));
  }, [triggerRef]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (!mounted) return;
    setVisible(false);
    const t = window.setTimeout(
      () => setMounted(false),
      reduceMotion ? 80 : 120,
    );
    return () => window.clearTimeout(t);
  }, [open, mounted, reduceMotion]);

  useLayoutEffect(() => {
    if (!mounted) return;
    updatePosition();
    // Next frame: enable enter animation after position is known
    const raf = requestAnimationFrame(() => {
      updatePosition();
      setVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [mounted, updatePosition]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      onClose();
    };
    const onScroll = () => updatePosition();
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [mounted, onClose, triggerRef, updatePosition]);

  if (!mounted || typeof document === "undefined") return null;

  const placement = pos?.placement ?? "below";
  const borderColor = `color-mix(in srgb, ${colors.border} 40%, transparent)`;
  const bg = colors.surfaceElevated || colors.surfaceContainer;

  const panelStyle: CSSProperties = {
    position: "fixed",
    top: pos?.top ?? -9999,
    left: pos?.left ?? -9999,
    zIndex: 80,
    width: `min(${MAX_WIDTH}px, calc(100vw - ${MARGIN * 2}px))`,
    maxWidth: MAX_WIDTH,
    borderRadius: radius.card ?? radius.lg ?? 12,
    border: `1px solid ${borderColor}`,
    background: bg,
    color: colors.textPrimary,
    boxShadow: shadows
      ? `0 ${shadows.cardOffsetY}px ${shadows.cardRadius}px ${shadows.cardColor}`
      : "0 12px 32px rgba(0,0,0,0.35)",
    padding: 12,
    opacity: visible ? 1 : 0,
    transform: visible
      ? "scale(1)"
      : reduceMotion
        ? "scale(1)"
        : "scale(0.96)",
    transformOrigin: placement === "below" ? "top center" : "bottom center",
    transition: reduceMotion
      ? "opacity 80ms ease-out"
      : "opacity 180ms ease-out, transform 180ms ease-out",
    pointerEvents: visible ? "auto" : "none",
  };

  const caretStyle: CSSProperties = {
    position: "absolute",
    left: pos?.caretLeft ?? 16,
    width: 0,
    height: 0,
    borderLeft: `${CARET}px solid transparent`,
    borderRight: `${CARET}px solid transparent`,
    ...(placement === "below"
      ? {
          top: -CARET,
          borderBottom: `${CARET}px solid ${bg}`,
        }
      : {
          bottom: -CARET,
          borderTop: `${CARET}px solid ${bg}`,
        }),
  };

  return createPortal(
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-label={title}
      style={panelStyle}
    >
      <span aria-hidden style={caretStyle} />
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
          {title}
        </p>
        <button
          type="button"
          className="flex size-8 shrink-0 items-center justify-center rounded-full"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="size-3.5" style={{ color: colors.textSecondary }} />
        </button>
      </div>
      {sections?.map((s) => (
        <div key={s.label} className="mb-2 last:mb-0">
          <p
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: colors.textSecondary, opacity: 0.7 }}
          >
            {s.label}
          </p>
          <p
            className="mt-0.5 text-xs leading-relaxed"
            style={{ color: colors.textSecondary, opacity: 0.95 }}
          >
            {s.body}
          </p>
        </div>
      ))}
      {body && !sections?.length ? (
        <p
          className="text-xs leading-relaxed"
          style={{ color: colors.textSecondary, opacity: 0.9 }}
        >
          {body}
        </p>
      ) : null}
      {children}
    </div>,
    document.body,
  );
}
