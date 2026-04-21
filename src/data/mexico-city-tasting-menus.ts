import type {
  RawRestaurant,
  RestaurantGalleryImage,
  RestaurantImageAsset,
  RestaurantMenuItem,
  TastingMenuDish,
  TastingMenuDishPhoto,
  TastingMenuVariation,
  TastingMenuVariationConfidence,
} from "@/lib/restaurant-types";

type PhotoUrlSeed = {
  url: string;
  sourceUrl?: string;
};

type TastingMenuDishSeed = {
  id: string;
  courseLabel?: string;
  name: string;
  description?: string;
  photoUrls?: PhotoUrlSeed[];
  menuPhotoHints?: string[];
  galleryPhotoIndices?: number[];
};

type TastingMenuVariationSeed = {
  slug: string;
  id: string;
  formatLabel: string;
  name: string;
  seasonLabel: string;
  summary: string;
  price?: string;
  sourceLabel: string;
  sourceUrl: string;
  confidence: TastingMenuVariationConfidence;
  dishes: TastingMenuDishSeed[];
};

const QUINTONIL_WINTER_2024_PHOTOS = {
  butternut:
    "https://cdn.enprimeurclub.com/storage/v1/object/public/epclub-site-assets/blog-inline/878ffe_71b062d2cbfd46c3a98f40d469d3f8dd-mv2.jpg",
  tuna:
    "https://cdn.enprimeurclub.com/storage/v1/object/public/epclub-site-assets/blog-inline/878ffe_30810c85d5564c6fb00ec19b9c666443-mv2.jpg",
  lobster:
    "https://cdn.enprimeurclub.com/storage/v1/object/public/epclub-site-assets/blog-inline/878ffe_cf440ebb48844cef934b782cb1e223cb-mv2.jpg",
  duck:
    "https://cdn.enprimeurclub.com/storage/v1/object/public/epclub-site-assets/blog-inline/878ffe_4837132f15d249f48c5b83bdfd33c9cf-mv2.jpg",
  entomophagy:
    "https://cdn.enprimeurclub.com/storage/v1/object/public/epclub-site-assets/blog-inline/878ffe_cb7b55bb62ca4774b1078c0ba772a4c6-mv2.jpg",
  ribEye:
    "https://cdn.enprimeurclub.com/storage/v1/object/public/epclub-site-assets/blog-inline/878ffe_ee9f88b14e994f2e83bd55f6ada171f9-mv2.jpg",
  nopal:
    "https://cdn.enprimeurclub.com/storage/v1/object/public/epclub-site-assets/blog-inline/878ffe_ac6236d0bb034cac906aea30f9876c73-mv2.jpg",
  coconut:
    "https://cdn.enprimeurclub.com/storage/v1/object/public/epclub-site-assets/blog-inline/878ffe_5fba58b3e06f478d881e3ac5dda9a9bb-mv2.jpg",
  mignardises:
    "https://cdn.enprimeurclub.com/storage/v1/object/public/epclub-site-assets/blog-inline/878ffe_ab5d374e9e8b4fb2933be053570ba510-mv2.jpg",
} as const;

