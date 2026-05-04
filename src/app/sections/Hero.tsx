"use client";

import { motion } from "framer-motion";
import { CreditCard, Users, Building2 } from "lucide-react";
import CTAButton from "@/app/components/CTAButton";
import MomentCard from "@/app/components/MomentCard";
import { staggerContainer, fadeUp } from "@/lib/animations";

const heroCards = [
  {
    icon: CreditCard,
    title: "Emergency Fund",
    description: "₹38,000 of ₹1,00,000 · 38% saved",
    accentColor: "personal" as const,
  },
  {
    icon: Users,
    title: "Goa Trip",
    description: "₹45,000 collected of ₹60,000 · 6 people",
    accentColor: "group" as const,
  },
  {
    icon: Building2,
    title: "Q2 Campaign",
    description: "₹3,60,000 spent of ₹5,00,000 · 72%",
    accentColor: "business" as const,
  },
];

export default function Hero() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/5 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full orb-personal blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -25, 15, 0], y: [0, 30, -35, 0], scale: [1, 0.9, 1.05, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full orb-group blur-[80px]"
        />
        <motion.div
          animate={{ x: [0, 20, -30, 0], y: [0, -25, 15, 0], scale: [1, 1.08, 0.92, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full orb-business blur-[90px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center mb-12 sm:mb-16"
        >
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
          >
            <span className="text-gradient-personal">Money management</span>
            <br />
            <span className="text-white">built around life&apos;s </span>
            <span className="text-gradient-group">moments</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg lg:text-xl text-[rgba(245,240,255,0.45)] max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed"
          >
            Track personal, shared, and business money in one intelligent app.
            No spreadsheets. No confusion. Just your financial life, organized by context.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <CTAButton
              variant="primary"
              size="lg"
              href="#cta"
              onClick={(e) => handleScroll(e, "#cta")}
            >
              Join the waitlist
            </CTAButton>
            <CTAButton
              variant="secondary"
              size="lg"
              href="#core-concept"
              onClick={(e) => handleScroll(e, "#core-concept")}
            >
              Explore how it works
            </CTAButton>
          </motion.div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto"
        >
          {heroCards.map((card, i) => (
            <motion.div key={card.title} variants={fadeUp}>
              <MomentCard
                icon={card.icon}
                title={card.title}
                description={card.description}
                accentColor={card.accentColor}
                delay={i * 0.2}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
