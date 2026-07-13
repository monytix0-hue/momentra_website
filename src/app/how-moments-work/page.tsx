import type { Metadata } from "next";
import { MarketingPageShell, ContentBlock } from "@/components/marketing/MarketingPageShell";
import {
  pageCopy,
  lifecycle,
  sharedArchitecture,
  finalCta,
} from "@/lib/marketing/copy";

export const metadata: Metadata = {
  title: "How Moments Work",
  description: pageCopy.howMomentsWork.description,
};

export default function HowMomentsWorkPage() {
  return (
    <MarketingPageShell
      eyebrow="How Moments Work"
      title={lifecycle.heading}
      description={lifecycle.supporting}
      primaryCta={finalCta.primaryCta}
      secondaryCta={{
        label: "Explore Personal",
        href: "/personal",
        event: "explore_personal",
      }}
    >
      <ContentBlock title="The lifecycle">
        <ol className="space-y-4">
          {lifecycle.stages.map((s) => (
            <li key={s.name}>
              <span className="font-semibold text-text-on-dark">{s.name}</span>
              <span className="mkt-muted"> — {s.description}</span>
            </li>
          ))}
        </ol>
      </ContentBlock>
      <ContentBlock title={sharedArchitecture.heading}>
        <ul className="space-y-3">
          {sharedArchitecture.areas.map((a) => (
            <li key={a.name}>
              <span className="font-semibold text-text-on-dark">{a.name}</span>
              <span className="mkt-muted"> — {a.description}</span>
            </li>
          ))}
        </ul>
      </ContentBlock>
    </MarketingPageShell>
  );
}
