import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StoreProduct } from "@/lib/catalog-types";
import { getDb } from "@/lib/db";
import { GAME_THEMES } from "@/lib/constants";
import { clampPrice, slugify } from "@/lib/utils";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "overlays", "generated");
const PREVIEW_ROOT = path.join(process.cwd(), "public", "generated-previews");
const FALLBACK_CATALOG_PATH = path.join(process.cwd(), "storage", "overlays", "fallback-catalog.json");

function isDatabaseUnavailable(error: unknown) {
  if (!(error instanceof Error)) return false;
  return error.message.includes("Can't reach database server") || error.name.includes("PrismaClientInitializationError");
}

async function readFallbackCatalog() {
  try {
    const raw = await readFile(FALLBACK_CATALOG_PATH, "utf8");
    return JSON.parse(raw) as StoreProduct[];
  } catch {
    return [];
  }
}

async function writeFallbackCatalog(products: StoreProduct[]) {
  await writeFile(FALLBACK_CATALOG_PATH, JSON.stringify(products, null, 2), "utf8");
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createProductTitle(gameCategory: string, overlayType: string, index: number) {
  const suffixes = ["Prime", "Elite", "Phantom", "Titan", "Ghost", "Signal", "Spectra", "Nova"];
  return `${gameCategory} ${suffixes[index % suffixes.length]} ${overlayType}`;
}

function createDescription(gameCategory: string, overlayType: string) {
  return `${overlayType} crafted for ${gameCategory} inspired creators. Includes premium OBS scene styling, installation notes, polished text layers, branded frame styling, and commercial-ready presentation for serious stream growth.`;
}

function createObsJson(gameCategory: string, overlayType: string, title: string) {
  const theme = GAME_THEMES[gameCategory];
  const webcam = overlayType === "Webcam Overlay" || overlayType === "Full Stream Pack";
  const chat = overlayType === "Chat Box Overlay" || overlayType === "Full Stream Pack";
  const alerts = overlayType === "Alert Box Overlay" || overlayType === "Full Stream Pack";

  return {
    sceneName: title,
    canvas: { width: 1920, height: 1080 },
    gameCategory,
    overlayType,
    sources: [
      { type: "backgroundShape", name: "chrome-shell", color: "#0a1018" },
      { type: "imagePlaceholder", name: "frame-top", path: "frame-top.png" },
      { type: "text", name: "stream-title", text: title, fontSize: 52, color: theme.accent },
    ],
    textLayers: [
      { name: "handle", text: "@streamforge", x: 92, y: 84, color: theme.glow },
      { name: "status", text: overlayType, x: 92, y: 148, color: "#f8fafc" },
    ],
    imagePlaceholderLayers: [
      { name: "logo-slot", x: 1600, y: 72, width: 200, height: 200 },
    ],
    webcamFramePlacement: webcam
      ? {
          x: 1270,
          y: 680,
          width: 540,
          height: 304,
          transparentCenter: true,
          note: "Transparent webcam center — no black box.",
        }
      : null,
    chatBoxPlacement: chat ? { x: 72, y: 738, width: 472, height: 252 } : null,
    alertBoxPlacement: alerts ? { x: 720, y: 68, width: 480, height: 140 } : null,
    colorThemeValues: theme,
    metadata: {
      compatibility: "OBS Studio JSON import",
      createdBy: "StreamForge Overlay Empire generator",
      originalArtworkOnly: true,
    },
    createdDate: new Date().toISOString(),
  };
}

function createPreviewSvg(gameCategory: string, overlayType: string, title: string) {
  const theme = GAME_THEMES[gameCategory];
  const transparentNote =
    overlayType === "Webcam Overlay" ? "Transparent webcam center - no black box" : "OBS JSON included";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#060b12" />
      <stop offset="100%" stop-color="#101827" />
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)" rx="36"/>
  <rect x="48" y="48" width="1504" height="804" rx="32" fill="rgba(255,255,255,0.05)" stroke="${theme.glow}" stroke-width="2"/>
  <rect x="76" y="76" width="360" height="748" rx="28" fill="rgba(255,255,255,0.04)"/>
  <rect x="468" y="76" width="1056" height="520" rx="32" fill="rgba(255,255,255,0.03)" stroke="${theme.accent}" stroke-opacity="0.6"/>
  <rect x="1210" y="622" width="274" height="160" rx="24" fill="none" stroke="${theme.accent}" stroke-width="8"/>
  <text x="90" y="146" fill="${theme.accent}" font-size="54" font-family="Arial, sans-serif" font-weight="700">${title}</text>
  <text x="90" y="212" fill="#e2e8f0" font-size="28" font-family="Arial, sans-serif">${gameCategory}</text>
  <text x="90" y="258" fill="#94a3b8" font-size="24" font-family="Arial, sans-serif">${overlayType}</text>
  <text x="90" y="784" fill="${theme.glow}" font-size="26" font-family="Arial, sans-serif">${transparentNote}</text>
</svg>`;
}

export async function generateOverlayBatch(input: {
  gameCategory: string;
  overlayType: string;
  quantity: number;
  minPrice: number;
  maxPrice: number;
  publish: boolean;
}) {
  await mkdir(STORAGE_ROOT, { recursive: true });
  await mkdir(PREVIEW_ROOT, { recursive: true });
  let batch = {
    id: `local-${Date.now()}`,
    gameCategory: input.gameCategory,
    overlayType: input.overlayType,
    quantity: input.quantity,
    status: "PENDING",
    createdAt: new Date(),
  };
  let dbAvailable = true;
  const fallbackCatalog = await readFallbackCatalog();

  try {
    batch = await getDb().generatedOverlayBatch.create({
      data: {
        gameCategory: input.gameCategory,
        overlayType: input.overlayType,
        quantity: input.quantity,
        status: "PENDING",
      },
    });
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
    dbAvailable = false;
  }

  const createdProducts: StoreProduct[] = [];
  for (let i = 0; i < input.quantity; i += 1) {
    const title = createProductTitle(input.gameCategory, input.overlayType, i);
    const slug = `${slugify(title)}-${Date.now()}-${i}`;
    const price = clampPrice(randomInt(input.minPrice, input.maxPrice));
    const jsonPath = path.join(STORAGE_ROOT, `${slug}.json`);
    const previewFilename = `${slug}.svg`;
    const previewPath = path.join(PREVIEW_ROOT, previewFilename);

    await writeFile(jsonPath, JSON.stringify(createObsJson(input.gameCategory, input.overlayType, title), null, 2));
    await writeFile(previewPath, createPreviewSvg(input.gameCategory, input.overlayType, title), "utf8");

    if (input.publish && dbAvailable) {
      const product = await getDb().product.create({
        data: {
          title,
          slug,
          description: createDescription(input.gameCategory, input.overlayType),
          price,
          gameCategory: input.gameCategory,
          overlayType: input.overlayType,
          previewImage: `/generated-previews/${previewFilename}`,
          downloadFilePath: `${slug}.json`,
          includedFiles: ["OBS scene JSON", "Installation guide", "Transparent preview asset"],
          isFeatured: false,
          isActive: true,
        },
      });
      createdProducts.push({
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      });
    } else if (input.publish) {
      const now = new Date().toISOString();
      createdProducts.push({
        id: `local-${slug}`,
        title,
        slug,
        description: createDescription(input.gameCategory, input.overlayType),
        price,
        gameCategory: input.gameCategory,
        overlayType: input.overlayType,
        previewImage: `/generated-previews/${previewFilename}`,
        downloadFilePath: `${slug}.json`,
        includedFiles: ["OBS scene JSON", "Installation guide", "Transparent preview asset"],
        ratingAverage: 4.8,
        totalSales: 0,
        isFeatured: false,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  if (input.publish && !dbAvailable) {
    await writeFallbackCatalog([...createdProducts, ...fallbackCatalog]);
  }

  if (dbAvailable) {
    await getDb().generatedOverlayBatch.update({
      where: { id: batch.id },
      data: { status: "COMPLETED" },
    });
  }

  return { batch, createdProducts };
}
