"use client";

import { motion } from "framer-motion";
import { sharedArchitecture } from "@/lib/marketing/copy";
import {
  fadeUp,
  staggerContainer,
  viewportConfig,
} from "@/lib/marketing/animations";

function BulletList({ points }: { points: string[] }) {
  if (points.length === 0) return null;

  return (
    <ul className="space-y-1">
      {points.map((p) => (
        <li key={p} className="text-xs text-white/55">
          · {p}
        </li>
      ))}
    </ul>
  );
}

export default function SharedArchitecture() {
  return (
    <section id="architecture" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mb-14 text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="mb-4 text-3xl font-extrabold tracking-tight text-text-on-dark sm:text-4xl md:text-5xl"
          >
            {sharedArchitecture.heading}
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="relative flex snap-x gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {sharedArchitecture.areas.map((area, i) => {
            const isLife = area.name === "Life";
            const supporting =
              "supporting" in area && area.supporting ? area.supporting : null;

            return (
              <motion.div
                key={area.name}
                variants={fadeUp}
                className={`relative mkt-surface flex h-full w-[220px] shrink-0 snap-center flex-col rounded-2xl border border-white/10 p-5 lg:w-auto ${
                  isLife ? "lg:col-span-2" : "lg:col-span-1"
                }`}
              >
                {i < sharedArchitecture.areas.length - 1 ? (
                  <div className="pointer-events-none absolute top-1/2 -right-2 z-10 hidden h-px w-4 bg-gradient-to-r from-white/30 to-transparent lg:block" />
                ) : null}

                {isLife ? (
                  <div className="flex h-full flex-col lg:grid lg:grid-cols-2 lg:gap-4">
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ember-500">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mb-2 text-lg font-bold text-text-on-dark">
                        {area.name}
                      </h3>
                      <p className="mkt-muted mb-2 text-sm leading-relaxed">
                        {area.description}
                      </p>
                      {supporting ? (
                        <p className="mkt-muted mb-3 text-sm leading-relaxed lg:mb-0">
                          {supporting}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-3 lg:mt-0 lg:flex lg:flex-col lg:justify-center">
                      <BulletList points={area.points} />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ember-500">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mb-2 text-lg font-bold text-text-on-dark">
                      {area.name}
                    </h3>
                    <p className="mkt-muted mb-3 text-sm leading-relaxed">
                      {area.description}
                    </p>
                    <BulletList points={area.points} />
                  </>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
