import { notFound } from "next/navigation";
import { CityRestaurantExplorer } from "@/components/city-restaurant-explorer";
import { getCityExplorerPayload, getCityIds } from "@/lib/city-registry";

type CityPageProps = {
  params: Promise<{
    city: string;
  }>;
};

export function generateStaticParams() {
  return getCityIds().map((city) => ({ city }));
}

export default async function CityPage({ params }: CityPageProps) {
  const { city } = await params;
  const payload = getCityExplorerPayload(city);

  if (!payload) {
    notFound();
  }

  return <CityRestaurantExplorer payload={payload} />;
}
