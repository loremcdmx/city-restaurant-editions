import { CityRestaurantExplorer } from "@/components/city-restaurant-explorer";
import { defaultCityPayload } from "@/lib/city-registry";

export default function Home() {
  return <CityRestaurantExplorer payload={defaultCityPayload} />;
}
