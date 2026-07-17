import type { Metadata } from "next";
import { MarketingPageShell, ContentBlock } from "@/components/marketing/MarketingPageShell";
import { pageCopy } from "@/lib/marketing/copy";

export const metadata: Metadata = {
  title: "Privacy",
  description: pageCopy.privacy.description,
};

export default function PrivacyPage() {
  return (
    <MarketingPageShell
      eyebrow="Legal"
      title="Privacy"
      description="How Momentra thinks about your data and the moments you create."
    >
      <ContentBlock>
        <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
          This page is a placeholder summary. Final privacy policy language will
          replace this content before public launch.
        </p>
        <p>
          Momentra is built to keep people, plans, money, progress, and memory
          together inside moments. We treat that context as sensitive—and we
          design for clarity about what is stored, why, and how you can control
          it.
        </p>
        <p>
          For questions about data practices, contact{" "}
          <a
            href="mailto:hello@momentra.app"
            className="text-ember-300 underline-offset-2 hover:underline"
          >
            hello@momentra.app
          </a>
          .
        </p>
      </ContentBlock>
    </MarketingPageShell>
  );
}
