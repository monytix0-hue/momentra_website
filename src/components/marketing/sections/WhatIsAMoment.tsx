"use client";

import { motion } from "framer-motion";
import { whatIsAMoment } from "@/lib/marketing/copy";
import {
  fadeUp,
  staggerContainer,
  scaleIn,
  viewportConfig,
} from "@/lib/marketing/animations";

export default function WhatIsAMoment() {
  return (
    <section id="what-is-a-moment" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mb-16 text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="mb-6 text-3xl font-extrabold tracking-tight text-text-on-dark sm:text-4xl md:text-5xl"
          >
            {whatIsAMoment.heading}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mkt-muted mx-auto max-w-2xl text-lg leading-relaxed"
          >
            {whatIsAMoment.supporting}
          </motion.p>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="relative mx-auto mb-16 flex min-h-[320px] max-w-3xl items-center justify-center sm:min-h-[380px]"
        >
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full border border-white/20 bg-indigo-700/80 text-center shadow-xl backdrop-blur-sm sm:h-44 sm:w-44">
            <span className="text-xs font-medium uppercase tracking-widest text-indigo-200">
              Moment
            </span>
            <span className="mt-1 text-sm font-semibold text-text-on-dark">
              Living space
            </span>
          </div>

          {whatIsAMoment.facets.map((facet, i) => {
            const angle = (i / whatIsAMoment.facets.length) * Math.PI * 2 - Math.PI / 2;
            const radius = 42;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            return (
              <motion.span
                key={facet}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
                className="absolute rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-text-on-dark backdrop-blur-sm sm:text-sm"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {facet}
              </motion.span>
            );
          })}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.p variants={fadeUp} className="mkt-muted mb-6 text-base leading-relaxed sm:text-lg">
            {whatIsAMoment.body}
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="text-lg font-semibold text-text-on-dark sm:text-xl"
          >
            {whatIsAMoment.phrase}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
