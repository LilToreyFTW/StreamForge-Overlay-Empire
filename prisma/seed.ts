import { hash } from "bcryptjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { GAME_CATEGORIES, OVERLAY_TYPES, GAME_THEMES } from "@/lib/constants";
import { slugify } from "@/lib/utils";

const prisma = new PrismaClient();
const overlayRoot = path.join(process.cwd(), "storage", "overlays", "generated");
const previewRoot = path.join(process.cwd(), "public", "generated-previews");

const sampleNames: Record<string, string[]> = {
  "Call of Duty": [
    "Call of Duty Tactical HUD Overlay Pack",
    "Call of Duty Strike Team Starting Soon Screen",
    "Call of Duty Midnight BRB Screen",
    "Call of Duty Precision Webcam Overlay",
    "Call of Duty Mission Debrief Ending Screen",
  ],
  "ARC Raiders": [
    "ARC Raiders Wasteland Stream Kit",
    "ARC Raiders Salvage Starting Soon Screen",
    "ARC Raiders Duststorm Intermission Screen",
    "ARC Raiders Beacon Chat Box Overlay",
    "ARC Raiders Outrider Alert Box Overlay",
  ],
  "Dying Light: The Beast": [
    "Dying Light Infected City Webcam Frame",
    "Dying Light Rooftop Starting Soon Screen",
    "Dying Light Nightfall BRB Screen",
    "Dying Light Outbreak HUD Overlay",
    "Dying Light Escape Ending Screen",
  ],
  "Subnautica 2": [
    "Subnautica Deep Ocean Starting Soon Screen",
    "Subnautica Abyss Webcam Overlay",
    "Subnautica Sonar Chat Box Overlay",
    "Subnautica Reef Stream Pack",
    "Subnautica Deep Dive Ending Screen",
  ],
  Fallout: [
    "Fallout Wasteland OBS Stream Pack",
    "Fallout Pip Console Starting Soon Screen",
    "Fallout Bunker BRB Screen",
    "Fallout Vault Webcam Overlay",
    "Fallout Signal Alert Box Overlay",
  ],
  "Escape from Tarkov": [
    "Tarkov Extraction Raid Overlay Bundle",
    "Tarkov Secure Container Starting Soon Screen",
    "Tarkov Hideout BRB Screen",
    "Tarkov Intel Gameplay HUD Overlay",
    "Tarkov Exfil Ending Screen",
  ],
  "Tom Clancy's Rainbow Six Siege": [
    "Rainbow Six Siege Operator Stream Layout",
    "Rainbow Six Siege Breach Starting Soon Screen",
    "Rainbow Six Siege Support Webcam Overlay",
    "Rainbow Six Siege Comms Chat Box Overlay",
    "Rainbow Six Siege Round End Screen",
  ],
};

function createObsJson(gameCategory: string, overlayType: string, title: string) {
  const theme = GAME_THEMES[gameCategory];
  const isWebcam = overlayType === "Webcam Overlay";
  return {
    sceneName: title,
    canvasSize: { width: 1920, height: 1080 },
    gameCategory,
    overlayType,
    sources: [
      { name: "frame", type: "image", placeholder: "frame.png" },
      { name: "label", type: "text", value: title },
    ],
    textLayers: [{ name: "game", text: gameCategory, x: 80, y: 80 }],
    imagePlaceholderLayers: [{ name: "brand-mark", x: 1580, y: 60, width: 200, height: 200 }],
    webcamFramePlacement: isWebcam
      ? { x: 1272, y: 686, width: 522, height: 294, transparentCenter: true }
      : null,
    chatBoxPlacement: overlayType === "Chat Box Overlay" ? { x: 88, y: 718, width: 420, height: 240 } : null,
    alertBoxPlacement: overlayType === "Alert Box Overlay" ? { x: 720, y: 72, width: 480, height: 120 } : null,
    colorThemeValues: theme,
    metadata: {
      transparentWebcamCenter: isWebcam,
      createdDate: new Date().toISOString(),
      originalArtworkOnly: true,
    },
    createdDate: new Date().toISOString(),
  };
}

function createPreview(title: string, gameCategory: string, overlayType: string) {
  const theme = GAME_THEMES[gameCategory];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" rx="40" fill="#07101a"/>
  <rect x="40" y="40" width="1520" height="820" rx="34" fill="rgba(255,255,255,0.04)" stroke="${theme.accent}" stroke-width="2"/>
  <rect x="80" y="80" width="480" height="740" rx="32" fill="rgba(255,255,255,0.03)"/>
  <rect x="620" y="80" width="900" height="520" rx="32" fill="rgba(255,255,255,0.02)" stroke="${theme.glow}" stroke-width="4"/>
  <rect x="1180" y="650" width="280" height="168" rx="24" fill="none" stroke="${theme.accent}" stroke-width="8"/>
  <text x="100" y="170" fill="${theme.accent}" font-size="52" font-family="Arial" font-weight="700">${title}</text>
  <text x="100" y="228" fill="#e2e8f0" font-size="26" font-family="Arial">${gameCategory}</text>
  <text x="100" y="274" fill="#94a3b8" font-size="24" font-family="Arial">${overlayType}</text>
  <text x="100" y="780" fill="${theme.glow}" font-size="24" font-family="Arial">${overlayType === "Webcam Overlay" ? "Transparent webcam center - no black box" : "OBS JSON included"}</text>
</svg>`;
}

async function main() {
  await mkdir(overlayRoot, { recursive: true });
  await mkdir(previewRoot, { recursive: true });

  await prisma.download.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.generatedOverlayBatch.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await hash("admin12345", 10);
  const customerPassword = await hash("customer12345", 10);

  await prisma.user.create({
    data: {
      name: "Admin User",
      email: process.env.ADMIN_EMAIL ?? "admin@example.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      name: "Demo Customer",
      email: "customer@example.com",
      passwordHash: customerPassword,
      role: "CUSTOMER",
    },
  });

  for (const gameCategory of GAME_CATEGORIES) {
    const titles = sampleNames[gameCategory];
    for (let index = 0; index < 5; index += 1) {
      const title = titles[index];
      const overlayType = OVERLAY_TYPES[index];
      const slug = slugify(title);
      const filename = `${slug}.json`;
      const previewFile = `${slug}.svg`;
      await writeFile(path.join(overlayRoot, filename), JSON.stringify(createObsJson(gameCategory, overlayType, title), null, 2));
      await writeFile(path.join(previewRoot, previewFile), createPreview(title, gameCategory, overlayType), "utf8");

      await prisma.product.create({
        data: {
          title,
          slug,
          description: `${overlayType} for ${gameCategory} streamers featuring premium original styling, OBS-ready layers, clean installation, and streamer-focused branding.`,
          price: 2000 + index * 100,
          gameCategory,
          overlayType,
          previewImage: `/generated-previews/${previewFile}`,
          downloadFilePath: filename,
          includedFiles: ["OBS scene JSON", "Preview asset", "Install notes"],
          isFeatured: index === 0,
          isActive: true,
          ratingAverage: 4.7 + index * 0.05,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
