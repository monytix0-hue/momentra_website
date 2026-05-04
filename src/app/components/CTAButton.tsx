"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface CTAButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

export default function CTAButton({ children, variant = "primary", size = "md", href, onClick, className = "" }: CTAButtonProps) {
  const sizeClasses = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const base = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-personal-accent/50";

  return (
    <motion.a
      href={href || "#"}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${sizeClasses[size]} ${
        variant === "primary"
          ? "bg-gradient-personal text-white hover:brightness-110 shadow-lg shadow-personal-accent/20"
          : "bg-transparent text-personal-text border border-personal-text/30 hover:border-personal-accent hover:bg-personal-[0.05]"
      } ${className}`}
    >
      {children}
      {variant === "primary" && <ArrowRight size={18} className="ml-2" />}
    </motion.a>
  );
}
