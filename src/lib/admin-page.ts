import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-session";
import { isCreatorEmail } from "@/lib/require-creator";

/** Call at the top of every admin page. Layouts don't re-run on client navigation, so don't rely on one. */
export async function requireCreatorPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");
  if (!isCreatorEmail(session.user.email)) notFound(); // non-creators just see a 404
  return session.user;
}