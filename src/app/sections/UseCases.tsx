"use client";

import { motion } from "framer-motion";
import {
  CalendarDays, Plane, Baby, House,
  BarChart3, ClipboardCheck, Bell, PiggyBank,
} from "lucide-react";
import SectionHeading from "@/app/components/SectionHeading";
import { staggerContainer, fadeUp } from "@/lib/animations";

const cases = [
  { icon: CalendarDays, label: "Manage monthly money", accent: "personal" },
  { icon: Plane, label: "Track shared trips", accent: "group" },
  { icon: Baby, label: "Split family expenses", accent: "group" },
  { icon: House, label: "Handle roommate payments", accent: "group" },
  { icon: BarChart3, label: "Monitor business costs", accent: "business" },
  { icon: ClipboardCheck, label: "Approve team expenses", accent: "business" },
  { icon: Bell, label: "Track bills and EMIs", accent: "personal" },
  { icon: PiggyBank, label: "Plan savings goals", accent: "personal" },
];

const accentBorder: Record<string, string> = {
  personal: "hover:border-personal/[0.25]",
  group: "hover:border-group/[0.25]",
  business: "hover:border-business/[0.25]",
};

const accentIcon: Record<string, string> = {
  personal: "text-personal-accent bg-personal/[0.05]",
  group: "text-group-accent bg-group/[0.05]",
  business: "text-business-accent bg-business/[0.05]",
};

export default function UseCases() {
  return (
    <section id="use-cases" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Use Momentra for every money moment."
          subtitle="From daily budgeting to once-in-a-lifetime events, Momentra adapts to your financial life."
          accent="circle"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {cases.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                variants={fadeUp}
                whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.3 } }}
                className={`flex items-center gap-4 bg-base-s100 border border-[rgba(245,240,255,0.05)] rounded-xl p-4 sm:p-5 ${accentBorder[item.accent]} transition-all duration-500 cursor-default`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${accentIcon[item.accent]}`}>
                  <Icon size={20} />
                </div>
                <span className="text-sm sm:text-base font-medium text-[#F5F0FF]">{item.label}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