const MEXICO_CITY_TASTING_MENU_SEEDS: TastingMenuVariationSeed[] = [
  {
    slug: "pujol",
    id: "pujol-dining-room-current",
    formatLabel: "Dining room tasting",
    name: "Restaurant tasting menu",
    seasonLabel: "Current menu / rotates every 4 months",
    summary:
      "The current dining-room format keeps the Pujol structure compact: choice-driven savory stages, the signature mole, and a dessert decision at the end.",
    sourceLabel: "Pujol official menu",
    sourceUrl: "https://pujol.com.mx/eng/acerca-de-2/",
    confidence: "official-current",
    dishes: [
      {
        id: "cold-opener",
        courseLabel: "Cold opener",
        name: "Choice of cold opener",
        description:
          "Lobster and sea snail cold soup with Yucatecan lime, or malanga and beet carpaccio with buckwheat tabbouleh, cracked corn, jicama, and chaya leaf.",
        menuPhotoHints: ["true crabs", "cucumber"],
      },
      {
        id: "second-course",
        courseLabel: "Second course",
        name: "Choice of second course",
        description:
          "Mayan octopus and criollo pork with pico de gallo and heirloom avocado, or carrot and chipilin steamed tamal.",
        menuPhotoHints: ["true crabs"],
      },
      {
        id: "main-course",
        courseLabel: "Main choice",
        name: "Choice of main course",
        description:
          "Fish mone in white recado beurre blanc; Durango Wagyu in black recado with xnipec and quail egg; or plantain escalope cooked in rescoldo with pink pine-nut sikil pak.",
      },
      {
        id: "mole",
        courseLabel: "Signature",
        name: "Mole madre, mole de Simojovel",
      },
      {
        id: "dessert",
        courseLabel: "Dessert choice",
        name: "Choice of dessert",
        description:
          "Pumpkin-seed financier with criollo cacao ice cream, or papaya in tacha with Melipona honey and yogurt.",
        menuPhotoHints: ["panna cotta", "churro"],
      },
    ],
  },
  {
    slug: "pujol",
    id: "pujol-taco-omakase-current",
    formatLabel: "Taco omakase",
    name: "Barra de tacos",
    seasonLabel: "Current menu",
    summary:
      "The taco counter runs as a fixed omakase sequence built around regional corn and a closing mole course.",
    sourceLabel: "Pujol official menu",
    sourceUrl: "https://pujol.com.mx/eng/acerca-de-2/",
    confidence: "official-current",
    dishes: [
      {
        id: "ant-roe",
        courseLabel: "Opening",
        name: "Ant roe salbute",
        description: "Miltomate sikil pak.",
      },
      {
        id: "baby-corn",
        courseLabel: "Snack",
        name: "Baby corn",
        description: "Roasted garlic mayonnaise and queso de bola.",
        menuPhotoHints: ["cucumber"],
      },
      {
        id: "pickled-snail",
        courseLabel: "Tostada",
        name: "Pickled snail tostada",
        description: "Jicama and lime kosho.",
      },
      {
        id: "grilled-octopus",
        courseLabel: "Taco",
        name: "Grilled octopus taco",
        description: "Chile guero.",
      },
      {
        id: "fish-taco",
        courseLabel: "Taco",
        name: "Fish taco in white recado",
      },
      {
        id: "soft-shell-crab",
        courseLabel: "Taco",
        name: "Soft-shell crab taco",
        description: "Longaniza de Valladolid.",
        menuPhotoHints: ["true crabs"],
      },
      {
        id: "castacan",
        courseLabel: "Taco",
        name: "Castacan taco",
        description: "Charred avocado and xnipec.",
      },
      {
        id: "mole-madre",
        courseLabel: "Signature",
        name: "Mole madre",
      },
      {
        id: "lima-flan",
        courseLabel: "Dessert",
        name: "Yucatecan lima flan",
        menuPhotoHints: ["panna cotta"],
      },
    ],
  },
  {
    slug: "quintonil",
    id: "quintonil-march-2026",
    formatLabel: "Chef's menu",
    name: "Our Mexico",
    seasonLabel: "March 2026",
    summary:
      "The current Quintonil progression leans into structured opening bites, a greener seafood run, cactus sorbet, and a split main-course finish.",
    price: "MX$5,900",
    sourceLabel: "Quintonil official site",
    sourceUrl: "https://quintonil.com/en/home-3/",
    confidence: "official-current",
    dishes: [
      {
        id: "opening-trio",
        courseLabel: "Opening trio",
        name: "Tuna pescadilla, mussel tostada, fried escamoles",
        description:
          "Lacto-fermented mushrooms and chapulin chintextle; mole de mar with charred onion reduction and chipotle; tomato caldillo and guajillo.",
        menuPhotoHints: ["tostada"],
      },
      {
        id: "lettuces",
        courseLabel: "Vegetable course",
        name: "Lettuces from Tepotzotlan",
        description: "Sikil pak, Cuadro cheese, and celeriac bushi.",
      },
      {
        id: "kampachi",
        courseLabel: "Seafood",
        name: "Kampachi in aguachile a la veracruzana",
        description: "Caper salt and pickled vegetables.",
      },
      {
        id: "steelhead",
        courseLabel: "Seafood",
        name: "Steelhead trout from Baja California",
        description: "Chicatana adobo and hen of the woods pickled in fig leaf.",
      },
      {
        id: "cactus-sorbet",
        courseLabel: "Cleanser",
        name: "Cactus paddle sorbet",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.nopal }],
      },
      {
        id: "pibil-pork",
        courseLabel: "Corn course",
        name: "Pibil pork tamal",
        description: "Young corn cream.",
      },
      {
        id: "rib-eye",
        courseLabel: "Main choice",
        name: "Rib eye en su jugo",
        description: "Pico de gallo and pinto beans from Sinaloa.",
      },
      {
        id: "roasted-duck",
        courseLabel: "Main choice",
        name: "Roasted duck",
        description: "Coconut manchamanteles mole and beet reduction.",
      },
      {
        id: "honey-ice-cream",
        courseLabel: "Dessert",
        name: "Melipona bee honey ice cream",
        description: "Papaya, lavender marmalade, and caviar.",
        menuPhotoHints: ["caviar"],
      },
      {
        id: "ataulfo-mango",
        courseLabel: "Dessert",
        name: "Ataulfo mango",
        description: "Coconut yogurt and sweet seaweed.",
        menuPhotoHints: ["mango"],
      },
      {
        id: "dulces",
        courseLabel: "Finish",
        name: "Dulces mexicanos",
      },
    ],
  },
  {
    slug: "quintonil",
    id: "quintonil-march-2025",
    formatLabel: "Chef's menu",
    name: "Chef's menu",
    seasonLabel: "March 2025",
    summary:
      "The March 2025 menu stacked a larger opening set before moving into vegetable, seafood, corn, mole, and dessert courses.",
    price: "MX$4,950",
    sourceLabel: "Quintonil official PDF",
    sourceUrl:
      "https://quintonil.com/wp-content/uploads/2025/03/MENU-DEL-CHEF-CON-ALERGENOS-ENG.pdf",
    confidence: "official-archive",
    dishes: [
      {
        id: "opening-set",
        courseLabel: "Opening set",
        name: "Chileatole, kampachi taco, avocado tartare tostada, mussel tartlet",
        description:
          "Huitlacoche and herbs; lacto-fermented chanterelles and almendrado yucateco; escamoles; and mole de mar.",
        menuPhotoHints: ["tostada"],
      },
      {
        id: "butternut",
        courseLabel: "Vegetable course",
        name: "Butternut squash and tomato salad",
        description: "Rice horchata and pumpkin seeds.",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.butternut }],
      },
      {
        id: "stone-crab",
        courseLabel: "Seafood",
        name: "Stone crab in pipian verde",
        description:
          "Sunflower seeds, makrut lime, Thai basil, and blue corn tostadas.",
      },
      {
        id: "bluefin",
        courseLabel: "Seafood",
        name: "Bluefin tuna",
        description:
          "Brassica aguachile, wasabi ice cream, pickled watermelon radish, and mustard leaves.",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.tuna }],
      },
      {
        id: "tuna-belly",
        courseLabel: "Corn course",
        name: "Grilled tuna belly sope",
        description: "Grasshopper adobo, red corn segueza, and chicatana ant.",
      },
      {
        id: "cactus-sorbet",
        courseLabel: "Cleanser",
        name: "Cactus paddle sorbet",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.nopal }],
      },
      {
        id: "duck-tamal",
        courseLabel: "Corn course",
        name: "Pibil duck tamal",
        description: "Young corn cream.",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.duck }],
      },
      {
        id: "rib-eye",
        courseLabel: "Main",
        name: "Chichilo negro rib eye from Tequisquiapan",
        description: "Huitlacoche garum and chorizo with cocopache.",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.ribEye }],
      },
      {
        id: "coconut-sorbet",
        courseLabel: "Dessert",
        name: "Coconut sorbet",
        description: "Plankton, physalis, and caviar.",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.coconut }],
      },
      {
        id: "cornbread",
        courseLabel: "Dessert",
        name: "Mexican cornbread",
        description:
          "Rompope de nixtamal, vanilla from Chichicaxtle, Veracruz, and passion fruit.",
      },
      {
        id: "mignardises",
        courseLabel: "Finish",
        name: "Mignardises",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.mignardises }],
      },
    ],
  },
  {
    slug: "quintonil",
    id: "quintonil-winter-2024",
    formatLabel: "Chef's menu",
    name: "Winter 2024 edition",
    seasonLabel: "Winter 2024",
    summary:
      "A documented winter run with one of Quintonil's clearest seasonal arcs: squash, bluefin, lobster, duck tamal, insects, rib eye, cactus sorbet, and the caviar dessert.",
    sourceLabel: "En Primeur Club review",
    sourceUrl:
      "https://www.enprimeurclub.com/guide/quintonil-mexico-city-s-modern-mexican-masterpiece",
    confidence: "reported-archive",
    dishes: [
      {
        id: "butternut",
        courseLabel: "1",
        name: "Butternut squash and tomato salad",
        description: "Rice horchata dressing and toasted pumpkin seeds.",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.butternut }],
      },
      {
        id: "bluefin",
        courseLabel: "2",
        name: "Bluefin tuna",
        description:
          "Brassica aguachile, wasabi ice cream, pickled watermelon radish, and mustard leaves.",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.tuna }],
      },
      {
        id: "lobster",
        courseLabel: "3",
        name: "Red lobster from Baja California",
        description: "Chilhuacle rojo, orange gastrique, and cauliflower cream.",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.lobster }],
      },
      {
        id: "duck-tamal",
        courseLabel: "4",
        name: "Duck pibil tamal",
        description: "Young corn cream.",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.duck }],
      },
      {
        id: "entomophagy",
        courseLabel: "5",
        name: "Entomophagy Festival",
        description:
          "A spread of insect preparations served with red corn segueza and heirloom tortillas.",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.entomophagy }],
      },
      {
        id: "rib-eye",
        courseLabel: "6",
        name: "Dry-aged rib eye",
        description:
          "Chichilo negro mole and a huitlacoche-charred vegetable pico de gallo.",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.ribEye }],
      },
      {
        id: "nopal",
        courseLabel: "7",
        name: "Nopal cactus sorbet",
        description: "A palate cleanser built around cactus paddle.",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.nopal }],
      },
      {
        id: "coconut",
        courseLabel: "8",
        name: "Coconut sorbet",
        description: "Marine plankton, physalis, and caviar.",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.coconut }],
      },
      {
        id: "mignardises",
        courseLabel: "9",
        name: "Mignardises",
        photoUrls: [{ url: QUINTONIL_WINTER_2024_PHOTOS.mignardises }],
      },
    ],
  },
  {
    slug: "maximo",
    id: "maximo-april-2026",
    formatLabel: "Tasting menu",
    name: "Current tasting menu",
    seasonLabel: "April 18, 2026",
    summary:
      "The latest published Maximo tasting runs through tartlet, tostada, aguachile, ravioli, kingfish, Wagyu rib eye, sorbet, and chocolate.",
    price: "MX$3,200",
    sourceLabel: "Maximo official menu",
    sourceUrl: "https://www.maximobistrot.com.mx/en/menu/",
    confidence: "official-current",
    dishes: [
      {
        id: "beet-tartlet",
        courseLabel: "1",
        name: "Beet and borage tartlet",
      },
      {
        id: "escamoles-tostada",
        courseLabel: "2",
        name: "Escamoles and guacasalsa tostada",
      },
      {
        id: "scallops",
        courseLabel: "3",
        name: "Penshell scallops aguachile",
        menuPhotoHints: ["ceviche", "oyster"],
      },
      {
        id: "ravioli",
        courseLabel: "4",
        name: "Ricotta cheese and lemon ravioli",
        menuPhotoHints: ["ravioli", "pappardelle"],
      },
      {
        id: "kingfish",
        courseLabel: "5",
        name: "Seared kingfish",
        description: "Tomato, caper, and bouillabaisse.",
        menuPhotoHints: ["sea bass"],
      },
      {
        id: "rib-eye",
        courseLabel: "6",
        name: "Wood-grilled Wagyu Cross rib eye",
        menuPhotoHints: ["venison", "hamburger"],
      },
      {
        id: "cucumber-sorbet",
        courseLabel: "7",
        name: "Cucumber and Granny Smith apple sorbet",
      },
      {
        id: "chocolate",
        courseLabel: "8",
        name: "Chocolate souffle tart",
        description: "Olive oil ice cream.",
        menuPhotoHints: ["chocolate cake", "cake"],
      },
    ],
  },
  {
    slug: "maximo",
    id: "maximo-may-2025",
    formatLabel: "Tasting menu",
    name: "Late-spring tasting menu",
    seasonLabel: "May 31, 2025",
    summary:
      "The late-spring 2025 cut leaned more heavily into dashi, tostada, grilled fish, Wagyu, and a tropical frozen dessert.",
    price: "MX$2,800",
    sourceLabel: "Maximo official PDF",
    sourceUrl:
      "https://www.maximobistrot.com.mx/wp-content/uploads/2025/05/Menu-Web-31-Mayo_2025.pdf",
    confidence: "official-archive",
    dishes: [
      {
        id: "beet-tartlet",
        courseLabel: "1",
        name: "Beet tartar tartlet and guacamole",
      },
      {
        id: "fish-dashi",
        courseLabel: "2",
        name: "Smoked fish dashi",
        description: "Tempura shiso and kampachi.",
        menuPhotoHints: ["sea bass"],
      },
      {
        id: "infladita",
        courseLabel: "3",
        name: "Wheat infladita",
        description: "Onion and Comte.",
      },
      {
        id: "salmon-tostada",
        courseLabel: "4",
        name: "Smoked salmon tostada",
        menuPhotoHints: ["ceviche"],
      },
      {
        id: "rockot",
        courseLabel: "5",
        name: "Seared rockot",
        description: "Beurre blanc sauce.",
        menuPhotoHints: ["sea bass"],
      },
      {
        id: "wagyu-strip",
        courseLabel: "6",
        name: "Wagyu Cross New York strip",
        description: "Homemade mole.",
        menuPhotoHints: ["venison", "hamburger"],
      },
      {
        id: "mango-pina",
        courseLabel: "7",
        name: "\"Mango pina\" and wakame popsicle",
      },
      {
        id: "chocolate",
        courseLabel: "8",
        name: "Chocolate souffle tart",
        description: "Olive oil ice cream.",
        menuPhotoHints: ["chocolate cake", "cake"],
      },
    ],
  },
  {
    slug: "maximo",
    id: "maximo-january-2025",
    formatLabel: "Tasting menu",
    name: "Winter tasting menu",
    seasonLabel: "January 11, 2025",
    summary:
      "The January 2025 version ran long and luxurious, with dashi, tostada, caviar bread, angolotti, Wagyu, truffle ice cream, and a closing flan.",
    price: "MX$3,850",
    sourceLabel: "Maximo official PDF",
    sourceUrl:
      "https://www.maximobistrot.com.mx/wp-content/uploads/2025/01/Menu-Web-11-Enero_2025.pdf",
    confidence: "official-archive",
    dishes: [
      {
        id: "fish-dashi",
        courseLabel: "1",
        name: "Smoked fish dashi",
        description: "Pico de gallo.",
        menuPhotoHints: ["sea bass"],
      },
      {
        id: "beet-tartlet",
        courseLabel: "2",
        name: "Beet tartar tartlet",
        description: "Borage, pomegranate, and caviar.",
      },
      {
        id: "infladita",
        courseLabel: "3",
        name: "Wheat infladita",
        description: "Onion and Comte.",
      },
      {
        id: "kampachi",
        courseLabel: "4",
        name: "Tempura shiso, kampachi, and dashi",
        menuPhotoHints: ["sea bass"],
      },
      {
        id: "abalone",
        courseLabel: "5",
        name: "Abalone tostada",
        menuPhotoHints: ["oyster", "ceviche"],
      },
      {
        id: "plantain-caviar",
        courseLabel: "6",
        name: "Plantain bread with caviar",
      },
      {
        id: "angolotti",
        courseLabel: "7",
        name: "Sweet potato angolotti and ricotta",
        menuPhotoHints: ["ravioli", "pappardelle"],
      },
      {
        id: "wagyu-strip",
        courseLabel: "8",
        name: "Wagyu Cross New York strip",
        menuPhotoHints: ["venison", "hamburger"],
      },
      {
        id: "truffle-ice-cream",
        courseLabel: "9",
        name: "Truffle ice cream and milk cracker",
      },
      {
        id: "flan",
        courseLabel: "10",
        name: "Vanilla and caviar flan",
      },
    ],
  },
  {
    slug: "bajel",
    id: "bajel-march-2026",
    formatLabel: "Tasting menu",
    name: "Clarity and depth / purity and refinement",
    seasonLabel: "Last updated March 29, 2026",
    summary:
      "OpenTable's current Bajel menu shows a full ten-course format that moves from tomato water jelly to a double-dessert finish.",
    sourceLabel: "OpenTable menu",
    sourceUrl: "https://www.opentable.com/r/bajel-at-sofitel-ciudad-de-mexico",
    confidence: "platform-current",
    dishes: [
      {
        id: "tomato-water",
        courseLabel: "Amuse",
        name: "Tomato water jelly",
        description: "Herbs and flowers.",
      },
      {
        id: "caesar-salad",
        courseLabel: "1",
        name: "Caesar salad",
      },
      {
        id: "scallop",
        courseLabel: "2",
        name: "Scallop with watercress sauce",
        description: "Mussel dressing and pickled Granny Smith apple.",
      },
      {
        id: "octopus",
        courseLabel: "3",
        name: "Octopus with grasshopper chintextle",
        description: "Pineapple and epazote oil.",
      },
      {
        id: "frog-leg",
        courseLabel: "4",
        name: "Frog leg",
        description: "Parsley pipian verde and caramelized pumpkin seeds.",
      },
      {
        id: "tilefish",
        courseLabel: "5",
        name: "Tilefish",
        description: "Peas and lemon sabayon.",
      },
      {
        id: "suckling-pig",
        courseLabel: "6",
        name: "Confit suckling pig",
        description: "Artichoke puree and artichokes in escabeche.",
      },
      {
        id: "beef-tenderloin",
        courseLabel: "7",
        name: "Beef tenderloin",
        description: "Swiss chard roll, potato puree, and Swiss chard pesto.",
      },
      {
        id: "beet-ravioli",
        courseLabel: "8",
        name: "Beet ravioli",
        description: "Goat cheese, fennel oil, yogurt, and blueberry jam.",
      },
      {
        id: "milk-skin-crepe",
        courseLabel: "9",
        name: "Milk skin crepe",
        description: "Strawberries.",
        menuPhotoHints: ["dulce de leche"],
      },
      {
        id: "milk-chocolate",
        courseLabel: "10",
        name: "Milk chocolate",
        description: "Peanut, caramel, blackberry, and chocolate ice cream cone.",
        menuPhotoHints: ["chocolate"],
      },
    ],
  },
  {
    slug: "baldio",
    id: "baldio-current",
    formatLabel: "Baldio experience",
    name: "Tasting menu + pairing",
    seasonLabel: "Current menu",
    summary:
      "Baldio's zero-waste tasting experience is a smaller-format run built around ceviche, soup, taco, enmolada, tamal, and a nostalgic dessert finish.",
    price: "MX$1,900",
    sourceLabel: "Baldio official food page",
    sourceUrl: "https://www.baldio.mx/en/food/",
    confidence: "official-current",
    dishes: [
      {
        id: "trout-ceviche",
        courseLabel: "1",
        name: "Trout ceviche",
        description: "Mango.",
      },
      {
        id: "huitlacoche-soup",
        courseLabel: "2",
        name: "Huitlacoche and setas soup",
      },
      {
        id: "beef-taco",
        courseLabel: "3",
        name: "Grilled beef taco",
        description: "Guacamole and fried chayotextles.",
      },
      {
        id: "insect-enmolada",
        courseLabel: "4",
        name: "Insect enmolada",
        description: "Longaniza.",
      },
      {
        id: "colado-tamal",
        courseLabel: "5",
        name: "Colado tamal",
        description: "Coconita beans.",
        menuPhotoHints: ["sourdough"],
      },
      {
        id: "strawberries",
        courseLabel: "6",
        name: "Strawberries with cream",
        description: "Marranito cookie, cacao popsicle, and capulin liqueur.",
      },
    ],
  },
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildImageAssetFromUrl(url: string, key: string): RestaurantImageAsset {
  return {
    key,
    url,
    mediumUrl: url,
    smallUrl: url,
  };
}

