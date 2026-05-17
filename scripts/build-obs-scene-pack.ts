import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

type OverlayJson = {
  title: string;
  slug: string;
  category: string;
  overlayType: string;
  palette?: {
    background: string;
    accent: string;
    secondary: string;
    tertiary: string;
  };
  composition?: {
    layoutFamily?: string;
    cameraFrame?: {
      x: number;
      y: number;
      width: number;
      height: number;
      transparentCenter?: boolean;
      radius?: number;
    } | null;
    lowerBar?: { x: number; y: number; width: number; height: number } | null;
    modules?: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      role: string;
    }>;
  };
  layout?: {
    cameraFrame?: {
      x: number;
      y: number;
      width: number;
      height: number;
      transparentCenter?: boolean;
      radius?: number;
    } | null;
    webcamFramePlacement?: {
      x: number;
      y: number;
      width: number;
      height: number;
      transparentCenter?: boolean;
      radius?: number;
    } | null;
    sceneBars?: {
      top?: { x: number; y: number; width: number; height: number };
      bottom?: { x: number; y: number; width: number; height: number };
    };
    callouts?: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
    }>;
  };
  visualStyle?: {
    shapeLanguage?: string;
    accentColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
  };
  textLayers?: Array<{
    id: string;
    text: string;
    fontSize?: number;
    letterSpacing?: number;
  }>;
  obsHints?: {
    recommendedResolution?: string;
    recommendedRefreshRate?: number;
  };
};

type SceneItem = {
  name: string;
  source_uuid: string;
  pos: { x: number; y: number };
  width: number;
  height: number;
  id: number;
};

const INPUT_DIR = "D:/obs-studio/overlays/generated-json-preview";
const OUTPUT_DIR = "D:/obs-studio/overlays/scenes-for-obs";
const VIEWER_DIR = path.join(OUTPUT_DIR, "viewer");
const COMPONENTS_DIR = path.join(VIEWER_DIR, "components");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "streamforge-native-preview-collection.json");
const OUTPUT_FILE_KICK_STYLE = path.join(OUTPUT_DIR, "streamforge-kick-style-overlays.json");

function parseResolution(input?: string) {
  const match = input?.match(/^(\d+)x(\d+)$/);
  if (!match) return { width: 1920, height: 1080 };
  return { width: Number(match[1]), height: Number(match[2]) };
}

function getPalette(overlay: OverlayJson) {
  return overlay.palette || {
    background: overlay.visualStyle?.backgroundColor || "#090b12",
    accent: overlay.visualStyle?.accentColor || "#67d4ff",
    secondary: overlay.visualStyle?.secondaryColor || "#f59b3d",
    tertiary: "#f8fafc",
  };
}

function getLayoutFamily(overlay: OverlayJson) {
  return (
    overlay.composition?.layoutFamily ||
    (overlay.visualStyle?.shapeLanguage?.includes("ring") ? "rings" : "") ||
    ""
  );
}

