"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { fadeUp } from "@/lib/animations";

interface UseCaseCardProps {
  icon: LucideIcon;
  title: string;
}

export default function UseCaseCard({ icon: Icon, title }: UseCaseCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.2 } }}
      className="flex items-center gap-4 bg-surface border border-white/5 rounded-xl p-4 sm:p-5 hover:border-gold/20 transition-colors duration-300 cursor-default"
    >
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gold/10 text-gold shrink-0">
        <Icon size={20} />
      </div>
      <span className="text-sm sm:text-base font-medium text-white">{title}</span>
    </motion.div>
  );
}
