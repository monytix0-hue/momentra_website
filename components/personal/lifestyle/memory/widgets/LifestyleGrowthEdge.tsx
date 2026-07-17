"use client";

import { useThemeTokens } from "@/components/theme/AppContextProvider";
import { personalGlassCardStyle } from "@/components/personal/empty/shared/emptyStyles";
import type { PersonalLifeOpsGrowthEdge } from "@/lib/api/personal";
import { ArrowUpRight } from "lucide-react";

type Props = { edge: PersonalLifeOpsGrowthEdge };

export function LifestyleGrowthEdge({ edge }: Props) {
  const tokens = useThemeTokens();
  const { colors } = tokens;

  return (
    <section style={{ ...personalGlassCardStyle(tokens), borderRadius: 16, padding: 16 }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Next Growth Edge</p>
          <h3 className="mt-1 text-lg font-bold">{edge.title}</h3>
          <p className="mt-2 text-sm opacity-70">{edge.body}</p>
        </div>
        <ArrowUpRight size={24} color={colors.brandPrimary} />
      </div>
    </section>
  );
}
