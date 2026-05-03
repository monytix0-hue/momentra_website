"use client";

import { motion } from "framer-motion";
import {
  Clock,
  LayoutDashboard,
  Landmark,
  Receipt,
  Wallet,
  FileText,
  Target,
  Users,
  Briefcase,
  CheckCircle,
  Activity,
  Lightbulb,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import SectionHeading from "@/app/components/SectionHeading";
import { fadeUp, staggerContainer } from "@/lib/animations";

const modules = [
  { icon: Clock, label: "Moments Timeline" },
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Landmark, label: "Accounts" },
  { icon: Receipt, label: "Transactions" },
  { icon: Wallet, label: "Budgets" },
  { icon: FileText, label: "Bills" },
  { icon: Target, label: "Goals" },
  { icon: Users, label: "Group Expenses" },
  { icon: Briefcase, label: "Business Expenses" },
  { icon: CheckCircle, label: "Approvals" },
  { icon: Activity, label: "Activity Feed" },
  { icon: Lightbulb, label: "Smart Nudges" },
  { icon: TrendingUp, label: "Forecasting" },
  { icon: Sparkles, label: "AI Insights" },
];

export default function ProductModules() {
  return (
    <section id="product-modules" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Designed for real financial life."
          subtitle="Everything you need to manage money, organized around how you actually live it."
          accent="gold"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4"
        >
          {modules.map((mod) => (
            <motion.div
              key={mod.label}
              variants={fadeUp}
              whileHover={{ scale: 1.08 }}
              className="flex flex-col items-center gap-3 bg-surface border border-white/5 rounded-xl p-4 sm:p-5 hover:border-gold/20 transition-colors duration-300 cursor-default"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gold/10 text-gold">
                <mod.icon size={20} />
              </div>
              <span className="text-xs sm:text-sm font-medium text-zinc-300 text-center">{mod.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
