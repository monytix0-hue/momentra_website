"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

const columns = [
  {
    title: "Product",
    links: ["Personal", "Group", "Business", "How it works"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Cookies"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#050508] border-t border-[rgba(245,240,255,0.05)] py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12"
        >
          <motion.div variants={fadeUp} className="col-span-2 md:col-span-1">
            <a href="#hero" className="inline-block text-xl font-bold text-[#F5F0FF] tracking-tight mb-4">
              Moment<span className="text-personal-accent">ra</span>
            </a>
            <p className="text-sm text-[rgba(245,240,255,0.3)] leading-relaxed max-w-xs">
              Money management built around life&apos;s moments. Personal, shared, and business.
            </p>
          </motion.div>

          {columns.map((col) => (
            <motion.div key={col.title} variants={fadeUp}>
              <h4 className="text-sm font-semibold text-[#F5F0FF] uppercase tracking-wider mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-[rgba(245,240,255,0.35)] hover:text-[rgba(245,240,255,0.7)] transition-colors duration-300">{l}</a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <div className="pt-8 border-t border-[rgba(245,240,255,0.05)]">
          <p className="text-sm text-[rgba(245,240,255,0.2)] text-center">&copy; 2026 Momentra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
