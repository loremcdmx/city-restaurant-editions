import type {
  RestaurantDiscoverySignalReference,
  RestaurantDiscoverySignals,
} from "@/lib/restaurant-types";

const EATER_38_URL = "https://www.eater.com/maps/best-mexico-city-restaurants-38";
const TIMEOUT_BEST_URL =
  "https://www.timeout.com/mexico-city/restaurants/best-restaurants-in-mexico-city";
const CONDE_NAST_BEST_URL =
  "https://www.cntraveler.com/gallery/best-restaurants-in-mexico-city";
const INFATUATION_JOWONG_URL =
  "https://www.theinfatuation.com/mexico-city/reviews/jowong";
const INFATUATION_GALEA_URL =
  "https://www.theinfatuation.com/mexico-city/reviews/galea";
const MICHELIN_STARS_2025_URL =
  "https://guide.michelin.com/ca/en/article/michelin-guide-ceremony/michelin-guide-mexico-stars-green-stars";
const MICHELIN_BIB_2025_URL =
  "https://guide.michelin.com/us/en/article/michelin-guide-ceremony/michelin-guide-mexico-bib-gourmand-2025";
const MICHELIN_BALDIO_URL =
  "https://guide.michelin.com/us/en/article/dining-out/baldio-mexico-city-michelin-guide-zero-waste";
const MICHELIN_FUGAZ_URL =
  "https://guide.michelin.com/us/en/article/michelin-guide-ceremony/giuseppe-lacorazza-fugaz-michelin-star-guide-ceremony-mexico-2025-young-chef-award";
const PUJOL_50BEST_URL = "https://www.theworlds50best.com/the-list/1-10/pujol.html";
const QUINTONIL_50BEST_URL =
  "https://www.theworlds50best.com/discovery/Establishments/Mexico/Mexico-City/Quintonil.html";
const ROSETTA_50BEST_URL = "https://www.theworlds50best.com/the-list/rosetta.html";
const MAXIMO_50BEST_URL =
  "https://www.theworlds50best.com/discovery/Establishments/Mexico/Mexico-City/M%C3%A1ximo.html";
const CONTRAMAR_50BEST_URL =
  "https://www.theworlds50best.com/discovery/Establishments/Mexico/Mexico-City/Contramar.html";
const JOWONG_EATER_URL = "https://www.eater.com/venue/113896/jowong";
const LINA_EATER_URL = "https://www.eater.com/venue/104880/lina";
const MASALA_EATER_URL = "https://www.eater.com/venue/60002/masala-y-ma-z";
const BALDIO_EATER_URL = "https://www.eater.com/venue/113892/baldio";
const MAKAN_EATER_URL = "https://www.eater.com/venue/104879/makan";
const GALEA_EATER_URL = "https://www.eater.com/venue/932494/galea";
const PROPIO_EATER_URL = "https://www.eater.com/venue/113893/propio";
const VORAZ_EATER_URL = "https://www.eater.com/venue/111976/voraz";

function buildReference(
  label: string,
  sourceLabel: string,
  sourceUrl: string,
  note: string,
  currentness: string,
): RestaurantDiscoverySignalReference {
  return {
    label,
    sourceLabel,
    sourceUrl,
    note,
    currentness,
  };
}

function guideReference(
  label: string,
  sourceLabel: string,
  sourceUrl: string,
  note: string,
  currentness: string,
) {
  return buildReference(label, sourceLabel, sourceUrl, note, currentness);
}

function socialReference(
  label: string,
  sourceLabel: string,
  sourceUrl: string,
  note: string,
  currentness: string,
) {
  return buildReference(label, sourceLabel, sourceUrl, note, currentness);
}

function buildSignals(
  guideScore: number,
  socialScore: number,
  guideReferences: RestaurantDiscoverySignalReference[],
  socialReferences: RestaurantDiscoverySignalReference[],
): RestaurantDiscoverySignals {
  return {
    guideScore,
    socialScore,
    guideReferences,
    socialReferences,
  };
}

export const MEXICO_CITY_DISCOVERY_SIGNALS: Record<
  string,
  RestaurantDiscoverySignals
