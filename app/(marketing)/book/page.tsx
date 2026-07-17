import type { Metadata } from "next";
import { MarketingPageShell, ContentBlock } from "@/components/marketing/MarketingPageShell";
import { pageCopy, book } from "@/lib/marketing/copy";

export const metadata: Metadata = {
  title: "Life Happens in Moments",
  description: pageCopy.book.description,
};

export default function BookPage() {
  return (
    <MarketingPageShell
      eyebrow="The Book"
      title={book.title}
      description={book.supporting}
      primaryCta={book.experienceCta}
      secondaryCta={{
        label: "See How Moments Work",
        href: "/how-moments-work",
        event: "see_how_moments_work",
      }}
    >
      <ContentBlock>
        <div className="mx-auto mb-10 max-w-xs">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/15 bg-gradient-to-br from-indigo-700 via-[#1a0f3d] to-[#2a1520] shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(232,98,26,0.25),transparent_50%)]" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-2xl font-extrabold text-text-on-dark">
                {book.title}
              </p>
            </div>
          </div>
        </div>
        <p className="text-xl font-medium text-indigo-100/90">{book.question}</p>
        <p className="font-semibold text-text-on-dark">{book.bridge}</p>
        <p>{book.bridgeLine}</p>
      </ContentBlock>
    </MarketingPageShell>
  );
}
