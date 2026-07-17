import { AuthGate } from "@/components/auth/AuthGate";
import { SplashGate } from "@/components/SplashGate";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SplashGate>
      <AuthGate>{children}</AuthGate>
    </SplashGate>
  );
}
