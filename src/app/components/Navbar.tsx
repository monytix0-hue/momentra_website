"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "#hero" },
  { label: "Personal", href: "#what-we-do" },
  { label: "Group", href: "#what-we-do" },
  { label: "Business", href: "#what-we-do" },
  { label: "How it works", href: "#core-concept" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-[rgba(18,15,32,0.8)] backdrop-blur-xl border-b border-[rgba(245,240,255,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#hero" onClick={(e) => handleScroll(e, "#hero")} className="text-xl font-bold text-[#F5F0FF] tracking-tight">
            Moment<span className="text-personal-accent">ra</span>
          </a>

          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                className="text-sm text-[rgba(245,240,255,0.45)] hover:text-[#F5F0FF] transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-personal-accent group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <motion.a
            href="#cta"
            onClick={(e) => handleScroll(e, "#cta")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="hidden md:inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-personal hover:brightness-110 rounded-lg transition-all duration-300 shadow-lg shadow-personal-accent/20"
          >
            Join Waitlist
          </motion.a>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-[rgba(245,240,255,0.45)] hover:text-[#F5F0FF]">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-[rgba(18,15,32,0.95)] backdrop-blur-xl border-t border-[rgba(245,240,255,0.05)] px-4 py-4"
          >
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <a
                  key={link.label + "m"}
                  href={link.href}
                  onClick={(e) => handleScroll(e, link.href)}
                  className="text-sm text-[rgba(245,240,255,0.6)] hover:text-[#F5F0FF] py-2 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <motion.a
                href="#cta"
                onClick={(e) => handleScroll(e, "#cta")}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-personal rounded-lg mt-2"
              >
                Join Waitlist
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
