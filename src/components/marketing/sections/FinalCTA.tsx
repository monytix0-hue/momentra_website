"use client";

import { motion } from "framer-motion";
import CTAButton from "@/components/marketing/CTAButton";
import { finalCta } from "@/lib/marketing/copy";
import {
  fadeUp,
  staggerContainer,
  viewportConfig,
} from "@/lib/marketing/animations";

export default function FinalCTA() {
  return (
    <section id="cta" className="relative overflow-hidden py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="orb-circle absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <motion.h2
            variants={fadeUp}
            className="mb-6 text-3xl font-extrabold tracking-tight text-text-on-dark sm:text-4xl md:text-5xl"
          >
            {finalCta.heading}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mkt-muted mb-4 text-base leading-relaxed sm:text-lg"
          >
            {finalCta.supporting}
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="mb-10 text-lg font-semibold text-text-on-dark"
          >
            {finalCta.close}
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <CTAButton
              variant="primary"
              size="lg"
              href={finalCta.primaryCta.href}
              event={finalCta.primaryCta.event}
            >
              {finalCta.primaryCta.label}
            </CTAButton>
            <CTAButton
              variant="secondary"
              size="lg"
              href={finalCta.secondaryCta.href}
              event={finalCta.secondaryCta.event}
            >
              {finalCta.secondaryCta.label}
            </CTAButton>
          </motion.div>
          <motion.p variants={fadeUp} className="mkt-muted text-sm">
            {finalCta.line}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
