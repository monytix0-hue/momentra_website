"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { staggerContainer, fadeUp } from "@/lib/animations";

export default function CTASection() {
  return (
    <section id="cta" className="py-20 sm:py-28 lg:py-32 relative overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-personal-accent blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full bg-circle-accent blur-[100px] pointer-events-none"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
            <span className="text-gradient-personal">Your money has moments.</span>
            <br />
            <span className="text-white">Now your app does too.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base sm:text-lg lg:text-xl text-[rgba(245,240,255,0.45)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Join Momentra early and help shape the future of personal, shared, and business finance.
          </motion.p>
          <motion.form variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              placeholder="Enter your email"
              required
              className="w-full sm:flex-1 px-5 py-4 bg-base-s100 border border-[rgba(245,240,255,0.1)] rounded-xl text-[#F5F0FF] placeholder-[rgba(245,240,255,0.3)] focus:outline-none focus:border-personal-accent/50 focus:ring-1 focus:ring-personal-accent/50 transition-all duration-300"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-personal hover:brightness-110 rounded-xl transition-all duration-300 shadow-lg shadow-personal-accent/20"
            >
              Join the waitlist
              <ArrowRight size={18} />
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
}
