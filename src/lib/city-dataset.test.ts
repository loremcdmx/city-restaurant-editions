import { describe, expect, it } from "vitest";
import {
  buildCityRestaurantExplorerPayload,
  buildRestaurantDataset,
  getRestaurantDetail,
  type PriceBandOption,
} from "@/lib/city-dataset";
import type {
  CitySnapshot,
  RestaurantGalleryImage,
  RestaurantMenuItem,
  RestaurantOverride,
} from "@/lib/restaurant-types";

function createGalleryImage(
  key: string,
  width = 1600,
  height = 1100,
): RestaurantGalleryImage {
  return {
    id: key,
    key,
    url: `https://example.com/${key}.jpg`,
    mediumUrl: `https://example.com/${key}-medium.jpg`,
    smallUrl: `https://example.com/${key}-small.jpg`,
    width,
    height,
  };
}

function createMenuItem(
  id: string,
  name: string,
  imageKey?: string,
): RestaurantMenuItem {
  return {
    id,
    name,
    captionURL: null,
    image: imageKey
      ? {
          key: imageKey,
          url: `https://example.com/${imageKey}.jpg`,
          mediumUrl: `https://example.com/${imageKey}-medium.jpg`,
          smallUrl: `https://example.com/${imageKey}-small.jpg`,
        }
      : null,
  };
}

const PRICE_BAND_OPTIONS: PriceBandOption[] = [
  { key: "budget", label: "Budget" },
  { key: "mid", label: "Mid" },
  { key: "high", label: "High" },
  { key: "destination", label: "Destination" },
];

