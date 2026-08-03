"use client";

import { Loader2 } from "lucide-react";

type Props = {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASS = {
  sm: "size-4",
  md: "size-8",
  lg: "size-10",
} as const;

/** Centered cold-load spinner for sheets, gates, and text-only loading gaps. */
export function LoadingIndicator({ label, className = "", size = "md" }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <Loader2 className={`${SIZE_CLASS[size]} animate-spin opacity-80`} aria-hidden />
      {label ? <p className="text-sm opacity-70">{label}</p> : null}
      <span className="sr-only">{label ?? "Loading"}</span>
    </div>
  );
}
