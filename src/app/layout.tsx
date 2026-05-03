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
      <body className="antialiased min-h-screen bg-background text-white">
        {children}
      </body>
    </html>
  );
}
