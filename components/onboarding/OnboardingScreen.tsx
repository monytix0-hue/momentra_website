"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MomentraAnalytics } from "@/lib/analytics";
import { markOnboardingSeen } from "@/lib/auth/onboardingSession";
import styles from "./OnboardingScreen.module.css";

const SLIDES = [
  {
    id: "onboarding_1",
    src: "/onboarding/onboarding1.png",
    alt: "Life moves from one moment to another. Personal, group and business moments connect around Momentra.",
  },
  {
    id: "onboarding_2",
    src: "/onboarding/onboarding2.png",
    alt: "Important moments should not feel chaotic. Momentra replaces scattered chats, notes, files, payments and reminders.",
  },
  {
    id: "onboarding_3",
    src: "/onboarding/onboarding3.png",
    alt: "Momentra brings personal, family, shared, community and business moments together in one place.",
  },
] as const;

const SWIPE_THRESHOLD = 52;

export type OnboardingMode = "firstRun" | "replay";

type OnboardingScreenProps = {
  mode?: OnboardingMode;
  onFinished: () => void;
  /** Overlay stacking — keep below splash (z-50) for first-run; above shell for replay. */
  overlayClassName?: string;
};

export function OnboardingScreen({
  mode = "firstRun",
  onFinished,
  overlayClassName = "z-[60]",
}: OnboardingScreenProps) {
  const [page, setPage] = useState(0);
  const [dragX, setDragX] = useState(0);
  const startX = useRef<number | null>(null);
  const isLast = page === SLIDES.length - 1;

  useEffect(() => {
    void MomentraAnalytics.logScreen(SLIDES[page].id);
  }, [page]);

  const finish = useCallback(
    (reason: "skip" | "complete") => {
      if (mode === "firstRun") {
        markOnboardingSeen();
      }
      if (reason === "skip") {
        void MomentraAnalytics.logCustomEvent("onboarding_skip", {
          page: SLIDES[page].id,
          mode,
        });
      } else {
        void MomentraAnalytics.logCustomEvent("onboarding_complete", { mode });
      }
      onFinished();
    },
    [mode, onFinished, page],
  );

  const goNext = useCallback(() => {
    if (isLast) {
      finish("complete");
      return;
    }
    setPage((p) => Math.min(p + 1, SLIDES.length - 1));
  }, [finish, isLast]);

  const goPrevious = useCallback(() => {
    setPage((p) => Math.max(p - 1, 0));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "Enter") goNext();
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "Escape") finish("skip");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finish, goNext, goPrevious]);

  const beginDrag = (clientX: number) => {
    startX.current = clientX;
    setDragX(0);
  };

  const updateDrag = (clientX: number) => {
    if (startX.current === null) return;
    setDragX(clientX - startX.current);
  };

  const finishDrag = () => {
    if (dragX <= -SWIPE_THRESHOLD) goNext();
    if (dragX >= SWIPE_THRESHOLD) goPrevious();
    startX.current = null;
    setDragX(0);
  };

  return (
    <div
      className={`${styles.page} ${overlayClassName}`}
      role="dialog"
      aria-label="Momentra introduction"
    >
      <section
        className={styles.phoneStage}
        onPointerDown={(event) => beginDrag(event.clientX)}
        onPointerMove={(event) => updateDrag(event.clientX)}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div
          className={styles.track}
          style={{
            transform: `translate3d(calc(${-page * 100}% + ${dragX}px), 0, 0)`,
          }}
        >
          {SLIDES.map((slide, slideIndex) => (
            <article
              className={styles.slide}
              key={slide.id}
              aria-hidden={slideIndex !== page}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                className={styles.artwork}
                draggable={false}
              />
            </article>
          ))}
        </div>

        <button
          className={styles.skipHotspot}
          type="button"
          onClick={() => finish("skip")}
          aria-label="Skip onboarding"
        />

        {page === 0 ? (
          <button
            className={styles.wideNextHotspot}
            type="button"
            onClick={goNext}
            aria-label="Next onboarding screen"
          />
        ) : page === 1 ? (
          <button
            className={styles.roundNextHotspot}
            type="button"
            onClick={goNext}
            aria-label="Next onboarding screen"
          />
        ) : (
          <button
            className={styles.enterHotspot}
            type="button"
            onClick={() => finish("complete")}
            aria-label="Enter Momentra"
          />
        )}

        <nav className={styles.dots} aria-label="Onboarding pages">
          {SLIDES.map((slide, dotIndex) => (
            <button
              key={slide.id}
              type="button"
              className={styles.dot}
              onClick={() => setPage(dotIndex)}
              aria-label={`Go to onboarding page ${dotIndex + 1}`}
              aria-current={dotIndex === page ? "step" : undefined}
            />
          ))}
        </nav>
      </section>
    </div>
  );
}
