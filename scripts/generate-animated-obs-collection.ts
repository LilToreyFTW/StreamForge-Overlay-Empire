import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugify } from "@/lib/utils";
import type { StoreProduct } from "@/lib/catalog-types";

type RefFamily = {
  key: string;
  titlePrefix: string;
  gameCategory: string;
  accent: string;
  secondary: string;
  tertiary: string;
  bg: string;
  shapeLanguage: string;
  mood: string;
  headlineStyle: string;
  cameraAnchor: { x: number; y: number; width: number; height: number };
  specialTag?: string;
};

const OUTPUT_ROOT = path.join(process.cwd(), "storage", "overlays", "generated", "animated-collection");
const PREVIEW_ROOT = path.join(process.cwd(), "public", "generated-previews");
const CATALOG_PATH = path.join(process.cwd(), "storage", "overlays", "fallback-catalog.json");

const families: RefFamily[] = [
  {
    key: "convex-purple",
    titlePrefix: "Convex Pulse",
    gameCategory: "Sci-Fi Stream",
    accent: "#9b4dff",
    secondary: "#5f17d9",
    tertiary: "#e5d8ff",
    bg: "#0d0718",
    shapeLanguage: "stacked concentric arcs and central stage rings",
    mood: "premium neon intermission suite",
    headlineStyle: "condensed centered typography with circular focus",
    cameraAnchor: { x: 88, y: 102, width: 620, height: 350 },
  },
  {
    key: "tainted-orange",
    titlePrefix: "Tainted Ember",
    gameCategory: "Tactical Stream",
    accent: "#ff7a1a",
    secondary: "#ffb347",
    tertiary: "#fff0db",
    bg: "#120c09",
    shapeLanguage: "layered armor edges with aggressive corner flares",
    mood: "warning-lit combat shell",
    headlineStyle: "hard-edged labels with segmented bottom plates",
    cameraAnchor: { x: 86, y: 98, width: 626, height: 352 },
  },
  {
    key: "bloody-red",
    titlePrefix: "BL0WDART Bloodline",
    gameCategory: "BL0WDART Signature",
    accent: "#ff2f43",
    secondary: "#a30716",
    tertiary: "#ffd5da",
    bg: "#140507",
    shapeLanguage: "scarred chrome with red slash energy and brutal framing",
    mood: "dark hostile premium broadcast pack",
    headlineStyle: "ominous centerpiece typography with weapon-grade separators",
    cameraAnchor: { x: 96, y: 104, width: 612, height: 344 },
    specialTag: "Custom for BL0WDART",
  },
  {
    key: "metallic-chrome",
    titlePrefix: "Metallic Dominion",
    gameCategory: "Metallic Stream",
    accent: "#90d7ff",
    secondary: "#9ca3af",
    tertiary: "#f8fafc",
    bg: "#0b1016",
    shapeLanguage: "machined steel bevels and chrome edge bars",
    mood: "luxury esports control deck",
    headlineStyle: "sleek metallic header strips with cold blue highlights",
    cameraAnchor: { x: 1188, y: 644, width: 560, height: 314 },
  },
  {
    key: "geometric-future",
    titlePrefix: "Geometric Future",
    gameCategory: "Future Stream",
    accent: "#3ce7ff",
    secondary: "#f14cff",
    tertiary: "#f8fbff",
    bg: "#07131a",
    shapeLanguage: "clean angular vectors and modular frame cuts",
    mood: "futuristic creator HUD suite",
    headlineStyle: "modular techno labels with clean geometry",
    cameraAnchor: { x: 1210, y: 146, width: 600, height: 338 },
  },
];

const productModes = [
  "Animated Webcam Overlay",
  "Animated Intermission Screen",
  "Animated Starting Soon Screen",
  "Animated BRB Screen",
  "Animated Ending Screen",
  "Animated Background Overlay",
  "Animated Alert Box Overlay",
  "Animated Chat Box Overlay",
  "Animated HUD Overlay",
  "Animated Full Stream Pack",
] as const;

function buildTitle(family: RefFamily, mode: string, index: number) {
  const suffixes = ["Prime", "Nova", "Vanta", "Specter", "Voltage", "Onyx", "Phantom", "Core", "Apex", "Rift"];
  return `${family.titlePrefix} ${suffixes[index % suffixes.length]} ${mode}`;
}

