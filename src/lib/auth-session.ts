import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";

export async function getAuthSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export const getCachedAuthSession = cache(getAuthSession);

export async function requireUserSession(callbackUrl?: string) {
  const session = await getCachedAuthSession();
  if (!session?.user?.id) {
    const next = callbackUrl ?? "/edition/current";
    redirect(`/login?callbackUrl=${encodeURIComponent(next)}`);
  }
  return session;
}
