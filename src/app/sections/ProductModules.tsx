"use client";

import { motion } from "framer-motion";
import {
  Wallet, Target, FileText, CalendarDays,
  Users, Briefcase, CircleCheck, Activity,
  Lightbulb, TrendingUp, Sparkles,
} from "lucide-react";
import SectionHeading from "@/app/components/SectionHeading";
import { staggerContainer, fadeUp } from "@/lib/animations";

const modules = [
  { icon: Wallet, label: "Accounts", accent: "personal" },
  { icon: Target, label: "Budgets", accent: "personal" },
  { icon: FileText, label: "Bills", accent: "business" },
  { icon: CalendarDays, label: "Goals", accent: "group" },
  { icon: Users, label: "Group Expenses", accent: "group" },
  { icon: Briefcase, label: "Business Expenses", accent: "business" },
  { icon: CircleCheck, label: "Approvals", accent: "business" },
  { icon: Activity, label: "Activity Feed", accent: "circle" },
  { icon: Lightbulb, label: "Smart Nudges", accent: "circle" },
  { icon: TrendingUp, label: "Forecasting", accent: "personal" },
  { icon: Sparkles, label: "AI Insights", accent: "circle" },
];

const accentIcon: Record<string, string> = {
  personal: "text-personal-accent bg-personal/[0.05]",
  group: "text-group-accent bg-group/[0.05]",
  business: "text-business-accent bg-business/[0.05]",
  circle: "text-circle-accent bg-circle/[0.05]",
};

export default function ProductModules() {
  return (
    <section id="product-modules" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Everything you need in one place."
          subtitle="No switching between apps. Momentra covers every aspect of your financial life."
          accent="business"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4"
        >
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.label}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="flex flex-col items-center gap-3 bg-base-s100 border border-[rgba(245,240,255,0.05)] rounded-xl p-4 sm:p-5 hover:border-personal/[0.15] transition-all duration-500 cursor-default"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${accentIcon[mod.accent]}`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[rgba(245,240,255,0.75)] text-center">{mod.label}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
