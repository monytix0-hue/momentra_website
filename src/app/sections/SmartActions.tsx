"use client";

import { motion } from "framer-motion";
import { Utensils, UserCheck, CalendarClock, ShieldAlert, TrendingUp, PiggyBank } from "lucide-react";
import SectionHeading from "@/app/components/SectionHeading";
import { scaleUp, staggerContainer } from "@/lib/animations";

const actions = [
  {
    icon: Utensils,
    text: "You're close to your food budget",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    textColor: "text-amber-400",
  },
  {
    icon: UserCheck,
    text: "2 people still need to pay",
    bg: "bg-accent-blue/10",
    border: "border-accent-blue/20",
    textColor: "text-accent-blue",
  },
  {
    icon: CalendarClock,
    text: "This bill is due tomorrow",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    textColor: "text-red-400",
  },
  {
    icon: ShieldAlert,
    text: "This expense needs approval",
    bg: "bg-accent-green/10",
    border: "border-accent-green/20",
    textColor: "text-accent-green",
  },
  {
    icon: TrendingUp,
    text: "Spending increased vs last month",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    textColor: "text-orange-400",
  },
  {
    icon: PiggyBank,
    text: "You can save more on subscriptions",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
    textColor: "text-teal-400",
  },
];

export default function SmartActions() {
  return (
    <section id="smart-actions" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="From insight to action."
          subtitle="Momentra doesn't just tell you what happened. It suggests what to do next."
          accent="green"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto"
        >
          {actions.map((action) => (
            <motion.div
              key={action.text}
              variants={scaleUp}
              whileHover={{ scale: 1.03, y: -2 }}
              className={`flex items-center gap-4 ${action.bg} ${action.border} border rounded-xl px-5 py-4 transition-all duration-300 hover:brightness-110`}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${action.bg} ${action.textColor} shrink-0`}>
                <action.icon size={20} />
              </div>
              <span className={`text-sm sm:text-base font-medium ${action.textColor}`}>
                {action.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
