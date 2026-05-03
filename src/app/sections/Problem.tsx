"use client";

import { motion } from "framer-motion";
import { Layers, Puzzle, Eye, Unlink } from "lucide-react";
import SectionHeading from "@/app/components/SectionHeading";
import { fadeUp, staggerContainer } from "@/lib/animations";

const painPoints = [
  {
    icon: Layers,
    title: "Scattered",
    description:
      "Expenses, budgets, and goals live across personal, group, and business accounts with no unified view.",
  },
  {
    icon: Puzzle,
    title: "Shared confusion",
    description:
      "Group payments, trips, and shared bills are impossible to track without endless spreadsheets and debates.",
  },
  {
    icon: Eye,
    title: "Business opacity",
    description:
      "Business spending lacks transparency, approvals are manual, and vendor payments slip through cracks.",
  },
  {
    icon: Unlink,
    title: "Disconnected budgets",
    description:
      "Budgets feel disconnected from real life. You're told how much you spent, not why it matters.",
  },
];

export default function Problem() {
  return (
    <section id="problem" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Money apps track transactions. Momentra understands context."
          subtitle="Traditional finance apps leave you with raw numbers and missed insights. Momentra connects your spending to the real-life moments that matter."
          accent="white"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto"
        >
          {painPoints.map((point) => (
            <motion.div
              key={point.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="bg-surface border border-white/5 rounded-xl p-5 sm:p-6 hover:border-gold/20 transition-colors duration-300"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gold/10 text-gold mb-4">
                <point.icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{point.title}</h3>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">{point.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
