import { redirect } from "next/navigation";

import { getFeaturedEdition } from "@/features/editions/edition-content";
import { requireProvider } from "@/lib/provider-auth";
import { ProviderEditionEditor } from "@/components/provider/provider-edition-editor";

export default async function ProviderEditionsPage() {
  const session = await requireProvider();
  if (!session) redirect("/login");

  const template = await getFeaturedEdition();
  return <ProviderEditionEditor template={template} />;
}