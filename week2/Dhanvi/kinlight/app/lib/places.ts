/*
  Where someone lives decides how their neighborhood looks: the style of home
  and the accent colors.

  Country comes from the saved city ("Mangalore, Karnataka, India"), which
  the add-person form gets from the geocoder, so it's always the last part.

  Colors: the 18 cultural palettes from ColorArchive
  (https://colorarchive.org/regions/). Countries without a palette use the
  original Kinlight village colors.
*/

export type HomeStyle =
  | "mangaluru"
  | "casita"
  | "machiya"
  | "riad"
  | "colonial"
  | "nubian"
  | "courtyard"
  | "hanok"
  | "shophouse"
  | "cycladic"
  | "villa"
  | "timber"
  | "turf"
  | "haussmann"
  | "terrace"
  | "thatch"
  | "konak"
  | "queenslander"
  | "cottage"
  | "farmhouse"
  | "aframe"
  | "apartment"
  | "tent";

export type Palette = {
  name: string;
  wall: string;
  roof: string;
  trim: string;
  door: string;
  accent: string;
  accent2: string;
  /** extra colors used for small decorations (bunting, flowers, lanterns) */
  extras: string[];
};

/** The land a home sits on, so neighborhoods don't all look like the same green hill. */
export type Ground = {
  name: string;
  hill: string;
  light: string;
  path: string;
  /** whether a little pond makes sense here */
  water: boolean;
};

type Region = { style: HomeStyle; palettes: Palette[]; ground: Ground };

const GROUNDS = {
  meadow: { name: "meadow", hill: "#b7cf7f", light: "#cadd98", path: "#f6e6cc", water: true },
  prairie: { name: "golden prairie", hill: "#dcc37e", light: "#e9d59c", path: "#f7ead2", water: true },
  autumn: { name: "autumn", hill: "#dba46a", light: "#e8bd8a", path: "#f6e2c6", water: true },
  clay: { name: "clay", hill: "#d6a68c", light: "#e4bda7", path: "#f6e4d6", water: true },
  laterite: { name: "red laterite", hill: "#cf8f63", light: "#dfa97f", path: "#b85a3e", water: true },
  desert: { name: "desert", hill: "#e3b87a", light: "#efcf9b", path: "#f8e7c8", water: false },
  dune: { name: "dune", hill: "#e6c47e", light: "#f1d89c", path: "#cdaa6c", water: false },
  moss: { name: "moss garden", hill: "#a9b47f", light: "#bdc69a", path: "#ebe6d8", water: true },
  terracotta: { name: "terracotta earth", hill: "#e0aa72", light: "#ecc293", path: "#c9714f", water: false },
  beach: { name: "beach", hill: "#efd39a", light: "#f7e4b8", path: "#fff4dc", water: true },
  stone: { name: "stone", hill: "#c9c3ad", light: "#dbd6c4", path: "#efebe0", water: true },
  hanji: { name: "earth", hill: "#cbbd93", light: "#ddd2b0", path: "#f1ead6", water: true },
  paddy: { name: "rice paddy", hill: "#c8c47a", light: "#dad79b", path: "#efe2bd", water: true },
  whiteRock: { name: "white rock", hill: "#e6dfcf", light: "#f3eee3", path: "#c9b89a", water: false },
  tuscan: { name: "tuscan field", hill: "#d8bf76", light: "#e7d296", path: "#f3e4c4", water: false },
  snow: { name: "snow", hill: "#e8eef0", light: "#ffffff", path: "#c6ccd1", water: false },
  lava: { name: "lava moss", hill: "#a3a88c", light: "#babea6", path: "#77706a", water: true },
  gravel: { name: "park gravel", hill: "#d6cdbb", light: "#e5dece", path: "#b6aa95", water: true },
  green: { name: "green", hill: "#9fbe7a", light: "#b4cf92", path: "#ece2cc", water: true },
  outback: { name: "red earth", hill: "#d38b5c", light: "#e2a678", path: "#f3d4ab", water: false },
} satisfies Record<string, Ground>;

/* Places without a regional palette get one of these, picked per person. */
const VILLAGE_GROUNDS: Ground[] = [GROUNDS.meadow, GROUNDS.prairie, GROUNDS.autumn, GROUNDS.clay];

