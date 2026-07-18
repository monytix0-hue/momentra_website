"use client";

import type { ReactNode } from "react";
import { useThemeTokens } from "@/components/theme/AppContextProvider";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function SetupSectionCard({ title, children, className }: Props) {
  const { colors } = useThemeTokens();
  return (
    <section
      className={`space-y-4 rounded-2xl border p-4 sm:p-5 ${className ?? ""}`}
      style={{
        borderColor: `color-mix(in srgb, ${colors.border} 40%, transparent)`,
        background: colors.surfaceContainer,
      }}
    >
      <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
