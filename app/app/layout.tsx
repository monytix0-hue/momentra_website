import { AuthGate } from "@/components/auth/AuthGate";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { SplashGate } from "@/components/SplashGate";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SplashGate>
      <OnboardingGate>
        <AuthGate>{children}</AuthGate>
      </OnboardingGate>
    </SplashGate>
  );
}