function buildPhotoFromMenuItem(
  restaurant: RawRestaurant,
  dishId: string,
  item: RestaurantMenuItem,
): TastingMenuDishPhoto | null {
  if (!item.image) {
    return null;
  }

  return {
    id: `${restaurant.slug}-${dishId}-${item.id}`,
    sourceUrl: item.captionURL ?? restaurant.sourceUrl,
    image: item.image,
  };
}

function buildPhotoFromGallery(
  restaurant: RawRestaurant,
  dishId: string,
  galleryImage: RestaurantGalleryImage,
  index: number,
): TastingMenuDishPhoto {
  return {
    id: `${restaurant.slug}-${dishId}-gallery-${index}`,
    sourceUrl: restaurant.sourceUrl,
    image: {
      key: galleryImage.key,
      url: galleryImage.url,
      mediumUrl: galleryImage.mediumUrl,
      smallUrl: galleryImage.smallUrl,
    },
  };
}

function buildRemotePhoto(
  restaurant: RawRestaurant,
  dishId: string,
  photoUrl: PhotoUrlSeed,
  index: number,
): TastingMenuDishPhoto {
  return {
    id: `${restaurant.slug}-${dishId}-remote-${index}`,
    sourceUrl: photoUrl.sourceUrl ?? null,
    image: buildImageAssetFromUrl(
      photoUrl.url,
      `${restaurant.slug}-${dishId}-remote-${index}`,
    ),
  };
}

