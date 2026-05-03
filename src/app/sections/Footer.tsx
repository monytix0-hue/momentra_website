"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

const footerLinks = {
  Product: [
    { label: "Personal", href: "#what-we-do" },
    { label: "Group", href: "#what-we-do" },
    { label: "Business", href: "#what-we-do" },
    { label: "How it works", href: "#core-concept" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#050508] border-t border-white/5 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12"
        >
          {/* Brand */}
          <motion.div variants={fadeUp} className="col-span-2 md:col-span-1">
            <a href="#hero" className="inline-block text-xl font-bold text-white tracking-tight mb-4">
              Moment<span className="text-gold">ra</span>
            </a>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Money management built around life&apos;s moments. Personal, shared, and business.
            </p>
          </motion.div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <motion.div key={category} variants={fadeUp}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5">
          <p className="text-sm text-zinc-600 text-center">
            © 2024 Momentra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
