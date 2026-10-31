import Navbar from "@/components/layout/navbar";
import React from "react";
import "../marketing.css";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-shell">
      <Navbar />
      <main className="marketing-content">{children}</main>
    </div>
  );
}