function scoreMenuItem(item: RestaurantMenuItem, normalizedHints: string[]) {
  const normalizedName = normalizeText(item.name);

  return normalizedHints.reduce((score, hint) => {
    if (!hint) {
      return score;
    }

    if (normalizedName === hint) {
      return score + 4;
    }

    if (normalizedName.includes(hint)) {
      return score + 2;
    }

    return score;
  }, 0);
}

function resolveMenuPhoto(
  restaurant: RawRestaurant,
  dishId: string,
  hints: string[],
): TastingMenuDishPhoto[] {
  const normalizedHints = hints.map(normalizeText).filter(Boolean);

  if (normalizedHints.length === 0) {
    return [];
  }

  let bestMatch: RestaurantMenuItem | null = null;
  let bestScore = 0;

  for (const item of restaurant.menuItems) {
    if (!item.image) {
      continue;
    }

    const score = scoreMenuItem(item, normalizedHints);

    if (score > bestScore) {
      bestMatch = item;
      bestScore = score;
    }
  }

  const photo = bestMatch ? buildPhotoFromMenuItem(restaurant, dishId, bestMatch) : null;
  return photo ? [photo] : [];
}

function buildDishPhotos(
  restaurant: RawRestaurant,
  dish: TastingMenuDishSeed,
): TastingMenuDishPhoto[] {
  const photos: TastingMenuDishPhoto[] = [];
  const seen = new Set<string>();

  for (const [index, photoUrl] of (dish.photoUrls ?? []).entries()) {
    const photo = buildRemotePhoto(restaurant, dish.id, photoUrl, index);

    if (seen.has(photo.image.url)) {
      continue;
    }

    seen.add(photo.image.url);
    photos.push(photo);
  }

  for (const photo of resolveMenuPhoto(restaurant, dish.id, dish.menuPhotoHints ?? [])) {
    if (seen.has(photo.image.url)) {
      continue;
    }

    seen.add(photo.image.url);
    photos.push(photo);
  }

  for (const galleryIndex of dish.galleryPhotoIndices ?? []) {
    const galleryImage = restaurant.gallery[galleryIndex];

    if (!galleryImage || seen.has(galleryImage.url)) {
      continue;
    }

    seen.add(galleryImage.url);
    photos.push(
      buildPhotoFromGallery(restaurant, dish.id, galleryImage, galleryIndex),
    );
  }

  return photos;
}

