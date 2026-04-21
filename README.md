# City Restaurant Editions

Editorial restaurant explorer built on Next.js 16. The UI is city-agnostic now: each city ships as a dataset package, gets registered once, and can be opened from its own route.

## Current routes

- `/` -> default city edition
- `/mexico-city` -> Mexico City edition

## Core structure

- `src/lib/city-dataset.ts` - generic dataset builder and city meta model
- `src/lib/city-registry.ts` - registry of available city editions
- `src/data/cities/<city-id>/index.ts` - city package assembly
- `src/components/city-restaurant-explorer.tsx` - generic explorer entrypoint
- `scripts/city-configs/<city-id>.mjs` - scrape config for snapshot generation
- `.city-cache/<city-id>/latest` - latest cached share bundle

## Run locally

```bash
npm install
npm run dev
```

App runs on [http://localhost:3107](http://localhost:3107).

## Build a city snapshot

```bash
npm run city:build -- mexico-city
```

This writes:

- `src/data/generated/<city-id>-snapshot.json`
- `.city-cache/<city-id>/latest/`
- `.city-cache/<city-id>/<city-id>-package.zip` on Windows when zip creation succeeds

## Archive an existing city package

```bash
npm run city:archive -- mexico-city
```

## Add a new city

1. Add `scripts/city-configs/<city-id>.mjs` with city metadata and Wanderlog source URLs.
2. Run `npm run city:build -- <city-id>`.
3. Add editorial copy and overrides:
   - `src/data/<city-id>-english-copy.ts`
   - `src/data/<city-id>-overrides.ts`
4. Create `src/data/cities/<city-id>/index.ts` using `buildRestaurantDataset(...)`.
5. Register the dataset in `src/lib/city-registry.ts`.

After that the edition is available at `/<city-id>`.
