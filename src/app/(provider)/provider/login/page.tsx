import { redirect } from "next/navigation";

import { MobileContainer } from "@/components/layout/mobile-container";
import { LoginForm } from "@/features/auth/login-form";
import { getAuthSession } from "@/lib/auth-session";
import { isProvider } from "@/lib/provider-auth";

export default async function ProviderLoginPage() {
  const session = await getAuthSession();
  if (session?.user?.email && isProvider(session.user.email)) redirect("/provider");

  return (
    <MobileContainer>
      <main className="min-h-dvh bg-[#f3ebdf] px-6 py-12 text-[#1e1b18]">
        <p className="text-center text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#e9512d]">Loop provider</p>
        <div className="mx-auto mt-4 max-w-md rounded-[24px] border-[3px] border-[#1e1b18] bg-[#f8f1e3] p-6 shadow-[0_7px_0_#1e1b18]">
          <LoginForm defaultCallbackUrl="/provider" />
        </div>
      </main>
    </MobileContainer>
  );
}