function componentCss() {
  return `:root {
  --accent: #67d4ff;
  --secondary: #f59b3d;
  --tertiary: #f8fafc;
  --background: transparent;
}
* { box-sizing: border-box; }
html, body {
  margin: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  overflow: hidden;
  font-family: Bahnschrift, "Segoe UI", sans-serif;
}
.root {
  position: relative;
  width: 100%;
  height: 100%;
  background: transparent;
}
.panel, .line, .frame, .module, .badge {
  position: absolute;
  inset: 0;
}
.full-bg {
  background: radial-gradient(circle at top, color-mix(in srgb, var(--accent) 20%, transparent), transparent 32%), linear-gradient(180deg, color-mix(in srgb, var(--background) 94%, black), #0f172a);
}
.headline, .status, .module, .footer {
  border: 2px solid var(--accent);
  background: rgba(255,255,255,0.04);
  color: var(--tertiary);
  box-shadow: 0 0 18px color-mix(in srgb, var(--accent) 30%, transparent);
}
.headline, .status {
  width: 100%;
  height: 100%;
  padding: 14px 18px;
  text-transform: uppercase;
  font-weight: 700;
}
.subtitle {
  margin-top: 6px;
  color: var(--accent);
  font-size: 14px;
  letter-spacing: 0.22em;
}
.rail {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(180deg, transparent, var(--secondary), transparent);
  box-shadow: 0 0 16px color-mix(in srgb, var(--accent) 28%, transparent);
}
.footer {
  width: 100%;
  height: 100%;
}
.module {
  width: 100%;
  height: 100%;
  border: 2px solid var(--accent);
  background: rgba(255,255,255,0.04);
}
.module-label {
  position: absolute;
  left: 10px;
  top: 8px;
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.webcam {
  width: 100%;
  height: 100%;
  border: 3px solid var(--accent);
  background: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.015));
  box-shadow: 0 0 22px color-mix(in srgb, var(--accent) 34%, transparent);
}
.webcam-cutout {
  position: absolute;
  inset: 16px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.16);
}
.rings::before, .rings::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  border: 18px solid color-mix(in srgb, var(--accent) 82%, transparent);
}
.rings::before { width: 70%; height: 70%; right: -6%; top: 12%; opacity: 0.45; }
.rings::after { width: 52%; height: 52%; right: 3%; top: 21%; border-color: color-mix(in srgb, var(--secondary) 76%, transparent); opacity: 0.65; }
.slashes::before, .slashes::after {
  content: "";
  position: absolute;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 42%, transparent), transparent);
  transform: rotate(-24deg);
}
.slashes::before { width: 40%; height: 4%; left: -6%; top: 10%; }
.slashes::after { width: 48%; height: 4%; right: -9%; bottom: 12%; }
.armor::before {
  content: "";
  position: absolute;
  inset: 4%;
  border: 3px solid color-mix(in srgb, var(--secondary) 68%, transparent);
  clip-path: polygon(0 12%, 10% 0, 90% 0, 100% 12%, 100% 88%, 90% 100%, 10% 100%, 0 88%);
  opacity: 0.24;
}
.vector::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(color-mix(in srgb, var(--accent) 16%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--accent) 16%, transparent) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.16;
}
.chrome::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.08) 45%, transparent 55%);
  opacity: 0.35;
}`;
}

function componentJs() {
  return `const component = window.__STREAMFORGE_COMPONENT__;
const root = document.getElementById("root");
if (!component) {
  root.textContent = "Missing component data";
} else {
  const palette = component.palette;
  document.documentElement.style.setProperty("--accent", palette.accent);
  document.documentElement.style.setProperty("--secondary", palette.secondary);
  document.documentElement.style.setProperty("--tertiary", palette.tertiary);
  document.documentElement.style.setProperty("--background", palette.background);
  root.className = "root " + (component.layoutFamily || "");

  switch (component.kind) {
    case "background":
      root.classList.add("full-bg");
      break;
    case "headline":
      root.innerHTML = '<div class="headline"><div>' + component.title + '</div><div class="subtitle">' + component.subtitle + '</div></div>';
      break;
    case "status":
      root.innerHTML = '<div class="status">' + component.label + '</div>';
      break;
    case "rail":
      root.innerHTML = '<div class="rail"></div>';
      break;
    case "footer":
      root.innerHTML = '<div class="footer"></div>';
      break;
    case "module":
      root.innerHTML = '<div class="module"><div class="module-label">' + component.label + '</div></div>';
      break;
    case "webcam":
      root.innerHTML = '<div class="webcam" style="border-radius:' + component.radius + 'px"><div class="webcam-cutout" style="border-radius:' + Math.max(component.radius - 8, 10) + 'px"></div></div>';
      break;
  }
}`;
}

function componentHtml(data: Record<string, unknown>) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="../component.css" />
  </head>
  <body>
    <div id="root" class="root"></div>
    <script>window.__STREAMFORGE_COMPONENT__ = ${JSON.stringify(data)};</script>
    <script src="../component.js"></script>
  </body>
