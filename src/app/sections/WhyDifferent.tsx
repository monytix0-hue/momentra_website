"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import SectionHeading from "@/app/components/SectionHeading";
import { fadeUp, staggerContainer } from "@/lib/animations";

const comparisons = [
  { traditional: "Track transactions", momentra: "Organizes by life context" },
  { traditional: "Show charts", momentra: "Personal / group / business" },
  { traditional: "Focus on categories", momentra: "Timelines and actions" },
  { traditional: "Personal-only", momentra: "Helps decide next steps" },
];

export default function WhyDifferent() {
  return (
    <section id="why-different" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Not category-first. Moment-first."
          subtitle="See how Momentra reimagines money management compared to traditional apps."
          accent="white"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="bg-base-s100 border border-[rgba(245,240,255,0.05)] rounded-2xl overflow-hidden"
        >
          <div className="grid grid-cols-2 border-b border-[rgba(245,240,255,0.05)]">
            <div className="px-6 py-4 sm:px-8 sm:py-5">
              <span className="text-sm font-semibold text-[rgba(245,240,255,0.28)] uppercase tracking-wider">Traditional apps</span>
            </div>
            <div className="px-6 py-4 sm:px-8 sm:py-5 bg-business-cover/50 border-l border-[rgba(245,240,255,0.05)]">
              <span className="text-sm font-semibold text-business-text uppercase tracking-wider">Momentra</span>
            </div>
          </div>

          {comparisons.map((row, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="grid grid-cols-2 border-b border-[rgba(245,240,255,0.05)] last:border-b-0"
            >
              <div className="px-6 py-4 sm:px-8 sm:py-5 flex items-center gap-3">
                <X size={16} className="text-[rgba(245,240,255,0.25)] shrink-0" />
                <span className="text-sm sm:text-base text-[rgba(245,240,255,0.4)]">{row.traditional}</span>
              </div>
              <div className="px-6 py-4 sm:px-8 sm:py-5 bg-business-cover/30 border-l border-[rgba(245,240,255,0.05)] flex items-center gap-3">
                <Check size={16} className="text-business-accent shrink-0" />
                <span className="text-sm sm:text-base text-[#F5F0FF] font-medium">{row.momentra}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
