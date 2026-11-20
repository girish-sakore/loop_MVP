import { getAuthSession } from "@/lib/auth-session";

import NavbarClient from "./navbar";

export default async function Navbar() {
  const session = await getAuthSession();

  const user = session?.user as
    | {
        email?: string;
        name?: string | null;
        isPremium?: boolean;
        plan?: string;
      }
    | undefined;

  return (
    <NavbarClient
      user={
        user
          ? {
              name: user.name ?? null,
              email: user.email ?? null,
            }
          : null
      }
    />
  );
}