import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { MarketingDocumentTheme } from "@/components/marketing/MarketingDocumentTheme";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/sections/Footer";
import StickyMobileCTA from "@/components/marketing/StickyMobileCTA";
import { siteMeta } from "@/lib/marketing/copy";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteMeta.title,
    template: "%s — Momentra",
  },
  description: siteMeta.description,
  keywords: siteMeta.keywords,
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <MarketingDocumentTheme>
          <Navbar />
          {children}
          <Footer />
          <StickyMobileCTA />
        </MarketingDocumentTheme>
      </body>
    </html>
  );
}
