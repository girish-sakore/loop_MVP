import { getAuthSession } from "@/lib/auth-session";

export async function requireProvider() {
  const session = await getAuthSession();
  if (!session?.user?.id || session.user.role !== "provider") {
    return null;
  }
  return session;
}