"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { fadeUp } from "@/lib/animations";

type AccentColor = "personal" | "group" | "business" | "circle";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor: AccentColor;
}

const accentMap = {
  personal:  { border: "border-personal/[0.2]", hover: "hover:border-personal/[0.4]",  bg: "bg-personal/[0.05]",   icon: "text-personal-accent", glow: "glow-personal" },
  group:     { border: "border-group/[0.2]",    hover: "hover:border-group/[0.4]",     bg: "bg-group/[0.05]",      icon: "text-group-accent",    glow: "glow-group" },
  business:  { border: "border-business/[0.2]",  hover: "hover:border-business/[0.4]",   bg: "bg-business/[0.05]",     icon: "text-business-accent", glow: "glow-business" },
  circle:    { border: "border-circle/[0.2]",   hover: "hover:border-circle/[0.4]",    bg: "bg-circle/[0.05]",      icon: "text-circle-accent",   glow: "glow-circle" },
};

export default function FeatureCard({ icon: Icon, title, description, accentColor }: FeatureCardProps) {
  const a = accentMap[accentColor];
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
      className={`relative bg-base-s100 border ${a.border} ${a.hover} rounded-2xl p-6 sm:p-8 transition-all duration-500 ${a.glow}`}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${a.bg} ${a.icon} mb-5`}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-[#F5F0FF] mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-[rgba(245,240,255,0.45)] leading-relaxed">{description}</p>
    </motion.div>
  );
}
