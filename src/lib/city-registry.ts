import "server-only";
import { mexicoCityDataset } from "@/data/cities/mexico-city";
import {
  buildCityRestaurantExplorerPayload,
  type CityRestaurantDataset,
  type CityRestaurantExplorerPayload,
} from "@/lib/city-dataset";
import type { Restaurant } from "@/lib/restaurant-types";

type CityRegistryEntry = {
  dataset: CityRestaurantDataset;
  payload: CityRestaurantExplorerPayload;
  restaurantsBySlug: ReadonlyMap<string, Restaurant>;
};

function buildCityRegistryEntry(dataset: CityRestaurantDataset): CityRegistryEntry {
  return {
    dataset,
    payload: buildCityRestaurantExplorerPayload(dataset),
    restaurantsBySlug: new Map(
      dataset.restaurants.map((restaurant) => [restaurant.slug, restaurant]),
    ),
  };
}

const CITY_REGISTRY = {
  "mexico-city": buildCityRegistryEntry(mexicoCityDataset),
} satisfies Record<string, CityRegistryEntry>;

export type KnownCityId = keyof typeof CITY_REGISTRY;

export const defaultCityId: KnownCityId = "mexico-city";
export const defaultCityDataset = CITY_REGISTRY[defaultCityId].dataset;
export const defaultCityPayload = CITY_REGISTRY[defaultCityId].payload;

export function getCityDataset(cityId: string) {
  if (cityId in CITY_REGISTRY) {
    return CITY_REGISTRY[cityId as KnownCityId].dataset;
  }

  return undefined;
}

export function getCityExplorerPayload(cityId: string) {
  if (cityId in CITY_REGISTRY) {
    return CITY_REGISTRY[cityId as KnownCityId].payload;
  }

  return undefined;
}

export function getCityRestaurantDetail(cityId: string, slug: string) {
  if (!(cityId in CITY_REGISTRY)) {
    return undefined;
  }

  return CITY_REGISTRY[cityId as KnownCityId].restaurantsBySlug.get(slug);
}

export function getCityIds() {
  return Object.keys(CITY_REGISTRY) as KnownCityId[];
}

export function getCitySummaries() {
  return getCityIds().map((cityId) => {
    const dataset = CITY_REGISTRY[cityId].dataset;

    return {
      id: cityId,
      name: dataset.meta.displayName,
      country: dataset.meta.country,
      restaurantCount: dataset.meta.restaurantCount,
      updatedAt: dataset.meta.generatedAt,
    };
  });
}
