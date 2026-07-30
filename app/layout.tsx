import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AnalyticsRouteTracker } from "@/components/analytics/AnalyticsRouteTracker";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { MotionProvider } from "@/lib/motion/MotionProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.momentra.tech"),
  title: {
    default: "Momentra — Life Happens in Moments",
    template: "%s — Momentra",
  },
  description:
    "Momentra is a moment-centric platform for organizing personal, group, and business moments—bringing people, plans, money, progress, and memory together.",
  keywords: [
    "Momentra",
    "Life Happens in Moments",
    "Moment-centric platform",
    "Personal moments",
    "Group coordination",
    "Shared financial moments",
    "Business moments",
    "Financial coordination platform",
    "Moment management",
    "Group planning app",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.momentra.tech",
    siteName: "Momentra",
    title: "Momentra — Life Happens in Moments",
    description:
      "Momentra is a moment-centric platform for organizing personal, group, and business moments—bringing people, plans, money, progress, and memory together.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Momentra — Life Happens in Moments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Momentra — Life Happens in Moments",
    description:
      "Momentra is a moment-centric platform for organizing personal, group, and business moments—bringing people, plans, money, progress, and memory together.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        <AuthProvider>
          <AnalyticsRouteTracker />
          <MotionProvider>{children}</MotionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
