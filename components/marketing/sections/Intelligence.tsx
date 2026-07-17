"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { intelligence } from "@/lib/marketing/copy";
import {
  fadeUp,
  staggerContainer,
  viewportConfig,
} from "@/lib/marketing/animations";

const healthColors: Record<string, string> = {
  Healthy: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  "Needs attention": "bg-amber-500/20 text-amber-200 border-amber-500/30",
  "At risk": "bg-red-500/20 text-red-300 border-red-500/30",
  "Back on track": "bg-indigo-400/20 text-indigo-200 border-indigo-300/30",
  Completed: "bg-white/10 text-white/80 border-white/20",
};

export default function Intelligence() {
  const [healthIdx, setHealthIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setHealthIdx((i) => (i + 1) % intelligence.healthStates.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const state = intelligence.healthStates[healthIdx];

  return (
    <section id="intelligence" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mb-12 max-w-3xl"
        >
          <motion.h2
            variants={fadeUp}
            className="mb-4 text-3xl font-extrabold tracking-tight text-text-on-dark sm:text-4xl md:text-5xl"
          >
            {intelligence.heading}
          </motion.h2>
          <motion.p variants={fadeUp} className="mkt-muted text-lg leading-relaxed">
            {intelligence.supporting}
          </motion.p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {intelligence.helpsWith.map((item) => (
              <motion.li
                key={item}
                variants={fadeUp}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80"
              >
                {item}
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.7 }}
            className="rounded-2xl border border-white/10 bg-indigo-700/40 p-8 text-center"
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-white/40">
              Living moment health
            </p>
            <motion.div
              key={state}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mx-auto mb-6 inline-flex rounded-full border px-5 py-2 text-sm font-semibold ${healthColors[state]}`}
            >
              {state}
            </motion.div>
            <p className="mkt-muted mx-auto max-w-sm text-sm leading-relaxed">
              {intelligence.closing}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
