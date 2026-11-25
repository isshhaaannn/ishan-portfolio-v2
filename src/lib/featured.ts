// The 3–5 highlighted case studies. Each gathers work from existing projects.
// Fill in `thinking` (the marketing thinking) and `idea` (the artistic idea) in your
// own words — empty fields are simply not shown. `result` only uses confirmed numbers.

export type CaseStudy = {
  id: string;
  name: string;
  brief: string;
  thinking: string;
  idea: string;
  result: string;
  /** Project ids whose assets make up the case, in order. */
  from: string[];
  /** Max assets to show from the combined list. */
  limit?: number;
};

export const FEATURED: CaseStudy[] = [
  {
    id: "CASE-sb",
    name: "Steven Bartlett",
    brief: "Instagram carousels for The Diary of a CEO, built from long-form conversations.",
    thinking: "",
    idea: "",
    result: "5M+ views on the carousels.",
    from: ["ITEM-076", "ITEM-075", "ITEM-077", "ITEM-078"],
    limit: 18,
  },
  {
    id: "CASE-dm",
    name: "Daily Mail",
    brief: "Creator-economy carousels for dmg newmedia, including a trading-card series for the team.",
    thinking: "",
    idea: "",
    result: "",
    from: ["ITEM-028", "ITEM-026", "ITEM-027", "ITEM-029", "ITEM-025"],
    limit: 18,
  },
  {
    id: "CASE-mmh",
    name: "Metro Media House",
    brief: "Thirty-plus editorial carousel series on taste, creativity and culture, each with its own look.",
    thinking: "",
    idea: "",
    result: "2M+ views and 1–2M engagements.",
    from: ["ITEM-054", "ITEM-052", "ITEM-068", "ITEM-057", "ITEM-043", "ITEM-038"],
    limit: 24,
  },
  {
    id: "CASE-pod",
    name: "Podcast thumbnails",
    brief: "YouTube thumbnails for My First Million, The Generalist and The Knowledge Project.",
    thinking: "",
    idea: "",
    result: "",
    from: ["XP-001", "XP-002", "XP-003"],
  },
  {
    id: "CASE-gul",
    name: "Gulnar",
    brief: "Identity explorations and a 30-second launch film for Gulnar by Vriksh Valley.",
    thinking: "",
    idea: "",
    result: "",
    from: ["XP-004"],
  },
];

export const FEATURED_LABEL = "Selected";