function modeType(mode: string) {
  if (mode.includes("Webcam")) return "Webcam Overlay";
  if (mode.includes("Background")) return "Animated Background Overlay";
  if (mode.includes("Full Stream Pack")) return "Full Stream Pack";
  return mode.replace("Animated ", "");
}

function createAnimatedJson(family: RefFamily, mode: string, index: number) {
  const title = buildTitle(family, mode, index);
  const slug = slugify(title);
  const createdAt = new Date(Date.now() + index * 1500).toISOString();
  const overlayType = modeType(mode);
  const webcam = overlayType === "Webcam Overlay" || overlayType === "Full Stream Pack";
  const background = overlayType === "Animated Background Overlay" || overlayType === "Full Stream Pack";
  const motionPulse = 1800 + (index % 4) * 240;
  const sweep = 2600 + (index % 5) * 210;

  return {
    title,
    slug,
    schemaVersion: "streamforge.obs.motion.v2",
    canvas: {
      width: 1920,
      height: 1080,
      fps: 60,
      transparentBackground: true,
    },
    category: family.gameCategory,
    overlayType,
    inspirationProfile: {
      referenceFamily: family.key,
      originalOnly: true,
      summary: `${family.mood} using ${family.shapeLanguage}.`,
      specialTag: family.specialTag ?? null,
    },
    composition: {
      headlineZone: { x: 80, y: 56, width: 640, height: 110, style: family.headlineStyle },
      statusZone: { x: 1450, y: 64, width: 320, height: 88 },
      cameraFrame: webcam
        ? {
            ...family.cameraAnchor,
            transparentCenter: true,
            noBlackFill: true,
            radius: 22,
          }
        : null,
      lowerBar: background
        ? {
            x: 64,
            y: 948,
            width: 1792,
            height: 86,
          }
        : null,
      leftRail: { x: 24, y: 190, width: 32, height: 620 },
      rightRail: { x: 1864, y: 190, width: 32, height: 620 },
    },
    palette: {
      background: family.bg,
      accent: family.accent,
      secondary: family.secondary,
      tertiary: family.tertiary,
    },
    animationLayers: [
      {
        id: "main-glow-field",
        type: family.key === "convex-purple" ? "circularGlow" : family.key === "tainted-orange" ? "contourGlow" : family.key === "bloody-red" ? "slashGlow" : family.key === "metallic-chrome" ? "steelSheen" : "vectorGrid",
        opacity: 0.78,
        animation: {
          kind: "drift",
          durationMs: 3400 + (index % 3) * 360,
          loop: true,
          easing: "easeInOutSine",
        },
      },
      {
        id: "edge-trace",
        type: "borderTrace",
        strokeWidth: family.key === "metallic-chrome" ? 3 : 4,
        animation: {
          kind: "pathGlow",
          durationMs: sweep,
          loop: true,
          intensityRange: [0.45, 1],
        },
      },
      {
        id: "scan-overlay",
        type: family.key === "geometric-future" ? "gridSweep" : "scanlineSweep",
        opacity: 0.16,
        animation: {
          kind: "scan",
          durationMs: motionPulse + 900,
          loop: true,
          direction: index % 2 === 0 ? "horizontal" : "vertical",
        },
      },
      {
        id: "badge-pulse",
        type: "statusBadge",
        animation: {
          kind: "pulse",
          durationMs: motionPulse,
          loop: true,
        },
      },
    ],
    textLayers: [
      { id: "title", text: title.toUpperCase(), fontSize: family.key === "bloody-red" ? 40 : 34, letterSpacing: 0.18 },
      { id: "subtitle", text: family.specialTag ?? family.gameCategory.toUpperCase(), fontSize: 16, letterSpacing: 0.24 },
    ],
    obsHints: {
      renderMode: "browser-source",
      recommendedResolution: "1920x1080",
      recommendedRefreshRate: 60,
      supportsTransparentCenter: webcam,
    },
    exportNotes: {
      intendedUse: overlayType,
      transparentWebcamCenter: webcam,
      noBlackFillInsideCameraRegion: webcam,
      animationGrade: "premium-ref-inspired",
    },
    metadata: {
      createdAt,
      createdBy: "StreamForge Overlay Empire",
      referenceUsage: "Original reinterpretation inspired by linked references; not a direct clone.",
    },
  };
}

