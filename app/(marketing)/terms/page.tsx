import type { Metadata } from "next";
import { MarketingPageShell, ContentBlock } from "@/components/marketing/MarketingPageShell";
import { pageCopy } from "@/lib/marketing/copy";

export const metadata: Metadata = {
  title: "Terms",
  description: pageCopy.terms.description,
};

export default function TermsPage() {
  return (
    <MarketingPageShell
      eyebrow="Legal"
      title="Terms of use"
      description="The ground rules for using Momentra."
    >
      <ContentBlock>
        <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
          This page is a placeholder summary. Final terms of use will replace
          this content before public launch.
        </p>
        <p>
          By using Momentra, you agree to use the product lawfully and
          respectfully, and to keep credentials and shared moments under your
          care.
        </p>
        <p>
          Questions? Reach us at{" "}
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
