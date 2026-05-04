"use client";

import { motion } from "framer-motion";
import { Wallet, Users, Building2 } from "lucide-react";
import SectionHeading from "@/app/components/SectionHeading";
import FeatureCard from "@/app/components/FeatureCard";
import { staggerContainer } from "@/lib/animations";

const features = [
  {
    icon: Wallet,
    title: "Personal",
    description:
      "Track all your accounts, spending, budgets, bills, and savings goals in one place. Get smart nudges before you overspend and see exactly where your money goes.",
    accentColor: "personal" as const,
  },
  {
    icon: Users,
    title: "Group",
    description:
      "Create shared moments for trips, roommates, events, and family. See who paid what, who owes whom, and settle up instantly without awkward conversations.",
    accentColor: "group" as const,
  },
  {
    icon: Building2,
    title: "Business",
    description:
      "Manage company expenses with built-in approvals, vendor tracking, and team spending limits. From startup to studio, keep business finances crystal clear.",
    accentColor: "business" as const,
  },
];

export default function WhatWeDo() {
  return (
    <section id="what-we-do" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="One app for personal, group, and business money moments."
          accent="brand"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              accentColor={feature.accentColor}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