/* Whimsical storybook colors for places without a regional palette:
   pinks, butter yellow, sky blue, lilac and mint, with tomato, teal and navy roofs. */
const VILLAGE: Palette[] = [
  { name: "Kinlight", wall: "#f7b9c8", roof: "#2f6f73", trim: "#fff4dc", door: "#3b4f8f", accent: "#f6cf71", accent2: "#9dcc84", extras: ["#f28aa8", "#f6cf71", "#7fc2dd"] },
  { name: "Kinlight", wall: "#a9d4ee", roof: "#e2574c", trim: "#fff4dc", door: "#2f4a3c", accent: "#f6cf71", accent2: "#f28aa8", extras: ["#e2574c", "#f6cf71", "#b49ce8"] },
  { name: "Kinlight", wall: "#f9d77e", roof: "#3b4f8f", trim: "#fff4dc", door: "#e2574c", accent: "#7fc2dd", accent2: "#9dcc84", extras: ["#3b4f8f", "#f28aa8", "#9dcc84"] },
  { name: "Kinlight", wall: "#cbbcf2", roof: "#f08a4b", trim: "#fff4dc", door: "#2f6f73", accent: "#f6cf71", accent2: "#f7b9c8", extras: ["#f08a4b", "#f6cf71", "#7fc2dd"] },
  { name: "Kinlight", wall: "#b5e3c8", roof: "#c74b5a", trim: "#fff4dc", door: "#3b4f8f", accent: "#f9d77e", accent2: "#f08a4b", extras: ["#c74b5a", "#f9d77e", "#cbbcf2"] },
  { name: "Kinlight", wall: "#f6c09f", roof: "#2f4a3c", trim: "#fff4dc", door: "#c74b5a", accent: "#f6cf71", accent2: "#7fc2dd", extras: ["#2f6f73", "#f6cf71", "#f28aa8"] },
];

