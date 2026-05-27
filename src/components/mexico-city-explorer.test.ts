import { describe, expect, it } from "vitest";
import {
  buildExplorerSearchParams,
  readExplorerUrlState,
  type ExplorerUrlState,
  type ExplorerUrlStateOptions,
} from "@/components/mexico-city-explorer";

const urlStateOptions: ExplorerUrlStateOptions = {
  defaultBands: ["budget", "mid", "high", "destination"],
  defaultCuisine: "mexican",
  defaultSlug: "pujol",
  validCuisineKeys: ["mexican", "seafood"],
  validPriceBands: ["budget", "mid", "high", "destination"],
  validRestaurantSlugs: ["pujol", "contramar"],
};

describe("Mexico City explorer URL state", () => {
  it("parses only supported view, restaurant, cuisine, and price values", () => {
    const state = readExplorerUrlState(
      new URLSearchParams(
        "view=google&restaurant=contramar&q=roma&reviews=500&bookable=1&cuisine=seafood&prices=mid,invalid,destination",
      ),
      urlStateOptions,
    );

    expect(state).toEqual({
      bookableOnly: true,
      only500Plus: true,
      search: "roma",
      selectedBands: ["mid", "destination"],
      selectedCuisine: "seafood",
      selectedSlug: "contramar",
      viewMode: "google",
    });
  });

  it("falls back to defaults for unsupported URL values", () => {
    const state = readExplorerUrlState(
      new URLSearchParams(
        "view=bad&restaurant=missing&cuisine=nope&prices=wrong&q=  polanco  ",
      ),
      urlStateOptions,
    );

    expect(state).toMatchObject({
      search: "polanco",
      selectedBands: urlStateOptions.defaultBands,
      selectedCuisine: urlStateOptions.defaultCuisine,
      selectedSlug: urlStateOptions.defaultSlug,
      viewMode: "global",
    });
  });

  it("serializes only meaningful deviations from the default state", () => {
    const state: ExplorerUrlState = {
      bookableOnly: true,
      only500Plus: false,
      search: "lunch",
      selectedBands: ["mid"],
      selectedCuisine: "seafood",
      selectedSlug: "contramar",
      viewMode: "cuisine",
    };

    expect(buildExplorerSearchParams(state, urlStateOptions).toString()).toBe(
      "view=cuisine&restaurant=contramar&q=lunch&bookable=1&cuisine=seafood&prices=mid",
    );
  });
});
