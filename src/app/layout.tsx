import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momentra — Money management built around life's moments",
  description:
    "Track personal, shared, and business money in one intelligent app. No spreadsheets. No confusion. Just your financial life, organized by context.",
  keywords: [
    "money management",
    "personal finance",
    "group expenses",
    "business expenses",
    "budgeting",
    "expense tracking",
    "India fintech",
    "moment based finance",
  ],
  openGraph: {
    title: "Momentra — Money management built around life's moments",
    description:
      "Track personal, shared, and business money in one intelligent app.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased min-h-screen bg-base text-[#F5F0FF] font-sans">
        {children}
      </body>
    </html>
  );
}
