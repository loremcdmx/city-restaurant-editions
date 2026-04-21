import type {
  CitySnapshot,
  CuisineKey,
  PriceBand,
  RawRestaurant,
  RestaurantDiscoverySignals,
  Restaurant,
  RestaurantOverride,
  TastingMenuVariation,
} from "@/lib/restaurant-types";

const GENERIC_MENU_ITEMS = new Set([
  "menu",
  "wine",
  "tableware",
  "restaurant",
  "interior",
  "food",
  "drinks",
]);

export type CuisineOption = {
  key: CuisineKey;
  label: string;
};

export type PriceBandOption = {
  key: PriceBand;
  label: string;
};

export type RestaurantEditorialCopy = Partial<
  Pick<
    RestaurantOverride,
    | "district"
    | "neighborhoods"
    | "cuisineLabel"
    | "bookingNote"
    | "timingNote"
    | "bestWindow"
    | "whyItWins"
  >
>;

export type CityDatasetMeta = Omit<CitySnapshot["city"], "displayName"> & {
  displayName: string;
  locale: string;
  timeZone: string;
  currencyCode: string;
  editionLabel: string;
};

export type CityRestaurantDataset = {
  meta: CityDatasetMeta;
  restaurants: Restaurant[];
  cuisineOptions: CuisineOption[];
  priceBandOptions: PriceBandOption[];
};

export type RestaurantListItem = Pick<
  Restaurant,
  | "slug"
  | "name"
  | "address"
  | "district"
  | "neighborhoods"
  | "cuisineKeys"
  | "cuisineLabel"
  | "globalScore"
  | "trendingScore"
  | "guideScore"
  | "socialScore"
  | "rating"
  | "numRatings"
  | "priceBand"
  | "bookingMode"
  | "bestWindow"
  | "googleCompositeScore"
  | "bookingPressure"
  | "guideReferences"
  | "socialReferences"
> & {
  awardHighlights: string[];
  bookingPlatform: string | null;
  coverImage: Restaurant["gallery"][number] | null;
  photoCount: number;
  signatureDishes: Array<{
    id: string;
    name: string;
  }>;
  listSummary: string;
  searchText: string;
};

export type CityRestaurantExplorerPayload = {
  meta: CityDatasetMeta;
  restaurants: RestaurantListItem[];
  cuisineOptions: CuisineOption[];
  priceBandOptions: PriceBandOption[];
  initialRestaurant: Restaurant;
};

type BuildRestaurantDatasetArgs = {
  snapshot: CitySnapshot;
  overrides: Record<string, RestaurantOverride>;
  restaurantCopy?: Record<string, RestaurantEditorialCopy>;
  tastingMenus?: Record<string, TastingMenuVariation[]>;
  discoverySignals?: Record<string, RestaurantDiscoverySignals>;
  cuisineLabels: Record<string, string>;
  priceBandOptions: PriceBandOption[];
  coverImageIndex?: Partial<Record<string, number>>;
  meta?: Partial<CityDatasetMeta>;
};

function inferReviewCountBucket(reviewCount: number | null): Restaurant["reviewCountBucket"] {
  if (!reviewCount || reviewCount < 200) {
    return "0-199";
  }

  if (reviewCount < 500) {
    return "200-499";
  }

  if (reviewCount < 1000) {
    return "500-999";
  }

  if (reviewCount < 3000) {
    return "1000-2999";
  }

  return "3000+";
}

function inferBookingPressure(restaurant: RawRestaurant): Restaurant["bookingPressure"] {
  const lowAvailabilityDays = restaurant.booking?.daysInAdvance?.lowAvailability ?? null;

  if (restaurant.booking?.type !== "reservation") {
    return "walk-in";
  }

  if (lowAvailabilityDays === null) {
    return "few-days";
  }

  if (lowAvailabilityDays >= 14) {
    return "two-weeks-plus";
  }

  if (lowAvailabilityDays >= 7) {
    return "one-week";
  }

  return "few-days";
}

function buildGoogleCompositeScore(restaurant: RawRestaurant) {
  const rating = restaurant.rating ?? 0;
  const reviews = restaurant.numRatings ?? 0;

  return Number((rating * 100 + Math.min(reviews, 6000) / 60).toFixed(2));
}

function normalizeWebsite(url: string | null | undefined) {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

function pickMenuHighlights(restaurant: RawRestaurant) {
  const picked = restaurant.menuItems
    .filter((item) => {
      const name = item.name.trim().toLowerCase();
      return name.length > 1 && !GENERIC_MENU_ITEMS.has(name);
    })
    .slice(0, 6);

  if (picked.length > 0) {
    return picked;
  }

  return restaurant.menuItems.slice(0, 4);
}

function shortenText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  const shortened = text.slice(0, maxLength);
  const boundary = shortened.lastIndexOf(" ");

  if (boundary < Math.min(120, Math.floor(maxLength * 0.45))) {
    return `${shortened.trimEnd()}...`;
  }

  return `${shortened.slice(0, boundary).trimEnd()}...`;
}

