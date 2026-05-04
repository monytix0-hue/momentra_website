"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

type AccentColor = "personal" | "group" | "business" | "circle";

interface MomentCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor: AccentColor;
  delay?: number;
}

const accentMap = {
  personal: { border: "border-personal/[0.2]",  bg: "bg-personal/[0.05]",      icon: "text-personal-accent",   text: "text-personal-text" },
  group:    { border: "border-group/[0.2]",     bg: "bg-group/[0.05]",         icon: "text-group-accent",      text: "text-group-text" },
  business: { border: "border-business/[0.2]",   bg: "bg-business/[0.05]",      icon: "text-business-accent",   text: "text-business-text" },
  circle:   { border: "border-circle/[0.2]",    bg: "bg-circle/[0.05]",        icon: "text-circle-accent",     text: "text-circle-text" },
};

export default function MomentCard({ icon: Icon, title, description, accentColor, delay = 0 }: MomentCardProps) {
  const a = accentMap[accentColor];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.04, y: -6, transition: { duration: 0.3 } }}
      className={`relative bg-base-s100 border ${a.border} rounded-xl p-5 sm:p-6 glow-${accentColor === "personal" ? "personal-sm" : accentColor === "group" ? "group-sm" : accentColor === "business" ? "business-sm" : "circle-sm"} transition-all duration-500 hover:${a.border.replace("[", "[").replace("]", "].40")}`}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
      >
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${a.bg} ${a.icon} mb-4`}>
          <Icon size={20} />
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-[#F5F0FF] mb-1">{title}</h3>
        <p className="text-sm text-[rgba(245,240,255,0.45)] leading-relaxed">{description}</p>
      </motion.div>
    </motion.div>
  );
}
