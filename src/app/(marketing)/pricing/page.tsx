import type { Metadata } from "next";
import { bricolage, inter } from "@/lib/marketing-fonts";
import { Header, Footer } from "@/components/landing/sections";
import { getAuthSession } from "@/lib/auth-session";
import { PricingBenefits } from "@/components/pricing/pricing-benefits";
import { PricingCheckout } from "@/components/pricing/pricing-checkout";
import { PricingManage } from "@/components/pricing/pricing-manage";
import Navbar from "@/components/layout/navbar-server";
import {
  PricingExtras,
  SignInToSubscribe,
} from "@/components/pricing/pricing-extras";

export const metadata: Metadata = {
  title: "Pricing | Loop",
  description:
    "Play every game and every past edition with Loop Premium. Free to start, cancel anytime.",
};

export default async function PricingPage() {
  const session = await getAuthSession();
  const user = session?.user as
    | {
      email?: string;
      name?: string | null;
      isPremium?: boolean;
      plan?: string;
      subscriptionEnd?: string | null;
    }
    | undefined;

  const isPremium = user?.isPremium ?? false;
  const plan = user?.plan ?? "yearly";
  const subscriptionEnd = user?.subscriptionEnd ?? null;

  return (
    <main className={`landing ${bricolage.variable} ${inter.variable}`}>
      <div className="p-wrap">
        <section className="p-head">
          <p className="l-kicker">Premium</p>
          <h1 className="l-display l-h1">Pick how often you play.</h1>
          <p className="l-lead">
            Start free. Upgrade when Loop becomes a habit.
          </p>
        </section>

        <PricingBenefits />

        {isPremium ? (
          <PricingManage
            plan={plan}
            subscriptionEnd={subscriptionEnd ? new Date(subscriptionEnd) : null}
          />
        ) : user?.email ? (
          <PricingCheckout
            userEmail={user.email}
            userName={user.name ?? undefined}
          />
        ) : (
          <SignInToSubscribe />
        )}

        <PricingExtras />
      </div>

      <Footer />
    </main>
  );
}