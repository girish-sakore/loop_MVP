import HeroSection from '@/components/landing-page/hero-section';
import ThreeStepJourney from '@/components/landing-page/three-step-journey';
import WeeklyExperience from '@/components/landing-page/weekly-experience';
import ProgressSection from '@/components/landing-page/interactive-progress';
import PremiumBenefits from '@/components/landing-page/premium-benefits';
import FinalCTA from '@/components/landing-page/final-cta';
import Footer from '@/components/landing-page/footer';
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getAuthSession();
  if (session?.user) redirect("/edition/current");
  return (
    <div className="bg-[#fcf8f7] text-[#1c1b1b] font-sans">
      <HeroSection />
      <ThreeStepJourney />
      <WeeklyExperience />
      <ProgressSection />
      <PremiumBenefits />
      <FinalCTA />
      <Footer />
    </div>
  );
}

