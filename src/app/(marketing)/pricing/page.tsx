import { MobileContainer } from "@/components/layout/mobile-container";
import { TopBar } from "@/components/layout/top-bar";
import { PremiumCard } from "@/components/ui/premium-card";

export default function PricingPage() {
  return (
    <MobileContainer>
      <TopBar title="Pricing" subtitle="Unlock premium progression" />
      <main className="px-4 pt-8">
        <PremiumCard />
      </main>
    </MobileContainer>
  );
}
