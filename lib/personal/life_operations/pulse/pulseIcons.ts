import type { LucideIcon } from "lucide-react";
import {
  BatteryCharging,
  Brain,
  Eye,
  ShoppingCart,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Wallet,
} from "lucide-react";

const ACTIVITY_ICON_MAP: Record<string, LucideIcon> = {
  recovery: BatteryCharging,
  expense: ShoppingCart,
  debit: ShoppingCart,
  money: Wallet,
  mood: Smile,
  reflection: Smile,
  adjust: SlidersHorizontal,
  rhythm: SlidersHorizontal,
  attention: Eye,
  intelligence: Brain,
  default: Sparkles,
};

const QUICK_ADD_ICONS: LucideIcon[] = [BatteryCharging, Eye, Smile, Wallet, SlidersHorizontal];

export function resolveActivityIcon(activityType?: string | null, icon?: string | null): LucideIcon {
  const key = (icon || activityType || "").toLowerCase();
  for (const [needle, Icon] of Object.entries(ACTIVITY_ICON_MAP)) {
    if (key.includes(needle)) return Icon;
  }
  return ACTIVITY_ICON_MAP.default;
}

export function quickAddIcon(index: number): LucideIcon {
  return QUICK_ADD_ICONS[index] ?? Sparkles;
}

export const SEGMENT_COLORS = ["#6c4ef2", "#cabeff", "#4cd6ff", "#ffb4ab", "#35c7c7"] as const;

export const GAUGE_COLORS: Record<string, string> = {
  stress: "#ffb4ab",
  capacity: "#c9bfff",
  discipline: "#6c4ef2",
  stability: "#4cd6ff",
};
