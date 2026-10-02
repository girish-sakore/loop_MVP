import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth-session";

function providerEmails() {
  return new Set(
    (process.env.PROVIDER_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isProvider(email: string | null | undefined) {
  const allowedEmails = providerEmails();
  return Boolean(email && allowedEmails.has(email.toLowerCase()));
}

export async function requireProvider() {
  const session = await getAuthSession();
  if (!session?.user?.email) redirect("/provider/login");
  if (!isProvider(session.user.email)) redirect("/provider/login?denied=1");
  return session;
}
