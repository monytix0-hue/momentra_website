"use client";

import { APP_CONTEXTS, useAppContextState } from "@/components/theme/AppContextProvider";
import { contextDisplayName } from "@/lib/bottomNavTabs";
import { tokensFor } from "@/lib/contextTokens";

const shellTokens = tokensFor("personal");

export function MomentraContextSwitcher() {
  const { context, setContext } = useAppContextState();

  return (
    <div
      className="flex h-11 shrink-0 items-center gap-1 px-4"
      style={{ background: shellTokens.colors.surfaceContainer }}
    >
      {APP_CONTEXTS.map((ctx) => {
        const isSelected = context === ctx;
        const tabTokens = tokensFor(ctx);

        return (
          <button
            key={ctx}
            type="button"
            onClick={() => setContext(ctx)}
            className="flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background: isSelected
                ? tabTokens.colors.primaryContainer
                : "transparent",
              color: isSelected
                ? tabTokens.colors.onPrimaryContainer
                : shellTokens.colors.textSecondary,
            }}
          >
            {contextDisplayName(ctx)}
          </button>
        );
      })}
    </div>
  );
}
