"use client";

import { motion } from "framer-motion";
import {
  Home,
  Plane,
  GraduationCap,
  Heart,
  Rocket,
  ArrowRight,
} from "lucide-react";
import SectionHeading from "@/app/components/SectionHeading";
import { fadeUp, staggerContainer, slideInLeft, slideInRight } from "@/lib/animations";

const timelineItems = [
  { icon: Home, label: "Monthly living expenses", color: "text-gold", bg: "bg-gold/10" },
  { icon: Plane, label: "Goa trip", color: "text-accent-blue", bg: "bg-accent-blue/10" },
  { icon: GraduationCap, label: "School fees", color: "text-accent-green", bg: "bg-accent-green/10" },
  { icon: Heart, label: "Wedding planning", color: "text-pink-400", bg: "bg-pink-400/10" },
  { icon: Rocket, label: "Business launch", color: "text-gold", bg: "bg-gold/10" },
];

export default function CoreConcept() {
  return (
    <section id="core-concept" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Moments are the new way to manage money."
          accent="blue"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Left: Explanation */}
          <motion.div variants={slideInLeft} className="space-y-6">
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
              A Moment is a container for any real-life financial context — a month, a trip,
              a project, a goal. Instead of seeing disjointed transactions, you see complete
              stories with budgets, timelines, and the people involved.
            </p>
            <div className="space-y-4">
              {[
                "Group your spending by real-life context",
                "Share moments with family, friends, or teammates",
                "Set budgets and track progress within each moment",
                "Get AI-powered insights and action suggestions",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-gold shrink-0" />
                  <span className="text-sm sm:text-base text-zinc-400">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Timeline */}
          <motion.div variants={slideInRight} className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-6">
              {timelineItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  className="flex items-center gap-4 relative"
                >
                  <div className={`relative z-10 inline-flex items-center justify-center w-10 h-10 rounded-full ${item.bg} ${item.color} shrink-0`}>
                    <item.icon size={18} />
                  </div>
                  <div className="bg-surface border border-white/5 rounded-lg px-4 py-3 flex-1 flex items-center justify-between">
                    <span className="text-sm sm:text-base font-medium text-white">{item.label}</span>
                    <ArrowRight size={16} className="text-zinc-500" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
