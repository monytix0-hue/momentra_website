"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Plane,
  Home,
  Cake,
  PartyPopper,
  Rocket,
  UsersRound,
} from "lucide-react";
import CTAButton from "@/components/marketing/CTAButton";
import { hero } from "@/lib/marketing/copy";
import { staggerContainer, fadeUp } from "@/lib/marketing/animations";

const icons = [Shield, Plane, Home, Cake, PartyPopper, Rocket, UsersRound];

const accentBorder = {
  personal: "border-indigo-300/30",
  group: "border-[#ff8a6a]/35",
  business: "border-amber-500/30",
} as const;

const accentGlow = {
  personal: "glow-personal-sm",
  group: "glow-group-sm",
  business: "glow-business-sm",
} as const;

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden pt-20"
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="orb-personal absolute top-1/5 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -25, 15, 0], y: [0, 30, -35, 0], scale: [1, 0.9, 1.05, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="orb-group absolute top-1/3 left-1/4 h-[500px] w-[500px] rounded-full blur-[80px]"
        />
        <motion.div
          animate={{ x: [0, 20, -30, 0], y: [0, -25, 15, 0], scale: [1, 1.08, 0.92, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="orb-business absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full blur-[90px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-12 text-center sm:mb-16"
        >
          <motion.h1
            variants={fadeUp}
            className="mb-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-text-on-dark sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {hero.headline}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ delay: 0.55 }}
            className="mb-8 text-xl font-medium text-indigo-100/90 sm:text-2xl md:text-3xl"
          >
            {hero.subheadline}
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="mkt-muted mx-auto mb-8 max-w-2xl text-base leading-relaxed sm:mb-10 sm:text-lg"
          >
            {hero.supporting}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mb-4 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <CTAButton
              variant="primary"
              size="lg"
              href={hero.primaryCta.href}
              event={hero.primaryCta.event}
            >
              {hero.primaryCta.label}
            </CTAButton>
            <CTAButton
              variant="secondary"
              size="lg"
              href={hero.secondaryCta.href}
              event={hero.secondaryCta.event}
            >
              {hero.secondaryCta.label}
            </CTAButton>
          </motion.div>

          <motion.a
            variants={fadeUp}
            href={hero.tertiary.href}
            className="mkt-muted inline-block text-sm underline-offset-4 transition-colors hover:text-text-on-dark hover:underline"
          >
            {hero.tertiary.label}
          </motion.a>
        </motion.div>

        <div className="mx-auto flex max-w-5xl snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:max-w-6xl sm:grid-cols-2 sm:overflow-visible md:grid-cols-3 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {hero.floatingMoments.map((m, i) => {
            const Icon = icons[i % icons.length];
            return (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.4 + i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`mkt-surface relative w-[220px] shrink-0 snap-center rounded-2xl border p-4 sm:w-auto ${accentBorder[m.accent]} ${accentGlow[m.accent]}`}
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 5 + (i % 3),
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-text-on-dark/80">
                      <Icon size={16} />
                    </span>
                    <h3 className="text-sm font-semibold text-text-on-dark">
                      {m.title}
                    </h3>
                  </div>
                  <p className="mb-1 text-xs font-medium text-indigo-100/80">
                    {m.status}
                  </p>
                  <p className="mkt-muted text-xs">{m.detail}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
