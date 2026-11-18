import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/contact";

interface PricingManageProps {
  plan: string;
  subscriptionEnd: Date | null;
}

export function PricingManage({ plan, subscriptionEnd }: PricingManageProps) {
  const endLabel = subscriptionEnd
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(subscriptionEnd)
    : null;

  return (
    <section className="p-checkout">
      <div className="p-card p-card--hl">
        <h2 className="l-display">
          {plan === "yearly" ? "Yearly Premium" : "Monthly Premium"} is active
        </h2>
        {endLabel && <p>Renews on {endLabel}.</p>}
      </div>

      <Link href="/map" className="l-btn l-btn--primary p-cta">
        Continue playing
      </Link>

      <p className="p-foot">
        To cancel, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </section>
  );
}