function buildListSummary(restaurant: Restaurant) {
  const source =
    restaurant.whyItWins ||
    restaurant.reviewsSummary ||
    restaurant.reasonsToVisit[0] ||
    restaurant.name;

  return shortenText(source, 132);
}

export function buildRestaurantListItem(restaurant: Restaurant): RestaurantListItem {
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    address: restaurant.address,
    district: restaurant.district,
    neighborhoods: restaurant.neighborhoods,
    cuisineKeys: restaurant.cuisineKeys,
    cuisineLabel: restaurant.cuisineLabel,
    globalScore: restaurant.globalScore,
    trendingScore: restaurant.trendingScore,
    guideScore: restaurant.guideScore,
    socialScore: restaurant.socialScore,
    rating: restaurant.rating,
    numRatings: restaurant.numRatings,
    priceBand: restaurant.priceBand,
    bookingMode: restaurant.bookingMode,
    bestWindow: restaurant.bestWindow,
    googleCompositeScore: restaurant.googleCompositeScore,
    bookingPressure: restaurant.bookingPressure,
    guideReferences: restaurant.guideReferences.slice(0, 3),
    socialReferences: restaurant.socialReferences.slice(0, 3),
    awardHighlights: restaurant.awards.slice(0, 2),
    bookingPlatform: restaurant.booking?.reservationPlatform ?? null,
    coverImage: restaurant.gallery[0] ?? null,
    photoCount: restaurant.gallery.length,
    signatureDishes: restaurant.menuItems.slice(0, 3).map(({ id, name }) => ({
      id,
      name,
    })),
    listSummary: buildListSummary(restaurant),
    searchText: [
      restaurant.name,
      restaurant.address,
      restaurant.district,
      restaurant.cuisineLabel,
      ...restaurant.neighborhoods,
      ...restaurant.cuisineKeys,
    ]
      .join(" ")
      .toLowerCase(),
  };
}

export function getRestaurantDetail(
  dataset: CityRestaurantDataset,
  slug: string,
) {
  return dataset.restaurants.find((restaurant) => restaurant.slug === slug);
}

export function buildCityRestaurantExplorerPayload(
  dataset: CityRestaurantDataset,
  initialSlug?: string,
): CityRestaurantExplorerPayload {
  const initialRestaurant =
    (initialSlug ? getRestaurantDetail(dataset, initialSlug) : undefined) ??
    dataset.restaurants[0];

  if (!initialRestaurant) {
    throw new Error(`City dataset ${dataset.meta.id} is missing restaurants`);
  }

  return {
    meta: dataset.meta,
    restaurants: dataset.restaurants.map(buildRestaurantListItem),
    cuisineOptions: dataset.cuisineOptions,
    priceBandOptions: dataset.priceBandOptions,
    initialRestaurant,
  };
}

function scoreGalleryImage(image: RawRestaurant["gallery"][number], index: number) {
  const pixels = image.width * image.height;
  const aspectRatio = image.width / image.height;
  const sizeScore = Math.min(pixels / (1920 * 1080), 1.15);
  const aspectScore = Math.max(0, 1 - Math.abs(aspectRatio - 1.45));
  const landscapeBonus =
    aspectRatio >= 1.25 ? 0.38 : aspectRatio >= 1.02 ? 0.16 : -0.18;
  const orderBonus = Math.max(0, 0.26 - index * 0.04);

  return sizeScore + aspectScore + landscapeBonus + orderBonus;
}

function buildVenueGallery(
  restaurant: RawRestaurant,
  coverImageIndex: Partial<Record<string, number>>,
) {
  const curatedIndex = coverImageIndex[restaurant.slug];

  return [...restaurant.gallery]
    .map((image, index) => ({
      image,
      index,
      score: scoreGalleryImage(image, index),
    }))
    .sort((left, right) => {
      if (curatedIndex !== undefined) {
        if (left.index === curatedIndex) {
          return -1;
        }

        if (right.index === curatedIndex) {
          return 1;
        }
      }

      return right.score - left.score;
    })
    .map(({ image }) => image);
}

function pickGallery(
  restaurant: RawRestaurant,
  menuHighlights: RawRestaurant["menuItems"],
  coverImageIndex: Partial<Record<string, number>>,
) {
  const venue = buildVenueGallery(restaurant, coverImageIndex).slice(0, 5);
  const seenKeys = new Set(venue.map((image) => image.key));
  const dishes = menuHighlights
    .filter((item) => item.image)
    .filter((item) => item.image && !seenKeys.has(item.image.key))
    .slice(0, 3)
    .map((item, index) => ({
      id: `${restaurant.slug}-dish-${index + 1}`,
      key: item.image?.key ?? `${restaurant.slug}-dish-${index + 1}`,
      url: item.image?.url ?? "",
      mediumUrl: item.image?.mediumUrl ?? "",
      smallUrl: item.image?.smallUrl ?? "",
      width: 1200,
      height: 900,
    }));

  return [...venue, ...dishes];
}

