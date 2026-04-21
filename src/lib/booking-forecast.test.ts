import { describe, expect, it } from "vitest";
import { buildBookingForecast } from "@/lib/booking-forecast";
import type { Restaurant } from "@/lib/restaurant-types";

function createRestaurant(): Restaurant {
  return {
    slug: "alpha",
    sourceUrl: "https://wanderlog.com/place/alpha",
    name: "Alpha",
    address: "Avenida Reforma 1",
    website: "https://alpha.example.com",
    phone: "+52 55 0000 0000",
    rating: 4.7,
    numRatings: 680,
    reviewsSummary: "Summary",
    reasonsToVisit: ["Reason 1", "Reason 2"],
    reviews: [],
    gallery: [],
    menuItems: [],
    tastingMenus: [],
    booking: {
      type: "reservation",
      reservationPlatform: "Resy",
      idOnPlatform: "alpha",
      daysInAdvance: {
        highAvailability: 14,
        lowAvailability: 9,
      },
    },
    openingHours: [
      { day: "Sun", intervals: [], closed: true },
      { day: "Mon", intervals: [{ open: "12:00", close: "15:00", overnight: false }], closed: false },
      { day: "Tue", intervals: [{ open: "12:00", close: "15:00", overnight: false }], closed: false },
      { day: "Wed", intervals: [{ open: "12:00", close: "15:00", overnight: false }], closed: false },
      { day: "Thu", intervals: [{ open: "12:00", close: "15:00", overnight: false }], closed: false },
      { day: "Fri", intervals: [{ open: "18:00", close: "23:00", overnight: false }], closed: false },
      { day: "Sat", intervals: [{ open: "18:00", close: "23:00", overnight: false }], closed: false },
    ],
    district: "Roma Norte",
    neighborhoods: ["Roma Norte"],
    cuisineKeys: ["mexican-contemporary"],
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
    bookingUrl: "https://book.alpha.example.com",
    bookingNote: "Reserve early.",
    timingNote: "Weekdays are calmer.",
    bestWindow: "Mon-Thu at 13:00.",
    whyItWins: "Strong cuisine and atmosphere.",
    googleCompositeScore: 481.33,
    reviewCountBucket: "500-999",
    bookingPressure: "one-week",
  };
}

describe("buildBookingForecast", () => {
  it("builds a deterministic ten-day forecast with closed days preserved", () => {
    const restaurant = createRestaurant();

    const forecast = buildBookingForecast(restaurant, "2026-04-19");
    const repeatedForecast = buildBookingForecast(restaurant, "2026-04-19");

    expect(forecast.days).toHaveLength(10);
    expect(forecast.days[0]?.dayKey).toBe("Sun");
    expect(forecast.days[0]?.closed).toBe(true);
    expect(forecast.days[0]?.slots).toHaveLength(0);
    expect(forecast.days[1]?.closed).toBe(false);
    expect(forecast.days[1]?.slots.length).toBeGreaterThan(0);
    expect(forecast.days[1]).toEqual(repeatedForecast.days[1]);
    expect(forecast.modeledWith).toContain("hashed slot variance");
  });

  it("never gives larger parties more live availability than smaller parties on the same day", () => {
    const restaurant = createRestaurant();
    const forecast = buildBookingForecast(restaurant, "2026-04-19");
    const monday = forecast.days.find((day) => day.dayKey === "Mon");

    expect(monday).toBeDefined();

    if (!monday) {
      return;
    }

    expect(monday.summaryByParty[2].availableCount).toBeGreaterThanOrEqual(
      monday.summaryByParty[4].availableCount,
    );
    expect(monday.summaryByParty[4].availableCount).toBeGreaterThanOrEqual(
      monday.summaryByParty[6].availableCount,
    );
  });
});
