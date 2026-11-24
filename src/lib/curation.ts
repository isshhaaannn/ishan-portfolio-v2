// Groups work by who it was made for (how buyers think), instead of by medium.
// To place a new project, add its folder_name to one of the lists below.

export const BUYERS = [
  "Founder brands",
  "Media & podcasts",
  "Startups & tech",
  "Consumer brands",
] as const;

export type Buyer = (typeof BUYERS)[number];

const BY_FOLDER: Record<string, Buyer> = {
  // Founder brands: people building in public
  "Steven Bartlett": "Founder brands",
  "Arthur Brooks": "Founder brands",
  "Chris Goode": "Founder brands",
  christian: "Founder brands",
  "Kane Kallaway": "Founder brands",
  "Nik Stewart": "Founder brands",
  "BYL Ventures": "Founder brands",
  Bizzie: "Founder brands",
  // Media & podcasts
  "Daily Mail": "Media & podcasts",
  MetroMedia: "Media & podcasts",
  "EUVC Posters": "Media & podcasts",
  "EUVC Thumbnails": "Media & podcasts",
  "Reel Covers 1": "Media & podcasts",
  Banners: "Media & podcasts",
  // Startups & tech
  Berribot: "Startups & tech",
  "SeeIT AI Glasses": "Startups & tech",
  "Journey Club": "Startups & tech",
  "Journey Club Rebrand(Pitch)": "Startups & tech",
  Passion: "Startups & tech",
  "Passion Carousels": "Startups & tech",
  "Terribly Creative": "Startups & tech",
  // Consumer brands
  Firi: "Consumer brands",
  "Wild Oak Jeans": "Consumer brands",
  "Kelme India": "Consumer brands",
  Packagefolio: "Consumer brands",
  JerseyFolio: "Consumer brands",
};

/** Folders kept out of the grid; the wallpaper packs live in the hidden freebie instead. */
const FREEBIE_FOLDERS = new Set(["iPhone", "PC"]);

type RawProject = { folder_name?: string; category_display: string; asset_locations: string[] };

export function buyerOf(p: RawProject): Buyer {
  return (p.folder_name && BY_FOLDER[p.folder_name]) || "Startups & tech";
}

export function isFreebie(p: RawProject) {
  return !!p.folder_name && FREEBIE_FOLDERS.has(p.folder_name);
}

/** Server-side: split the database into portfolio work (with a buyer tag) and freebie images. */
export function curate<T extends RawProject>(all: T[]) {
  const work = all.filter((p) => !isFreebie(p)).map((p) => ({ ...p, buyer: buyerOf(p) }));
  const freebies = all.filter(isFreebie).flatMap((p) => p.asset_locations);
  return { work, freebies };
}
