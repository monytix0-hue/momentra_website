"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { hasStoredSession } from "@/lib/auth/tokens";
import { markSplashSeen, shouldSkipSplash } from "@/lib/auth/splashSession";
import { SplashScreen } from "./SplashScreen";

function shouldShowSplashOnMount(): boolean {
  if (typeof window === "undefined") return false;
  // Returning users: skip splash so refresh never hides the app behind a blank overlay.
  if (hasStoredSession()) return false;
  return !shouldSkipSplash();
}

export function SplashGate({ children }: { children: React.ReactNode }) {
  const { isRestoring } = useAuth();
  const hadSessionOnMount = useRef(false);
  // Always false on first render so SSR HTML matches the client (hydration-safe).
  const [showSplash, setShowSplash] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    hadSessionOnMount.current = hasStoredSession();
    setShowSplash(shouldShowSplashOnMount());
  }, []);

  const dismissSplash = useCallback(() => {
    setShowSplash((visible) => {
      if (!visible) return false;
      markSplashSeen();
      setFadeOut(true);
      window.setTimeout(() => setShowSplash(false), 300);
      return visible;
    });
  }, []);

  const handleAnimationFinish = useCallback(() => {
    setAnimationDone(true);
  }, []);

  useEffect(() => {
    if (!showSplash) return;

    if (hadSessionOnMount.current) {
      if (!isRestoring) {
        dismissSplash();
      }
      return;
    }

    if (animationDone) {
      dismissSplash();
    }
  }, [animationDone, dismissSplash, isRestoring, showSplash]);

  return (
    <>
      {children}
      {showSplash ? (
        <div
          className="fixed inset-0 z-50 min-h-screen h-screen transition-opacity duration-300"
          style={{
            opacity: fadeOut ? 0 : 1,
            pointerEvents: fadeOut ? "none" : "auto",
          }}
          aria-hidden={fadeOut}
        >
          <SplashScreen onFinish={handleAnimationFinish} />
        </div>
      ) : null}
    </>
  );
}