const REGIONS: Record<string, Region> = {
  india: {
    ground: GROUNDS.laterite,
    style: "mangaluru",
    palettes: [{ name: "India", wall: "#F2A516", roof: "#D32F2F", trim: "#D32F2F", door: "#1B4F72", accent: "#E91E63", accent2: "#138808", extras: ["#FF9933", "#E91E63", "#C2185B", "#F2A516"] }],
  },
  mexico: {
    ground: GROUNDS.desert,
    style: "casita",
    palettes: [
      { name: "Mexico", wall: "#D77176", roof: "#A33340", trim: "#F4EBD0", door: "#2A52BE", accent: "#E4007C", accent2: "#FF8A1E", extras: ["#E4007C", "#FF8A1E", "#2A52BE", "#F4EBD0"] },
      { name: "Mexico", wall: "#2A52BE", roof: "#A33340", trim: "#F4EBD0", door: "#FF8A1E", accent: "#E4007C", accent2: "#D77176", extras: ["#E4007C", "#FF8A1E", "#D77176", "#F4EBD0"] },
    ],
  },
  japan: {
    ground: GROUNDS.moss,
    style: "machiya",
    palettes: [{ name: "Japan", wall: "#F4ECD8", roof: "#22366E", trim: "#A52821", door: "#1A1A1A", accent: "#D44A2C", accent2: "#FBC4D0", extras: ["#FBC4D0", "#D44A2C", "#22366E"] }],
  },
  morocco: {
    ground: GROUNDS.terracotta,
    style: "riad",
    palettes: [{ name: "Morocco", wall: "#C75B3D", roof: "#F2EAD3", trim: "#F2EAD3", door: "#6050DC", accent: "#F4C430", accent2: "#62A87C", extras: ["#7BAFD4", "#F4C430", "#62A87C", "#6050DC"] }],
  },
  brazil: {
    ground: GROUNDS.beach,
    style: "colonial",
    palettes: [{ name: "Brazil", wall: "#FFCC29", roof: "#B85B40", trim: "#002776", door: "#1B6D3F", accent: "#FF1B6B", accent2: "#E97132", extras: ["#FF1B6B", "#E97132", "#1B6D3F", "#3D1F4D"] }],
  },
  egypt: {
    ground: GROUNDS.dune,
    style: "nubian",
    palettes: [{ name: "Egypt", wall: "#C1A36F", roof: "#EDE0C8", trim: "#1F4287", door: "#3D9970", accent: "#FCC72E", accent2: "#A8201A", extras: ["#1F4287", "#FCC72E", "#A8201A", "#3D9970"] }],
  },
  china: {
    ground: GROUNDS.stone,
    style: "courtyard",
    palettes: [{ name: "China", wall: "#9CB48F", roof: "#1C1C1C", trim: "#C0392B", door: "#9B2335", accent: "#FFB300", accent2: "#5F9EA0", extras: ["#C0392B", "#FFB300", "#5F9EA0"] }],
  },
  korea: {
    ground: GROUNDS.hanji,
    style: "hanok",
    palettes: [{ name: "Korea", wall: "#EAE0CB", roof: "#1F1F1F", trim: "#C8242C", door: "#1E68C1", accent: "#F2C94C", accent2: "#7CA38E", extras: ["#1E68C1", "#C8242C", "#F2C94C", "#F5F5F2", "#1F1F1F"] }],
  },
  vietnam: {
    ground: GROUNDS.paddy,
    style: "shophouse",
    palettes: [{ name: "Vietnam", wall: "#E8B647", roof: "#A52A2A", trim: "#3F8B7E", door: "#5C3A21", accent: "#E94175", accent2: "#5F8D4E", extras: ["#E94175", "#D89B2E", "#A52A2A"] }],
  },
  greece: {
    ground: GROUNDS.whiteRock,
    style: "cycladic",
    palettes: [{ name: "Greece", wall: "#F8F4EE", roof: "#005EB8", trim: "#005EB8", door: "#005EB8", accent: "#C2185B", accent2: "#3E6B47", extras: ["#C2185B", "#9CA38F", "#B85B40"] }],
  },
  italy: {
    ground: GROUNDS.tuscan,
    style: "villa",
    palettes: [{ name: "Italy", wall: "#C68F58", roof: "#9C3E2E", trim: "#EDDFC6", door: "#722F37", accent: "#F3C220", accent2: "#3F5E47", extras: ["#F3C220", "#9C3E2E", "#3F5E47"] }],
  },
  scandinavia: {
    ground: GROUNDS.snow,
    style: "timber",
    palettes: [
      { name: "Scandinavia", wall: "#D03030", roof: "#A8AAA5", trim: "#F4F0EA", door: "#3D5B49", accent: "#D3A6A0", accent2: "#3D5B49", extras: ["#D3A6A0", "#A6CEDB", "#D5C7A7"] },
      { name: "Scandinavia", wall: "#D5C7A7", roof: "#3D5B49", trim: "#F4F0EA", door: "#D03030", accent: "#A6CEDB", accent2: "#3D5B49", extras: ["#D03030", "#D3A6A0", "#A6CEDB"] },
      { name: "Scandinavia", wall: "#A6CEDB", roof: "#A8AAA5", trim: "#F4F0EA", door: "#D03030", accent: "#D3A6A0", accent2: "#3D5B49", extras: ["#D03030", "#D5C7A7", "#D3A6A0"] },
    ],
  },
  iceland: {
    ground: GROUNDS.lava,
    style: "turf",
    palettes: [{ name: "Iceland", wall: "#E8DFCC", roof: "#9CA577", trim: "#1A1B1F", door: "#F75900", accent: "#75BBC1", accent2: "#F2AEB5", extras: ["#F2AEB5", "#75BBC1", "#7C5A3A"] }],
  },
  france: {
    ground: GROUNDS.gravel,
    style: "haussmann",
    palettes: [{ name: "France", wall: "#E5DDC8", roof: "#5E6566", trim: "#0A0A0A", door: "#5C2E2A", accent: "#FF7B00", accent2: "#002FA7", extras: ["#FF7B00", "#002FA7", "#7E8A93"] }],
  },
  england: {
    ground: GROUNDS.green,
    style: "terrace",
    palettes: [
      { name: "England", wall: "#9F4A3C", roof: "#0A2351", trim: "#F4F0EA", door: "#DC241F", accent: "#1C3F95", accent2: "#5C7A5A", extras: ["#DC241F", "#1C3F95", "#5C7A5A"] },
      { name: "England", wall: "#9F4A3C", roof: "#0A2351", trim: "#F4F0EA", door: "#1F4D2E", accent: "#DC241F", accent2: "#5C7A5A", extras: ["#DC241F", "#A4262C", "#5C7A5A"] },
    ],
  },
  ireland: {
    ground: GROUNDS.green,
    style: "thatch",
    palettes: [{ name: "Ireland", wall: "#F0E8D2", roof: "#604024", trim: "#5A6770", door: "#B4292B", accent: "#169B62", accent2: "#7C9A4C", extras: ["#169B62", "#B4292B", "#8DA48A"] }],
  },
  turkey: {
    ground: GROUNDS.terracotta,
    style: "konak",
    palettes: [{ name: "Turkey", wall: "#F0EBE0", roof: "#E30A17", trim: "#1E5599", door: "#4DA8AC", accent: "#D4AF37", accent2: "#C77D4D", extras: ["#1E5599", "#4DA8AC", "#D4AF37", "#E30A17"] }],
  },
  australia: {
    ground: GROUNDS.outback,
    style: "queenslander",
    palettes: [{ name: "Australia", wall: "#F2EFE1", roof: "#7EA08C", trim: "#3FBFB9", door: "#C9472B", accent: "#FF7E6F", accent2: "#8E895C", extras: ["#FF7E6F", "#3FBFB9", "#C9472B"] }],
  },
};

