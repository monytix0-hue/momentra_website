import type { AppContext } from "@/lib/appContext";
import type { BottomNavTabId } from "@/lib/bottomNavTabs";

export type ScreenOverlay = "create" | "life_ops_setup" | "quick_add" | "settings" | "life_ops_activity" | "life_ops_edit_activity" | "master_expense" | null;

export function tabToAnalyticsSlug(tab: BottomNavTabId): string {
  return tab === "add" ? "create" : tab;
}

export function resolveScreenName(
  context: AppContext,
  tab: BottomNavTabId,
  overlay: ScreenOverlay,
  previousTab: BottomNavTabId = "pulse",
): string {
  if (overlay === "settings") return "settings";
  if (overlay === "create") return `${context}_create_overlay`;
  if (overlay === "life_ops_setup") return `${context}_life_ops_setup`;
  if (overlay === "quick_add") return `${context}_quick_add`;
  if (overlay === "life_ops_activity") return `${context}_life_ops_activity`;
  if (overlay === "life_ops_edit_activity") return `${context}_life_ops_edit_activity`;
  if (overlay === "master_expense") return `${context}_master_expense`;
  const visibleTab = tab === "add" ? previousTab : tab;
  return `${context}_${tabToAnalyticsSlug(visibleTab)}`;
}
