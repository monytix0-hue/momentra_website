import type { Metadata } from "next";
import { MarketingPageShell, ContentBlock } from "@/components/marketing/MarketingPageShell";
import { pageCopy, worlds } from "@/lib/marketing/copy";

export const metadata: Metadata = {
  title: "Personal Moments",
  description: pageCopy.personal.description,
};

const w = worlds.personal;

export default function PersonalPage() {
  return (
    <MarketingPageShell
      eyebrow="Personal"
      title={w.heading}
      description={w.supporting}
      primaryCta={{
        label: "Start Your First Moment",
        href: "/app",
        event: "start_first_moment",
      }}
      secondaryCta={{
        label: "See How Moments Work",
        href: "/how-moments-work",
        event: "see_how_moments_work",
      }}
    >
      <ContentBlock title={w.featured.title}>
        <p>{w.featured.copy}</p>
        <p className="font-medium text-text-on-dark not-italic">{w.emotional}</p>
      </ContentBlock>
      <ContentBlock title="How a personal moment unfolds">
        <ol className="list-decimal space-y-2 pl-5 text-white/75">
          {w.lifecycle.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </ContentBlock>
      <ContentBlock title="Example moments">
        <p>{w.examples.join(" · ")}</p>
      </ContentBlock>
    </MarketingPageShell>
  );
}
