export const APP_NAME = "StreamForge Overlay Empire";
export const APP_TAGLINE =
  "Custom OBS overlays for serious gamers who want their stream to look premium, game-specific, and ready to sell their brand.";

export const GAMER_METHOD = [
  {
    letter: "G",
    title: "Game Identity Mapping",
    description: "Every collection is built around the vibe of a specific game category and streamer niche.",
  },
  {
    letter: "A",
    title: "Automated OBS JSON Creation",
    description: "The system generates structured OBS scene JSON with themed layers, metadata, and transparent webcam handling.",
  },
  {
    letter: "M",
    title: "Marketplace Productization",
    description: "Every overlay becomes a sellable product with naming, pricing, previews, tags, and download delivery.",
  },
  {
    letter: "E",
    title: "Ecommerce Delivery",
    description: "Stripe checkout, customer accounts, secure downloads, and purchase history are wired into the storefront.",
  },
  {
    letter: "R",
    title: "Recurring Catalog Growth",
    description: "The catalog grows toward 50 overlays per day and 500+ overlays per month with admin-controlled batching.",
  },
];

export const GAME_SLUGS: Record<string, string> = {
  "Call of Duty": "call-of-duty",
  "ARC Raiders": "arc-raiders",
  "Dying Light: The Beast": "dying-light-the-beast",
  "Subnautica 2": "subnautica-2",
  Fallout: "fallout",
  "Escape from Tarkov": "escape-from-tarkov",
  "Tom Clancy's Rainbow Six Siege": "rainbow-six-siege",
};

export const SLUG_TO_GAME = Object.fromEntries(
  Object.entries(GAME_SLUGS).map(([name, slug]) => [slug, name]),
) as Record<string, string>;

export const GAME_CATEGORIES = [
  "Call of Duty",
  "ARC Raiders",
  "Dying Light: The Beast",
  "Subnautica 2",
  "Fallout",
  "Escape from Tarkov",
  "Tom Clancy's Rainbow Six Siege",
] as const;

export const OVERLAY_TYPES = [
  "Full Stream Pack",
  "Starting Soon Screen",
  "Be Right Back Screen",
  "Stream Ending Screen",
  "Webcam Overlay",
  "Gameplay HUD Overlay",
  "Chat Box Overlay",
  "Alert Box Overlay",
  "Intermission Screen",
] as const;

export const GAME_THEMES: Record<string, { accent: string; glow: string; description: string }> = {
  "Call of Duty": {
    accent: "#7cf2ff",
    glow: "#48b7ff",
    description: "Tactical steel, HUD lines, and elite squad precision.",
  },
  "ARC Raiders": {
    accent: "#d4ff55",
    glow: "#94ff19",
    description: "Salvage-tech gradients, sci-fi dust, and raid energy.",
  },
  "Dying Light: The Beast": {
    accent: "#ff7c5a",
    glow: "#ff3d2e",
    description: "Infected city warning lights with survival grit.",
  },
  "Subnautica 2": {
    accent: "#7af6ff",
    glow: "#24c8ff",
    description: "Deep-ocean glass panels and bioluminescent blue depth.",
  },
  Fallout: {
    accent: "#f3e178",
    glow: "#c4ff58",
    description: "Retro-futurist wasteland terminals and vault steel.",
  },
  "Escape from Tarkov": {
    accent: "#c0ff88",
    glow: "#8cf14a",
    description: "Extraction-grade utility panels and raid-callout framing.",
  },
  "Tom Clancy's Rainbow Six Siege": {
    accent: "#8ad2ff",
    glow: "#49a8ff",
    description: "Operator-inspired tactical framing and breach cues.",
  },
};

export const PREMIUM_PRICING = [
  {
    name: "Weekly Plan",
    price: "$200/week",
    description: "Fast-turn custom overlay drops for creators and agencies.",
  },
  {
    name: "Monthly Plan",
    price: "$500/month",
    description: "Continuous production with 500+ overlays per month capacity.",
  },
];
