"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  Plane,
  Baby,
  Home,
  BarChart3,
  ClipboardCheck,
  Bell,
  PiggyBank,
} from "lucide-react";
import SectionHeading from "@/app/components/SectionHeading";
import UseCaseCard from "@/app/components/UseCaseCard";
import { staggerContainer } from "@/lib/animations";

const useCases = [
  { icon: CalendarDays, title: "Manage monthly money" },
  { icon: Plane, title: "Track shared trips" },
  { icon: Baby, title: "Split family expenses" },
  { icon: Home, title: "Handle roommate payments" },
  { icon: BarChart3, title: "Monitor business costs" },
  { icon: ClipboardCheck, title: "Approve team expenses" },
  { icon: Bell, title: "Track bills and EMIs" },
  { icon: PiggyBank, title: "Plan savings goals" },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="py-20 sm:py-28 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Use Momentra for every money moment."
          subtitle="From daily budgeting to once-in-a-lifetime events, Momentra adapts to your financial life."
          accent="blue"
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {useCases.map((useCase) => (
            <UseCaseCard
              key={useCase.title}
              icon={useCase.icon}
              title={useCase.title}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