describe("buildRestaurantDataset", () => {
  it("normalizes a city snapshot into a UI-ready dataset", () => {
    const snapshot: CitySnapshot = {
      city: {
        id: "test-city",
        name: "Test City",
        country: "Mexico",
        generatedAt: "2026-04-19T12:00:00.000Z",
        restaurantCount: 1,
        locale: "en-US",
        timeZone: "America/Mexico_City",
        currencyCode: "MXN",
      },
      restaurants: [
        {
          slug: "alpha",
          sourceUrl: "https://wanderlog.com/place/alpha",
          fetchedAt: "2026-04-19T12:00:00.000Z",
          placeId: "place-alpha",
          name: "Alpha",
          description: "Original description",
          generatedDescription: "",
          categories: ["fine dining"],
          address: "Avenida Reforma 1",
          website: "alpha.example.com",
          phone: "+52 55 0000 0000",
          rating: 4.7,
          numRatings: 680,
          tripadvisorRating: 4.5,
          tripadvisorNumRatings: 120,
          priceLevel: 4,
          reviewsSummary: "",
          reasonsToVisit: ["Reason 1", "Reason 2", "Reason 3", "Reason 4"],
          tips: ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
          reviews: [
            {
              reviewerName: "A",
              rating: 5,
              time: "2026-04-01T00:00:00.000Z",
              reviewText: "Review A",
            },
            {
              reviewerName: "B",
              rating: 4,
              time: "2026-04-02T00:00:00.000Z",
              reviewText: "Review B",
            },
            {
              reviewerName: "C",
              rating: 5,
              time: "2026-04-03T00:00:00.000Z",
              reviewText: "Review C",
            },
            {
              reviewerName: "D",
              rating: 4,
              time: "2026-04-04T00:00:00.000Z",
              reviewText: "Review D",
            },
          ],
          gallery: [
            createGalleryImage("venue-1"),
            createGalleryImage("venue-2", 1200, 1600),
          ],
          menuItems: [
            createMenuItem("menu-1", "Menu", "generic-menu"),
            createMenuItem("menu-2", "Tuna tostada", "dish-1"),
            createMenuItem("menu-3", "Duck mole", "dish-2"),
          ],
          booking: {
            type: "reservation",
            reservationPlatform: "Resy",
            idOnPlatform: "alpha",
            daysInAdvance: {
              highAvailability: 12,
              lowAvailability: 9,
            },
          },
          openingHours: [
            {
              day: "Sun",
              intervals: [],
              closed: true,
            },
            {
              day: "Mon",
              intervals: [{ open: "12:00", close: "15:00", overnight: false }],
              closed: false,
            },
            {
              day: "Tue",
              intervals: [{ open: "12:00", close: "15:00", overnight: false }],
              closed: false,
            },
            {
              day: "Wed",
              intervals: [{ open: "12:00", close: "15:00", overnight: false }],
              closed: false,
            },
            {
              day: "Thu",
              intervals: [{ open: "12:00", close: "15:00", overnight: false }],
              closed: false,
            },
            {
              day: "Fri",
              intervals: [{ open: "18:00", close: "23:00", overnight: false }],
              closed: false,
            },
            {
              day: "Sat",
              intervals: [{ open: "18:00", close: "23:00", overnight: false }],
              closed: false,
            },
          ],
          typicalVisitMinutes: {
            min: 90,
            max: 150,
          },
        },
      ],
    };

    const overrides: Record<string, RestaurantOverride> = {
      alpha: {
        district: "Roma Norte",
        neighborhoods: ["Roma Norte"],
        cuisineKeys: ["mexican-contemporary", "tasting-menu"],
        cuisineLabel: "Contemporary Mexican",
        globalScore: 96,
        trendingScore: 88,
        awards: ["MICHELIN 1*", "50 Best"],
        priceBand: "high",
        estimatedCheck: {
          low: 1800,
          high: 2600,
        },
        bookingMode: "website",
        bookingUrl: "book.alpha.example.com",
        bookingNote: "Reserve early.",
        timingNote: "Weekdays are calmer.",
        bestWindow: "Mon-Thu at 13:00.",
        whyItWins: "Strong cuisine and atmosphere.",
        sourceNotes: ["Manual curation"],
      },
    };

    const dataset = buildRestaurantDataset({
      snapshot,
      overrides,
      restaurantCopy: {
        alpha: {
          whyItWins: "Editorial summary",
        },
      },
      tastingMenus: {
        alpha: [
          {
            id: "alpha-current",
            formatLabel: "Chef's menu",
            name: "Current tasting menu",
            seasonLabel: "Spring 2026",
            summary: "Current seasonal progression.",
            price: "MX$2,400",
            sourceLabel: "Official menu",
            sourceUrl: "https://alpha.example.com/menu",
            confidence: "official-current",
            dishes: [
              {
                id: "alpha-snack",
                courseLabel: "Opening",
                name: "Tuna snack",
                description: "Corn and citrus.",
                photos: [
                  {
                    id: "alpha-snack-photo",
                    sourceUrl: "https://alpha.example.com/menu",
                    image: {
                      key: "alpha-snack-photo",
                      url: "https://example.com/alpha-snack.jpg",
                      mediumUrl: "https://example.com/alpha-snack-medium.jpg",
                      smallUrl: "https://example.com/alpha-snack-small.jpg",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      discoverySignals: {
        alpha: {
          guideScore: 94,
          socialScore: 89,
          guideReferences: [
            {
              label: "Michelin star confirmation",
              sourceLabel: "Michelin Guide Mexico 2025",
              sourceUrl: "https://guide.example.com/alpha",
              note: "Current Michelin validation.",
              currentness: "2025",
            },
          ],
          socialReferences: [
            {
              label: "Hit List feature",
              sourceLabel: "The Infatuation / Local editor",
              sourceUrl: "https://guides.example.com/alpha-hot",
              note: "Still part of the city's restaurant chatter.",
              currentness: "Updated Apr 2026",
            },
          ],
        },
      },
      cuisineLabels: {
        "mexican-contemporary": "Contemporary Mexican",
        "tasting-menu": "Tasting menu",
      },
      priceBandOptions: PRICE_BAND_OPTIONS,
      meta: {
        displayName: "Test City Edition",
      },
    });

    expect(dataset.meta.displayName).toBe("Test City Edition");
    expect(dataset.restaurants).toHaveLength(1);
    expect(dataset.cuisineOptions).toHaveLength(2);

    const restaurant = dataset.restaurants[0];

    expect(restaurant.website).toBe("https://alpha.example.com");
    expect(restaurant.bookingUrl).toBe("https://book.alpha.example.com");
    expect(restaurant.reviewCountBucket).toBe("500-999");
    expect(restaurant.bookingPressure).toBe("one-week");
    expect(restaurant.reviews).toHaveLength(3);
    expect(restaurant.reasonsToVisit).toHaveLength(3);
    expect(restaurant.menuItems[0]?.name).toBe("Tuna tostada");
    expect(restaurant.tastingMenus).toHaveLength(1);
    expect(restaurant.tastingMenus[0]?.dishes[0]?.photos[0]?.image.url).toBe(
      "https://example.com/alpha-snack.jpg",
    );
    expect(restaurant.timingNote).toContain("Weekdays are calmer.");
    expect(restaurant.timingNote).toContain("Mon-Thu at 13:00.");
    expect(restaurant.whyItWins).toBe("Editorial summary");
    expect(restaurant.googleCompositeScore).toBeGreaterThan(470);
    expect(restaurant.guideScore).toBe(94);
    expect(restaurant.socialScore).toBe(89);
    expect(restaurant.guideReferences[0]?.sourceLabel).toBe(
      "Michelin Guide Mexico 2025",
    );
    expect(restaurant.socialReferences[0]?.label).toBe("Hit List feature");
    expect("tips" in restaurant).toBe(false);
    expect("description" in restaurant).toBe(false);
    expect("sourceNotes" in restaurant).toBe(false);

    const explorerPayload = buildCityRestaurantExplorerPayload(dataset);
    const restaurantListItem = explorerPayload.restaurants[0];

    expect(explorerPayload.initialRestaurant.slug).toBe("alpha");
    expect(restaurantListItem.slug).toBe("alpha");
    expect(restaurantListItem.coverImage?.id).toBe("venue-1");
    expect(restaurantListItem.photoCount).toBeGreaterThanOrEqual(3);
    expect(restaurantListItem.signatureDishes.map((dish) => dish.name)).toEqual([
      "Tuna tostada",
      "Duck mole",
    ]);
    expect(restaurantListItem.guideScore).toBe(94);
    expect(restaurantListItem.socialScore).toBe(89);
    expect(restaurantListItem.guideReferences[0]?.label).toBe(
      "Michelin star confirmation",
    );
    expect(restaurantListItem.searchText).toContain("roma norte");
    expect(restaurantListItem.listSummary).toContain("Editorial summary");
    expect("reviews" in restaurantListItem).toBe(false);
    expect("menuItems" in restaurantListItem).toBe(false);
    expect("gallery" in restaurantListItem).toBe(false);
    expect(getRestaurantDetail(dataset, "alpha")?.slug).toBe("alpha");
  });

  it("defaults discovery signals to global and trending scores when none are provided", () => {
    const snapshot: CitySnapshot = {
      city: {
        id: "test-city",
        name: "Test City",
        country: "Mexico",
        generatedAt: "2026-04-19T12:00:00.000Z",
        restaurantCount: 1,
      },
      restaurants: [
        {
          slug: "beta",
          sourceUrl: "https://wanderlog.com/place/beta",
          fetchedAt: "2026-04-19T12:00:00.000Z",
          placeId: null,
          name: "Beta",
          description: "",
          generatedDescription: "",
          categories: [],
          address: "Street 2",
          website: null,
          phone: null,
          rating: 4.5,
          numRatings: 540,
          tripadvisorRating: null,
          tripadvisorNumRatings: null,
          priceLevel: null,
          reviewsSummary: "",
          reasonsToVisit: ["Reason"],
          tips: [],
          reviews: [],
          gallery: [createGalleryImage("beta-1")],
          menuItems: [createMenuItem("beta-menu", "Crudo", "beta-dish")],
          booking: null,
          openingHours: [],
          typicalVisitMinutes: {
            min: null,
            max: null,
          },
        },
      ],
    };

    const overrides: Record<string, RestaurantOverride> = {
      beta: {
        district: "Juarez",
        neighborhoods: ["Juarez"],
        cuisineKeys: ["seafood"],
        cuisineLabel: "Seafood",
        globalScore: 88,
        trendingScore: 91,
        awards: [],
        priceBand: "mid",
        estimatedCheck: {
          low: 700,
          high: 1200,
        },
        bookingMode: "walk-in",
        bookingNote: "Walk in.",
        timingNote: "Calmer midweek.",
        bestWindow: "Wed at 14:00.",
        whyItWins: "Fresh seafood.",
        sourceNotes: [],
      },
    };

    const dataset = buildRestaurantDataset({
      snapshot,
      overrides,
      cuisineLabels: {
        seafood: "Seafood",
      },
      priceBandOptions: PRICE_BAND_OPTIONS,
    });

    expect(dataset.restaurants[0]?.guideScore).toBe(88);
    expect(dataset.restaurants[0]?.socialScore).toBe(91);
    expect(dataset.restaurants[0]?.guideReferences).toEqual([]);
    expect(dataset.restaurants[0]?.socialReferences).toEqual([]);
  });

  it("throws when a restaurant override is missing", () => {
    const snapshot: CitySnapshot = {
      city: {
        id: "test-city",
        name: "Test City",
        country: "Mexico",
        generatedAt: "2026-04-19T12:00:00.000Z",
        restaurantCount: 1,
      },
      restaurants: [
        {
          slug: "missing",
          sourceUrl: "https://wanderlog.com/place/missing",
          fetchedAt: "2026-04-19T12:00:00.000Z",
          placeId: null,
          name: "Missing",
          description: "",
          generatedDescription: "",
          categories: [],
          address: "",
          website: null,
          phone: null,
          rating: null,
          numRatings: null,
          tripadvisorRating: null,
          tripadvisorNumRatings: null,
          priceLevel: null,
          reviewsSummary: "",
          reasonsToVisit: [],
          tips: [],
          reviews: [],
          gallery: [],
          menuItems: [],
          booking: null,
          openingHours: [],
          typicalVisitMinutes: {
            min: null,
            max: null,
          },
        },
      ],
    };

    expect(() =>
      buildRestaurantDataset({
        snapshot,
        overrides: {},
        cuisineLabels: {},
        priceBandOptions: PRICE_BAND_OPTIONS,
      }),
    ).toThrow("Missing override for missing");
  });
});
