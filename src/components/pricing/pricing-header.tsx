import Link from "next/link";

export function PricingHeader() {
  return (
    <header
      className="flex justify-between items-center w-full px-6 h-16 sticky top-0 z-50"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <Link href="/profile">
        <span
          className="material-symbols-outlined hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: "var(--on-surface)" }}
        >
          close
        </span>
      </Link>

      <span
        className="text-[28px] font-extrabold tracking-tight"
        style={{ color: "var(--secondary)" }}
      >
        Habitly
      </span>

      {/* Spacer to keep brand centered */}
      <div className="w-6" />
    </header>
  );
}