import snapshot from "@/data/generated/mexico-city-snapshot.json";
import {
  ENGLISH_CUISINE_LABELS,
  ENGLISH_RESTAURANT_COPY,
} from "@/data/mexico-city-english-copy";
import { MEXICO_CITY_DISCOVERY_SIGNALS } from "@/data/mexico-city-discovery-signals";
import { MEXICO_CITY_OVERRIDES } from "@/data/mexico-city-overrides";
import { buildMexicoCityTastingMenus } from "@/data/mexico-city-tasting-menus";
import {
  buildRestaurantDataset,
  type CityRestaurantDataset,
  type PriceBandOption,
} from "@/lib/city-dataset";
import type { CitySnapshot } from "@/lib/restaurant-types";

const typedSnapshot = snapshot as CitySnapshot;
const tastingMenus = buildMexicoCityTastingMenus(typedSnapshot.restaurants);

const COVER_IMAGE_INDEX: Partial<Record<string, number>> = {
  pujol: 3,
  quintonil: 0,
  contramar: 1,
  rosetta: 3,
  maximo: 2,
  "masala-y-maiz": 0,
  em: 2,
  jowong: 0,
  "ultramarinos-demar": 2,
  "el-califa-de-leon": 4,
  makan: 3,
  taverna: 1,
  bajel: 2,
  voraz: 1,
  lina: 0,
  baldio: 0,
  propio: 2,
  fugaz: 0,
  galea: 2,
  tetetlan: 3,
};

const PRICE_BAND_OPTIONS: PriceBandOption[] = [
  { key: "budget", label: "Under MX$320" },
  { key: "mid", label: "MX$800-MX$1,500" },
  { key: "high", label: "MX$1,100-MX$2,500" },
  { key: "destination", label: "MX$3,200+" },
];

export const mexicoCityDataset: CityRestaurantDataset = buildRestaurantDataset({
  snapshot: typedSnapshot,
  overrides: MEXICO_CITY_OVERRIDES,
  restaurantCopy: ENGLISH_RESTAURANT_COPY,
  tastingMenus,
  discoverySignals: MEXICO_CITY_DISCOVERY_SIGNALS,
  cuisineLabels: ENGLISH_CUISINE_LABELS,
  priceBandOptions: PRICE_BAND_OPTIONS,
  coverImageIndex: COVER_IMAGE_INDEX,
  meta: {
    displayName: "Mexico City",
    locale: "en-US",
    timeZone: "America/Mexico_City",
    currencyCode: "MXN",
    editionLabel: "Edition 01",
  },
});

export const mexicoCityMeta = mexicoCityDataset.meta;
export const mexicoCityRestaurants = mexicoCityDataset.restaurants;
export const cuisineOptions = mexicoCityDataset.cuisineOptions;
export const priceBandOptions = mexicoCityDataset.priceBandOptions;
