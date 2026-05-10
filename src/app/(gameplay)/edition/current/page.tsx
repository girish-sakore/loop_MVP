import { redirect } from "next/navigation";

import { getFeaturedEdition } from "@/features/editions/edition-content";
import { getCachedAuthSession } from "@/lib/auth-session";

export default async function CurrentEditionRedirectPage() {
  // await requireUserSession("/edition/current");

  const currentEdition = getFeaturedEdition();
  if (!currentEdition?.id) {
    redirect("/");
  }

  redirect(`/edition/${currentEdition.id}`);
}
