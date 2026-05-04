"use client";

import { motion } from "framer-motion";
import { House, Users, Building2, Sparkles } from "lucide-react";
import { staggerContainer, fadeUp, slideInLeft, slideInRight } from "@/lib/animations";

const timelineItems = [
  { icon: House, label: "Monthly living expenses" },
  { icon: Users, label: "Goa trip with friends" },
  { icon: Building2, label: "Q2 marketing campaign" },
  { icon: Sparkles, label: "AI-powered suggestions" },
];

const bulletPoints = [
  "Group your spending by real-life context",
  "Share moments with family, friends, or teammates",
  "Set budgets and track progress within each moment",
  "Get AI-powered insights and action suggestions",
];

export default function CoreConcept() {
  return (
    <section id="core-concept" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-12 sm:mb-16 text-center">
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gradient-circle">
            Moments are the new way to manage money.
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div variants={slideInLeft} className="space-y-6">
            <p className="text-base sm:text-lg text-[rgba(245,240,255,0.6)] leading-relaxed">
              A Moment is a container for any real-life financial context — a month, a trip, a project, a goal. Instead of seeing disjointed transactions, you see complete stories with budgets, timelines, and the people involved.
            </p>
            <div className="space-y-4">
              {bulletPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-brand shrink-0" />
                  <span className="text-sm sm:text-base text-[rgba(245,240,255,0.45)]">{pt}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={slideInRight} className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-[rgba(245,240,255,0.1)]" />
            <div className="space-y-6">
              {timelineItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 relative"
                >
                  <div className="relative z-10 inline-flex items-center justify-center w-10 h-10 rounded-full bg-personal/[0.1] text-personal-accent shrink-0">
                    <item.icon size={18} />
                  </div>
                  <div className="bg-s100 border border-[rgba(245,240,255,0.05)] rounded-lg px-4 py-3 flex-1 flex items-center justify-between hover:border-personal/[0.2] transition-all duration-300">
                    <span className="text-sm sm:text-base font-medium text-white">{item.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
