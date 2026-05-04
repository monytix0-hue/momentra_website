"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  accent?: "personal" | "group" | "business" | "circle" | "brand" | "white";
}

const accentGradients = {
  personal: "text-gradient-personal",
  group: "text-gradient-group",
  business: "text-gradient-business",
  circle: "text-gradient-circle",
  brand: "text-gradient-personal",
  white: "text-white",
};

export default function SectionHeading({ title, subtitle, accent = "brand" }: SectionHeadingProps) {
  const titleClass = accentGradients[accent];
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="text-center mb-10 sm:mb-16"
    >
      <motion.h2 variants={fadeUp} className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 sm:mb-6 ${titleClass}`}>
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} className="text-base sm:text-lg lg:text-xl text-[rgba(245,240,255,0.45)] max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
