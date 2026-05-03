"use client";

import { motion } from "framer-motion";
import { CreditCard, Users, Building2 } from "lucide-react";
import CTAButton from "@/app/components/CTAButton";
import MomentCard from "@/app/components/MomentCard";
import { fadeUp, staggerContainer, heroCard } from "@/lib/animations";

const heroCards = [
  {
    icon: CreditCard,
    title: "Credit card bill due tomorrow",
    description: "$1,247 · SBI Card ending in 4821",
    accentColor: "gold" as const,
  },
  {
    icon: Users,
    title: "Goa Trip: 2 people pending",
    description: "₹8,450 total · Rahul owes ₹3,200",
    accentColor: "blue" as const,
  },
  {
    icon: Building2,
    title: "Studio Launch: 3 expenses need approval",
    description: "₹42,000 pending · 2 vendors",
    accentColor: "green" as const,
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
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-accent-blue/5 blur-[100px]" />
        <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-accent-green/5 blur-[80px]" />
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
            <span className="text-gradient-gold">Money management</span>
            <br />
            <span className="text-white">built around life&apos;s{" "}</span>
            <span className="text-gradient-blue">moments</span>
            <span className="text-white">.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed"
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

        {/* Floating cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto"
        >
          {heroCards.map((card, i) => (
            <motion.div key={card.title} variants={heroCard}>
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
