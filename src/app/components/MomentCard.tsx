"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MomentCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor: "gold" | "blue" | "green";
  delay?: number;
}

const accentClasses = {
  gold: {
    border: "border-gold/20",
    bg: "bg-gold/5",
    icon: "text-gold",
    glow: "glow-gold",
  },
  blue: {
    border: "border-accent-blue/20",
    bg: "bg-accent-blue/5",
    icon: "text-accent-blue",
    glow: "glow-blue",
  },
  green: {
    border: "border-accent-green/20",
    bg: "bg-accent-green/5",
    icon: "text-accent-green",
    glow: "glow-green",
  },
};

export default function MomentCard({
  icon: Icon,
  title,
  description,
  accentColor,
  delay = 0,
}: MomentCardProps) {
  const accent = accentClasses[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: 1.03, y: -4 }}
      className={`relative bg-surface border ${accent.border} rounded-xl p-5 sm:p-6 ${accent.glow} transition-all duration-300 hover:border-opacity-40`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      >
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${accent.bg} ${accent.icon} mb-4`}>
          <Icon size={20} />
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
      </motion.div>
    </motion.div>
  );
}