function createPreview(family: RefFamily, title: string, overlayType: string) {
  const cam = family.cameraAnchor;
  const showCam = overlayType === "Webcam Overlay" || overlayType === "Full Stream Pack";
  const showBottom = overlayType !== "Webcam Overlay";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${family.bg}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="1600" height="900" rx="36" fill="url(#bg)"/>
  <rect x="36" y="36" width="1528" height="828" rx="32" fill="rgba(255,255,255,0.04)" stroke="${family.accent}" stroke-width="2"/>
  <rect x="78" y="62" width="640" height="106" rx="22" fill="rgba(255,255,255,0.05)" stroke="${family.secondary}" stroke-opacity="0.35"/>
  <rect x="1180" y="70" width="300" height="84" rx="18" fill="rgba(255,255,255,0.05)"/>
  <rect x="24" y="180" width="12" height="520" rx="999" fill="${family.secondary}" opacity="0.6"/>
  <rect x="1564" y="180" width="12" height="520" rx="999" fill="${family.secondary}" opacity="0.6"/>
  ${showCam ? `<rect x="${Math.round((cam.x / 1920) * 1600)}" y="${Math.round((cam.y / 1080) * 900)}" width="${Math.round((cam.width / 1920) * 1600)}" height="${Math.round((cam.height / 1080) * 900)}" rx="24" fill="none" stroke="${family.accent}" stroke-width="7"/>` : ""}
  ${showBottom ? `<rect x="64" y="792" width="1472" height="70" rx="18" fill="rgba(255,255,255,0.05)"/>` : ""}
  <text x="94" y="126" fill="${family.tertiary}" font-size="36" font-family="Arial" font-weight="700">${title}</text>
  <text x="94" y="174" fill="${family.accent}" font-size="22" font-family="Arial">${overlayType}</text>
  <text x="94" y="218" fill="#cbd5e1" font-size="20" font-family="Arial">${family.mood}</text>
</svg>`;
}

async function main() {
  await mkdir(OUTPUT_ROOT, { recursive: true });
  await mkdir(PREVIEW_ROOT, { recursive: true });

  const existing = JSON.parse(await readFile(CATALOG_PATH, "utf8")) as StoreProduct[];
  const generated: StoreProduct[] = [];

  for (let i = 0; i < 50; i += 1) {
    const family = families[Math.floor(i / 10)];
    const mode = productModes[i % productModes.length];
    const json = createAnimatedJson(family, mode, i);
    const filename = `${json.slug}.json`;
    const previewName = `${json.slug}.svg`;

    await writeFile(path.join(OUTPUT_ROOT, filename), JSON.stringify(json, null, 2), "utf8");
    await writeFile(path.join(PREVIEW_ROOT, previewName), createPreview(family, json.title, json.overlayType), "utf8");

    generated.push({
      id: `animated-${i + 1}`,
      title: json.title,
      slug: json.slug,
      description: `${family.mood}. Original premium OBS-style animated ${json.overlayType.toLowerCase()} with ${family.shapeLanguage}.`,
      price: 2100 + (i % 5) * 100,
      gameCategory: family.gameCategory,
      overlayType: json.overlayType,
      previewImage: `/generated-previews/${previewName}`,
      downloadFilePath: `animated-collection/${filename}`,
      includedFiles: ["Animated OBS JSON", "Motion metadata", json.overlayType === "Webcam Overlay" ? "Transparent webcam center data" : "Scene layout data"],
      ratingAverage: 4.8,
      totalSales: 0,
      isFeatured: i < 10,
      isActive: true,
      createdAt: json.metadata.createdAt,
      updatedAt: json.metadata.createdAt,
    });
  }

  const retained = existing.filter((item) => !String(item.id).startsWith("animated-"));
  await writeFile(CATALOG_PATH, JSON.stringify([...retained, ...generated], null, 2), "utf8");
  await writeFile(
    path.join(OUTPUT_ROOT, "manifest.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: generated.length,
        families: families.map((family) => ({
          key: family.key,
          titlePrefix: family.titlePrefix,
          specialTag: family.specialTag ?? null,
        })),
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Generated ${generated.length} reference-inspired animated OBS JSON overlays.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
