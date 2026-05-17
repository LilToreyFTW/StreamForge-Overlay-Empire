import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { slugify } from "@/lib/utils";
import type { StoreProduct } from "@/lib/catalog-types";

type TemplateTheme = {
  key: string;
  gameCategory: string;
  overlayPrefix: string;
  accent: string;
  secondary: string;
  energy: string;
  shape: string;
  cameraAnchor: { x: number; y: number; width: number; height: number };
  backgroundMood: string;
};

const OUTPUT_ROOT = path.join(process.cwd(), "storage", "overlays", "generated", "animated-collection");
const PREVIEW_ROOT = path.join(process.cwd(), "public", "generated-previews");
const CATALOG_PATH = path.join(process.cwd(), "storage", "overlays", "fallback-catalog.json");

const themes: TemplateTheme[] = [
  {
    key: "arc-raiders",
    gameCategory: "ARC Raiders",
    overlayPrefix: "ARC Raiders",
    accent: "#72e6ff",
    secondary: "#ffa461",
    energy: "salvage-tech glow",
    shape: "cut-corner tactical glass",
    cameraAnchor: { x: 1268, y: 684, width: 548, height: 308 },
    backgroundMood: "storm-swept extraction horizon",
  },
  {
    key: "fortnite",
    gameCategory: "Fortnite",
    overlayPrefix: "Fortnite",
    accent: "#47f3ff",
    secondary: "#ffd54a",
    energy: "victory neon pulse",
    shape: "rounded-card esports shell",
    cameraAnchor: { x: 1234, y: 152, width: 604, height: 338 },
    backgroundMood: "storm circle skyline",
  },
  {
    key: "overwatch",
    gameCategory: "Overwatch",
    overlayPrefix: "Overwatch",
    accent: "#67d4ff",
    secondary: "#f59b3d",
    energy: "competitive signal hum",
    shape: "hero-panel beveled frame",
    cameraAnchor: { x: 70, y: 690, width: 568, height: 322 },
    backgroundMood: "arena-ready command deck",
  },
  {
    key: "just-chatting",
    gameCategory: "Just Chatting",
    overlayPrefix: "Just Chatting",
    accent: "#53fc18",
    secondary: "#f472b6",
    energy: "chill ambient neon",
    shape: "soft glass lounge frame",
    cameraAnchor: { x: 1230, y: 150, width: 608, height: 342 },
    backgroundMood: "late-night creator lounge",
  },
];

const webcamDescriptors = [
  "Pulse Rift",
  "Orbit Signal",
  "Neon Guard",
  "Drift Core",
  "Chrome Beacon",
  "Live Sync",
  "Echo Frame",
  "Prime Flux",
  "Spectra Lock",
  "Ghost Array",
  "Command Halo",
  "Velocity Grid",
  "Night Shift",
];

const backgroundDescriptors = [
  "Command Deck",
  "Signal Horizon",
  "Arena Sweep",
  "Storm Pulse",
  "Live Ops",
  "Drop Zone",
  "Creator Bay",
  "Battle Feed",
  "Overclock Scene",
  "Afterglow Stage",
  "Victory Wash",
  "Raid Screen",
  "Night Watch",
];

function priceFor(index: number, base: number) {
  return base + (index % 6) * 100;
}