/* Country names as the geocoder returns them -> region key */
const COUNTRY_TO_REGION: Record<string, string> = {
  india: "india",
  mexico: "mexico",
  japan: "japan",
  morocco: "morocco",
  brazil: "brazil",
  egypt: "egypt",
  china: "china",
  "hong kong": "china",
  taiwan: "china",
  "south korea": "korea",
  korea: "korea",
  "republic of korea": "korea",
  vietnam: "vietnam",
  "viet nam": "vietnam",
  greece: "greece",
  italy: "italy",
  sweden: "scandinavia",
  norway: "scandinavia",
  denmark: "scandinavia",
  finland: "scandinavia",
  iceland: "iceland",
  france: "france",
  "united kingdom": "england",
  england: "england",
  scotland: "england",
  wales: "england",
  ireland: "ireland",
  turkey: "turkey",
  "türkiye": "turkey",
  turkiye: "turkey",
  australia: "australia",
};

/* Big cities get an apartment building instead of a house */
const BIG_CITIES = new Set([
  "chicago", "new york", "new york city", "manhattan", "brooklyn", "los angeles", "san francisco",
  "boston", "seattle", "philadelphia", "washington", "toronto", "vancouver", "singapore",
  "dubai", "berlin", "madrid", "barcelona", "amsterdam", "lagos", "nairobi", "cairo",
]);

const FRIEND_WORDS = /\b(friend|bestie|best friend|bff|buddy|pal|roommate|roomie|mate)\b/i;

export function hashString(value: string) {
  let seed = 2166136261;
  for (const character of value) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

/** Small seeded random generator so every person's scene stays the same between visits. */
export function seededRandom(value: string) {
  let seed = hashString(value);
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function countryFromCity(city?: string) {
  if (!city) return undefined;
  const parts = city.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : undefined;
}

export type PlaceLook = {
  style: HomeStyle;
  palette: Palette;
  ground: Ground;
  /** true when the colors come from a ColorArchive regional palette */
  regional: boolean;
};

export function placeLook(person: { id: string; city?: string; relationship?: string }): PlaceLook {
  const pick = hashString(person.id);
  const country = countryFromCity(person.city)?.toLowerCase();
  const regionKey = country ? COUNTRY_TO_REGION[country] : undefined;
  const region = regionKey ? REGIONS[regionKey] : undefined;
  const palette = region
    ? region.palettes[pick % region.palettes.length]
    : VILLAGE[pick % VILLAGE.length];

  let style: HomeStyle;
  if (person.relationship && FRIEND_WORDS.test(person.relationship)) {
    style = "tent"; // from the sketch: a tent instead of a house, for friends
  } else if (region) {
    style = region.style;
  } else {
    const cityName = person.city?.split(",")[0].trim().toLowerCase() ?? "";
    style = BIG_CITIES.has(cityName)
      ? "apartment"
      : (["cottage", "farmhouse", "aframe"] as const)[(pick >>> 4) % 3];
  }

  const ground = region ? region.ground : VILLAGE_GROUNDS[(pick >>> 8) % VILLAGE_GROUNDS.length];

  return { style, palette, ground, regional: Boolean(region) };
}