> = {
  quintonil: buildSignals(
    100,
    82,
    [
      guideReference(
        "No. 3 in The World's 50 Best Restaurants 2025",
        "50 Best / Quintonil",
        QUINTONIL_50BEST_URL,
        "Current global benchmark for Mexico City fine dining.",
        "2025",
      ),
      guideReference(
        "Two Michelin stars in Mexico 2025",
        "Michelin Guide Mexico 2025",
        MICHELIN_STARS_2025_URL,
        "Still in the top Michelin tier of the current national guide.",
        "2025",
      ),
      guideReference(
        "Local expert essential",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "The current Mexico City guide still treats it as a defining reservation.",
        "Updated Apr 15, 2026",
      ),
    ],
    [
      socialReference(
        "Still anchors the current conversation",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "The updated local map frames Quintonil as part of the active city narrative, not just legacy prestige.",
        "Updated Apr 15, 2026",
      ),
      socialReference(
        "World-ranking visibility keeps it hot",
        "50 Best / Quintonil",
        QUINTONIL_50BEST_URL,
        "Its 2025 world ranking keeps Quintonil well beyond critic-only attention.",
        "2025",
      ),
    ],
  ),
  pujol: buildSignals(
    98,
    79,
    [
      guideReference(
        "Global 50 Best main-list fixture",
        "50 Best / Pujol",
        PUJOL_50BEST_URL,
        "Still treated as one of the city's canonical destination meals.",
        "2024-2025 context",
      ),
      guideReference(
        "Two Michelin stars in Mexico 2025",
        "Michelin Guide Mexico 2025",
        MICHELIN_STARS_2025_URL,
        "Current guide validation at the highest Michelin tier in Mexico City.",
        "2025",
      ),
      guideReference(
        "Authoritative local essential",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Continues to rank as core city dining for first-time and repeat visitors.",
        "Updated Apr 15, 2026",
      ),
    ],
    [
      socialReference(
        "High-visibility legacy icon",
        "50 Best / Pujol",
        PUJOL_50BEST_URL,
        "Its long-running global reputation still converts directly into planning buzz.",
        "2024-2025 context",
      ),
      socialReference(
        "Persistent travel-diner buzz",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "The current map keeps it squarely in the main traveler conversation.",
        "Updated Apr 15, 2026",
      ),
    ],
  ),
  rosetta: buildSignals(
    96,
    84,
    [
      guideReference(
        "No. 46 in The World's 50 Best Restaurants 2025",
        "50 Best / Rosetta",
        ROSETTA_50BEST_URL,
        "Strong current international ranking with a detailed profile.",
        "2025",
      ),
      guideReference(
        "One Michelin star in Mexico 2025",
        "Michelin Guide Mexico 2025",
        MICHELIN_STARS_2025_URL,
        "Current Michelin validation for the flagship dining room.",
        "2025",
      ),
    ],
    [
      socialReference(
        "Still one of the most talked-about reservations",
        "50 Best / Rosetta",
        ROSETTA_50BEST_URL,
        "The 2025 world-list ranking keeps Rosetta central to destination-dining chatter.",
        "2025",
      ),
      socialReference(
        "Bakery-to-dining halo stays strong",
        "50 Best / Rosetta",
        ROSETTA_50BEST_URL,
        "Rosetta's wider ecosystem keeps it unusually visible in trip planning.",
        "2025",
      ),
    ],
  ),
  maximo: buildSignals(
    95,
    87,
    [
      guideReference(
        "No. 43 in Latin America's 50 Best Restaurants 2024",
        "50 Best / Maximo",
        MAXIMO_50BEST_URL,
        "Current Discovery profile still frames it as a regional benchmark.",
        "2024 profile, live in 2026",
      ),
      guideReference(
        "One Michelin star in Mexico 2025",
        "Michelin Guide Mexico 2025",
        MICHELIN_STARS_2025_URL,
        "Current guide confirms Maximo as a serious fine-dining play.",
        "2025",
      ),
      guideReference(
        "Deep local-guide coverage",
        "Conde Nast / Scarlett Lindeman + Naomi Tomky",
        CONDE_NAST_BEST_URL,
        "Included in a recently refreshed guide by restaurant specialists.",
        "Dec 2, 2025",
      ),
    ],
    [
      socialReference(
        "Still heavily trafficked by food-focused diners",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Remains on the current city map for destination reservations.",
        "Updated Apr 15, 2026",
      ),
      socialReference(
        "High-value travel-media attention",
        "Conde Nast / Scarlett Lindeman + Naomi Tomky",
        CONDE_NAST_BEST_URL,
        "Continues to land in premium travel-food planning coverage.",
        "Dec 2, 2025",
      ),
    ],
  ),
  "masala-y-maiz": buildSignals(
    94,
    90,
    [
      guideReference(
        "One Michelin star in Mexico 2025",
        "Michelin Guide Mexico 2025",
        MICHELIN_STARS_2025_URL,
        "Current Michelin recognition for its cross-cultural point of view.",
        "2025",
      ),
      guideReference(
        "Strong current travel-guide presence",
        "Conde Nast / Scarlett Lindeman + Naomi Tomky",
        CONDE_NAST_BEST_URL,
        "Recent city guide coverage keeps it in the top conversation.",
        "Dec 2, 2025",
      ),
      guideReference(
        "Long-running Eater venue coverage",
        "Eater / Masala y Maiz venue page",
        MASALA_EATER_URL,
        "The venue page keeps Masala y Maiz in Eater's live restaurant index.",
        "Live page, crawled 2026",
      ),
    ],
    [
      socialReference(
        "Cross-cultural menu still drives chatter",
        "Eater / Masala y Maiz venue page",
        MASALA_EATER_URL,
        "Its long-lived venue page keeps the restaurant legible to visitors searching current buzz.",
        "Live page, crawled 2026",
      ),
      socialReference(
        "Travel-media momentum remains high",
        "Conde Nast / Scarlett Lindeman + Naomi Tomky",
        CONDE_NAST_BEST_URL,
        "A strong fit for diners chasing distinctive, conversation-starting meals.",
        "Dec 2, 2025",
      ),
    ],
  ),
  contramar: buildSignals(
    93,
    83,
    [
      guideReference(
        "50 Best Discovery institution",
        "50 Best / Contramar",
        CONTRAMAR_50BEST_URL,
        "A long-running seafood anchor with strong global recognition.",
        "Live profile in 2026",
      ),
    ],
    [
      socialReference(
        "Weekend-lunch main-character energy",
        "50 Best / Contramar",
        CONTRAMAR_50BEST_URL,
        "The profile explicitly points to packed local lunchtimes and return diners.",
        "Live profile in 2026",
      ),
    ],
  ),
  em: buildSignals(
    91,
    80,
    [
      guideReference(
        "One Michelin star in Mexico 2025",
        "Michelin Guide Mexico 2025",
        MICHELIN_STARS_2025_URL,
        "Current Michelin recognition keeps EM in the serious tasting-menu tier.",
        "2025",
      ),
    ],
    [],
  ),
  jowong: buildSignals(
    87,
    93,
    [
      guideReference(
        "Bib Gourmand in Mexico 2025",
        "Michelin Guide Mexico 2025 / Bib",
        MICHELIN_BIB_2025_URL,
        "Current Michelin Bib validation for value and flavor.",
        "2025",
      ),
      guideReference(
        "Eater venue-page presence",
        "Eater / Jowong venue page",
        JOWONG_EATER_URL,
        "Jowong remains indexed inside Eater's live city coverage.",
        "Live page, crawled 2026",
      ),
    ],
    [
      socialReference(
        "New-wave Korean scene energy",
        "Infatuation / Guillaume Guevara",
        INFATUATION_JOWONG_URL,
        "The review explicitly places Jowong in the city's scene-y Korean wave.",
        "Oct 4, 2024",
      ),
      socialReference(
        "Current city-guide carryover",
        "Eater / Jowong venue page",
        JOWONG_EATER_URL,
        "The live venue page helps keep Jowong visible for current-night planning.",
        "Live page, crawled 2026",
      ),
      socialReference(
        "Bib plus feed-friendly dishes",
        "Michelin Guide Mexico 2025 / Bib",
        MICHELIN_BIB_2025_URL,
        "Current Michelin attention reinforces broad visibility beyond niche diners.",
        "2025",
      ),
    ],
  ),
  "ultramarinos-demar": buildSignals(
    85,
    94,
    [
      guideReference(
        "Bib Gourmand in Mexico 2025",
        "Michelin Guide Mexico 2025 / Bib",
        MICHELIN_BIB_2025_URL,
        "Current Michelin Bib attention adds durability to the hype.",
        "2025",
      ),
      guideReference(
        "Top current city guide pick",
        "Time Out / Mauricio Nava",
        TIMEOUT_BEST_URL,
        "Included in Time Out Mexico City's current best-restaurants guide.",
        "Mar 11, 2025",
      ),
      guideReference(
        "Current local map inclusion",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Still part of Eater's updated citywide shortlist.",
        "Updated Apr 15, 2026",
      ),
    ],
    [
      socialReference(
        "Hardcore foodie magnet",
        "Time Out / Mauricio Nava",
        TIMEOUT_BEST_URL,
        "Time Out calls it one of the most visited spots by hardcore foodies that year.",
        "Mar 11, 2025",
      ),
      socialReference(
        "Still on the live city map",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Current map coverage keeps the buzz fresh.",
        "Updated Apr 15, 2026",
      ),
      socialReference(
        "Bib validation amplifies the chatter",
        "Michelin Guide Mexico 2025 / Bib",
        MICHELIN_BIB_2025_URL,
        "Recognition broadened its reach beyond insider-only audiences.",
        "2025",
      ),
    ],
  ),
  "el-califa-de-leon": buildSignals(
    89,
    88,
    [
      guideReference(
        "Michelin-star outlier in Mexico City",
        "Michelin Guide Mexico 2025",
        MICHELIN_STARS_2025_URL,
        "Its current Michelin status keeps it historically important and easy to explain.",
        "2025",
      ),
    ],
    [
      socialReference(
        "Michelin-star taqueria halo",
        "Michelin Guide Mexico 2025",
        MICHELIN_STARS_2025_URL,
        "The unusual Michelin story keeps it circulating far beyond taco obsessives.",
        "2025",
      ),
    ],
  ),
  makan: buildSignals(
    83,
    89,
    [
      guideReference(
        "Included in the current Eater 38",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Current local expert coverage keeps Makan on the serious city radar.",
        "Updated Apr 15, 2026",
      ),
      guideReference(
        "Current Time Out best-restaurants guide",
        "Time Out / Mauricio Nava",
        TIMEOUT_BEST_URL,
        "Included in a recent citywide ranking of standout restaurants.",
        "Mar 11, 2025",
      ),
    ],
    [
      socialReference(
        "Share-plate, open-kitchen momentum",
        "Eater / Makan venue page",
        MAKAN_EATER_URL,
        "The refreshed venue write-up makes it easy to read as a social group-dinner play.",
        "Live page, crawled 2026",
      ),
      socialReference(
        "Current map inclusion",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Still part of the newest local-essential shortlist.",
        "Updated Apr 15, 2026",
      ),
      socialReference(
        "Time Out visibility",
        "Time Out / Mauricio Nava",
        TIMEOUT_BEST_URL,
        "Recent guide inclusion extends it beyond niche diners.",
        "Mar 11, 2025",
      ),
    ],
  ),
  taverna: buildSignals(
    76,
    84,
    [
      guideReference(
        "Current local-guide inclusion",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Included in the updated local expert map.",
        "Updated Apr 15, 2026",
      ),
    ],
    [
      socialReference(
        "Still benefits from Eater map visibility",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "More scene-driven than award-driven in the current city mix.",
        "Updated Apr 15, 2026",
      ),
    ],
  ),
  bajel: buildSignals(
    80,
    81,
    [
      guideReference(
        "Current local-guide inclusion",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Included in the updated city guide for special-occasion dining.",
        "Updated Apr 15, 2026",
      ),
    ],
    [
      socialReference(
        "View-driven special-occasion buzz",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Visibility is more occasion-led than broad social hype.",
        "Updated Apr 15, 2026",
      ),
    ],
  ),
  voraz: buildSignals(
    82,
    94,
    [
      guideReference(
        "Bib Gourmand in Mexico 2025",
        "Michelin Guide Mexico 2025 / Bib",
        MICHELIN_BIB_2025_URL,
        "Current Michelin Bib gives it real guide credibility.",
        "2025",
      ),
      guideReference(
        "Included in the current Eater 38",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Still on the updated city map for locals and travelers.",
        "Updated Apr 15, 2026",
      ),
    ],
    [
      socialReference(
        "Busy-open-kitchen gastropub momentum",
        "Eater / Voraz venue page",
        VORAZ_EATER_URL,
        "The current venue page frames it as a conversation-starting Roma Norte-adjacent room.",
        "Live page, crawled 2026",
      ),
      socialReference(
        "Current local-map carryover",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Updated coverage keeps Voraz in the hot-wave set.",
        "Updated Apr 15, 2026",
      ),
    ],
  ),
  lina: buildSignals(
    88,
    96,
    [
      guideReference(
        "Recently refreshed travel-guide favorite",
        "Conde Nast / Scarlett Lindeman + Naomi Tomky",
        CONDE_NAST_BEST_URL,
        "A local contributor singles it out in a recently updated city guide.",
        "Dec 2, 2025",
      ),
      guideReference(
        "Included in the current Eater 38",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Current local-expert validation keeps it in the main shortlist.",
        "Updated Apr 15, 2026",
      ),
      guideReference(
        "Strong Time Out placement",
        "Time Out / Mauricio Nava",
        TIMEOUT_BEST_URL,
        "Highlighted in the current best-restaurants guide.",
        "Mar 11, 2025",
      ),
    ],
    [
      socialReference(
        "Cozy-yet-elevated dinner-party vibe",
        "Eater / Lina venue page",
        LINA_EATER_URL,
        "The venue page explicitly calls out its food-focused social energy.",
        "Live page, crawled 2026",
      ),
      socialReference(
        "Premium travel-media momentum",
        "Conde Nast / Scarlett Lindeman + Naomi Tomky",
        CONDE_NAST_BEST_URL,
        "Recent editorial coverage keeps Lina highly shareable and current.",
        "Dec 2, 2025",
      ),
      socialReference(
        "Still in the active local map",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Carries current buzz beyond launch-phase novelty.",
        "Updated Apr 15, 2026",
      ),
    ],
  ),
  baldio: buildSignals(
    90,
    97,
    [
      guideReference(
        "Michelin Green Star story in current coverage",
        "Michelin / Baldio profile",
        MICHELIN_BALDIO_URL,
        "Official Michelin coverage makes Baldio one of the city's clearest current guide narratives.",
        "2025",
      ),
      guideReference(
        "Included in the current Eater 38",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Current local expert coverage confirms it is not just a temporary trend.",
        "Updated Apr 15, 2026",
      ),
    ],
    [
      socialReference(
        "Zero-waste narrative travels fast",
        "Michelin / Baldio profile",
        MICHELIN_BALDIO_URL,
        "The Michelin feature gives Baldio unusually sticky conversation value online.",
        "2025",
      ),
      socialReference(
        "Current local-map heat",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Its place in the latest Eater map keeps the room firmly in the new-wave set.",
        "Updated Apr 15, 2026",
      ),
      socialReference(
        "Venue-page visibility",
        "Eater / Baldio venue page",
        BALDIO_EATER_URL,
        "The current venue page ties Baldio straight into the newest city guide cycle.",
        "Live page, crawled 2026",
      ),
    ],
  ),
  propio: buildSignals(
    79,
    95,
    [
      guideReference(
        "Included in the current Eater 38",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "A current local-expert inclusion, even without Michelin or 50 Best weight.",
        "Updated Apr 15, 2026",
      ),
    ],
    [
      socialReference(
        "Sought-after reservation momentum",
        "Eater / Propio venue page",
        PROPIO_EATER_URL,
        "The current venue write-up explicitly says Propio became a sought-after booking quickly.",
        "Live page, crawled 2026",
      ),
      socialReference(
        "Current local-map carryover",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Still reads as a present-tense room in the updated city map.",
        "Updated Apr 15, 2026",
      ),
    ],
  ),
  fugaz: buildSignals(
    81,
    86,
    [
      guideReference(
        "Michelin Young Chef Award in Mexico 2025",
        "Michelin / Giuseppe Lacorazza",
        MICHELIN_FUGAZ_URL,
        "Official Michelin editorial attention gives Fugaz unusually strong guide credibility for its size.",
        "2025",
      ),
    ],
    [
      socialReference(
        "Tiny-room, changing-menu appeal",
        "Michelin / Giuseppe Lacorazza",
        MICHELIN_FUGAZ_URL,
        "The official feature leans into its weekly-changing menu and youthful energy.",
        "2025",
      ),
    ],
  ),
  galea: buildSignals(
    84,
    86,
    [
      guideReference(
        "Bib Gourmand in Mexico 2025",
        "Michelin Guide Mexico 2025 / Bib",
        MICHELIN_BIB_2025_URL,
        "Current Michelin Bib status keeps Galea in the guide conversation.",
        "2025",
      ),
      guideReference(
        "Included in the current Eater 38",
        "Eater / Natalia de la Rosa",
        EATER_38_URL,
        "Current local-expert map coverage adds durable relevance.",
        "Updated Apr 15, 2026",
      ),
      guideReference(
        "Current travel-guide coverage",
        "Eater / Galea venue page",
        GALEA_EATER_URL,
        "The live venue profile describes it as fully cemented in the city scene.",
        "Live page, crawled 2026",
      ),
    ],
    [
      socialReference(
        "Casual but polished crowd pull",
        "Infatuation / Galea review",
        INFATUATION_GALEA_URL,
        "The Infatuation review frames Galea as composed, current, and easy to recommend socially.",
        "2025",
      ),
      socialReference(
        "Venue-page reinforcement",
        "Eater / Galea venue page",
        GALEA_EATER_URL,
        "A current venue profile helps keep Galea visible to planning-heavy diners.",
        "Live page, crawled 2026",
      ),
    ],
  ),
  tetetlan: buildSignals(
    74,
    75,
    [],
    [],
  ),
};
