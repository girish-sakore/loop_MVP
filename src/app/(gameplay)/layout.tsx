import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export default async function GameplayLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();

  // Security fallback: If middleware somehow misses a check, the layout catches it
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="gameplay-theme">
      {/* You can now use session.user.name here safely! */}
      {children}
    </div>
  );
}