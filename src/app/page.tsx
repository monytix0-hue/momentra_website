import Hero from "@/components/marketing/sections/Hero";
import Philosophy from "@/components/marketing/sections/Philosophy";
import WhatIsAMoment from "@/components/marketing/sections/WhatIsAMoment";
import WorldsTabs from "@/components/marketing/sections/WorldsTabs";
import SharedArchitecture from "@/components/marketing/sections/SharedArchitecture";
import MomentLifecycle from "@/components/marketing/sections/MomentLifecycle";
import Intelligence from "@/components/marketing/sections/Intelligence";
import Comparison from "@/components/marketing/sections/Comparison";
import BookBridge from "@/components/marketing/sections/BookBridge";
import EmotionalStatement from "@/components/marketing/sections/EmotionalStatement";
import UseCaseMosaic from "@/components/marketing/sections/UseCaseMosaic";
import FinalCTA from "@/components/marketing/sections/FinalCTA";

export default function MarketingHome() {
  return (
    <main className="relative">
      <Hero />
      <Philosophy />
      <WhatIsAMoment />
      <WorldsTabs />
      <SharedArchitecture />
      <MomentLifecycle />
      <Intelligence />
      <Comparison />
      <BookBridge />
      <EmotionalStatement />
      <UseCaseMosaic />
      <FinalCTA />
    </main>
  );
}
