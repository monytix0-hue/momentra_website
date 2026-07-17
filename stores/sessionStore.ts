import { clearTokens } from "@/lib/auth/tokens";
import { clearProactiveTokenRefresh } from "@/lib/auth/tokenRefresh";
import { clearBootstrapOnLogout } from "@/stores/bootstrapStore";
import { clearAllPersonalSessionOnLogout } from "@/stores/personalSessionStore";

export function clearSessionOnLogout(): void {
  clearProactiveTokenRefresh();
  clearTokens();
  clearBootstrapOnLogout();
  clearAllPersonalSessionOnLogout();
}
