"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { memoryMicroLabelStyle } from "@/components/personal/empty/shared/emptyStyles";

export function LifeSectionLabel({ children }: { children: React.ReactNode }) {
  const tokens = useThemeTokens();
  return <p style={memoryMicroLabelStyle(tokens)}>{children}</p>;
}
