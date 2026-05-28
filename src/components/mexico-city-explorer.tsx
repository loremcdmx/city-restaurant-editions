"use client";

import Image from "next/image";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { RestaurantBookingWorkbench } from "@/components/restaurant-booking-workbench";
import {
  RestaurantMediaLightbox,
  type MediaViewerItem,
} from "@/components/restaurant-media-lightbox";
import type {
  CityRestaurantExplorerPayload,
  RestaurantListItem,
} from "@/lib/city-dataset";
import type {
  CuisineKey,
  PriceBand,
  Restaurant,
  TastingMenuDishPhoto,
  TastingMenuVariation,
} from "@/lib/restaurant-types";

type ViewMode =
  | "global"
  | "trending"
  | "socials"
  | "guides"
  | "google"
  | "cuisine";
type CardSignalTone = "neutral" | "accent" | "warm" | "strong";

type CardSignal = {
  label: string;
  tone: CardSignalTone;
};

type ModeBadge = {
  label: string;
  value: string;
};

type GalleryVariant = "single" | "hero" | "tall" | "stack" | "wide";

type GalleryLayoutItem = {
  image: Restaurant["gallery"][number];
  variant: GalleryVariant;
  sizes: string;
};

type GalleryImageVariant = "full" | "hero" | "preview" | "card" | "thumb";
type MenuImageVariant = "full" | "preview" | "thumb";

const VIEW_LABELS: Record<ViewMode, string> = {
  global: "Global",
  trending: "Trending",
  socials: "Trending in Socials",
  guides: "Guides",
  google: "Google Maps",
  cuisine: "By Cuisine",
};

const VIEW_DECKS: Record<ViewMode, string> = {
  global: "The defining tables to start with when you want the city at full resolution.",
  trending: "The rooms where the city's energy feels most alive right now.",
  socials:
    "Restaurants carrying the strongest current visual, new-wave, and social-conversation signal.",
  guides:
    "A consensus lens weighted toward current expert guides, awards, and local-author authority.",
  google:
    "A crowd-signal lens built from rating quality, review density, and durable public demand.",
  cuisine:
    "A cleaner entry into the city through a specific cuisine instead of generic noise.",
};

const VIEW_MODES = Object.keys(VIEW_LABELS) as ViewMode[];
const DEFAULT_VIEW_MODE: ViewMode = "global";
const SHARE_STATUS_DURATION_MS = 1800;
const MAX_URL_SHORTLIST_SIZE = 20;

export type ExplorerUrlStateOptions = {
  defaultBands: PriceBand[];
  defaultCuisine: CuisineKey;
  defaultSlug: string;
  validCuisineKeys: CuisineKey[];
  validPriceBands: PriceBand[];
  validRestaurantSlugs: string[];
};

export type ExplorerUrlState = {
  bookableOnly: boolean;
  only500Plus: boolean;
  search: string;
  selectedBands: PriceBand[];
  selectedCuisine: CuisineKey;
  selectedSlug: string;
  shortlistSlugs: string[];
  viewMode: ViewMode;
};

type CityRestaurantExplorerProps = {
  payload: CityRestaurantExplorerPayload;
};

type RestaurantMapTarget = Pick<Restaurant, "name" | "address">;

const DETAIL_PREFETCH_WINDOW = 4;
const DETAIL_PREFETCH_DELAY_MS = 260;

function formatReviewCount(value: number | null, locale = "en-US") {
  if (value === null || value === undefined) {
    return "No data";
  }

  return new Intl.NumberFormat(locale).format(value);
}

