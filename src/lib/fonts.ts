import { Abril_Fatface, Anton, DM_Sans, Titan_One } from "next/font/google";


/** Matchbox theme fonts. Their CSS variables must be on <html> (see app/layout.tsx). */
export const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });
export const abril = Abril_Fatface({ subsets: ["latin"], weight: "400", variable: "--font-abril", display: "swap" });
export const titanOne = Titan_One({ subsets: ["latin"], weight: "400", variable: "--font-titan", display: "swap" });
export const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
