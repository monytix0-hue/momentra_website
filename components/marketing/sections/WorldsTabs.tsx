"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Radio, BookOpen } from "lucide-react";
import CTAButton from "@/components/marketing/CTAButton";
import { worlds, type WorldId } from "@/lib/marketing/copy";

const tabs: WorldId[] = ["personal", "group", "business"];

const atmosphere: Record<WorldId, string> = {
  personal: "from-indigo-900 via-[#1a1548] to-indigo-900",
  group: "from-[#2a1520] via-[#1f1a2e] to-[#152828]",
  business: "from-[#0f1a2e] via-indigo-900 to-[#12241a]",
};

const accentChip: Record<WorldId, string> = {
  personal: "border-indigo-300/40 bg-indigo-500/20 text-indigo-100",
  group: "border-[#ff8a6a]/40 bg-[#ff8a6a]/15 text-[#ffc4b0]",
  business: "border-amber-500/40 bg-amber-500/15 text-amber-200",
};

const accentTab: Record<WorldId, string> = {
  personal: "bg-indigo-500 text-white",
  group: "bg-[#e8621a] text-white",
  business: "bg-amber-600 text-white",
};

function PhoneMockup({ world }: { world: WorldId }) {
  const data = worlds[world];
  const [pane, setPane] = useState<"pulse" | "live" | "memory">("pulse");
  const items =
    pane === "pulse"
      ? data.mockup.pulse
      : pane === "live"
        ? data.mockup.live
        : data.mockup.memory;

  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div className="rounded-[2rem] border border-white/15 bg-[#0e0e12] p-3 shadow-2xl">
        <div className="mb-3 flex items-center justify-center">
          <div className="h-1.5 w-16 rounded-full bg-white/20" />
        </div>
        <div className="overflow-hidden rounded-[1.4rem] bg-[#16161c]">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-white/40">
              Moment
            </p>
            <p className="text-base font-semibold text-text-on-dark">
              {data.mockup.title}
            </p>
            {data.mockup.subtitle ? (
              <p className="mt-0.5 text-xs text-white/50">{data.mockup.subtitle}</p>
            ) : null}
          </div>

          <div className="flex gap-1 border-b border-white/10 px-2 py-2">
            {(
              [
                { id: "pulse" as const, label: "Pulse", Icon: Activity },
                { id: "live" as const, label: "Live", Icon: Radio },
                { id: "memory" as const, label: "Memory", Icon: BookOpen },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPane(id)}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors ${
                  pane === id
                    ? "bg-white/10 text-text-on-dark"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          <ul className="space-y-2 px-4 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={pane}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-2"
              >
                {items.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-xs leading-snug text-white/75"
                  >
                    {item}
                  </li>
                ))}
              </motion.div>
            </AnimatePresence>
          </ul>

          <div className="border-t border-white/10 px-4 py-3">
            <div className="flex flex-wrap gap-1.5">
              {data.mockup.highlight.map((h) => (
                <span
                  key={h}
                  className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-white/60"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-around border-t border-white/10 px-2 py-2.5 text-[9px] uppercase tracking-wide text-white/35">
            {(["Pulse", "Moments", "Create", "Life", "Memory"] as const).map(
              (n) => (
                <span
                  key={n}
                  className={
                    n.toLowerCase() === pane ? "font-semibold text-white/70" : ""
                  }
                >
                  {n}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorldsTabs() {
  const [active, setActive] = useState<WorldId>("personal");
  const world = worlds[active];

  return (
    <section
      id="worlds"
      className={`relative overflow-hidden bg-gradient-to-br py-24 transition-colors duration-700 sm:py-32 ${atmosphere[active]}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div
          className={`absolute -top-20 left-1/4 h-80 w-80 rounded-full blur-[100px] transition-colors duration-700 ${
            active === "personal"
              ? "bg-indigo-500/40"
              : active === "group"
                ? "bg-[#ff8a6a]/35"
                : "bg-emerald-500/30"
          }`}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex w-full min-w-0 justify-center">
          <div
            role="tablist"
            aria-label="Personal, Group, and Business"
            className="inline-flex max-w-full snap-x snap-mandatory gap-0 overflow-x-auto rounded-full border border-white/15 bg-black/20 p-1 backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active === id}
                onClick={() => setActive(id)}
                className={`shrink-0 snap-start rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 sm:px-7 sm:py-2.5 ${
                  active === id
                    ? accentTab[id]
                    : "text-white/55 hover:text-white/85"
                }`}
              >
                {worlds[id].label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16"
          >
            <div>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight break-words text-text-on-dark sm:text-4xl md:text-5xl">
                {world.heading}
              </h2>
              <p className="mkt-muted mb-8 max-w-xl text-base leading-relaxed sm:text-lg">
                {world.supporting}
              </p>

              <div className="mb-8 flex snap-x gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {world.examples.map((ex) => (
                  <span
                    key={ex}
                    className={`shrink-0 snap-start rounded-full border px-3 py-1.5 text-xs font-medium ${accentChip[active]}`}
                  >
                    {ex}
                  </span>
                ))}
              </div>

              <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/40">
                  Featured
                </p>
                <h3 className="mb-2 text-xl font-bold text-text-on-dark">
                  {world.featured.title}
                </h3>
                <p className="mkt-muted mb-5 text-sm leading-relaxed">
                  {world.featured.copy}
                </p>
                <ol className="space-y-2">
                  {world.lifecycle.map((step, i) => (
                    <li
                      key={step}
                      className="flex gap-3 text-sm text-white/75"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white/80">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                {"roles" in world && Array.isArray(world.roles) ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {world.roles.map((role: string) => (
                      <span
                        key={role}
                        className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-white/65"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <p className="mb-6 max-w-xl text-base font-medium leading-relaxed text-indigo-100/90 italic">
                {world.emotional}
              </p>

              <CTAButton
                variant="primary"
                href={world.cta.href}
                event={world.cta.event}
              >
                {world.cta.label}
              </CTAButton>
            </div>

            <div className="flex justify-center lg:justify-end">
              <PhoneMockup world={active} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
