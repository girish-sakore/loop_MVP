import { Abril_Fatface, Cinzel, DM_Sans } from "next/font/google";

export const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

/** Matchbox theme fonts. Their CSS variables must be on <html> (see app/layout.tsx). */
export const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });
export const abril = Abril_Fatface({ subsets: ["latin"], weight: "400", variable: "--font-abril", display: "swap" });