import Link from "next/link";

interface ProfileStatsProps {
  isPremium: boolean;
  plan: string | null;
  subscriptionEnd: Date | null;
}

export function ProfileStats({
  isPremium,
  plan,
  subscriptionEnd,
}: ProfileStatsProps) {
  const planLabel = isPremium
    ? plan === "yearly"
      ? "Yearly Plan"
      : plan === "monthly"
      ? "Monthly Plan"
      : "Premium"
    : "Free Plan";

  const planSubLabel = isPremium
    ? subscriptionEnd
      ? `Renews ${new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(subscriptionEnd)}`
      : "Active"
    : "Upgrade for full access";

  const planIcon = isPremium ? "workspace_premium" : "lock_open";
  const planColor = isPremium ? "var(--tertiary)" : "var(--secondary)";
  const planBg = isPremium
    ? "var(--tertiary-container)"
    : "var(--surface-container)";
  const planIconBg = isPremium
    ? "color-mix(in srgb, var(--tertiary-fixed) 30%, transparent)"
    : "var(--surface-container-high)";

  return (
    <section className="grid grid-cols-2 gap-4">
      {/* Streak card — static for now, wire to DB later */}
      <div
        className="p-6 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform duration-200"
        style={{ backgroundColor: "var(--surface-container-low)" }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--secondary-container) 30%, transparent)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 28,
              color: "var(--secondary)",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            local_fire_department
          </span>
        </div>
        <span
          className="text-[42px] font-extrabold leading-none"
          style={{ color: "var(--secondary)" }}
        >
          14
        </span>
        <span
          className="text-[11px] font-bold tracking-widest uppercase"
          style={{ color: "var(--on-surface-variant)" }}
        >
          Day Streak
        </span>
      </div>

      {/* Plan card — with data, links to pricing */}
      <Link
        href="/pricing"
        className="p-6 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform duration-200"
        style={{
          backgroundColor: planBg,
          border: isPremium
            ? "1px solid color-mix(in srgb, var(--outline-variant) 10%, transparent)"
            : "1px solid color-mix(in srgb, var(--outline-variant) 30%, transparent)",
          textDecoration: "none",
        }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
          style={{ backgroundColor: planIconBg }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 28,
              color: planColor,
              fontVariationSettings: isPremium ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            {planIcon}
          </span>
        </div>
        <span
          className="text-[18px] font-bold text-center leading-tight"
          style={{ color: planColor }}
        >
          {planLabel}
        </span>
        <span
          className="text-[10px] font-bold tracking-widest uppercase text-center"
          style={{ color: "var(--on-surface-variant)" }}
        >
          {planSubLabel}
        </span>
        {!isPremium && (
          <span
            className="mt-1 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "var(--secondary)",
              color: "var(--secondary-foreground)",
            }}
          >
            Upgrade
          </span>
        )}
      </Link>
    </section>
  );
}