function buildDish(
  restaurant: RawRestaurant,
  dish: TastingMenuDishSeed,
): TastingMenuDish {
  return {
    id: `${restaurant.slug}-${dish.id}`,
    courseLabel: dish.courseLabel ?? null,
    name: dish.name,
    description: dish.description ?? null,
    photos: buildDishPhotos(restaurant, dish),
  };
}

function buildVariation(
  restaurant: RawRestaurant,
  seed: TastingMenuVariationSeed,
): TastingMenuVariation {
  return {
    id: `${restaurant.slug}-${seed.id}`,
    formatLabel: seed.formatLabel,
    name: seed.name,
    seasonLabel: seed.seasonLabel,
    summary: seed.summary,
    price: seed.price ?? null,
    sourceLabel: seed.sourceLabel,
    sourceUrl: seed.sourceUrl,
    confidence: seed.confidence,
    dishes: seed.dishes.map((dish) => buildDish(restaurant, dish)),
  };
}

export function buildMexicoCityTastingMenus(
  restaurants: RawRestaurant[],
): Record<string, TastingMenuVariation[]> {
  const restaurantMap = new Map(restaurants.map((restaurant) => [restaurant.slug, restaurant]));
  const tastingMenus = new Map<string, TastingMenuVariation[]>();

  for (const seed of MEXICO_CITY_TASTING_MENU_SEEDS) {
    const restaurant = restaurantMap.get(seed.slug);

    if (!restaurant) {
      continue;
    }

    const existing = tastingMenus.get(seed.slug) ?? [];
    existing.push(buildVariation(restaurant, seed));
    tastingMenus.set(seed.slug, existing);
  }

  return Object.fromEntries(tastingMenus);
}
