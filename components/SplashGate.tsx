"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { hasStoredSession } from "@/lib/auth/tokens";
import { markSplashSeen, shouldSkipSplash } from "@/lib/auth/splashSession";
import { SplashScreen } from "./SplashScreen";

const SPLASH_FAILSAFE_MS = 4500;

export function SplashGate({ children }: { children: React.ReactNode }) {
  const { isRestoring } = useAuth();
  const hadSessionOnMount = useRef(false);
  const dismissedRef = useRef(false);
  // Hydration-safe: always show on first paint (matches SSR), then skip if already seen.
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [gateReady, setGateReady] = useState(false);

  useEffect(() => {
    hadSessionOnMount.current = hasStoredSession();
    if (shouldSkipSplash()) {
      dismissedRef.current = true;
      setShowSplash(false);
    }
    setGateReady(true);
  }, []);

  const dismissSplash = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    markSplashSeen();
    setFadeOut(true);
    window.setTimeout(() => setShowSplash(false), 300);
  }, []);

  const handleAnimationFinish = useCallback(() => {
    setAnimationDone(true);
  }, []);

  useEffect(() => {
    if (!gateReady || !showSplash) return;

    // Returning session: dismiss as soon as restore settles, or when mark intro finishes.
    if (hadSessionOnMount.current) {
      if (!isRestoring || animationDone) {
        dismissSplash();
      }
      return;
    }

    if (animationDone) {
      dismissSplash();
    }
  }, [animationDone, dismissSplash, gateReady, isRestoring, showSplash]);

  // Never leave a blank indigo shell if timers/hydration stall.
  useEffect(() => {
    if (!gateReady || !showSplash) return;
    const t = window.setTimeout(() => dismissSplash(), SPLASH_FAILSAFE_MS);
    return () => window.clearTimeout(t);
  }, [dismissSplash, gateReady, showSplash]);

  return (
    <>
      {children}
      {showSplash ? (
        <div
          className="fixed inset-0 z-50 min-h-screen h-screen transition-opacity duration-300"
          style={{ opacity: fadeOut ? 0 : 1 }}
        >
          <SplashScreen onFinish={handleAnimationFinish} />
        </div>
      ) : null}
    </>
  );
}