function createAnimatedOverlayJson(theme: TemplateTheme, descriptor: string, mode: "webcam" | "background", index: number) {
  const title =
    mode === "webcam"
      ? `${theme.overlayPrefix} ${descriptor} Animated Webcam Overlay`
      : `${theme.overlayPrefix} ${descriptor} Animated Background Overlay`;

  const slug = slugify(title);
  const camera = theme.cameraAnchor;
  const createdAt = new Date(Date.now() + index * 1000).toISOString();
  const motionSpeed = 2200 + (index % 5) * 350;
  const shimmerSpeed = 3600 + (index % 4) * 420;

  return {
    title,
    slug,
    schemaVersion: "streamforge.obs.motion.v1",
    canvas: { width: 1920, height: 1080, fps: 60, transparentBackground: true },
    category: theme.gameCategory,
    overlayType: mode === "webcam" ? "Webcam Overlay" : "Animated Background Overlay",
    sourceInspiration: {
      template: theme.key,
      notes: `Original animation system inspired by your ${theme.gameCategory} overlay direction without copying proprietary art.`,
    },
    layout: {
      cameraFrame:
        mode === "webcam"
          ? {
              x: camera.x,
              y: camera.y,
              width: camera.width,
              height: camera.height,
              transparentCenter: true,
              safeInset: 16,
            }
          : null,
      sceneBars:
        mode === "background"
          ? {
              top: { x: 44, y: 34, width: 1832, height: 104 },
              bottom: { x: 44, y: 942, width: 1832, height: 104 },
            }
          : null,
      callouts: [
        { x: 70, y: 80, width: 420, height: 72, label: "title cluster" },
        { x: 1450, y: 80, width: 360, height: 72, label: "live status" },
      ],
    },
    visualStyle: {
      energy: theme.energy,
      shapeLanguage: theme.shape,
      accentColor: theme.accent,
      secondaryColor: theme.secondary,
      atmosphere: mode === "background" ? theme.backgroundMood : `${theme.backgroundMood} with broadcast focus`,
    },
    animatedSources: [
      {
        id: "ambient-gradient",
        type: "gradientField",
        blendMode: "screen",
        opacity: 0.72,
        animation: {
          kind: "drift",
          durationMs: shimmerSpeed,
          easing: "easeInOutSine",
          loop: true,
          keyframes: [
            { progress: 0, offsetX: -0.02, offsetY: -0.01, scale: 1 },
            { progress: 0.5, offsetX: 0.03, offsetY: 0.02, scale: 1.03 },
            { progress: 1, offsetX: -0.02, offsetY: -0.01, scale: 1 },
          ],
        },
      },
      {
        id: "scanline-hum",
        type: "lineSweep",
        opacity: 0.18,
        animation: {
          kind: "scan",
          durationMs: motionSpeed,
          direction: mode === "background" ? "vertical" : "horizontal",
          loop: true,
        },
      },
      {
        id: "accent-trace",
        type: "borderTrace",
        color: theme.accent,
        secondaryColor: theme.secondary,
        animation: {
          kind: "pathGlow",
          durationMs: motionSpeed + 900,
          loop: true,
          intensityRange: [0.4, 1],
        },
      },
      {
        id: "status-pulse",
        type: "statusBadge",
        anchor: mode === "webcam" ? "frame-corner" : "top-right",
        animation: {
          kind: "pulse",
          durationMs: 1800 + (index % 3) * 220,
          loop: true,
        },
      },
    ],
    textLayers: [
      { id: "game-label", text: theme.gameCategory.toUpperCase(), fontSize: 34, letterSpacing: 0.16 },
      { id: "mode-label", text: descriptor.toUpperCase(), fontSize: 18, letterSpacing: 0.24 },
    ],
    obsBrowserSourceHints: {
      baseWidth: 1920,
      baseHeight: 1080,
      recommendedFps: 60,
      refreshWhenSceneBecomesActive: true,
    },
    exportNotes: {
      transparentWebcamCenter: mode === "webcam",
      noBlackFillInsideCameraRegion: mode === "webcam",
      intendedUse: mode === "webcam" ? "browser source webcam frame" : "browser source scene background",
    },
    metadata: {
      createdAt,
      createdBy: "StreamForge Overlay Empire",
      originalArtworkOnly: true,
      animationTier: "premium",
    },
  };
}

