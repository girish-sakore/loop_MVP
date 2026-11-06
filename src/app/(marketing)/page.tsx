import type { Metadata } from "next";
import "./landing.css";
import { bricolage, inter } from "./landing-fonts";
import {
  Header, Hero, VideoSection, WhySection, GamesSection,
  ValuesSection, PlayBand, Footer,
} from "@/components/landing/sections";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Loop · The daily game for curious adults",
  description:
    "Loop is a daily game for curious adults. Bite-sized games that make you smarter, more curious and more playful. Free, 10–15 minutes a day.",
};

// Static: no DB or auth reads, so it's prerendered at build time and served from the CDN.
export default async function LandingPage() {
  const session = await getAuthSession();
  if (session?.user) redirect("/map"); if (session?.user) redirect("/map");
  return (
    <main className={`landing ${bricolage.variable} ${inter.variable}`}>
      <Header />
      <Hero />
      <VideoSection />
      <WhySection />
      <GamesSection />
      <ValuesSection />
      <PlayBand />
      <Footer />
    </main>
  );
}