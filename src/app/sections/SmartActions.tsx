"use client";

import { motion } from "framer-motion";
import { Bell, Zap, TrendingUp, Lightbulb } from "lucide-react";
import { staggerContainer, fadeUp } from "@/lib/animations";

const actions = [
  {
    icon: Bell,
    title: "Smart reminders",
    description: "Never miss a bill, EMI, or group payment. Get nudges before deadlines and avoid late fees.",
    accent: "personal",
  },
  {
    icon: Zap,
    title: "Instant settlements",
    description: "Settle group expenses in one tap with UPI, wallets, or bank transfers. No more 0060you owe me0060 texts.",
    accent: "group",
  },
  {
    icon: TrendingUp,
    title: "Budget forecasts",
    description: "AI-powered spending predictions that learn from your patterns and help you stay on track.",
    accent: "business",
  },
  {
    icon: Lightbulb,
    title: "Action suggestions",
    description: "Momentra tells you what to do next — reallocate, save more, or celebrate a milestone.",
    accent: "circle",
  },
];

const accentBorder = {
  personal: "hover:border-personal/[0.25]",
  group: "hover:border-group/[0.25]",
  business: "hover:border-business/[0.25]",
  circle: "hover:border-circle/[0.25]",
};

const accentIcon = {
  personal: "text-personal-accent",
  group: "text-group-accent",
  business: "text-business-accent",
  circle: "text-circle-accent",
};

const accentBg = {
  personal: "bg-personal/[0.05]",
  group: "bg-group/[0.05]",
  business: "bg-business/[0.05]",
  circle: "bg-circle/[0.05]",
};

export default function SmartActions() {
  return (
    <section id="smart-actions" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gradient-group mb-4">
            Intelligence that actually helps.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base sm:text-lg text-[rgba(245,240,255,0.45)] max-w-2xl mx-auto">
            Not just data — decisions. Momentra&apos;s AI learns your habits and suggests the next best action.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto"
        >
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className={`bg-base-s100 border border-[rgba(245,240,255,0.05)] rounded-xl p-5 sm:p-6 ${accentBorder[action.accent as keyof typeof accentBorder]} transition-all duration-500`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${accentBg[action.accent as keyof typeof accentBg]} ${accentIcon[action.accent as keyof typeof accentIcon]} mb-4`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#F5F0FF] mb-2">{action.title}</h3>
                <p className="text-sm text-[rgba(245,240,255,0.45)] leading-relaxed">{action.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