function formatMoney(value: number, locale: string, currencyCode: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPriceBand(priceBand: PriceBand) {
  switch (priceBand) {
    case "budget":
      return "Budget";
    case "mid":
      return "Mid-range";
    case "high":
      return "High";
    case "destination":
      return "Trip-worthy";
  }
}

function formatPriceBandCompact(priceBand: PriceBand) {
  switch (priceBand) {
    case "budget":
      return "Budget";
    case "mid":
      return "Mid";
    case "high":
      return "High";
    case "destination":
      return "Trip";
  }
}

function formatBookingPressure(pressure: Restaurant["bookingPressure"]) {
  switch (pressure) {
    case "walk-in":
      return "Usually walk-in";
    case "few-days":
      return "Book 2-5 days out";
    case "one-week":
      return "Book about a week out";
    case "two-weeks-plus":
      return "Book 2+ weeks out";
  }
}

function formatTastingMenuConfidence(
  confidence: TastingMenuVariation["confidence"],
) {
  switch (confidence) {
    case "official-current":
      return "Official current";
    case "official-archive":
      return "Official archive";
    case "platform-current":
      return "Live platform menu";
    case "reported-archive":
      return "Reported archive";
  }
}

function formatOpeningDay(day: Restaurant["openingHours"][number]) {
  if (day.closed) {
    return "Closed";
  }

  return day.intervals.map((interval) => `${interval.open}-${interval.close}`).join(", ");
}

function shortenText(text: string, maxLength = 280) {
  if (text.length <= maxLength) {
    return text;
  }

  const shortened = text.slice(0, maxLength);
  const boundary = shortened.lastIndexOf(" ");

  if (boundary < 120) {
    return `${shortened.trimEnd()}...`;
  }

  return `${shortened.slice(0, boundary).trimEnd()}...`;
}

function formatRank(index: number) {
  return String(index + 1).padStart(2, "0");
}

function buildListDeck(restaurant: RestaurantListItem) {
  return restaurant.listSummary;
}

function shortenWindow(text: string) {
  return shortenText(text, 26);
}

function shortenSignalLabel(text: string) {
  return shortenText(text, 28);
}

function buildSignatureDishes(restaurant: RestaurantListItem) {
  return restaurant.signatureDishes;
}

function formatReservationPlatform(platform: string) {
  if (platform.toLowerCase() === "opentable") {
    return "OpenTable";
  }

  if (platform.toLowerCase() === "resy") {
    return "Resy";
  }

  return platform;
}

function buildMapsQuery(restaurant: RestaurantMapTarget, cityDisplayName: string) {
  return `${restaurant.name}, ${restaurant.address}, ${cityDisplayName}`;
}

function buildMapsHref(restaurant: RestaurantMapTarget, cityDisplayName: string) {
  const query = encodeURIComponent(buildMapsQuery(restaurant, cityDisplayName));

  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function buildMapsEmbedSrc(restaurant: RestaurantMapTarget, cityDisplayName: string) {
  const query = encodeURIComponent(buildMapsQuery(restaurant, cityDisplayName));

  return `https://www.google.com/maps?q=${query}&z=15&output=embed`;
}

async function writeClipboardText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function buildShortlistPlanText(
  cityDisplayName: string,
  restaurants: RestaurantListItem[],
) {
  const lines = restaurants.map((restaurant, index) =>
    [
      `${index + 1}. ${restaurant.name}`,
      `${restaurant.district} / ${restaurant.cuisineLabel}`,
      `${formatPriceBandCompact(restaurant.priceBand)} spend`,
      formatBookingPressure(restaurant.bookingPressure),
      `best window: ${restaurant.bestWindow}`,
      restaurant.bookingPlatform
        ? `channel: ${formatReservationPlatform(restaurant.bookingPlatform)}`
        : "channel: website / contact",
    ].join(" - "),
  );

  return [`${cityDisplayName} restaurant shortlist`, "", ...lines].join("\n");
}

function formatAwardLabel(award: string) {
  return shortenText(award, 30);
}

function getGalleryImageSrc(
  image: Restaurant["gallery"][number],
  variant: GalleryImageVariant = "full",
) {
  if (variant === "thumb") {
    return image.smallUrl || image.mediumUrl || image.url;
  }

  if (variant === "card" || variant === "preview") {
    return image.mediumUrl || image.url || image.smallUrl;
  }

  return image.url || image.mediumUrl || image.smallUrl;
}

function getMenuImageSrc(
  image: NonNullable<Restaurant["menuItems"][number]["image"]>,
  variant: MenuImageVariant = "full",
) {
  if (variant === "thumb") {
    return image.smallUrl || image.mediumUrl || image.url;
  }

  if (variant === "preview") {
    return image.mediumUrl || image.url || image.smallUrl;
  }

  return image.url || image.mediumUrl || image.smallUrl;
}

function getTastingPhotoSrc(
  image: TastingMenuDishPhoto["image"],
  variant: MenuImageVariant = "full",
) {
  if (variant === "thumb") {
    return image.smallUrl || image.mediumUrl || image.url;
  }

  if (variant === "preview") {
    return image.mediumUrl || image.url || image.smallUrl;
  }

  return image.url || image.mediumUrl || image.smallUrl;
}

function buildGalleryViewerItems(
  restaurant: Restaurant,
  images: Restaurant["gallery"],
): MediaViewerItem[] {
  return images.map((image, index) => ({
    src: getGalleryImageSrc(image, "full"),
    alt: `${restaurant.name} photo ${index + 1}`,
    caption: `${restaurant.name} - Photo ${index + 1}`,
  }));
}

function buildMenuViewerItem(
  restaurant: Restaurant,
  item: Restaurant["menuItems"][number],
): MediaViewerItem | null {
  if (!item.image) {
    return null;
  }

  return {
    src: getMenuImageSrc(item.image, "full"),
    alt: `${restaurant.name} ${item.name}`,
    caption: `${restaurant.name} - ${item.name}`,
  };
}

function buildTastingMenuViewerItems(
  restaurant: Restaurant,
  tastingMenu: TastingMenuVariation,
): MediaViewerItem[] {
  return tastingMenu.dishes.flatMap((dish) =>
    dish.photos.map((photo, index) => ({
      src: getTastingPhotoSrc(photo.image, "full"),
      alt: `${restaurant.name} ${dish.name} photo ${index + 1}`,
      caption: `${restaurant.name} - ${tastingMenu.seasonLabel} - ${dish.name}`,
    })),
  );
}

function buildGalleryLayout(
  images: Restaurant["gallery"],
): GalleryLayoutItem[] {
  const visible = images.slice(0, 5);

  if (visible.length === 0) {
    return [];
  }

  if (visible.length === 1) {
    return [
      {
        image: visible[0],
        variant: "single",
        sizes: "(max-width: 1080px) 100vw, 72vw",
      },
    ];
  }

  if (visible.length === 2) {
    return [
      {
        image: visible[0],
        variant: "hero",
        sizes: "(max-width: 1080px) 100vw, 48vw",
      },
      {
        image: visible[1],
        variant: "tall",
        sizes: "(max-width: 1080px) 100vw, 24vw",
      },
    ];
  }

  if (visible.length === 3) {
    return [
      {
        image: visible[0],
        variant: "hero",
        sizes: "(max-width: 1080px) 100vw, 48vw",
      },
      {
        image: visible[1],
        variant: "stack",
        sizes: "(max-width: 1080px) 50vw, 24vw",
      },
      {
        image: visible[2],
        variant: "stack",
        sizes: "(max-width: 1080px) 50vw, 24vw",
      },
    ];
  }

  if (visible.length === 4) {
    return [
      {
        image: visible[0],
        variant: "hero",
        sizes: "(max-width: 1080px) 100vw, 48vw",
      },
      {
        image: visible[1],
        variant: "stack",
        sizes: "(max-width: 1080px) 50vw, 24vw",
      },
      {
        image: visible[2],
        variant: "stack",
        sizes: "(max-width: 1080px) 50vw, 24vw",
      },
      {
        image: visible[3],
        variant: "wide",
        sizes: "(max-width: 1080px) 100vw, 48vw",
      },
    ];
  }

  return [
    {
      image: visible[0],
      variant: "hero",
      sizes: "(max-width: 1080px) 100vw, 48vw",
    },
    {
      image: visible[1],
      variant: "stack",
      sizes: "(max-width: 1080px) 50vw, 24vw",
    },
    {
      image: visible[2],
      variant: "stack",
      sizes: "(max-width: 1080px) 50vw, 24vw",
    },
    {
      image: visible[3],
      variant: "wide",
      sizes: "(max-width: 1080px) 100vw, 48vw",
    },
    {
      image: visible[4],
      variant: "stack",
      sizes: "(max-width: 1080px) 50vw, 24vw",
    },
  ];
}

function buildModeBadge(restaurant: RestaurantListItem, mode: ViewMode): ModeBadge {
  if (mode === "trending") {
    return { label: "Heat", value: String(restaurant.trendingScore) };
  }

  if (mode === "socials") {
    return { label: "Buzz", value: String(restaurant.socialScore) };
  }

  if (mode === "guides") {
    return { label: "Guides", value: String(restaurant.guideScore) };
  }

  if (mode === "google") {
    return {
      label: "Crowd",
      value: String(Math.round(restaurant.googleCompositeScore)),
    };
  }

  if (mode === "cuisine") {
    return { label: "Fit", value: String(restaurant.globalScore) };
  }

  return { label: "Score", value: String(restaurant.globalScore) };
}

function buildCrowdSignal(restaurant: RestaurantListItem): CardSignal {
  const reviews = restaurant.numRatings ?? 0;

  if (reviews >= 3000) {
    return { label: "3k+ ratings", tone: "strong" };
  }

  if (reviews >= 1000) {
    return { label: "1k+ ratings", tone: "accent" };
  }

  if (reviews >= 500) {
    return { label: "500+ ratings", tone: "neutral" };
  }

  return { label: "Insider signal", tone: "warm" };
}

function buildBookingSignal(restaurant: RestaurantListItem): CardSignal {
  const platform = restaurant.bookingPlatform;

  if (platform) {
    return {
      label: `Slots: ${formatReservationPlatform(platform)}`,
      tone: "accent",
    };
  }

  if (restaurant.bookingMode === "walk-in") {
    return { label: "Walk-in only", tone: "warm" };
  }

  return { label: "Website / call", tone: "neutral" };
}

function buildMoveSignal(restaurant: RestaurantListItem): CardSignal {
  switch (restaurant.bookingPressure) {
    case "walk-in":
      return { label: "Same day", tone: "accent" };
    case "few-days":
      return { label: "2-5 days", tone: "neutral" };
    case "one-week":
      return { label: "About a week", tone: "neutral" };
    case "two-weeks-plus":
      return { label: "Book early", tone: "warm" };
  }
}

function buildReferenceCardSignals(
  references: RestaurantListItem["guideReferences"],
  tone: CardSignalTone,
) {
  const signals: CardSignal[] = [];
  const seen = new Set<string>();

  for (const reference of references) {
    const label = shortenSignalLabel(reference.sourceLabel);

    if (seen.has(label)) {
      continue;
    }

    seen.add(label);
    signals.push({
      label,
      tone: signals.length === 0 ? tone : "neutral",
    });

    if (signals.length === 3) {
      break;
    }
  }

  return signals;
}

function buildCardSignals(restaurant: RestaurantListItem, mode: ViewMode) {
  if (mode === "guides" && restaurant.guideReferences.length > 0) {
    return buildReferenceCardSignals(restaurant.guideReferences, "strong");
  }

  if (mode === "socials" && restaurant.socialReferences.length > 0) {
    return buildReferenceCardSignals(restaurant.socialReferences, "accent");
  }

  return [
    buildBookingSignal(restaurant),
    buildMoveSignal(restaurant),
    buildCrowdSignal(restaurant),
  ];
}

function sortRestaurants(restaurants: RestaurantListItem[], mode: ViewMode) {
  const clone = [...restaurants];

  clone.sort((left, right) => {
    if (mode === "trending") {
      return right.trendingScore - left.trendingScore;
    }

    if (mode === "socials") {
      return right.socialScore - left.socialScore;
    }

    if (mode === "guides") {
      return right.guideScore - left.guideScore;
    }

    if (mode === "google") {
      return right.googleCompositeScore - left.googleCompositeScore;
    }

    return right.globalScore - left.globalScore;
  });

  return clone;
}

function updateFlagRecord(
  current: Record<string, boolean>,
  key: string,
  enabled: boolean,
) {
  if (enabled) {
    return current[key] ? current : { ...current, [key]: true };
  }

  if (!current[key]) {
    return current;
  }

  const next = { ...current };
  delete next[key];
  return next;
}

function hasSameMembers<T extends string>(left: T[], right: T[]) {
  if (left.length !== right.length) {
    return false;
  }

  const rightValues = new Set(right);

  return left.every((value) => rightValues.has(value));
}

function isViewMode(value: string | null): value is ViewMode {
  return value !== null && VIEW_MODES.includes(value as ViewMode);
}

function sanitizeSearch(value: string | null) {
  return (value ?? "").trim().slice(0, 80);
}

function parseSelectedBands(
  value: string | null,
  options: ExplorerUrlStateOptions,
) {
  if (!value) {
    return options.defaultBands;
  }

  const validBands = new Set(options.validPriceBands);
  const selectedBands = value
    .split(",")
    .map((band) => band.trim())
    .filter((band): band is PriceBand => validBands.has(band as PriceBand));

  return selectedBands.length > 0 ? selectedBands : options.defaultBands;
}

function parseShortlistSlugs(
  value: string | null,
  options: ExplorerUrlStateOptions,
) {
  if (!value) {
    return [];
  }

  const validSlugs = new Set(options.validRestaurantSlugs);
  const shortlistSlugs: string[] = [];

  for (const slug of value.split(",")) {
    const normalizedSlug = slug.trim();

    if (
      validSlugs.has(normalizedSlug) &&
      !shortlistSlugs.includes(normalizedSlug)
    ) {
      shortlistSlugs.push(normalizedSlug);
    }

    if (shortlistSlugs.length >= MAX_URL_SHORTLIST_SIZE) {
      break;
    }
  }

  return shortlistSlugs;
}

export function readExplorerUrlState(
  params: URLSearchParams,
  options: ExplorerUrlStateOptions,
): ExplorerUrlState {
  const selectedCuisine = params.get("cuisine");
  const selectedSlug = params.get("restaurant");
  const validCuisineKeys = new Set(options.validCuisineKeys);
  const validRestaurantSlugs = new Set(options.validRestaurantSlugs);

  return {
    bookableOnly: params.get("bookable") === "1",
    only500Plus: params.get("reviews") === "500",
    search: sanitizeSearch(params.get("q")),
    selectedBands: parseSelectedBands(params.get("prices"), options),
    selectedCuisine:
      selectedCuisine && validCuisineKeys.has(selectedCuisine)
        ? selectedCuisine
        : options.defaultCuisine,
    selectedSlug:
      selectedSlug && validRestaurantSlugs.has(selectedSlug)
        ? selectedSlug
        : options.defaultSlug,
    shortlistSlugs: parseShortlistSlugs(params.get("shortlist"), options),
    viewMode: isViewMode(params.get("view"))
      ? (params.get("view") as ViewMode)
      : DEFAULT_VIEW_MODE,
  };
}

export function buildExplorerSearchParams(
  state: ExplorerUrlState,
  options: ExplorerUrlStateOptions,
) {
  const params = new URLSearchParams();
  const search = sanitizeSearch(state.search);

  if (state.viewMode !== DEFAULT_VIEW_MODE) {
    params.set("view", state.viewMode);
  }

  if (state.selectedSlug !== options.defaultSlug) {
    params.set("restaurant", state.selectedSlug);
  }

  const shortlistSlugs = parseShortlistSlugs(
    state.shortlistSlugs.join(","),
    options,
  );

  if (shortlistSlugs.length > 0) {
    params.set("shortlist", shortlistSlugs.join(","));
  }

  if (search) {
    params.set("q", search);
  }

  if (state.only500Plus) {
    params.set("reviews", "500");
  }

  if (state.bookableOnly) {
    params.set("bookable", "1");
  }

  if (
    state.viewMode === "cuisine" &&
    state.selectedCuisine !== options.defaultCuisine
  ) {
    params.set("cuisine", state.selectedCuisine);
  }

  if (!hasSameMembers(state.selectedBands, options.defaultBands)) {
    params.set("prices", state.selectedBands.join(","));
  }

  return params;
}

export function CityRestaurantExplorer({
  payload,
}: CityRestaurantExplorerProps) {
  const cityMeta = payload.meta;
  const restaurants = payload.restaurants;
  const cuisineOptions = payload.cuisineOptions;
  const priceBandOptions = payload.priceBandOptions;
  const defaultRestaurantSummary = restaurants[0]!;
  const defaultRestaurant = payload.initialRestaurant;
  const allPriceBands = useMemo(
    () => priceBandOptions.map((option) => option.key),
    [priceBandOptions],
  );
  const defaultCuisine = cuisineOptions[0]?.key ?? "";
  const urlStateOptions = useMemo<ExplorerUrlStateOptions>(
    () => ({
      defaultBands: allPriceBands,
      defaultCuisine,
      defaultSlug:
        restaurants.find((restaurant) => restaurant.slug === defaultRestaurant.slug)
          ?.slug ?? defaultRestaurantSummary.slug,
      validCuisineKeys: cuisineOptions.map((option) => option.key),
      validPriceBands: allPriceBands,
      validRestaurantSlugs: restaurants.map((restaurant) => restaurant.slug),
    }),
    [
      allPriceBands,
      cuisineOptions,
      defaultCuisine,
      defaultRestaurant.slug,
      defaultRestaurantSummary.slug,
      restaurants,
    ],
  );
  const hydratedUrlRef = useRef(false);
  const shareStatusTimerRef = useRef<number | null>(null);
  const shortlistStatusTimerRef = useRef<number | null>(null);
  const shouldScrollSelectedRef = useRef(false);
  const [viewMode, setViewMode] = useState<ViewMode>(DEFAULT_VIEW_MODE);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const [only500Plus, setOnly500Plus] = useState(false);
  const [bookableOnly, setBookableOnly] = useState(false);
  const [selectedCuisine, setSelectedCuisine] =
    useState<CuisineKey>(defaultCuisine);
  const activeCuisine =
    cuisineOptions.find((option) => option.key === selectedCuisine)?.key ??
    defaultCuisine ??
    "";
  const [selectedBands, setSelectedBands] =
    useState<PriceBand[]>(allPriceBands);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [shortlistStatus, setShortlistStatus] = useState<
    "idle" | "copied" | "failed"
  >("idle");
  const [shortlistSlugs, setShortlistSlugs] = useState<string[]>([]);
  const rankingListRef = useRef<HTMLOListElement | null>(null);
  const [restaurantDetails, setRestaurantDetails] = useState<
    Record<string, Restaurant>
  >(() => ({
    [defaultRestaurant.slug]: defaultRestaurant,
  }));
  const detailCacheRef = useRef(restaurantDetails);
  const detailRequestsRef = useRef<Map<string, Promise<Restaurant | null>>>(
    new Map(),
  );
  const [pendingDetailSlugs, setPendingDetailSlugs] = useState<
    Record<string, boolean>
  >({});
  const [detailErrors, setDetailErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    detailCacheRef.current = restaurantDetails;
  }, [restaurantDetails]);

  const filteredRestaurants = useMemo(() => {
    const base = restaurants.filter((restaurant) => {
      if (normalizedSearch && !restaurant.searchText.includes(normalizedSearch)) {
        return false;
      }

      if (only500Plus && (restaurant.numRatings ?? 0) < 500) {
        return false;
      }

      if (bookableOnly && restaurant.bookingMode === "walk-in") {
        return false;
      }

      if (!selectedBands.includes(restaurant.priceBand)) {
        return false;
      }

      if (
        viewMode === "cuisine" &&
        !restaurant.cuisineKeys.includes(activeCuisine)
      ) {
        return false;
      }

      return true;
    });

    return sortRestaurants(base, viewMode);
  }, [
    activeCuisine,
    bookableOnly,
    normalizedSearch,
    only500Plus,
    restaurants,
    selectedBands,
    viewMode,
  ]);

  const [selectedSlug, setSelectedSlug] = useState<string>(
    urlStateOptions.defaultSlug,
  );
  const applyUrlState = useCallback((shouldScroll = false) => {
    if (typeof window === "undefined") {
      return;
    }

    shouldScrollSelectedRef.current = shouldScroll;

    const nextState = readExplorerUrlState(
      new URLSearchParams(window.location.search),
      urlStateOptions,
    );

    setViewMode(nextState.viewMode);
    setSearch(nextState.search);
    setOnly500Plus(nextState.only500Plus);
    setBookableOnly(nextState.bookableOnly);
    setSelectedCuisine(nextState.selectedCuisine);
    setSelectedBands(nextState.selectedBands);
    setSelectedSlug(nextState.selectedSlug);
    setShortlistSlugs(nextState.shortlistSlugs);
  }, [
    setBookableOnly,
    setOnly500Plus,
    setSearch,
    setSelectedBands,
    setSelectedCuisine,
    setSelectedSlug,
    setShortlistSlugs,
    setViewMode,
    urlStateOptions,
  ]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      applyUrlState();
      hydratedUrlRef.current = true;
    }, 0);

    const handlePopState = () => applyUrlState(true);

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [applyUrlState]);

  const activeSelectedSlug =
    filteredRestaurants.find((restaurant) => restaurant.slug === selectedSlug)?.slug ??
    filteredRestaurants[0]?.slug ??
    defaultRestaurantSummary.slug;

  const selectedRestaurant =
    filteredRestaurants.find((restaurant) => restaurant.slug === activeSelectedSlug) ??
    filteredRestaurants[0] ??
    defaultRestaurantSummary;
  const restaurantsBySlug = useMemo(
    () => new Map(restaurants.map((restaurant) => [restaurant.slug, restaurant])),
    [restaurants],
  );
  const shortlistRestaurants = useMemo(
    () =>
      shortlistSlugs
        .map((slug) => restaurantsBySlug.get(slug))
        .filter((restaurant): restaurant is RestaurantListItem =>
          Boolean(restaurant),
        ),
    [restaurantsBySlug, shortlistSlugs],
  );
  const selectedRestaurantIsShortlisted = shortlistSlugs.includes(
    selectedRestaurant.slug,
  );
  const shortlistDistricts = new Set(
    shortlistRestaurants.map((restaurant) => restaurant.district),
  ).size;
  const shortlistBookableCount = shortlistRestaurants.filter(
    (restaurant) => restaurant.bookingMode !== "walk-in",
  ).length;
  const detailRestaurant = restaurantDetails[activeSelectedSlug] ?? null;
  const isDetailPending =
    Boolean(pendingDetailSlugs[activeSelectedSlug]) ||
    (!detailRestaurant && !detailErrors[activeSelectedSlug]);
  const hasDetailError =
    Boolean(detailErrors[activeSelectedSlug]) && !detailRestaurant;
  const hasResults = filteredRestaurants.length > 0;
  const hasActiveFilters =
    search.trim().length > 0 ||
    only500Plus ||
    bookableOnly ||
    !hasSameMembers(selectedBands, allPriceBands) ||
    viewMode === "cuisine";

  useEffect(() => {
    if (!hydratedUrlRef.current || typeof window === "undefined") {
      return;
    }

    const params = buildExplorerSearchParams(
      {
        bookableOnly,
        only500Plus,
        search,
        selectedBands,
        selectedCuisine: activeCuisine,
        selectedSlug: activeSelectedSlug,
        shortlistSlugs,
        viewMode,
      },
      urlStateOptions,
    );
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [
    activeCuisine,
    activeSelectedSlug,
    bookableOnly,
    only500Plus,
    search,
    selectedBands,
    shortlistSlugs,
    urlStateOptions,
    viewMode,
  ]);

  const fetchRestaurantDetail = useCallback(
    async (slug: string) => {
      const cachedRestaurant = detailCacheRef.current[slug];

      if (cachedRestaurant) {
        return cachedRestaurant;
      }

      const activeRequest = detailRequestsRef.current.get(slug);

      if (activeRequest) {
        return activeRequest;
      }

      setPendingDetailSlugs((current) => updateFlagRecord(current, slug, true));

      const request = fetch(
        `/api/cities/${encodeURIComponent(cityMeta.id)}/restaurants/${encodeURIComponent(slug)}`,
        {
          cache: "force-cache",
        },
      )
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Failed to load ${slug} detail`);
          }

          const data = (await response.json()) as {
            restaurant: Restaurant;
          };

          setRestaurantDetails((current) => {
            if (current[slug]) {
              return current;
            }

            return {
              ...current,
              [slug]: data.restaurant,
            };
          });
          setDetailErrors((current) => updateFlagRecord(current, slug, false));

          return data.restaurant;
        })
        .catch((error) => {
          console.error(error);
          setDetailErrors((current) => updateFlagRecord(current, slug, true));
          return null;
        })
        .finally(() => {
          detailRequestsRef.current.delete(slug);
          setPendingDetailSlugs((current) => updateFlagRecord(current, slug, false));
        });

      detailRequestsRef.current.set(slug, request);

      return request;
    },
    [cityMeta.id],
  );

  useEffect(() => {
    void fetchRestaurantDetail(activeSelectedSlug);
  }, [activeSelectedSlug, fetchRestaurantDetail]);

  useEffect(() => {
    const activeIndex = filteredRestaurants.findIndex(
      (restaurant) => restaurant.slug === activeSelectedSlug,
    );

    if (activeIndex === -1) {
      return;
    }

    const slugsToPrefetch = filteredRestaurants
      .slice(activeIndex + 1, activeIndex + 1 + DETAIL_PREFETCH_WINDOW)
      .map((restaurant) => restaurant.slug)
      .filter((slug) => !detailCacheRef.current[slug]);

    if (slugsToPrefetch.length === 0) {
      return;
    }

    const prefetch = () => {
      for (const slug of slugsToPrefetch) {
        void fetchRestaurantDetail(slug);
      }
    };

    const requestIdleCallback = window.requestIdleCallback?.bind(window);
    const cancelIdleCallback = window.cancelIdleCallback?.bind(window);

    if (requestIdleCallback && cancelIdleCallback) {
      const idleId = requestIdleCallback(prefetch, {
        timeout: 1200,
      });

      return () => cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(prefetch, DETAIL_PREFETCH_DELAY_MS);

    return () => globalThis.clearTimeout(timeoutId);
  }, [activeSelectedSlug, fetchRestaurantDetail, filteredRestaurants]);

  const gallerySource =
    detailRestaurant?.gallery ??
    (selectedRestaurant.coverImage ? [selectedRestaurant.coverImage] : []);
  const gallery = gallerySource.slice(0, 5);
  const galleryLayout = useMemo(() => buildGalleryLayout(gallery), [gallery]);
  const totalGalleryCount = detailRestaurant?.gallery.length ?? selectedRestaurant.photoCount;
  const hiddenGalleryCount = Math.max(totalGalleryCount - gallery.length, 0);
  const galleryViewerItems = useMemo(
    () =>
      detailRestaurant
        ? buildGalleryViewerItems(detailRestaurant, detailRestaurant.gallery)
        : selectedRestaurant.coverImage
          ? [
              {
                src: getGalleryImageSrc(selectedRestaurant.coverImage, "full"),
                alt: `${selectedRestaurant.name} cover photo`,
                caption: `${selectedRestaurant.name} - Cover`,
              },
            ]
          : [],
    [detailRestaurant, selectedRestaurant.coverImage, selectedRestaurant.name],
  );
  const selectedRestaurantLead = detailRestaurant
    ? shortenText(
        detailRestaurant.whyItWins ||
          detailRestaurant.reviewsSummary ||
          detailRestaurant.reasonsToVisit[0],
        210,
      )
    : selectedRestaurant.listSummary;
  const guideScore = detailRestaurant?.guideScore ?? selectedRestaurant.guideScore;
  const socialScore = detailRestaurant?.socialScore ?? selectedRestaurant.socialScore;
  const guideReferences =
    detailRestaurant?.guideReferences ?? selectedRestaurant.guideReferences;
  const socialReferences =
    detailRestaurant?.socialReferences ?? selectedRestaurant.socialReferences;
  const mapsHref = buildMapsHref(selectedRestaurant, cityMeta.displayName);
  const mapsEmbedSrc = buildMapsEmbedSrc(selectedRestaurant, cityMeta.displayName);
  const bookingPlatform = detailRestaurant?.booking?.reservationPlatform
    ? formatReservationPlatform(detailRestaurant.booking.reservationPlatform)
    : selectedRestaurant.bookingPlatform
      ? formatReservationPlatform(selectedRestaurant.bookingPlatform)
    : null;
  const [viewerItems, setViewerItems] = useState<MediaViewerItem[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [loadedMapSlug, setLoadedMapSlug] = useState<string | null>(null);
  const isMapLoaded = loadedMapSlug === activeSelectedSlug;
  const activeViewerItem =
    viewerIndex === null ? null : viewerItems[viewerIndex] ?? null;

  const cuisineLeaders = useMemo(() => {
    const leaders = new Map<CuisineKey, RestaurantListItem>();

    for (const cuisine of cuisineOptions) {
      const matches = restaurants
        .filter((restaurant) => restaurant.cuisineKeys.includes(cuisine.key))
        .sort((left, right) => right.globalScore - left.globalScore);

      if (matches[0]) {
        leaders.set(cuisine.key, matches[0]);
      }
    }

    return leaders;
  }, [cuisineOptions, restaurants]);

  const openViewer = useCallback((items: MediaViewerItem[], startIndex = 0) => {
    if (!items[startIndex]) {
      return;
    }

    setViewerItems(items);
    setViewerIndex(startIndex);
  }, []);

  const closeViewer = useCallback(() => {
    setViewerIndex(null);
    setViewerItems([]);
  }, []);

  const moveViewer = useCallback((step: number) => {
    setViewerIndex((current) => {
      if (current === null || viewerItems.length === 0) {
        return current;
      }

      return (current + step + viewerItems.length) % viewerItems.length;
    });
  }, [viewerItems.length]);

  const selectRestaurant = useCallback((slug: string) => {
    closeViewer();
    shouldScrollSelectedRef.current = true;
    void fetchRestaurantDetail(slug);
    setSelectedSlug(slug);
  }, [closeViewer, fetchRestaurantDetail, setSelectedSlug]);

  const toggleShortlistRestaurant = useCallback((slug: string) => {
    setShortlistSlugs((current) => {
      if (current.includes(slug)) {
        return current.filter((currentSlug) => currentSlug !== slug);
      }

      return [...current, slug].slice(0, MAX_URL_SHORTLIST_SIZE);
    });
  }, []);

  const removeShortlistRestaurant = useCallback((slug: string) => {
    setShortlistSlugs((current) =>
      current.filter((currentSlug) => currentSlug !== slug),
    );
  }, []);

  const clearShortlist = useCallback(() => {
    setShortlistSlugs([]);
    setShortlistStatus("idle");
  }, []);

  const resetFilters = useCallback(() => {
    closeViewer();
    setViewMode(DEFAULT_VIEW_MODE);
    setSearch("");
    setOnly500Plus(false);
    setBookableOnly(false);
    setSelectedCuisine(defaultCuisine);
    setSelectedBands(allPriceBands);
    setSelectedSlug(urlStateOptions.defaultSlug);
  }, [
    allPriceBands,
    closeViewer,
    defaultCuisine,
    setBookableOnly,
    setOnly500Plus,
    setSearch,
    setSelectedBands,
    setSelectedCuisine,
    setSelectedSlug,
    setViewMode,
    urlStateOptions.defaultSlug,
  ]);

  const copyCurrentViewLink = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      await writeClipboardText(window.location.href);
      setShareStatus("copied");
    } catch {
      setShareStatus("failed");
    }

    if (shareStatusTimerRef.current !== null) {
      window.clearTimeout(shareStatusTimerRef.current);
    }

    shareStatusTimerRef.current = window.setTimeout(() => {
      setShareStatus("idle");
      shareStatusTimerRef.current = null;
    }, SHARE_STATUS_DURATION_MS);
  }, []);

  const copyShortlistPlan = useCallback(async () => {
    if (typeof window === "undefined" || shortlistRestaurants.length === 0) {
      return;
    }

    try {
      await writeClipboardText(
        buildShortlistPlanText(cityMeta.displayName, shortlistRestaurants),
      );
      setShortlistStatus("copied");
    } catch {
      setShortlistStatus("failed");
    }

    if (shortlistStatusTimerRef.current !== null) {
      window.clearTimeout(shortlistStatusTimerRef.current);
    }

    shortlistStatusTimerRef.current = window.setTimeout(() => {
      setShortlistStatus("idle");
      shortlistStatusTimerRef.current = null;
    }, SHARE_STATUS_DURATION_MS);
  }, [cityMeta.displayName, shortlistRestaurants]);

  useEffect(
    () => () => {
      if (shareStatusTimerRef.current !== null) {
        window.clearTimeout(shareStatusTimerRef.current);
      }

      if (shortlistStatusTimerRef.current !== null) {
        window.clearTimeout(shortlistStatusTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const container = rankingListRef.current;

    if (!container || !shouldScrollSelectedRef.current) {
      return;
    }

    shouldScrollSelectedRef.current = false;

    const card = container.querySelector<HTMLElement>(
      `[data-restaurant-slug="${selectedRestaurant.slug}"]`,
    );

    card?.scrollIntoView({
      block: "nearest",
      behavior: "auto",
    });
  }, [selectedRestaurant.slug]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (viewerIndex !== null) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      const selectedIndex = filteredRestaurants.findIndex(
        (restaurant) => restaurant.slug === selectedRestaurant.slug,
      );

      if (selectedIndex === -1) {
        return;
      }

      if (
        event.key === "ArrowDown" &&
        selectedIndex < filteredRestaurants.length - 1
      ) {
        event.preventDefault();
        selectRestaurant(filteredRestaurants[selectedIndex + 1].slug);
      }

      if (event.key === "ArrowUp" && selectedIndex > 0) {
        event.preventDefault();
        selectRestaurant(filteredRestaurants[selectedIndex - 1].slug);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredRestaurants, selectRestaurant, selectedRestaurant.slug, viewerIndex]);

  useEffect(() => {
    if (viewerIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleViewerKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeViewer();
      }

      if (event.key === "ArrowRight" && viewerItems.length > 1) {
        moveViewer(1);
      }

      if (event.key === "ArrowLeft" && viewerItems.length > 1) {
        moveViewer(-1);
      }
    };

    window.addEventListener("keydown", handleViewerKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleViewerKeyDown);
    };
  }, [closeViewer, moveViewer, viewerIndex, viewerItems.length]);

  const rankingListContent = useMemo(
    () =>
      filteredRestaurants.map((restaurant, index) => {
        const modeBadge = buildModeBadge(restaurant, viewMode);
        const cardSignals = buildCardSignals(restaurant, viewMode);
        const signatureDishes = buildSignatureDishes(restaurant);
        const isActive = restaurant.slug === selectedRestaurant.slug;
        const isShortlisted = shortlistSlugs.includes(restaurant.slug);
        const rankingItemClassName = [
          "ranking-item",
          isActive ? "is-active" : "",
          isShortlisted ? "is-shortlisted" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <li key={restaurant.slug} className="ranking-list__row">
            <button
              aria-current={isActive ? "true" : undefined}
              className={rankingItemClassName}
              data-restaurant-slug={restaurant.slug}
              onFocus={() => {
                void fetchRestaurantDetail(restaurant.slug);
              }}
              onClick={() => selectRestaurant(restaurant.slug)}
              onMouseEnter={() => {
                void fetchRestaurantDetail(restaurant.slug);
              }}
              type="button"
            >
              <div className="ranking-item__rail">
                <div className="ranking-item__rankBox">
                  <span className="ranking-item__rankLabel">Rank</span>
                  <div className="ranking-item__rank">{formatRank(index)}</div>
                </div>
                <span className="ranking-item__modeBadge">
                  {modeBadge.label} {modeBadge.value}
                </span>
              </div>

              <div className="ranking-item__body">
                <div className="ranking-item__eyebrow">
                  <span>{restaurant.district}</span>
                  <span>{restaurant.cuisineLabel}</span>
                </div>

                <div className="ranking-item__headline">
                  <strong>{restaurant.name}</strong>
                </div>

                {isShortlisted ? (
                  <span className="ranking-item__shortlistFlag">
                    In your shortlist
                  </span>
                ) : null}

                <p className="ranking-item__summary">{buildListDeck(restaurant)}</p>

                {signatureDishes.length > 0 ? (
                  <div className="ranking-item__signatureBlock">
                    <span className="ranking-item__signatureLabel">Signature dishes</span>
                    <div className="ranking-item__signatureList">
                      {signatureDishes.map((dish) => (
                        <span
                          key={dish.id}
                          className="ranking-item__signaturePill"
                          title={dish.name}
                        >
                          <span
                            aria-hidden="true"
                            className="ranking-item__signatureDot"
                          />
                          {dish.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="ranking-item__signalRail">
                  {cardSignals.map((signal) => (
                    <span
                      key={signal.label}
                      className={`card-signal card-signal--${signal.tone}`}
                    >
                      {signal.label}
                    </span>
                  ))}
                </div>

                <div className="ranking-item__editorialLine">
                  <span>Best time to book</span>
                  <strong>{shortenWindow(restaurant.bestWindow)}</strong>
                </div>

                <div className="ranking-item__metrics">
                  <div className="ranking-item__metric">
                    <span>Google</span>
                    <strong>{restaurant.rating ?? "No rating"}</strong>
                  </div>
                  <div className="ranking-item__metric">
                    <span>Reviews</span>
                    <strong>{formatReviewCount(restaurant.numRatings, cityMeta.locale)}</strong>
                  </div>
                </div>

                <div className="ranking-item__footer">
                  <div
                    className={`ranking-price ranking-price--${restaurant.priceBand}`}
                    title={`Spend level: ${formatPriceBandCompact(restaurant.priceBand)}`}
                  >
                    <span className="ranking-price__icon" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    <span className="ranking-price__label">Spend</span>
                    <strong>{formatPriceBandCompact(restaurant.priceBand)}</strong>
                  </div>

                  <div className="ranking-item__awards">
                    {restaurant.awardHighlights.map((award) => (
                      <span key={award} className="ranking-item__award" title={award}>
                        {formatAwardLabel(award)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ranking-item__imageWrap">
                {restaurant.coverImage ? (
                  <Image
                    alt={`${restaurant.name} cover photo`}
                    className="ranking-item__image"
                    height={restaurant.coverImage.height}
                    loading={index < 2 ? "eager" : "lazy"}
                    preload={index === 0}
                    sizes="(max-width: 720px) calc(100vw - 56px), (max-width: 1200px) 44vw, 560px"
                    src={getGalleryImageSrc(restaurant.coverImage, "card")}
                    width={restaurant.coverImage.width}
                  />
                ) : (
                  <div className="ranking-item__image ranking-item__image--empty" />
                )}
                <div className="ranking-item__imageMeta">
                  <strong>{restaurant.photoCount} photos</strong>
                </div>
              </div>
            </button>
          </li>
        );
      }),
    [
      cityMeta.locale,
      fetchRestaurantDetail,
      filteredRestaurants,
      selectRestaurant,
      selectedRestaurant.slug,
      shortlistSlugs,
      viewMode,
    ],
  );

  const galleryGridContent = useMemo(
    () =>
      galleryLayout.map(({ image, variant, sizes }, index) => (
        <figure key={image.id} className={`gallery-card gallery-card--${variant}`}>
          <button
            aria-label={`Open photo ${index + 1} in full size`}
            className="gallery-card__button"
            onClick={() => openViewer(galleryViewerItems, index)}
            type="button"
          >
            <Image
              alt={`${selectedRestaurant.name} ${index + 1}`}
              className="gallery-card__image"
              height={image.height}
              loading={index < 4 ? "eager" : "lazy"}
              sizes={sizes}
              src={getGalleryImageSrc(image, "preview")}
              width={image.width}
            />
            {hiddenGalleryCount > 0 && index === galleryLayout.length - 1 ? (
              <span className="gallery-card__more">+{hiddenGalleryCount} more</span>
            ) : null}
          </button>
        </figure>
      )),
    [galleryLayout, galleryViewerItems, hiddenGalleryCount, openViewer, selectedRestaurant.name],
  );

  const menuGridContent = useMemo(
    () => {
      if (!detailRestaurant) {
        return [];
      }

      return detailRestaurant.menuItems.map((item) => (
        <div key={item.id} className="menu-item">
          {item.image ? (
            <button
              aria-label={`Open ${item.name} photo in full size`}
              className="menu-item__thumb"
              onClick={() => {
                const viewerItem = buildMenuViewerItem(detailRestaurant, item);

                if (viewerItem) {
                  openViewer([viewerItem], 0);
                }
              }}
              type="button"
            >
              <span className="menu-item__thumbStage">
                <Image
                  alt={`${selectedRestaurant.name} ${item.name}`}
                  className="menu-item__thumbImage"
                  height={720}
                  loading="lazy"
                  sizes="(max-width: 720px) 92vw, 22vw"
                  src={getMenuImageSrc(item.image, "preview")}
                  width={900}
                />
              </span>
            </button>
          ) : null}
          <span>{item.name}</span>
          {item.captionURL ? (
            <a href={item.captionURL} rel="noreferrer" target="_blank">
              menu
            </a>
          ) : null}
        </div>
      ));
    },
    [detailRestaurant, openViewer, selectedRestaurant.name],
  );

  const tastingMenuCardsContent = useMemo(
    () => {
      if (!detailRestaurant || detailRestaurant.tastingMenus.length === 0) {
        return [];
      }

      return detailRestaurant.tastingMenus.map((tastingMenu) => {
        const viewerItems = buildTastingMenuViewerItems(detailRestaurant, tastingMenu);
        let nextViewerIndex = 0;

        return (
          <article key={tastingMenu.id} className="tasting-menu-card">
            <div className="tasting-menu-card__head">
              <div className="tasting-menu-card__copy">
                <span className="tasting-menu-card__eyebrow">
                  {tastingMenu.formatLabel}
                </span>
                <h4>{tastingMenu.name}</h4>
                <p>{tastingMenu.summary}</p>
              </div>
              <div className="tasting-menu-card__meta">
                <span className="booking-chip is-accent">{tastingMenu.seasonLabel}</span>
                {tastingMenu.price ? (
                  <span className="booking-chip">{tastingMenu.price}</span>
                ) : null}
                <span
                  className={`booking-chip tasting-menu-card__confidence tasting-menu-card__confidence--${tastingMenu.confidence}`}
                >
                  {formatTastingMenuConfidence(tastingMenu.confidence)}
                </span>
              </div>
            </div>

            <div className="tasting-menu-card__dishes">
              {tastingMenu.dishes.map((dish) => {
                const dishViewerOffset = nextViewerIndex;
                nextViewerIndex += dish.photos.length;

                return (
                  <article key={dish.id} className="tasting-dish">
                    {dish.photos.length > 0 ? (
                      <div className="tasting-dish__photos">
                        {dish.photos.map((photo, photoIndex) => (
                          <button
                            key={photo.id}
                            aria-label={`Open ${dish.name} photo ${photoIndex + 1}`}
                            className="tasting-dish__photo"
                            onClick={() =>
                              openViewer(viewerItems, dishViewerOffset + photoIndex)
                            }
                            type="button"
                          >
                            <span className="tasting-dish__photoStage">
                              <Image
                                alt={`${selectedRestaurant.name} ${dish.name}`}
                                className="tasting-dish__photoImage"
                                height={900}
                                loading="lazy"
                                sizes="(max-width: 720px) 92vw, (max-width: 1180px) 40vw, 18vw"
                                src={getTastingPhotoSrc(photo.image, "preview")}
                                width={900}
                              />
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="tasting-dish__empty">Source menu only</div>
                    )}

                    <div className="tasting-dish__copy">
                      {dish.courseLabel ? (
                        <span className="tasting-dish__course">{dish.courseLabel}</span>
                      ) : null}
                      <strong>{dish.name}</strong>
                      {dish.description ? <p>{dish.description}</p> : null}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="tasting-menu-card__footer">
              <a
                className="source-link"
                href={tastingMenu.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                {tastingMenu.sourceLabel}
              </a>
            </div>
          </article>
        );
      });
    },
    [detailRestaurant, openViewer, selectedRestaurant.name],
  );

  const reviewCardsContent = useMemo(
    () => {
      if (!detailRestaurant) {
        return [];
      }

      return detailRestaurant.reviews.map((review) => (
        <div
          key={`${review.reviewerName}-${review.time}`}
          className="review-card"
        >
          <div className="review-card__meta">
            <strong>{review.reviewerName}</strong>
            <span>
              {review.rating}/5 -{" "}
              {new Date(review.time).toLocaleDateString(cityMeta.locale, {
                timeZone: cityMeta.timeZone,
              })}
            </span>
          </div>
          <p>{shortenText(review.reviewText)}</p>
        </div>
      ));
    },
    [cityMeta.locale, cityMeta.timeZone, detailRestaurant],
  );
  const topbarPreviewRestaurants = useMemo(
    () =>
      sortRestaurants(restaurants, "global")
        .filter((restaurant) => restaurant.coverImage)
        .slice(0, 3),
    [restaurants],
  );

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="topbar__title">
          <p className="eyebrow">Top 20 restaurants</p>
          <h1>{cityMeta.displayName}</h1>
          <p className="subtle">
            {cityMeta.restaurantCount} restaurants in one editorial shortlist shaped
            by public demand, menu depth, photo evidence, and booking friction.
          </p>
        </div>
        <div className="topbar__meta">
          <div>
            <span className="label">City</span>
            <strong>{cityMeta.displayName}</strong>
          </div>
          <div>
            <span className="label">Updated</span>
            <strong>
              {new Date(cityMeta.generatedAt).toLocaleDateString(cityMeta.locale, {
                timeZone: cityMeta.timeZone,
              })}
            </strong>
          </div>
          <div>
            <span className="label">Lens</span>
            <strong>Global / Trending / Socials / Guides / Google / Cuisine</strong>
          </div>
          {topbarPreviewRestaurants.length > 0 ? (
            <figure
              aria-label="Featured restaurant covers"
              className="topbar__preview"
            >
              {topbarPreviewRestaurants.map((restaurant, index) =>
                restaurant.coverImage ? (
                  <button
                    key={restaurant.slug}
                    aria-label={`Open ${restaurant.name}`}
                    className="topbar__previewItem"
                    onClick={() => selectRestaurant(restaurant.slug)}
                    type="button"
                  >
                    <Image
                      alt={`${restaurant.name} restaurant preview`}
                      className="topbar__previewImage"
                      height={240}
                      loading={index === 0 ? "eager" : "lazy"}
                      preload={index === 0}
                      sizes="(max-width: 720px) 30vw, 160px"
                      src={getGalleryImageSrc(restaurant.coverImage, "card")}
                      width={360}
                    />
                    <span>{restaurant.name}</span>
                  </button>
                ) : null,
              )}
            </figure>
          ) : null}
        </div>
      </header>

      <section className="toolbar">
        <div className="toolbar__row">
          <div className="segmented" aria-label="Ranking lens" role="group">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode}
                aria-pressed={mode === viewMode}
                className={
                  mode === viewMode
                    ? "segmented__button is-active"
                    : "segmented__button"
                }
                onClick={() => setViewMode(mode)}
                type="button"
              >
                {VIEW_LABELS[mode]}
              </button>
            ))}
          </div>
          <label className="sr-only" htmlFor="restaurant-search">
            Search restaurants
          </label>
          <input
            id="restaurant-search"
            className="search"
            placeholder="Search by name, district, or cuisine"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="toolbar__row toolbar__row--wrap">
          <label className="toggle">
            <input
              checked={only500Plus}
              onChange={(event) => setOnly500Plus(event.target.checked)}
              type="checkbox"
            />
            <span>500+ reviews only</span>
          </label>
          <label className="toggle">
            <input
              checked={bookableOnly}
              onChange={(event) => setBookableOnly(event.target.checked)}
              type="checkbox"
            />
            <span>Bookable or contactable only</span>
          </label>
          <div className="chip-row">
            {priceBandOptions.map((option) => {
              const active = selectedBands.includes(option.key);

              return (
                <button
                  key={option.key}
                  aria-pressed={active}
                  className={active ? "chip is-active" : "chip"}
                  onClick={() =>
                    setSelectedBands((current) =>
                      current.includes(option.key)
                        ? current.length === 1
                          ? current
                          : current.filter((value) => value !== option.key)
                        : [...current, option.key],
                    )
                  }
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {viewMode === "cuisine" ? (
          <div className="toolbar__row toolbar__row--wrap">
            <div className="chip-row">
              {cuisineOptions.map((option) => {
                const leader = cuisineLeaders.get(option.key);

                return (
                  <button
                    key={option.key}
                    aria-pressed={activeCuisine === option.key}
                    className={
                      activeCuisine === option.key ? "chip is-active" : "chip"
                    }
                    onClick={() => setSelectedCuisine(option.key)}
                    type="button"
                  >
                    {option.label}
                    {leader ? (
                      <span className="chip__hint">#{leader.name}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="toolbar__row toolbar__row--actions">
          <button
            className="action action--compact"
            disabled={!hasActiveFilters && activeSelectedSlug === urlStateOptions.defaultSlug}
            onClick={resetFilters}
            type="button"
          >
            Reset filters
          </button>
          <button
            className="action action--primary action--compact"
            onClick={() => {
              void copyCurrentViewLink();
            }}
            type="button"
          >
            {shareStatus === "copied"
              ? "Link copied"
              : shareStatus === "failed"
                ? "Copy failed"
                : "Copy view link"}
          </button>
        </div>
      </section>

      {shortlistRestaurants.length > 0 ? (
        <section className="shortlist-panel" aria-label="Trip shortlist">
          <div className="shortlist-panel__head">
            <div>
              <p className="section-kicker">Trip shortlist</p>
              <h2>{shortlistRestaurants.length} saved tables</h2>
              <p>
                Compare the rooms that made the cut before opening booking links
                or sharing the plan.
              </p>
            </div>
            <div className="shortlist-panel__stats">
              <div>
                <span>Areas</span>
                <strong>{shortlistDistricts}</strong>
              </div>
              <div>
                <span>Bookable</span>
                <strong>
                  {shortlistBookableCount}/{shortlistRestaurants.length}
                </strong>
              </div>
            </div>
            <div className="shortlist-panel__actions">
              <button
                className="action action--primary action--compact"
                onClick={() => {
                  void copyShortlistPlan();
                }}
                type="button"
              >
                {shortlistStatus === "copied"
                  ? "Plan copied"
                  : shortlistStatus === "failed"
                    ? "Copy failed"
                    : "Copy plan"}
              </button>
              <button
                className="action action--compact"
                onClick={clearShortlist}
                type="button"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="shortlist-rail" aria-label="Saved restaurants">
            {shortlistRestaurants.map((restaurant, index) => (
              <article
                key={restaurant.slug}
                className={
                  restaurant.slug === selectedRestaurant.slug
                    ? "shortlist-card is-active"
                    : "shortlist-card"
                }
              >
                <button
                  className="shortlist-card__select"
                  onClick={() => selectRestaurant(restaurant.slug)}
                  type="button"
                >
                  <span>{formatRank(index)}</span>
                  <strong>{restaurant.name}</strong>
                  <small>
                    {restaurant.district} / {formatPriceBandCompact(restaurant.priceBand)}
                  </small>
                </button>
                <button
                  aria-label={`Remove ${restaurant.name} from shortlist`}
                  className="shortlist-card__remove"
                  onClick={() => removeShortlistRestaurant(restaurant.slug)}
                  type="button"
                >
                  Remove
                </button>
              </article>
            ))}
          </div>

          <div className="shortlist-compare" role="table">
            <div className="shortlist-compare__row shortlist-compare__row--head" role="row">
              <span role="columnheader">Restaurant</span>
              <span role="columnheader">Why it fits</span>
              <span role="columnheader">Booking</span>
              <span role="columnheader">Crowd signal</span>
              <span role="columnheader">Action</span>
            </div>
            {shortlistRestaurants.map((restaurant) => (
              <div
                key={restaurant.slug}
                className="shortlist-compare__row"
                role="row"
              >
                <div role="cell">
                  <strong>{restaurant.name}</strong>
                  <span>
                    {restaurant.district} / {restaurant.cuisineLabel}
                  </span>
                </div>
                <div role="cell">
                  <span>{shortenText(restaurant.listSummary, 92)}</span>
                  <small>{restaurant.awardHighlights.join(" / ") || "Local signal"}</small>
                </div>
                <div role="cell">
                  <strong>{formatBookingPressure(restaurant.bookingPressure)}</strong>
                  <span>{shortenWindow(restaurant.bestWindow)}</span>
                </div>
                <div role="cell">
                  <strong>{restaurant.rating ?? "No rating"}</strong>
                  <span>{formatReviewCount(restaurant.numRatings, cityMeta.locale)} reviews</span>
                </div>
                <div className="shortlist-compare__actions" role="cell">
                  <button
                    className="action action--compact"
                    onClick={() => selectRestaurant(restaurant.slug)}
                    type="button"
                  >
                    Inspect
                  </button>
                  <a
                    className="action action--compact"
                    href={buildMapsHref(restaurant, cityMeta.displayName)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Map
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <main className="content-grid">
        <section className="ranking">
          <div className="section-head section-head--ranking">
            <div>
              <p className="section-kicker">
                {cityMeta.displayName} / {cityMeta.editionLabel}
              </p>
              <h2>{VIEW_LABELS[viewMode]}</h2>
              <p>{VIEW_DECKS[viewMode]}</p>
            </div>
            <div className="section-head__meta">
              <div
                className="section-count"
                aria-label={`${filteredRestaurants.length} places`}
              >
                <strong>{String(filteredRestaurants.length).padStart(2, "0")}</strong>
                <span>places</span>
              </div>
              <p className="section-shortcut">Use up and down arrows to move through the list</p>
            </div>
          </div>

          <ol ref={rankingListRef} className="ranking-list">
            {hasResults ? (
              rankingListContent
            ) : (
              <li className="ranking-list__empty">
                <strong>No restaurants match this view</strong>
                <p>
                  Loosen the search, add a price band, or reset the active filters.
                </p>
                <button
                  className="action action--primary"
                  onClick={resetFilters}
                  type="button"
                >
                  Reset filters
                </button>
              </li>
            )}
          </ol>
        </section>

        {hasResults ? (
        <section className="details">
          <div className="section-head section-head--details details-head">
            <div className="details-head__copy">
              <p className="section-kicker">
                {selectedRestaurant.district} / {selectedRestaurant.cuisineLabel}
              </p>
              <h2>{selectedRestaurant.name}</h2>
              <p>{selectedRestaurant.address}</p>
              <p className="details-head__lede">{selectedRestaurantLead}</p>
            </div>
            {gallery[0] ? (
              <button
                aria-label={`Open ${selectedRestaurant.name} cover photo in full size`}
                className="details-head__hero"
                onClick={() => openViewer(galleryViewerItems, 0)}
                type="button"
              >
                <Image
                  alt={`${selectedRestaurant.name} hero photo`}
                  className="details-head__heroImage"
                  height={gallery[0].height}
                  loading="eager"
                  preload
                  sizes="(max-width: 1180px) calc(100vw - 40px), 42vw"
                  src={getGalleryImageSrc(gallery[0], "hero")}
                  width={gallery[0].width}
                />
                <span className="details-head__heroLabel">Editorial cover</span>
                <span className="details-head__heroMeta">
                  {totalGalleryCount} photo{totalGalleryCount === 1 ? "" : "s"}
                </span>
                {isDetailPending ? (
                  <span className="details-head__status">Loading full gallery</span>
                ) : null}
              </button>
            ) : null}
            <div className="details-head__aside">
              <div className="badge-row">
                {(detailRestaurant?.awards ?? selectedRestaurant.awardHighlights).map((award) => (
                  <span key={award} className="badge">
                    {award}
                  </span>
                ))}
              </div>
              <div className="booking-chipRow">
                {bookingPlatform ? (
                  <span className="booking-chip is-accent">{bookingPlatform}</span>
                ) : null}
                <span className="booking-chip">
                  {formatBookingPressure(selectedRestaurant.bookingPressure)}
                </span>
                <span className="booking-chip">
                  {formatPriceBand(selectedRestaurant.priceBand)}
                </span>
              </div>
              <div className="action-row action-row--compact">
                <button
                  className="action action--primary"
                  disabled={galleryViewerItems.length === 0}
                  onClick={() => openViewer(galleryViewerItems, 0)}
                  type="button"
                >
                  Open gallery
                </button>
                <a
                  className="action"
                  href={mapsHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open map
                </a>
                <button
                  className={
                    selectedRestaurantIsShortlisted
                      ? "action action--selected"
                      : "action"
                  }
                  onClick={() => toggleShortlistRestaurant(selectedRestaurant.slug)}
                  type="button"
                >
                  {selectedRestaurantIsShortlisted
                    ? "Saved to shortlist"
                    : "Add to shortlist"}
                </button>
              </div>
            </div>
          </div>

          <div className="gallery-meta">
            <span className="gallery-meta__count">
              {totalGalleryCount} photo{totalGalleryCount === 1 ? "" : "s"}
            </span>
            <button
              className="gallery-meta__action"
              onClick={() => openViewer(galleryViewerItems, 0)}
              type="button"
            >
              Open full gallery
            </button>
          </div>

          <div className="gallery-grid">{galleryGridContent}</div>

          <section className="location-showcase">
            <div className="location-showcase__map">
              {isMapLoaded ? (
                <iframe
                  className="location-showcase__frame"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapsEmbedSrc}
                  title={`Map for ${selectedRestaurant.name}`}
                />
              ) : (
                <div className="location-showcase__placeholder">
                  <span
                    aria-hidden="true"
                    className="location-showcase__placeholderPin"
                  />
                  <div className="location-showcase__placeholderCopy">
                    <strong>Live map paused for faster scrolling</strong>
                    <p>{selectedRestaurant.address}</p>
                  </div>
                  <button
                    className="action action--primary"
                    onClick={() => setLoadedMapSlug(activeSelectedSlug)}
                    type="button"
                  >
                    Load live map
                  </button>
                </div>
              )}
            </div>
            <div className="location-showcase__card">
              <p className="section-kicker">Location</p>
              <h3>{selectedRestaurant.district}</h3>
              <p>{selectedRestaurant.address}</p>
              <div className="booking-chipRow">
                {selectedRestaurant.neighborhoods.map((area) => (
                  <span key={area} className="booking-chip">
                    {area}
                  </span>
                ))}
              </div>
              <div className="action-row">
                <a
                  className="action action--primary"
                  href={mapsHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  Get directions
                </a>
                {detailRestaurant?.website ? (
                  <a
                    className="action"
                    href={detailRestaurant.website}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Website
                  </a>
                ) : null}
              </div>
            </div>
          </section>

          {detailRestaurant ? (
            <RestaurantBookingWorkbench
              key={activeSelectedSlug}
              locale={cityMeta.locale}
              restaurant={detailRestaurant}
              timeZone={cityMeta.timeZone}
            />
          ) : (
            <section className="booking-workbench booking-workbench--loading">
              <div className="booking-workbench__loading">
                <strong>
                  {hasDetailError
                    ? "Availability model unavailable"
                    : "Loading availability model"}
                </strong>
                <p>
                  {hasDetailError
                    ? "The live booking model could not load on this request."
                    : `Preparing the 10-day availability view for ${selectedRestaurant.name}.`}
                </p>
                {hasDetailError ? (
                  <button
                    className="action action--primary"
                    onClick={() => {
                      void fetchRestaurantDetail(activeSelectedSlug);
                    }}
                    type="button"
                  >
                    Retry detail load
                  </button>
                ) : null}
              </div>
            </section>
          )}

          <div className="quick-grid">
            <div className="quick-stat">
              <span className="label">Google Maps</span>
              <strong>
                {selectedRestaurant.rating ?? "No rating"} /{" "}
                {formatReviewCount(selectedRestaurant.numRatings, cityMeta.locale)}
              </strong>
            </div>
            <div className="quick-stat">
              <span className="label">Estimated spend</span>
              <strong>
                {formatPriceBand(selectedRestaurant.priceBand)}
                {detailRestaurant ? (
                  <>
                    {", "}
                    {formatMoney(
                      detailRestaurant.estimatedCheck.low,
                      cityMeta.locale,
                      cityMeta.currencyCode,
                    )}
                    -
                    {formatMoney(
                      detailRestaurant.estimatedCheck.high,
                      cityMeta.locale,
                      cityMeta.currencyCode,
                    )}
                  </>
                ) : (
                  ", check range loading"
                )}
              </strong>
            </div>
            <div className="quick-stat">
              <span className="label">When to book</span>
              <strong>{formatBookingPressure(selectedRestaurant.bookingPressure)}</strong>
            </div>
            <div className="quick-stat">
              <span className="label">Best time to book</span>
              <strong>{selectedRestaurant.bestWindow}</strong>
            </div>
          </div>

          <div className="story-grid story-grid--signals">
            <article className="story-panel story-panel--signal">
              <h3>Guide consensus</h3>
              <div className="signal-score">
                <strong>{guideScore}</strong>
                <span>guide score</span>
              </div>
              <p>
                Weighted toward Michelin, 50 Best, and current city guides from
                writers with strong local restaurant context.
              </p>
              {guideReferences.length > 0 ? (
                <div className="source-stack">
                  {guideReferences.slice(0, 3).map((reference) => (
                    <a
                      key={`${reference.sourceLabel}-${reference.label}`}
                      className="source-link source-link--stack"
                      href={reference.sourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="source-link__eyebrow">{reference.sourceLabel}</span>
                      <strong>{reference.label}</strong>
                      <span className="source-link__meta">{reference.note}</span>
                      <span className="source-link__stamp">{reference.currentness}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="story-panel__loading">
                  Guide references appear here when current editorial signals are available.
                </p>
              )}
            </article>

            <article className="story-panel story-panel--signal">
              <h3>Trending in socials</h3>
              <div className="signal-score">
                <strong>{socialScore}</strong>
                <span>social buzz</span>
              </div>
              <p>
                Weighted toward current hit lists, venue buzz, and restaurant
                coverage that tends to spill into social planning and group chat
                recommendations.
              </p>
              {socialReferences.length > 0 ? (
                <div className="source-stack">
                  {socialReferences.slice(0, 3).map((reference) => (
                    <a
                      key={`${reference.sourceLabel}-${reference.label}`}
                      className="source-link source-link--stack"
                      href={reference.sourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="source-link__eyebrow">{reference.sourceLabel}</span>
                      <strong>{reference.label}</strong>
                      <span className="source-link__meta">{reference.note}</span>
                      <span className="source-link__stamp">{reference.currentness}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="story-panel__loading">
                  Social-buzz references appear here when current editorial signals
                  are available.
                </p>
              )}
            </article>
          </div>

          <div className="story-grid">
            <article className="story-panel">
              <h3>Why it ranks</h3>
              <p>{detailRestaurant?.whyItWins ?? selectedRestaurant.listSummary}</p>
              {detailRestaurant ? (
                <p>{detailRestaurant.reviewsSummary}</p>
              ) : (
                <p className="story-panel__loading">
                  {isDetailPending
                    ? "Loading reviews, menu, and booking detail on demand."
                    : "Detail snapshot is still warming up."}
                </p>
              )}
            </article>

            <article className="story-panel">
              <h3>Reviews & signals</h3>
              {detailRestaurant ? (
                <div className="review-stack">{reviewCardsContent}</div>
              ) : (
                <p className="story-panel__loading">
                  Review excerpts appear as soon as the restaurant detail finishes loading.
                </p>
              )}
            </article>
          </div>

          <div className="story-grid">
            <article className="story-panel">
              <h3>Menus and signatures</h3>
              {detailRestaurant ? (
                <>
                  {detailRestaurant.tastingMenus.length > 0 ? (
                    <section className="tasting-archive">
                      <div className="tasting-archive__head">
                        <p className="tasting-archive__eyebrow">Tasting menu archive</p>
                        <p className="tasting-archive__deck">
                          Current and seasonal tasting menu variants gathered into one
                          view, with course photography whenever a reliable source image
                          exists.
                        </p>
                      </div>
                      <div className="tasting-menu-stack">{tastingMenuCardsContent}</div>
                    </section>
                  ) : null}
                  <div className="menu-grid">{menuGridContent}</div>
                  <ul className="plain-list">
                    {detailRestaurant.reasonsToVisit.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <ul className="plain-list">
                    {selectedRestaurant.signatureDishes.map((dish) => (
                      <li key={dish.id}>{dish.name}</li>
                    ))}
                  </ul>
                  <p className="story-panel__loading">
                    Full menu cards and dish photography load only for the active restaurant.
                  </p>
                </>
              )}
            </article>

            <article className="story-panel">
              <h3>Hours and links</h3>
              {detailRestaurant ? (
                <>
                  <div className="hours-grid">
                    {detailRestaurant.openingHours.map((day) => (
                      <div key={day.day} className="hours-row">
                        <span>{day.day}</span>
                        <strong>{formatOpeningDay(day)}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="source-row">
                    <a
                      className="source-link"
                      href={detailRestaurant.sourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Wanderlog snapshot
                    </a>
                    {detailRestaurant.website ? (
                      <a
                        className="source-link"
                        href={detailRestaurant.website}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Website
                      </a>
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="story-panel__loading">
                  Hours, source links, and reservation hooks load only when this
                  restaurant is in focus.
                </p>
              )}
            </article>
          </div>
        </section>
        ) : (
          <section className="details details--empty">
            <div className="empty-detail">
              <p className="section-kicker">{cityMeta.displayName}</p>
              <h2>No matching shortlist</h2>
              <p>
                The current filter stack hides all {cityMeta.restaurantCount} restaurants.
                Reset to the full editorial ranking or keep narrowing from a lighter base.
              </p>
              <button
                className="action action--primary"
                onClick={resetFilters}
                type="button"
              >
                Show all restaurants
              </button>
            </div>
          </section>
        )}
      </main>

      {activeViewerItem && viewerIndex !== null ? (
        <RestaurantMediaLightbox
          activeItem={activeViewerItem}
          items={viewerItems}
          onClose={closeViewer}
          onMove={moveViewer}
          onSelect={setViewerIndex}
          viewerIndex={viewerIndex}
        />
      ) : null}
    </div>
  );
}




