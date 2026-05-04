"use client";

import { motion } from "framer-motion";
import { Layers, Puzzle, Eye, Unlink } from "lucide-react";
import { staggerContainer, fadeUp } from "@/lib/animations";

const painPoints = [
  {
    icon: Layers,
    title: "Scattered",
    description: "Expenses, budgets, and goals live across personal, group, and business accounts with no unified view.",
  },
  {
    icon: Puzzle,
    title: "Shared confusion",
    description: "Group payments, trips, and shared bills are impossible to track without endless spreadsheets and debates.",
  },
  {
    icon: Eye,
    title: "Business opacity",
    description: "Business spending lacks transparency, approvals are manual, and vendor payments slip through cracks.",
  },
  {
    icon: Unlink,
    title: "Disconnected budgets",
    description: "Budgets feel disconnected from real life. You're told how much you spent, not why it matters.",
  },
];

export default function Problem() {
  return (
    <section id="problem" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12 sm:mb-16 text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 sm:mb-6 text-white">
            Money apps track transactions. Momentra understands context.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base sm:text-lg lg:text-xl text-[rgba(245,240,255,0.45)] max-w-3xl mx-auto leading-relaxed">
            Traditional finance apps leave you with raw numbers and missed insights. Momentra connects your spending to the real-life moments that matter.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto"
        >
          {painPoints.map((point, i) => (
            <motion.div
              key={point.title}
              variants={fadeUp}
              className="bg-s100 border border-[rgba(245,240,255,0.05)] rounded-xl p-5 sm:p-6 hover:border-personal/[0.2] transition-all duration-500 group"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-personal/[0.1] text-personal-accent mb-4 group-hover:scale-110 transition-transform duration-300">
                <point.icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{point.title}</h3>
              <p className="text-sm sm:text-base text-[rgba(245,240,255,0.45)] leading-relaxed">{point.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
