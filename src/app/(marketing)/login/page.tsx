import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/features/auth/login-form";
import { getAuthSession } from "@/lib/auth-session";

export default async function LoginPage() {
  const session = await getAuthSession();
  if (session?.user?.id) redirect("/map");

  return (
    <section className="auth-page">
      <div className="auth-card">
        <LoginForm />
        <p className="auth-legal">
          By continuing, you agree to our <Link href="/terms-of-service">Terms of Service</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>
      </div>
    </section>
  );
}