function buildMeta(
  snapshot: CitySnapshot,
  overrides: Partial<CityDatasetMeta> | undefined,
): CityDatasetMeta {
  return {
    id: overrides?.id ?? snapshot.city.id,
    name: overrides?.name ?? snapshot.city.name,
    displayName:
      overrides?.displayName ?? snapshot.city.displayName ?? snapshot.city.name,
    country: overrides?.country ?? snapshot.city.country,
    generatedAt: overrides?.generatedAt ?? snapshot.city.generatedAt,
    restaurantCount:
      overrides?.restaurantCount ?? snapshot.city.restaurantCount ?? snapshot.restaurants.length,
    locale: overrides?.locale ?? snapshot.city.locale ?? "en-US",
    timeZone: overrides?.timeZone ?? snapshot.city.timeZone ?? "UTC",
    currencyCode: overrides?.currencyCode ?? snapshot.city.currencyCode ?? "USD",
    editionLabel: overrides?.editionLabel ?? snapshot.city.editionLabel ?? "Edition 01",
  };
}

export function buildRestaurantDataset({
  snapshot,
  overrides,
  restaurantCopy = {},
  tastingMenus = {},
  discoverySignals = {},
  cuisineLabels,
  priceBandOptions,
  coverImageIndex = {},
  meta,
}: BuildRestaurantDatasetArgs): CityRestaurantDataset {
  const restaurants: Restaurant[] = snapshot.restaurants.map((restaurant) => {
    const override = overrides[restaurant.slug];
    const editorialCopy = restaurantCopy[restaurant.slug] ?? {};

    if (!override) {
      throw new Error(`Missing override for ${restaurant.slug}`);
    }

    const bookingUrl = normalizeWebsite(override.bookingUrl ?? restaurant.website ?? undefined);
    const menuHighlights = pickMenuHighlights(restaurant);
    const gallery = pickGallery(restaurant, menuHighlights, coverImageIndex);
    const timingNote = editorialCopy.timingNote ?? override.timingNote;
    const bestWindow = editorialCopy.bestWindow ?? override.bestWindow;
    const whyItWins = editorialCopy.whyItWins ?? override.whyItWins;
    const discoverySignal = discoverySignals[restaurant.slug] ?? {
      guideScore: override.globalScore,
      socialScore: override.trendingScore,
      guideReferences: [],
      socialReferences: [],
    };

    return {
      slug: restaurant.slug,
      sourceUrl: restaurant.sourceUrl,
      name: restaurant.name,
      address: restaurant.address,
      website: normalizeWebsite(restaurant.website) ?? null,
      phone: restaurant.phone,
      rating: restaurant.rating,
      numRatings: restaurant.numRatings,
      reviewsSummary: restaurant.reviewsSummary || whyItWins,
      reasonsToVisit: restaurant.reasonsToVisit.slice(0, 3),
      reviews: restaurant.reviews.slice(0, 3),
      gallery,
      menuItems: menuHighlights,
      tastingMenus: tastingMenus[restaurant.slug] ?? [],
      booking: restaurant.booking,
      openingHours: restaurant.openingHours,
      district: editorialCopy.district ?? override.district,
      neighborhoods: editorialCopy.neighborhoods ?? override.neighborhoods,
      cuisineKeys: override.cuisineKeys,
      cuisineLabel: editorialCopy.cuisineLabel ?? override.cuisineLabel,
      globalScore: override.globalScore,
      trendingScore: override.trendingScore,
      guideScore: discoverySignal.guideScore,
      socialScore: discoverySignal.socialScore,
      awards: override.awards,
      priceBand: override.priceBand,
      estimatedCheck: override.estimatedCheck,
      bookingMode: override.bookingMode,
      bookingUrl,
      bookingNote: editorialCopy.bookingNote ?? override.bookingNote,
      timingNote: `${timingNote} ${bestWindow}`.trim(),
      bestWindow,
      whyItWins,
      googleCompositeScore: buildGoogleCompositeScore(restaurant),
      reviewCountBucket: inferReviewCountBucket(restaurant.numRatings),
      bookingPressure: inferBookingPressure(restaurant),
      guideReferences: discoverySignal.guideReferences,
      socialReferences: discoverySignal.socialReferences,
    };
  });

  return {
    meta: buildMeta(snapshot, meta),
    restaurants,
    cuisineOptions: Object.entries(cuisineLabels).map(([key, label]) => ({
      key: key as CuisineKey,
      label,
    })),
    priceBandOptions,
  };
}
