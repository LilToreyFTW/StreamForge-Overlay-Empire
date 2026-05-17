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
  layoutFamily: "rings" | "armor" | "slashes" | "chrome" | "vector";
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
    layoutFamily: "rings",
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
    layoutFamily: "armor",
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
    layoutFamily: "slashes",
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
    layoutFamily: "chrome",
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
    layoutFamily: "vector",
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

  const moduleSet =
    family.layoutFamily === "slashes"
      ? [
          { id: "main-stage", x: 74, y: 102, width: 1136, height: 640, role: "main-scene" },
          { id: "top-cam", x: 1266, y: 100, width: 386, height: 214, role: "mini-cam" },
          { id: "chat-stack", x: 1266, y: 332, width: 386, height: 258, role: "chat-box" },
          { id: "social-1", x: 1674, y: 332, width: 190, height: 64, role: "social-tab" },
          { id: "social-2", x: 1674, y: 410, width: 190, height: 64, role: "social-tab" },
          { id: "social-3", x: 1674, y: 488, width: 190, height: 64, role: "social-tab" },
          { id: "status-a", x: 80, y: 820, width: 344, height: 158, role: "screen-card" },
          { id: "status-b", x: 454, y: 820, width: 344, height: 158, role: "screen-card" },
          { id: "status-c", x: 828, y: 820, width: 344, height: 158, role: "screen-card" },
        ]
      : family.layoutFamily === "rings"
        ? [
            { id: "center-stage", x: 152, y: 112, width: 1616, height: 516, role: "hero-card" },
            { id: "bottom-left", x: 164, y: 706, width: 462, height: 190, role: "screen-card" },
            { id: "bottom-mid", x: 730, y: 706, width: 462, height: 190, role: "screen-card" },
            { id: "bottom-right", x: 1296, y: 706, width: 462, height: 190, role: "screen-card" },
          ]
        : family.layoutFamily === "armor"
          ? [
              { id: "hero-window", x: 120, y: 104, width: 736, height: 390, role: "main-scene" },
              { id: "title-card", x: 1010, y: 118, width: 738, height: 202, role: "title-card" },
              { id: "bottom-left", x: 102, y: 742, width: 498, height: 170, role: "screen-card" },
              { id: "bottom-mid", x: 714, y: 742, width: 498, height: 170, role: "screen-card" },
              { id: "bottom-right", x: 1326, y: 742, width: 498, height: 170, role: "screen-card" },
            ]
          : family.layoutFamily === "vector"
            ? [
                { id: "main-cam", x: 102, y: 120, width: 820, height: 438, role: "main-scene" },
                { id: "side-cam", x: 1188, y: 118, width: 488, height: 268, role: "side-cam" },
                { id: "bottom-cam", x: 104, y: 634, width: 494, height: 272, role: "chat-box" },
                { id: "chip-a", x: 704, y: 638, width: 242, height: 62, role: "data-chip" },
                { id: "chip-b", x: 704, y: 724, width: 242, height: 62, role: "data-chip" },
                { id: "chip-c", x: 704, y: 810, width: 242, height: 62, role: "data-chip" },
              ]
            : [
                { id: "hero-shell", x: 120, y: 120, width: 1030, height: 520, role: "main-scene" },
                { id: "right-shell", x: 1220, y: 140, width: 520, height: 310, role: "webcam-panel" },
                { id: "banner-shell", x: 160, y: 748, width: 1440, height: 110, role: "footer-banner" },
              ];

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
      layoutFamily: family.layoutFamily,
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
      modules: moduleSet,
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
  if (family.layoutFamily === "rings") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
    <rect width="1600" height="900" fill="#e5e7eb"/>
    <rect x="36" y="36" width="1528" height="828" rx="26" fill="#1a1028"/>
    <circle cx="1180" cy="450" r="265" fill="none" stroke="${family.accent}" stroke-width="28" opacity="0.85"/>
    <circle cx="1180" cy="450" r="205" fill="none" stroke="${family.secondary}" stroke-width="14" opacity="0.85"/>
    <path d="M80 640 C 280 520, 460 510, 760 620" fill="none" stroke="${family.accent}" stroke-width="18" opacity="0.95"/>
    <path d="M58 690 C 290 560, 478 560, 790 690" fill="none" stroke="${family.secondary}" stroke-width="10" opacity="0.85"/>
    <rect x="98" y="122" width="610" height="296" rx="8" fill="rgba(255,255,255,0.04)" stroke="${family.accent}" stroke-width="5"/>
    <rect x="112" y="720" width="410" height="124" rx="8" fill="rgba(255,255,255,0.03)" stroke="${family.accent}" stroke-width="4"/>
    <rect x="594" y="720" width="410" height="124" rx="8" fill="rgba(255,255,255,0.03)" stroke="${family.accent}" stroke-width="4"/>
    <rect x="1076" y="720" width="410" height="124" rx="8" fill="rgba(255,255,255,0.03)" stroke="${family.accent}" stroke-width="4"/>
    <text x="1030" y="440" fill="${family.tertiary}" font-size="44" font-family="Arial" font-weight="700">${title}</text>
    <text x="1030" y="494" fill="${family.accent}" font-size="24" font-family="Arial">${overlayType}</text>
    </svg>`;
  }
  if (family.layoutFamily === "armor") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
    <rect width="1600" height="900" fill="#d9d9d9"/>
    <rect x="32" y="32" width="1536" height="836" rx="22" fill="${family.bg}"/>
    <path d="M70 120 L 700 120 L 740 160 L 740 430 L 710 470 L 70 470 L 70 120 Z" fill="rgba(255,255,255,0.04)" stroke="${family.accent}" stroke-width="7"/>
    <path d="M948 122 L 1508 122 L 1530 152 L 1530 340 L 1504 368 L 948 368 L 920 332 L 920 154 Z" fill="rgba(255,255,255,0.03)" stroke="${family.accent}" stroke-width="7"/>
    <path d="M90 734 L 482 734 L 508 756 L 508 850 L 480 876 L 90 876 L 66 850 L 66 756 Z" fill="rgba(255,255,255,0.03)" stroke="${family.accent}" stroke-width="6"/>
    <path d="M608 734 L 1000 734 L 1026 756 L 1026 850 L 998 876 L 608 876 L 584 850 L 584 756 Z" fill="rgba(255,255,255,0.03)" stroke="${family.accent}" stroke-width="6"/>
    <path d="M1126 734 L 1518 734 L 1544 756 L 1544 850 L 1516 876 L 1126 876 L 1102 850 L 1102 756 Z" fill="rgba(255,255,255,0.03)" stroke="${family.accent}" stroke-width="6"/>
    <text x="1010" y="236" fill="${family.tertiary}" font-size="42" font-family="Arial" font-weight="700">${title}</text>
    <text x="1010" y="286" fill="${family.accent}" font-size="24" font-family="Arial">${overlayType}</text>
    </svg>`;
  }
  if (family.layoutFamily === "slashes") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
    <rect width="1600" height="900" fill="#090909"/>
    <rect x="26" y="26" width="1548" height="848" rx="18" fill="${family.bg}"/>
    <path d="M0 160 L 340 0 L 500 0 L 140 220 Z" fill="${family.accent}" opacity="0.18"/>
    <path d="M1110 900 L 1600 640 L 1600 900 Z" fill="${family.accent}" opacity="0.14"/>
    <rect x="84" y="102" width="980" height="584" fill="rgba(255,255,255,0.03)" stroke="${family.accent}" stroke-width="4"/>
    <rect x="1110" y="100" width="282" height="150" fill="rgba(255,255,255,0.03)" stroke="${family.accent}" stroke-width="4"/>
    <rect x="1110" y="276" width="282" height="206" fill="rgba(255,255,255,0.03)" stroke="${family.accent}" stroke-width="4"/>
    <path d="M1434 272 L 1544 272 L 1500 330 L 1390 330 Z" fill="rgba(255,255,255,0.06)" stroke="${family.accent}" stroke-width="3"/>
    <path d="M1434 352 L 1544 352 L 1500 410 L 1390 410 Z" fill="rgba(255,255,255,0.06)" stroke="${family.accent}" stroke-width="3"/>
    <path d="M1434 432 L 1544 432 L 1500 490 L 1390 490 Z" fill="rgba(255,255,255,0.06)" stroke="${family.accent}" stroke-width="3"/>
    <rect x="94" y="748" width="282" height="112" fill="rgba(255,255,255,0.03)" stroke="${family.accent}" stroke-width="4"/>
    <rect x="414" y="748" width="282" height="112" fill="rgba(255,255,255,0.03)" stroke="${family.accent}" stroke-width="4"/>
    <rect x="734" y="748" width="282" height="112" fill="rgba(255,255,255,0.03)" stroke="${family.accent}" stroke-width="4"/>
    <text x="1096" y="600" fill="${family.tertiary}" font-size="38" font-family="Arial" font-weight="700">${title}</text>
    <text x="1096" y="648" fill="${family.accent}" font-size="24" font-family="Arial">${overlayType}</text>
    ${family.specialTag ? `<text x="1096" y="694" fill="${family.tertiary}" font-size="20" font-family="Arial">${family.specialTag}</text>` : ""}
    </svg>`;
  }
  if (family.layoutFamily === "vector") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
    <rect width="1600" height="900" fill="#1f2937"/>
    <rect x="38" y="38" width="1524" height="824" rx="20" fill="${family.bg}"/>
    <path d="M86 122 L 810 122 L 854 162 L 854 510 L 818 550 L 86 550 L 86 122 Z" fill="rgba(255,255,255,0.04)" stroke="${family.secondary}" stroke-width="6"/>
    <path d="M1088 122 L 1452 122 L 1492 152 L 1492 444 L 1452 478 L 1088 478 L 1048 444 L 1048 152 Z" fill="rgba(255,255,255,0.04)" stroke="${family.accent}" stroke-width="6"/>
    <path d="M104 644 L 520 644 L 560 684 L 560 846 L 520 884 L 104 884 L 66 846 L 66 684 Z" fill="rgba(255,255,255,0.04)" stroke="${family.secondary}" stroke-width="6"/>
    <rect x="650" y="646" width="228" height="62" rx="10" fill="rgba(255,255,255,0.05)" stroke="${family.accent}" stroke-width="3"/>
    <rect x="650" y="728" width="228" height="62" rx="10" fill="rgba(255,255,255,0.05)" stroke="${family.accent}" stroke-width="3"/>
    <rect x="650" y="810" width="228" height="62" rx="10" fill="rgba(255,255,255,0.05)" stroke="${family.accent}" stroke-width="3"/>
    <text x="100" y="108" fill="${family.tertiary}" font-size="30" font-family="Arial" font-weight="700">${title}</text>
    <text x="100" y="874" fill="${family.accent}" font-size="22" font-family="Arial">${overlayType}</text>
    </svg>`;
  }
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