function createPreviewSvg(theme: TemplateTheme, title: string, mode: "webcam" | "background") {
  const note = mode === "webcam" ? "Animated transparent webcam center" : "Animated stream background scene";
  const cam = theme.cameraAnchor;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#070b12" />
      <stop offset="100%" stop-color="#101828" />
    </linearGradient>
  </defs>
  <rect width="1600" height="900" rx="40" fill="url(#bg)"/>
  <rect x="40" y="40" width="1520" height="820" rx="34" fill="rgba(255,255,255,0.04)" stroke="${theme.accent}" stroke-width="2"/>
  <rect x="86" y="78" width="520" height="112" rx="24" fill="rgba(255,255,255,0.05)" />
  <rect x="1050" y="78" width="420" height="96" rx="22" fill="rgba(255,255,255,0.05)" />
  ${mode === "background" ? `<rect x="88" y="696" width="1424" height="112" rx="24" fill="rgba(255,255,255,0.05)" />` : ""}
  <rect x="${Math.round((cam.x / 1920) * 1600)}" y="${Math.round((cam.y / 1080) * 900)}" width="${Math.round((cam.width / 1920) * 1600)}" height="${Math.round((cam.height / 1080) * 900)}" rx="24" fill="none" stroke="${theme.secondary}" stroke-width="7"/>
  <text x="96" y="138" fill="${theme.accent}" font-size="40" font-family="Arial" font-weight="700">${title}</text>
  <text x="96" y="188" fill="#dbeafe" font-size="24" font-family="Arial">${theme.gameCategory}</text>
  <text x="96" y="232" fill="#94a3b8" font-size="22" font-family="Arial">${note}</text>
  <text x="96" y="790" fill="${theme.secondary}" font-size="22" font-family="Arial">Premium animated OBS JSON concept</text>
</svg>`;
}

async function main() {
  await mkdir(OUTPUT_ROOT, { recursive: true });
  await mkdir(PREVIEW_ROOT, { recursive: true });

  const products: StoreProduct[] = JSON.parse(await readFile(CATALOG_PATH, "utf8"));
  const generatedProducts: StoreProduct[] = [];
  let counter = 0;

  for (let i = 0; i < 50; i += 1) {
    const theme = themes[i % themes.length];
    const mode = i < 25 ? "webcam" : "background";
    const descriptorPool = mode === "webcam" ? webcamDescriptors : backgroundDescriptors;
    const descriptor = descriptorPool[Math.floor(i / themes.length) % descriptorPool.length];
    const json = createAnimatedOverlayJson(theme, descriptor, mode, i);
    const filename = `${json.slug}.json`;
    const previewName = `${json.slug}.svg`;

    await writeFile(path.join(OUTPUT_ROOT, filename), JSON.stringify(json, null, 2), "utf8");
    await writeFile(path.join(PREVIEW_ROOT, previewName), createPreviewSvg(theme, json.title, mode), "utf8");

    generatedProducts.push({
      id: `animated-${counter + 1}`,
      title: json.title,
      slug: json.slug,
      description:
        mode === "webcam"
          ? `Animated webcam overlay with transparent center, motion-driven accent traces, and ${theme.gameCategory} inspired broadcast styling.`
          : `Animated scene background overlay with layered motion, live-status styling, and ${theme.gameCategory} inspired HUD energy.`,
      price: priceFor(i, mode === "webcam" ? 2200 : 2300),
      gameCategory: theme.gameCategory,
      overlayType: mode === "webcam" ? "Webcam Overlay" : "Animated Background Overlay",
      previewImage: `/generated-previews/${previewName}`,
      downloadFilePath: `animated-collection/${filename}`,
      includedFiles: ["Animated OBS JSON", "Motion metadata", mode === "webcam" ? "Transparent webcam layout" : "Scene background layout"],
      ratingAverage: 4.8,
      totalSales: 0,
      isFeatured: i < 8,
      isActive: true,
      createdAt: json.metadata.createdAt,
      updatedAt: json.metadata.createdAt,
    });
    counter += 1;
  }

  const retained = products.filter((product) => !String(product.id).startsWith("animated-"));
  await writeFile(CATALOG_PATH, JSON.stringify([...retained, ...generatedProducts], null, 2), "utf8");
  await writeFile(
    path.join(OUTPUT_ROOT, "manifest.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: generatedProducts.length,
        themes: themes.map((theme) => theme.gameCategory),
        split: {
          webcam: generatedProducts.filter((product) => product.overlayType === "Webcam Overlay").length,
          background: generatedProducts.filter((product) => product.overlayType === "Animated Background Overlay").length,
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Generated ${generatedProducts.length} animated OBS overlay JSON files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
