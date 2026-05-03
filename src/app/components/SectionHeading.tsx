"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  accent?: "gold" | "blue" | "green" | "white";
}

const accentClasses = {
  gold: "text-gradient-gold",
  blue: "text-gradient-blue",
  green: "text-gradient-green",
  white: "text-white",
};

export default function SectionHeading({
  title,
  subtitle,
  align = "center",
  accent = "gold",
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={`mb-12 sm:mb-16 ${align === "center" ? "text-center" : "text-left"}`}
    >
      <motion.h2
        variants={fadeUp}
        className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 sm:mb-6 ${accentClasses[accent]}`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          className="text-base sm:text-lg lg:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
