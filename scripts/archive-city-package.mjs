import { archiveCityPackage } from "./lib/archive-city-package.mjs";

const cityId = process.argv[2];

if (!cityId) {
  throw new Error("Usage: node scripts/archive-city-package.mjs <city-id>");
}

const result = await archiveCityPackage(cityId);

console.log(`Archived ${cityId} into ${result.latestDir}`);

if (result.zipPath) {
  console.log(`Created shareable zip at ${result.zipPath}`);
}