</html>`;
}

function browserSource(name: string, localFile: string, width: number, height: number) {
  return {
    prev_ver: 536936450,
    name,
    uuid: randomUUID(),
    id: "browser_source",
    versioned_id: "browser_source",
    settings: {
      is_local_file: true,
      local_file: localFile,
      width,
      height,
      fps_custom: false,
      fps: 60,
      css: "",
      shutdown: true,
      restart_when_active: false,
      reroute_audio: false,
      web_page_control_level: 1,
    },
    mixers: 255,
    sync: 0,
    flags: 0,
    volume: 1,
    balance: 0.5,
    enabled: true,
    muted: false,
    push_to_mute: false,
    push_to_mute_delay: 0,
    push_to_talk: false,
    push_to_talk_delay: 0,
    hotkeys: {
      "libobs.mute": [],
      "libobs.unmute": [],
      "libobs.push-to-mute": [],
      "libobs.push-to-talk": [],
      "ObsBrowser.Refresh": [],
    },
    deinterlace_mode: 0,
    deinterlace_field_order: 0,
    monitoring_type: 0,
    private_settings: {},
  };
}

function colorSource(name: string, width: number, height: number, color: number) {
  return {
    prev_ver: 536936450,
    name,
    uuid: randomUUID(),
    id: "color_source_v3",
    versioned_id: "color_source_v3",
    settings: {
      color,
      width,
      height,
    },
    mixers: 255,
    sync: 0,
    flags: 0,
    volume: 1,
    balance: 0.5,
    enabled: true,
    muted: false,
    push_to_mute: false,
    push_to_mute_delay: 0,
    push_to_talk: false,
    push_to_talk_delay: 0,
    hotkeys: {
      "libobs.mute": [],
      "libobs.unmute": [],
      "libobs.push-to-mute": [],
      "libobs.push-to-talk": [],
    },
    deinterlace_mode: 0,
    deinterlace_field_order: 0,
    monitoring_type: 0,
    private_settings: {},
  };
}

function sceneItem(item: SceneItem) {
  return {
    name: item.name,
    source_uuid: item.source_uuid,
    visible: true,
    locked: false,
    rot: 0,
    align: 5,
    bounds_type: 0,
    bounds_align: 0,
    bounds_crop: false,
    crop_left: 0,
    crop_top: 0,
    crop_right: 0,
    crop_bottom: 0,
    id: item.id,
    group_item_backup: false,
    pos: { x: item.pos.x, y: item.pos.y },
    pos_rel: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    scale_rel: { x: 1, y: 1 },
    bounds: { x: 0, y: 0 },
    bounds_rel: { x: 0, y: 0 },
    scale_filter: "disable",
    blend_method: "default",
    blend_type: "normal",
    show_transition: { duration: 300 },
    hide_transition: { duration: 300 },
    private_settings: {},
  };
}

function sceneSource(name: string, items: SceneItem[]) {
  return {
    prev_ver: 536936450,
    name,
    uuid: randomUUID(),
    id: "scene",
    versioned_id: "scene",
    settings: {
      custom_size: false,
      id_counter: items.length + 1,
      items: items.map(sceneItem),
    },
    mixers: 0,
    sync: 0,
    flags: 0,
    volume: 1,
    balance: 0.5,
    enabled: true,
    muted: false,
    push_to_mute: false,
    push_to_mute_delay: 0,
    push_to_talk: false,
    push_to_talk_delay: 0,
    hotkeys: Object.fromEntries(
      [["OBSBasic.SelectScene", [] as unknown[]]].concat(
        items.flatMap((item) => [
          [`libobs.show_scene_item.${item.id}`, [] as unknown[]],
          [`libobs.hide_scene_item.${item.id}`, [] as unknown[]],
        ]),
      ),
    ),
    deinterlace_mode: 0,
    deinterlace_field_order: 0,
    monitoring_type: 0,
    canvas_uuid: "6c69626f-6273-4c00-9d88-c5136d61696e",
    private_settings: {},
  };
}

async function emitComponent(
  overlay: OverlayJson,
  componentKey: string,
  data: Record<string, unknown>,
  width: number,
  height: number,
) {
  const componentPath = path.join(COMPONENTS_DIR, `${overlay.slug}--${componentKey}.html`);
  await writeFile(componentPath, componentHtml(data), "utf8");
  return browserSource(`${overlay.title} ${componentKey}`, componentPath, width, height);
}

async function buildOverlaySources(overlay: OverlayJson) {
  const palette = getPalette(overlay);
  const layoutFamily = getLayoutFamily(overlay);
  const composition = overlay.composition || {};
  const layout = overlay.layout || {};
  const cameraFrame = composition.cameraFrame || layout.cameraFrame || layout.webcamFramePlacement || null;
  const lowerBar = composition.lowerBar || layout.sceneBars?.bottom || null;
  const modules = [...(composition.modules || [])];
  const callouts = (layout.callouts || []).map((entry, index) => ({
    id: `callout-${index + 1}`,
    x: entry.x,
    y: entry.y,
    width: entry.width,
    height: entry.height,
    role: entry.label,
  }));
  const allModules = [...modules, ...callouts];

  const sources: Array<Record<string, unknown>> = [];
  const sceneItems: SceneItem[] = [];
  let itemId = 1;

  const gameplayModule =
    allModules.find((mod) => ["main-scene", "hero-window", "hero-shell", "main-cam", "hero-card"].includes(mod.role)) ||
    null;
  const sideCamModule =
    allModules.find((mod) => ["mini-cam", "side-cam", "webcam-panel", "right-shell", "top-cam"].includes(mod.role)) ||
    null;
  const chatModule =
    allModules.find((mod) => ["chat-box", "bottom-cam"].includes(mod.role)) ||
    null;

  if (gameplayModule) {
    const gameplay = colorSource(`${overlay.title} Gameplay Placeholder`, gameplayModule.width, gameplayModule.height, 4279834905);
    sources.push(gameplay);
    sceneItems.push({
      name: String(gameplay.name),
      source_uuid: String(gameplay.uuid),
      pos: { x: gameplayModule.x, y: gameplayModule.y },
      width: gameplayModule.width,
      height: gameplayModule.height,
      id: itemId++,
    });
  }

  if (chatModule) {
    const chat = colorSource(`${overlay.title} Chat Placeholder`, chatModule.width, chatModule.height, 4280032286);
    sources.push(chat);
    sceneItems.push({
      name: String(chat.name),
      source_uuid: String(chat.uuid),
      pos: { x: chatModule.x, y: chatModule.y },
      width: chatModule.width,
      height: chatModule.height,
      id: itemId++,
    });
  }

  if (sideCamModule) {
    const sideCam = colorSource(`${overlay.title} Side Cam Placeholder`, sideCamModule.width, sideCamModule.height, 4281545523);
    sources.push(sideCam);
    sceneItems.push({
      name: String(sideCam.name),
      source_uuid: String(sideCam.uuid),
      pos: { x: sideCamModule.x, y: sideCamModule.y },
      width: sideCamModule.width,
      height: sideCamModule.height,
      id: itemId++,
    });
  }

  const background = await emitComponent(
    overlay,
    "background",
    { kind: "background", palette, layoutFamily },
    1920,
    1080,
  );
  sources.push(background);
  sceneItems.push({ name: String(background.name), source_uuid: String(background.uuid), pos: { x: 0, y: 0 }, width: 1920, height: 1080, id: itemId++ });

  const headline = await emitComponent(
    overlay,
    "headline",
    {
      kind: "headline",
      palette,
      layoutFamily,
      title: overlay.textLayers?.[0]?.text || overlay.title,
      subtitle: overlay.textLayers?.[1]?.text || overlay.category,
    },
    640,
    110,
  );
  sources.push(headline);
  sceneItems.push({ name: String(headline.name), source_uuid: String(headline.uuid), pos: { x: 80, y: 56 }, width: 640, height: 110, id: itemId++ });

  const status = await emitComponent(
    overlay,
    "status",
    { kind: "status", palette, layoutFamily, label: overlay.overlayType },
    320,
    88,
  );
  sources.push(status);
  sceneItems.push({ name: String(status.name), source_uuid: String(status.uuid), pos: { x: 1450, y: 64 }, width: 320, height: 88, id: itemId++ });

  const leftRail = await emitComponent(overlay, "left-rail", { kind: "rail", palette, layoutFamily }, 12, 620);
  sources.push(leftRail);
  sceneItems.push({ name: String(leftRail.name), source_uuid: String(leftRail.uuid), pos: { x: 24, y: 190 }, width: 12, height: 620, id: itemId++ });

  const rightRail = await emitComponent(overlay, "right-rail", { kind: "rail", palette, layoutFamily }, 12, 620);
  sources.push(rightRail);
  sceneItems.push({ name: String(rightRail.name), source_uuid: String(rightRail.uuid), pos: { x: 1864, y: 190 }, width: 12, height: 620, id: itemId++ });

  for (const mod of allModules) {
    const source = await emitComponent(
      overlay,
      mod.id,
      { kind: "module", palette, layoutFamily, label: mod.role },
      mod.width,
      mod.height,
    );
    sources.push(source);
    sceneItems.push({
      name: String(source.name),
      source_uuid: String(source.uuid),
      pos: { x: mod.x, y: mod.y },
      width: mod.width,
      height: mod.height,
      id: itemId++,
    });
  }

  if (cameraFrame) {
    const webcamFill = colorSource(`${overlay.title} Webcam Content Placeholder`, cameraFrame.width, cameraFrame.height, 4279308561);
    sources.push(webcamFill);
    sceneItems.push({
      name: String(webcamFill.name),
      source_uuid: String(webcamFill.uuid),
      pos: { x: cameraFrame.x, y: cameraFrame.y },
      width: cameraFrame.width,
      height: cameraFrame.height,
      id: itemId++,
    });

    const webcam = await emitComponent(
      overlay,
      "webcam-frame",
      { kind: "webcam", palette, layoutFamily, radius: cameraFrame.radius || 20 },
      cameraFrame.width,
      cameraFrame.height,
    );
    sources.push(webcam);
    sceneItems.push({
      name: String(webcam.name),
      source_uuid: String(webcam.uuid),
      pos: { x: cameraFrame.x, y: cameraFrame.y },
      width: cameraFrame.width,
      height: cameraFrame.height,
      id: itemId++,
    });
  }

  if (lowerBar) {
    const footer = await emitComponent(
      overlay,
      "footer-bar",
      { kind: "footer", palette, layoutFamily },
      lowerBar.width,
      lowerBar.height,
    );
    sources.push(footer);
    sceneItems.push({
      name: String(footer.name),
      source_uuid: String(footer.uuid),
      pos: { x: lowerBar.x, y: lowerBar.y },
      width: lowerBar.width,
      height: lowerBar.height,
      id: itemId++,
    });
  }

  return { sources, sceneItems };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(VIEWER_DIR, { recursive: true });
  await mkdir(COMPONENTS_DIR, { recursive: true });

  const names = (await readdir(INPUT_DIR)).filter((name) => name.endsWith(".json") && name !== "manifest.json").sort();
  const overlays: OverlayJson[] = [];
  for (const name of names) {
    overlays.push(JSON.parse(await readFile(path.join(INPUT_DIR, name), "utf8")) as OverlayJson);
  }

  await writeFile(path.join(VIEWER_DIR, "component.css"), componentCss(), "utf8");
  await writeFile(path.join(VIEWER_DIR, "component.js"), componentJs(), "utf8");

  const sources: Array<Record<string, unknown>> = [];
  const sceneOrder: Array<{ name: string }> = [];

  for (const overlay of overlays) {
    const { sources: overlaySources, sceneItems } = await buildOverlaySources(overlay);
    sources.push(...overlaySources);
    const scene = sceneSource(overlay.title, sceneItems);
    sources.push(scene);
    sceneOrder.push({ name: overlay.title });
  }

  const collection = {
    name: "StreamForge Native Preview Collection",
    sources,
    groups: [],
    scene_order: sceneOrder,
    current_scene: sceneOrder[0]?.name ?? "",
    current_program_scene: sceneOrder[0]?.name ?? "",
    canvases: [],
    current_transition: "Fade",
    transition_duration: 300,
    transitions: [],
    quick_transitions: [
      { name: "Cut", duration: 300, hotkeys: [], id: 1, fade_to_black: false },
      { name: "Fade", duration: 300, hotkeys: [], id: 2, fade_to_black: false },
      { name: "Fade", duration: 300, hotkeys: [], id: 3, fade_to_black: true },
    ],
    saved_projectors: [],
    preview_locked: false,
    scaling_enabled: false,
    scaling_level: -9,
    scaling_off_x: 0,
    scaling_off_y: 0,
    "virtual-camera": { type2: 3 },
    modules: {
      "auto-scene-switcher": {
        interval: 300,
        non_matching_scene: "",
        switch_if_not_matching: false,
        active: false,
        switches: [],
      },
      captions: {
        source: "",
        enabled: false,
        lang_id: 1033,
        provider: "mssapi",
      },
      "output-timer": {
        streamTimerHours: 0,
        streamTimerMinutes: 0,
        streamTimerSeconds: 30,
        recordTimerHours: 0,
        recordTimerMinutes: 0,
        recordTimerSeconds: 30,
        autoStartStreamTimer: false,
        autoStartRecordTimer: false,
        pauseRecordTimer: true,
      },
      "scripts-tool": [],
    },
    resolution: { x: 1920, y: 1080 },
    version: 2,
  };

  await writeFile(OUTPUT_FILE, JSON.stringify(collection, null, 2), "utf8");
  await writeFile(OUTPUT_FILE_KICK_STYLE, JSON.stringify(collection, null, 2), "utf8");
  console.log(`Wrote native OBS preview collection with ${sceneOrder.length} scenes and separated editable sources to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
