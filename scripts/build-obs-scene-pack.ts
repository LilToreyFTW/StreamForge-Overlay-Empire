import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

type OverlayJson = {
  title: string;
  slug: string;
  category: string;
  overlayType: string;
  composition?: {
    cameraFrame?: {
      x: number;
      y: number;
      width: number;
      height: number;
      transparentCenter?: boolean;
      noBlackFill?: boolean;
      radius?: number;
    } | null;
    modules?: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      role: string;
    }>;
  };
  palette?: {
    background: string;
    accent: string;
    secondary: string;
    tertiary: string;
  };
  obsHints?: {
    recommendedResolution?: string;
    recommendedRefreshRate?: number;
    supportsTransparentCenter?: boolean;
  };
  metadata?: {
    createdAt?: string;
  };
};

const INPUT_DIR = "D:/obs-studio/overlays/generated-json-preview";
const OUTPUT_DIR = "D:/obs-studio/overlays/scenes-for-obs";
const OUTPUT_FILE = path.join(OUTPUT_DIR, "streamforge-customizable-overlay-scenes.json");

function parseResolution(input?: string) {
  const match = input?.match(/^(\d+)x(\d+)$/);
  if (!match) return { width: 1920, height: 1080 };
  return { width: Number(match[1]), height: Number(match[2]) };
}

function sceneItemForOverlay(overlay: OverlayJson, basePath: string) {
  const resolution = parseResolution(overlay.obsHints?.recommendedResolution);
  const camera = overlay.composition?.cameraFrame;
  const modules = overlay.composition?.modules ?? [];

  return {
    uuid: randomUUID(),
    name: overlay.title,
    settings: {
      custom_overlay_json: path.join(basePath, `${overlay.slug}.json`),
      stream_name: "BL0WDART",
      kick_channel: "bl0wdart",
      resolution,
      overlay_type: overlay.overlayType,
      game_category: overlay.category,
      palette: overlay.palette ?? null,
      supports_transparent_center: overlay.obsHints?.supportsTransparentCenter ?? false,
      webcam_frame: camera
        ? {
            x: camera.x,
            y: camera.y,
            width: camera.width,
            height: camera.height,
            transparent_center: camera.transparentCenter ?? false,
            no_black_fill: camera.noBlackFill ?? false,
            radius: camera.radius ?? 0,
          }
        : null,
      modules,
      obs_usage_notes: [
        "This scene pack references generated overlay JSON design files.",
        "Use the composition data to rebuild the overlay in browser-source HTML, PNG, or future converter tooling.",
        "Update stream_name and kick_channel before final production export.",
      ],
    },
  };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const entries = await readFile(path.join(INPUT_DIR, "manifest.json"), "utf8");
  const manifest = JSON.parse(entries) as { count?: number };

  const files = (await readFile(path.join(INPUT_DIR, "manifest.json"), "utf8"), undefined);
  const overlayFiles = (await import("node:fs/promises")).readdir(INPUT_DIR);
  const jsonFiles = (await overlayFiles)
    .filter((name) => name.endsWith(".json") && name !== "manifest.json")
    .sort();

  const overlays: OverlayJson[] = [];
  for (const file of jsonFiles) {
    const raw = await readFile(path.join(INPUT_DIR, file), "utf8");
    overlays.push(JSON.parse(raw) as OverlayJson);
  }

  const grouped = overlays.reduce<Record<string, OverlayJson[]>>((acc, overlay) => {
    const key = overlay.category || "Other";
    acc[key] ??= [];
    acc[key].push(overlay);
    return acc;
  }, {});

  const sceneCollection = {
    name: "StreamForge Customizable Overlay Scenes",
    kind: "streamforge-scene-pack",
    version: 1,
    createdAt: new Date().toISOString(),
    sourceFolder: INPUT_DIR,
    outputPurpose: "Preview and organize all generated overlay JSON files for OBS production rebuilding.",
    customizationDefaults: {
      stream_name: "BL0WDART",
      kick_channel: "bl0wdart",
      chat_popout_url: "https://kick.com/popout/bl0wdart/chat",
      canvas_width: 1920,
      canvas_height: 1080,
      fps: 60,
      webcam_source_name: "Your Webcam Source",
      game_capture_source_name: "Your Game Capture Source",
    },
    counts: {
      overlays: overlays.length,
      families: Object.keys(grouped).length,
      manifest_count: manifest.count ?? overlays.length,
    },
    groups: Object.entries(grouped).map(([category, items]) => ({
      category,
      overlays: items.map((overlay) => sceneItemForOverlay(overlay, INPUT_DIR)),
    })),
  };

  await writeFile(OUTPUT_FILE, JSON.stringify(sceneCollection, null, 2), "utf8");
  console.log(`Wrote customizable scene pack with ${overlays.length} overlays to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
