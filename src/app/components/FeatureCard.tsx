"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { fadeUp } from "@/lib/animations";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor: "gold" | "blue" | "green";
}

const accentClasses = {
  gold: {
    border: "border-gold/20",
    bg: "bg-gold/5",
    icon: "text-gold",
    hover: "hover:border-gold/40",
  },
  blue: {
    border: "border-accent-blue/20",
    bg: "bg-accent-blue/5",
    icon: "text-accent-blue",
    hover: "hover:border-accent-blue/40",
  },
  green: {
    border: "border-accent-green/20",
    bg: "bg-accent-green/5",
    icon: "text-accent-green",
    hover: "hover:border-accent-green/40",
  },
};

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  accentColor,
}: FeatureCardProps) {
  const accent = accentClasses[accentColor];

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative bg-surface border ${accent.border} ${accent.hover} rounded-2xl p-6 sm:p-8 transition-colors duration-300`}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${accent.bg} ${accent.icon} mb-5`}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
