import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { archiveCityPackage } from "./lib/archive-city-package.mjs";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildWanderlogImage(key, variant = "full") {
  const prefix =
    variant === "small"
      ? "freeImageSmall"
      : variant === "medium"
        ? "freeImageMedium"
        : "freeImage";

  return `https://itin-dev.wanderlogstatic.com/${prefix}/${key}`;
}

function formatTime(raw) {
  if (!raw || raw.length !== 4) {
    return raw ?? "";
  }

  return `${raw.slice(0, 2)}:${raw.slice(2)}`;
}

function normalizeOpeningPeriods(openingPeriods = []) {
  const grouped = new Map(
    WEEK_DAYS.map((day) => [
      day,
      {
        day,
        intervals: [],
      },
    ]),
  );

  for (const period of openingPeriods) {
    if (!period?.open || !period?.close) {
      continue;
    }

    const openDay = WEEK_DAYS[period.open.day];
    const closeDay = WEEK_DAYS[period.close.day];

    if (!openDay || !closeDay) {
      continue;
    }

    const interval = {
      open: formatTime(period.open.time),
      close: formatTime(period.close.time),
      overnight: openDay !== closeDay,
    };

    grouped.get(openDay)?.intervals.push(interval);
  }

  return Array.from(grouped.values()).map((entry) => ({
    ...entry,
    closed: entry.intervals.length === 0,
  }));
}

function sanitizeReviewText(reviewText = "") {
  return reviewText.replace(/\s+/g, " ").trim();
}

function buildMenuItemImage(item) {
  if (!item?.imageKey) {
    return null;
  }

  return {
    key: item.imageKey,
    url: buildWanderlogImage(item.imageKey),
    mediumUrl: buildWanderlogImage(item.imageKey, "medium"),
    smallUrl: buildWanderlogImage(item.imageKey, "small"),
  };
}

function parseWanderlogState(html) {
  const match = html.match(
    /window\.__MOBX_STATE__\s*=\s*(\{[\s\S]*?\});\s*window\.__CONFIG__/,
  );

  if (!match) {
    throw new Error("Failed to locate Wanderlog state payload.");
  }

  return JSON.parse(match[1]);
}

function normalizeRestaurant(source, state) {
  const page = state.placePage?.data;
  const meta = page?.placeMetadata;

  if (!page || !meta) {
    throw new Error(`Missing place payload for ${source.slug}.`);
  }

  const booking = page.bookingInformation ?? null;
  const reviews = Array.isArray(meta.reviews)
    ? meta.reviews.slice(0, 5).map((review) => ({
        reviewerName: review.reviewerName,
        rating: review.rating,
        time: review.time,
        reviewText: sanitizeReviewText(review.reviewText),
      }))
    : [];

  const gallery = (meta.images ?? []).map((image, index) => ({
    id: `${source.slug}-gallery-${index + 1}`,
    key: image.key,
    url: buildWanderlogImage(image.key),
    mediumUrl: buildWanderlogImage(image.key, "medium"),
    smallUrl: buildWanderlogImage(image.key, "small"),
    width: image.width,
    height: image.height,
  }));

  const menuItems = (page.menuItems ?? []).map((item, index) => ({
    id: `${source.slug}-menu-${index + 1}`,
    name: item.name,
    captionURL: item.captionURL,
    image: buildMenuItemImage(item),
  }));

  return {
    slug: source.slug,
    sourceUrl: source.url,
    fetchedAt: new Date().toISOString(),
    placeId: meta.placeId ?? null,
    name: meta.name,
    description: meta.description ?? "",
    generatedDescription: meta.generatedDescription ?? "",
    categories: meta.categories ?? [],
    address: meta.address ?? "",
    website: meta.website ?? null,
    phone: meta.internationalPhoneNumber ?? null,
    rating: meta.rating ?? null,
    numRatings: meta.numRatings ?? null,
    tripadvisorRating: meta.tripadvisorRating ?? null,
    tripadvisorNumRatings: meta.tripadvisorNumRatings ?? null,
    priceLevel: meta.priceLevel ?? null,
    reviewsSummary: page.reviewsSummary ?? "",
    reasonsToVisit: page.reasonsToVisit ?? [],
    tips: page.tips ?? [],
    reviews,
    gallery,
    menuItems,
    booking,
    openingHours: normalizeOpeningPeriods(meta.openingPeriods),
    typicalVisitMinutes: {
      min: meta.minMinutesSpent ?? null,
      max: meta.maxMinutesSpent ?? null,
    },
  };
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodexRestaurantApp/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function loadCityConfig(cityId, cwd = process.cwd()) {
  const configPath = resolve(cwd, "scripts", "city-configs", `${cityId}.mjs`);
  const configModule = await import(pathToFileURL(configPath).href);
  const config = configModule.default;

  if (!config?.city?.id || !Array.isArray(config.sources)) {
    throw new Error(`Invalid city config at ${configPath}`);
  }

  return config;
}

export async function buildCitySnapshot(cityId, cwd = process.cwd()) {
  const config = await loadCityConfig(cityId, cwd);
  const restaurants = [];

  for (const source of config.sources) {
    const html = await fetchHtml(source.url);
    const state = parseWanderlogState(html);
    restaurants.push(normalizeRestaurant(source, state));
  }

  const snapshot = {
    city: {
      ...config.city,
      generatedAt: new Date().toISOString(),
      restaurantCount: restaurants.length,
    },
    restaurants,
  };

  const outputPath = resolve(
    cwd,
    "src",
    "data",
    "generated",
    `${config.city.id}-snapshot.json`,
  );

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(snapshot, null, 2) + "\n");

  const archive = await archiveCityPackage(config.city.id, cwd);

  return {
    cityId: config.city.id,
    outputPath,
    restaurantCount: restaurants.length,
    archive,
  };
}

const cityId = process.argv[2] ?? "mexico-city";

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildCitySnapshot(cityId)
    .then((result) => {
      console.log(
        `Generated ${result.restaurantCount} restaurant snapshots at ${result.outputPath}`,
      );

      if (result.archive.zipPath) {
        console.log(`Archived ${result.cityId} package at ${result.archive.zipPath}`);
      } else {
        console.log(`Archived ${result.cityId} package in ${result.archive.latestDir}`);
      }
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
