import { buildCitySnapshot } from "./build-city-snapshot.mjs";

buildCitySnapshot("mexico-city")
  .then((result) => {
    console.log(
      `Generated ${result.restaurantCount} restaurant snapshots at ${result.outputPath}`,
    );

    if (result.archive.zipPath) {
      console.log(`Archived mexico-city package at ${result.archive.zipPath}`);
    }
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
