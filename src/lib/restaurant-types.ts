export type RestaurantGalleryImage = {
  id: string;
  key: string;
  url: string;
  mediumUrl: string;
  smallUrl: string;
  width: number;
  height: number;
};

export type RestaurantImageAsset = {
  key: string;
  url: string;
  mediumUrl: string;
  smallUrl: string;
};

export type RestaurantMenuItem = {
  id: string;
  name: string;
  captionURL: string | null;
  image: RestaurantImageAsset | null;
};

export type TastingMenuDishPhoto = {
  id: string;
  sourceUrl: string | null;
  image: RestaurantImageAsset;
};

export type TastingMenuDish = {
  id: string;
  courseLabel: string | null;
  name: string;
  description: string | null;
  photos: TastingMenuDishPhoto[];
};

export type TastingMenuVariationConfidence =
  | "official-current"
  | "official-archive"
  | "platform-current"
  | "reported-archive";

export type TastingMenuVariation = {
  id: string;
  formatLabel: string;
  name: string;
  seasonLabel: string;
  summary: string;
  price: string | null;
  sourceLabel: string;
  sourceUrl: string;
  confidence: TastingMenuVariationConfidence;
  dishes: TastingMenuDish[];
};

export type RestaurantReview = {
  reviewerName: string;
  rating: number;
  time: string;
  reviewText: string;
};

export type RestaurantOpeningDay = {
  day: string;
  intervals: Array<{
    open: string;
    close: string;
    overnight: boolean;
  }>;
  closed: boolean;
};

export type RestaurantBookingInfo = {
  type: string;
  reservationPlatform: string | null;
  idOnPlatform: string | null;
  daysInAdvance: {
    highAvailability: number | null;
    lowAvailability: number | null;
  } | null;
} | null;

export type RawRestaurant = {
  slug: string;
  sourceUrl: string;
  fetchedAt: string;
  placeId: string | null;
  name: string;
  description: string;
  generatedDescription: string;
  categories: string[];
  address: string;
  website: string | null;
  phone: string | null;
  rating: number | null;
  numRatings: number | null;
  tripadvisorRating: number | null;
  tripadvisorNumRatings: number | null;
  priceLevel: number | null;
  reviewsSummary: string;
  reasonsToVisit: string[];
  tips: string[];
  reviews: RestaurantReview[];
  gallery: RestaurantGalleryImage[];
  menuItems: RestaurantMenuItem[];
  booking: RestaurantBookingInfo;
  openingHours: RestaurantOpeningDay[];
  typicalVisitMinutes: {
    min: number | null;
    max: number | null;
  };
};

export type RestaurantAward = string;

export type PriceBand = "budget" | "mid" | "high" | "destination";

export type CuisineKey = string;

export type RestaurantDiscoverySignalReference = {
  label: string;
  sourceLabel: string;
  sourceUrl: string;
  note: string;
  currentness: string;
};

export type RestaurantDiscoverySignals = {
  guideScore: number;
  socialScore: number;
  guideReferences: RestaurantDiscoverySignalReference[];
  socialReferences: RestaurantDiscoverySignalReference[];
};

export type RestaurantOverride = {
  district: string;
  neighborhoods: string[];
  cuisineKeys: CuisineKey[];
  cuisineLabel: string;
  globalScore: number;
  trendingScore: number;
  awards: RestaurantAward[];
  priceBand: PriceBand;
  estimatedCheck: {
    low: number;
    high: number;
  };
  bookingMode: "website" | "reservation" | "call" | "walk-in" | "dm";
  bookingUrl?: string;
  bookingNote: string;
  timingNote: string;
  bestWindow: string;
  whyItWins: string;
  sourceNotes: string[];
};

export type Restaurant = Pick<
  RawRestaurant,
  | "slug"
  | "sourceUrl"
  | "name"
  | "address"
  | "website"
  | "phone"
  | "rating"
  | "numRatings"
  | "reviewsSummary"
  | "reasonsToVisit"
  | "reviews"
  | "gallery"
  | "menuItems"
  | "booking"
  | "openingHours"
> & {
  district: string;
  neighborhoods: string[];
  cuisineKeys: CuisineKey[];
  cuisineLabel: string;
  globalScore: number;
  trendingScore: number;
  guideScore: number;
  socialScore: number;
  awards: RestaurantAward[];
  priceBand: PriceBand;
  estimatedCheck: {
    low: number;
    high: number;
  };
  bookingMode: "website" | "reservation" | "call" | "walk-in" | "dm";
  bookingUrl?: string;
  bookingNote: string;
  timingNote: string;
  bestWindow: string;
  whyItWins: string;
  googleCompositeScore: number;
  reviewCountBucket: "0-199" | "200-499" | "500-999" | "1000-2999" | "3000+";
  bookingPressure: "walk-in" | "few-days" | "one-week" | "two-weeks-plus";
  guideReferences: RestaurantDiscoverySignalReference[];
  socialReferences: RestaurantDiscoverySignalReference[];
  tastingMenus: TastingMenuVariation[];
};

export type CitySnapshot = {
  city: {
    id: string;
    name: string;
    displayName?: string;
    country: string;
    generatedAt: string;
    restaurantCount: number;
    locale?: string;
    timeZone?: string;
    currencyCode?: string;
    editionLabel?: string;
  };
  restaurants: RawRestaurant[];
};

export type MexicoCitySnapshot = CitySnapshot;
