import Link from "next/link";

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
      }).format(new Date(subscriptionEnd))
    : null;

  return (
    <section className="flex flex-col gap-4">
      {/* Status card */}
      <div
        className="p-6 rounded-2xl flex items-center gap-4"
        style={{ backgroundColor: "var(--secondary-container)" }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--secondary)" }}
        >
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}
          >
            workspace_premium
          </span>
        </div>
        <div>
          <p
            className="text-[18px] font-bold"
            style={{ color: "var(--on-secondary-container)" }}
          >
            {plan === "yearly" ? "Yearly Membership" : "Monthly Pass"}
          </p>
          {endLabel && (
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--on-secondary-container)", opacity: 0.75 }}
            >
              Renews {endLabel}
            </p>
          )}
        </div>
        <span
          className="material-symbols-outlined ml-auto"
          style={{
            color: "var(--secondary)",
            fontVariationSettings: "'FILL' 1",
          }}
        >
          check_circle
        </span>
      </div>

      {/* What's included */}
      <div
        className="p-5 rounded-2xl flex flex-col gap-3"
        style={{ backgroundColor: "var(--surface-container-low)" }}
      >
        <p
          className="text-[11px] font-bold tracking-widest uppercase"
          style={{ color: "var(--on-surface-variant)" }}
        >
          Your Benefits
        </p>
        {[
          { icon: "workspace_premium", label: "Unlimited Habits" },
          { icon: "insights", label: "Deep Analytics" },
          { icon: "cloud_sync", label: "Cloud Sync" },
          { icon: "group", label: "Private Circles" },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 20,
                color: "var(--secondary)",
                fontVariationSettings: "'FILL' 1",
              }}
            >
              {icon}
            </span>
            <span
              className="text-[15px] font-medium"
              style={{ color: "var(--on-surface)" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Return CTA */}
      <Link
        href="/edition/current"
        className="w-full h-14 rounded-xl text-[16px] font-bold flex items-center justify-center gap-2 transition-all duration-75 active:translate-y-0.5"
        style={{
          backgroundColor: "var(--secondary)",
          color: "var(--secondary-foreground)",
          boxShadow: "0 4px 0 0 #224f40",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          play_arrow
        </span>
        Continue Playing
      </Link>

      {/* Legal */}
      <p
        className="text-center text-xs opacity-50"
        style={{ color: "var(--outline)" }}
      >
        To cancel, contact support@habitly.app
      </p>
    </section>
  );
}