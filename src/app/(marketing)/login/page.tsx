import { redirect } from "next/navigation";

import { MobileContainer } from "@/components/layout/mobile-container";
import { TopBar } from "@/components/layout/top-bar";
import { LoginForm } from "@/features/auth/login-form";
import { getCachedAuthSession } from "@/lib/auth-session";

export default async function LoginPage() {
  const session = await getCachedAuthSession();
  if (session?.user?.id) {
    redirect("/edition/current");
  }

  return (
    <MobileContainer>
      <TopBar title="Login" subtitle="Continue your edition" />
      <main className="px-4 pt-8">
        <section className="rounded-3xl border border-border bg-card p-5">
          <p className="mb-4 text-sm text-muted-foreground">
            Sign in with your email to continue your progression.
          </p>
          <LoginForm />
        </section>
      </main>
    </MobileContainer>
  );
}
