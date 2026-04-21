import type { CuisineKey, RestaurantOverride } from "@/lib/restaurant-types";

export const ENGLISH_CUISINE_LABELS: Record<CuisineKey, string> = {
  "mexican-contemporary": "Contemporary Mexican",
  seafood: "Seafood",
  tacos: "Tacos & antojitos",
  italian: "Italian",
  korean: "Korean",
  "asian-fusion": "Asian fusion",
  mediterranean: "Mediterranean",
  "tasting-menu": "Tasting menu",
  "vegetable-forward": "Vegetable-forward",
};

type EnglishRestaurantCopy = Pick<
  RestaurantOverride,
  | "district"
  | "neighborhoods"
  | "cuisineLabel"
  | "bookingNote"
  | "timingNote"
  | "bestWindow"
  | "whyItWins"
>;

export const ENGLISH_RESTAURANT_COPY: Record<string, EnglishRestaurantCopy> = {
  pujol: {
    district: "Polanco",
    neighborhoods: ["Polanco", "Miguel Hidalgo"],
    cuisineLabel: "Fine Mexican tasting menu",
    bookingNote:
      "Plan ahead for this destination dinner; it is rarely a spontaneous walk-in.",
    timingNote:
      "Most evening seatings run hot, and weekday opening waves are usually the cleanest read.",
    bestWindow: "Mon-Thu at 13:00 or on the first dinner turn before 19:00.",
    whyItWins:
      "The city's signature fine-dining table for travelers chasing modern Mexican technique and cult mole.",
  },
  quintonil: {
    district: "Polanco",
    neighborhoods: ["Polanco", "Miguel Hidalgo"],
    cuisineLabel: "Contemporary Mexican",
    bookingNote:
      "One of the hardest tables in town; book well in advance if it matters.",
    timingNote:
      "Prime dinner is the tightest zone, while early weekday turns are the most realistic opening.",
    bestWindow: "Tue-Thu at 13:00 or on the first dinner wave around 18:00-19:00.",
    whyItWins:
      "The sharpest flagship case for modern Mexican cooking built on product, precision, and restraint.",
  },
  contramar: {
    district: "Roma Norte",
    neighborhoods: ["Roma Norte", "Cuauhtemoc"],
    cuisineLabel: "Seafood / long lunch",
    bookingNote:
      "A classic power-lunch room, so going in without a plan can turn into a long wait.",
    timingNote:
      "Lunch and early afternoon are the heaviest turns, especially from Friday through Sunday.",
    bestWindow: "Weekdays right at 12:00 or Sunday closer to 17:00.",
    whyItWins:
      "Still the default answer for a legendary seafood lunch in Mexico City.",
  },
  rosetta: {
    district: "Roma Norte",
    neighborhoods: ["Roma Norte", "Cuauhtemoc"],
    cuisineLabel: "Italian with a Mexican lens",
    bookingNote:
      "Dinner and Saturday lunch disappear quickly, so reservations make a material difference.",
    timingNote:
      "Dinner runs tighter than day service, and midweek lunch is usually gentler.",
    bestWindow: "Wed-Thu for lunch between 13:00 and 14:00.",
    whyItWins:
      "A strong call for atmosphere, bread, pasta, and a long, beautiful dining room.",
  },
  maximo: {
    district: "Roma Norte",
    neighborhoods: ["Roma Norte", "Cuauhtemoc"],
    cuisineLabel: "Contemporary chef-driven cooking",
    bookingNote:
      "Reserve ahead if you want the room at its best; it is not the place to leave to chance.",
    timingNote:
      "Friday and Saturday dinner are the highest-friction services.",
    bestWindow: "Mon-Thu near opening, or on an early Saturday turn before 18:00.",
    whyItWins:
      "A clean balance of status, comfort, and genuinely strong contemporary cooking.",
  },
  "masala-y-maiz": {
    district: "Juarez",
    neighborhoods: ["Juarez", "Cuauhtemoc"],
    cuisineLabel: "Mexico x India x East Africa",
    bookingNote:
      "This is a destination reservation now; showing up cold is a thin bet.",
    timingNote:
      "Early weekday seatings are the best angle, while evenings and weekends compress fast.",
    bestWindow: "Tue-Thu on the first seating.",
    whyItWins:
      "One of the city's most singular voices, with a point of view that actually tastes unique.",
  },
  em: {
    district: "Cuauhtemoc",
    neighborhoods: ["Cuauhtemoc"],
    cuisineLabel: "Tasting counter with Japanese influence",
    bookingNote:
      "Prepaid reservations are the cleanest move, and counter seats usually vanish first.",
    timingNote:
      "Demand is high on most evenings, especially for the kitchen-facing seats.",
    bestWindow: "A weekday early seating or a rare late cancellation.",
    whyItWins:
      "For diners who want a precise authorial tasting menu without the weight of classic grand fine dining.",
  },
  jowong: {
    district: "Condesa",
    neighborhoods: ["Condesa", "Cuauhtemoc"],
    cuisineLabel: "Korean with a local accent",
    bookingNote:
      "The room is compact, so prime-time bookings help, though it is not the most impossible table in town.",
    timingNote:
      "Friday and Saturday dinner book hardest; Sunday lunch usually breathes more.",
    bestWindow: "Tue-Thu after opening or Sunday before 15:00.",
    whyItWins:
      "A precise Korean-led table for anyone tired of generic fusion energy.",
  },
  "ultramarinos-demar": {
    district: "Roma Norte",
    neighborhoods: ["Roma Norte", "Cuauhtemoc"],
    cuisineLabel: "Modern seafood",
    bookingNote:
      "Confirm in advance whenever you can; walk-ins land sometimes, but mostly on luck.",
    timingNote:
      "Weekend daytime seafood traffic is the tightest wave.",
    bestWindow: "Weekday lunch or late Sunday closer to close.",
    whyItWins:
      "Fresh seafood without heavy ceremony, with a room that still feels current.",
  },
  "el-califa-de-leon": {
    district: "San Rafael",
    neighborhoods: ["San Rafael", "Cuauhtemoc"],
    cuisineLabel: "Classic taqueria",
    bookingNote:
      "There is no reservation game here; the only move is timing the queue.",
    timingNote:
      "After lunch and into the evening is the tightest stretch, while mid-afternoon is softer.",
    bestWindow: "Weekdays between 16:00 and 18:00.",
    whyItWins:
      "An iconic taco stop when you want a true must-try without a fine-dining budget.",
  },
  makan: {
    district: "Centro",
    neighborhoods: ["Centro", "Cuauhtemoc"],
    cuisineLabel: "Singapore x CDMX",
    bookingNote:
      "Reservations help, but the table is still easier to land than the hard fine-dining rooms.",
    timingNote:
      "Saturday dinner is the sharpest rush; weekday dinners are more forgiving.",
    bestWindow: "Mon, Wed, or Thu between 14:00 and 17:00.",
    whyItWins:
      "A strong non-Mexican lane when you want flavor, pace, and zero ceremony.",
  },
  taverna: {
    district: "Juarez",
    neighborhoods: ["Juarez", "Cuauhtemoc"],
    cuisineLabel: "Mediterranean / date-night room",
    bookingNote:
      "Reserve ahead if the goal is a polished evening table.",
    timingNote:
      "After sunset the room runs hottest, while lunch stays calmer.",
    bestWindow: "Lunch or an early weekday dinner.",
    whyItWins:
      "One of the cleaner calls for a handsome date-night room with real atmosphere.",
  },
  bajel: {
    district: "Reforma",
    neighborhoods: ["Reforma", "Cuauhtemoc"],
    cuisineLabel: "High-end tasting with a view",
    bookingNote:
      "Book ahead, especially if you want a sunset-facing table and the full tasting pace.",
    timingNote:
      "Sunset and late dinner are the hardest turns to secure.",
    bestWindow: "An early weekday dinner or an early lunch if it is open.",
    whyItWins:
      "A strong pick when you want skyline views, service polish, and a full tasting format.",
  },
  voraz: {
    district: "Roma Sur",
    neighborhoods: ["Roma Sur", "Cuauhtemoc"],
    cuisineLabel: "Bold contemporary Mexican",
    bookingNote:
      "The buzz is rising quickly, so weekend reservations are the safer play.",
    timingNote:
      "Friday and Saturday night run tight; lunch is the easier angle.",
    bestWindow: "Tue-Thu at lunch or on an early dinner turn.",
    whyItWins:
      "One of the liveliest and most convincing newer Mexican tables in Roma Sur.",
  },
  lina: {
    district: "Roma Norte",
    neighborhoods: ["Roma Norte", "Cuauhtemoc"],
    cuisineLabel: "Seasonal product, fine line cooking",
    bookingNote:
      "Book ahead for prime hours, though this is still a table you can realistically catch.",
    timingNote:
      "Demand builds toward the weekend, and Tuesday-Wednesday usually feels looser.",
    bestWindow: "Tue-Wed right at opening.",
    whyItWins:
      "A modern Mexican table with poise and product focus, without an overhyped feel.",
  },
  baldio: {
    district: "Condesa",
    neighborhoods: ["Condesa", "Cuauhtemoc"],
    cuisineLabel: "Zero-waste / vegetable-forward",
    bookingNote:
      "This is already a trend address, so reserve especially if you want the counter.",
    timingNote:
      "Dinner is tighter than lunch, and weekdays are the cleaner bet.",
    bestWindow: "Tue-Thu in the first half of service.",
    whyItWins:
      "A sharp read on the new CDMX wave: product-driven, modern, and unburdened by old fine-dining language.",
  },
  propio: {
    district: "Roma Norte",
    neighborhoods: ["Roma Norte", "Cuauhtemoc"],
    cuisineLabel: "Contemporary social dinner",
    bookingNote:
      "Demand is real, but you can still often land a table a few days out.",
    timingNote:
      "Weekend dinner is where pressure shows most clearly.",
    bestWindow: "Tue-Thu on an early dinner turn.",
    whyItWins:
      "A good contemporary option when the brief is a fashionable room and a broad, sharable menu.",
  },
  fugaz: {
    district: "Roma Norte",
    neighborhoods: ["Roma Norte", "Cuauhtemoc"],
    cuisineLabel: "Small-format authorial fusion",
    bookingNote:
      "The room is small enough that booking ahead is much smarter than gambling on a walk-in.",
    timingNote:
      "The compact dinner service is where the room pinches.",
    bestWindow: "Any weekday on the earliest turn.",
    whyItWins:
      "A compact table for diners hunting more intimate new openings instead of the obvious headline rooms.",
  },
  galea: {
    district: "Roma Norte",
    neighborhoods: ["Roma Norte", "Cuauhtemoc"],
    cuisineLabel: "Fine-dining Italian",
    bookingNote:
      "An easy table to plan in advance and a dependable backup when you want a pasta-forward dinner.",
    timingNote:
      "Evenings fill first, though weekday seats are still usually within reach.",
    bestWindow: "Mon-Thu between 14:00 and 18:00.",
    whyItWins:
      "The best pasta lane in this set when you need a break from Mexican cooking.",
  },
  tetetlan: {
    district: "Jardines del Pedregal",
    neighborhoods: ["Pedregal", "Alvaro Obregon"],
    cuisineLabel: "Architecture-led Mexican dining",
    bookingNote:
      "Reservations help most on weekends and for the prettiest daytime tables.",
    timingNote:
      "Weekend daytime traffic is where demand shows up most clearly.",
    bestWindow: "A late weekday breakfast or an early lunch.",
    whyItWins:
      "A strong choice when the brief is food plus architecture rather than dining-room theater alone.",
  },
};
