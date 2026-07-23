import { getAuthSession } from "@/lib/auth-session";
import { buildVillageMapData } from "@/features/map/map-content";
import { MapCanvas } from "@/components/map/map-canvas";
import { redirect } from "next/navigation";

export default async function MapPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");
  
  const villages = await buildVillageMapData(session.user.id);
  return <MapCanvas villages={villages} />;
}