import { MobileContainer } from "@/components/layout/mobile-container";
import { PricingHeader } from "@/components/pricing/pricing-header";
import { PricingBenefits } from "@/components/pricing/pricing-benefits";
import { PricingCheckout } from "@/components/pricing/pricing-checkout";
import { PricingManage } from "@/components/pricing/pricing-manage";
import { getAuthSession } from "@/lib/auth-session";

export default async function PricingPage() {
  const session = await getAuthSession();
  const user = session?.user;
  const isPremium = (user as { isPremium?: boolean })?.isPremium ?? false;
  const plan = (user as { plan?: string })?.plan ?? "yearly";
  const subscriptionEnd =
    (user as { subscriptionEnd?: string })?.subscriptionEnd ?? null;

  return (
    <MobileContainer>
      <PricingHeader />
      <main className="flex flex-col gap-10 px-6 pt-6 pb-16">
        <PricingBenefits />

        {isPremium ? (
          <PricingManage
            plan={plan}
            subscriptionEnd={
              subscriptionEnd ? new Date(subscriptionEnd) : null
            }
          />
        ) : (
          <PricingCheckout
            userEmail={user?.email}
            userName={user?.name ?? undefined}
          />
        )}
      </main>
    </MobileContainer>
  );
}