import { LinksBuilder } from "@/features/interactions/drag-drop/builder/links-builder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links Pattern Builder | Loop MVP",
  description: "Visual level and pattern designer for the Links game",
};

export default function LinksBuilderPage() {
  return <LinksBuilder />;
}
