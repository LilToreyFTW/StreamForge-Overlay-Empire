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
    modules?: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      role: string;
    }>;
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

const INPUT_DIR = "D:/obs-studio/overlays/generated-json-preview";
const OUTPUT_DIR = "D:/obs-studio/overlays/scenes-for-obs";
const VIEWER_DIR = path.join(OUTPUT_DIR, "viewer");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "streamforge-native-preview-collection.json");

function parseResolution(input?: string) {
  const match = input?.match(/^(\d+)x(\d+)$/);
  if (!match) return { width: 1920, height: 1080 };
  return { width: Number(match[1]), height: Number(match[2]) };
}

function browserSource(name: string, overlayPath: string, width: number, height: number) {
  return {
    prev_ver: 536936450,
    name,
    uuid: randomUUID(),
    id: "browser_source",
    versioned_id: "browser_source",
    settings: {
      url: `file:///D:/obs-studio/overlays/scenes-for-obs/viewer/index.html?overlay=${encodeURIComponent(overlayPath)}`,
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

function sceneSource(name: string, sourceUuid: string) {
  return {
    prev_ver: 536936450,
    name,
    uuid: randomUUID(),
    id: "scene",
    versioned_id: "scene",
    settings: {
      custom_size: false,
      id_counter: 1,
      items: [
        {
          name,
          source_uuid: sourceUuid,
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
          id: 1,
          group_item_backup: false,
          pos: { x: 0, y: 0 },
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
        },
      ],
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
    hotkeys: {
      "OBSBasic.SelectScene": [],
      "libobs.show_scene_item.1": [],
      "libobs.hide_scene_item.1": [],
    },
    deinterlace_mode: 0,
    deinterlace_field_order: 0,
    monitoring_type: 0,
    canvas_uuid: "6c69626f-6273-4c00-9d88-c5136d61696e",
    private_settings: {},
  };
}

function viewerHtml() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StreamForge Overlay Viewer</title>
    <link rel="stylesheet" href="./viewer.css" />
  </head>
  <body>
    <div id="app" class="app"></div>
    <script src="./viewer.js"></script>
  </body>
</html>`;
}

function viewerCss() {
  return `:root {
  --bg: #090b12;
  --panel: rgba(255,255,255,0.06);
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
.app {
  position: relative;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  background: transparent;
}
.bg {
  position: absolute;
  inset: 0;
}
.module, .headline, .status, .webcam-frame, .footer-bar, .rail {
  position: absolute;
  border: 2px solid var(--accent);
  background: rgba(255,255,255,0.04);
  box-shadow: 0 0 18px color-mix(in srgb, var(--accent) 30%, transparent);
}
.headline, .status {
  padding: 14px 18px;
  color: var(--tertiary);
  font-weight: 700;
  text-transform: uppercase;
}
.subtitle {
  margin-top: 6px;
  color: var(--accent);
  font-size: 14px;
  letter-spacing: 0.22em;
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
.webcam-frame {
  background: linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.015));
}
.webcam-cutout {
  position: absolute;
  inset: 16px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.14);
}
.footer-bar {
  height: 72px;
}
.rail {
  width: 12px;
  border-radius: 999px;
}
.rings::before, .rings::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  border: 18px solid color-mix(in srgb, var(--accent) 80%, transparent);
}
.rings::before {
  width: 540px;
  height: 540px;
  right: 180px;
  top: 180px;
  opacity: 0.55;
}
.rings::after {
  width: 400px;
  height: 400px;
  right: 250px;
  top: 250px;
  border-color: color-mix(in srgb, var(--secondary) 78%, transparent);
  opacity: 0.7;
}
.slashes::before, .slashes::after {
  content: "";
  position: absolute;
  inset: auto;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 42%, transparent), transparent);
  transform: rotate(-24deg);
}
.slashes::before { width: 520px; height: 42px; left: -80px; top: 110px; }
.slashes::after { width: 640px; height: 42px; right: -120px; bottom: 160px; }
.armor::before {
  content: "";
  position: absolute;
  inset: 40px;
  border: 3px solid color-mix(in srgb, var(--secondary) 70%, transparent);
  clip-path: polygon(0 12%, 10% 0, 90% 0, 100% 12%, 100% 88%, 90% 100%, 10% 100%, 0 88%);
  opacity: 0.22;
}
.vector::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(color-mix(in srgb, var(--accent) 16%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--accent) 16%, transparent) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 0.14;
}
.chrome::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.08) 45%, transparent 55%);
  opacity: 0.35;
}`;
}

function viewerJs() {
  return `async function boot() {
  const params = new URLSearchParams(window.location.search);
  const overlayPath = params.get("overlay");
  const app = document.getElementById("app");
  if (!overlayPath) {
    app.textContent = "Missing overlay path";
    return;
  }
  const response = await fetch("file:///" + overlayPath.replace(/\\\\/g, "/"));
  const overlay = await response.json();
  const palette = overlay.palette || { background: "#090b12", accent: "#67d4ff", secondary: "#f59b3d", tertiary: "#f8fafc" };
  app.style.setProperty("--accent", palette.accent);
  app.style.setProperty("--secondary", palette.secondary);
  app.style.setProperty("--tertiary", palette.tertiary);
  app.className = "app " + (overlay.composition?.layoutFamily || "");

  const bg = document.createElement("div");
  bg.className = "bg";
  bg.style.background = "radial-gradient(circle at top, " + palette.accent + "22, transparent 30%), linear-gradient(180deg, " + palette.background + ", #0f172a)";
  app.appendChild(bg);

  const headline = document.createElement("div");
  headline.className = "headline";
  headline.style.left = "80px";
  headline.style.top = "56px";
  headline.style.width = "640px";
  headline.innerHTML = "<div>" + (overlay.textLayers?.[0]?.text || overlay.title) + "</div><div class='subtitle'>" + (overlay.textLayers?.[1]?.text || overlay.category || "") + "</div>";
  app.appendChild(headline);

  const status = document.createElement("div");
  status.className = "status";
  status.style.left = "1450px";
  status.style.top = "64px";
  status.style.width = "320px";
  status.textContent = overlay.overlayType || "Overlay";
  app.appendChild(status);

  const leftRail = document.createElement("div");
  leftRail.className = "rail";
  leftRail.style.left = "24px";
  leftRail.style.top = "190px";
  leftRail.style.height = "620px";
  app.appendChild(leftRail);

  const rightRail = document.createElement("div");
  rightRail.className = "rail";
  rightRail.style.left = "1864px";
  rightRail.style.top = "190px";
  rightRail.style.height = "620px";
  app.appendChild(rightRail);

  (overlay.composition?.modules || []).forEach((mod) => {
    const node = document.createElement("div");
    node.className = "module";
    node.style.left = mod.x + "px";
    node.style.top = mod.y + "px";
    node.style.width = mod.width + "px";
    node.style.height = mod.height + "px";
    const label = document.createElement("div");
    label.className = "module-label";
    label.textContent = mod.role.replace(/-/g, " ");
    node.appendChild(label);
    app.appendChild(node);
  });

  if (overlay.composition?.cameraFrame) {
    const cam = overlay.composition.cameraFrame;
    const frame = document.createElement("div");
    frame.className = "webcam-frame";
    frame.style.left = cam.x + "px";
    frame.style.top = cam.y + "px";
    frame.style.width = cam.width + "px";
    frame.style.height = cam.height + "px";
    frame.style.borderRadius = (cam.radius || 20) + "px";
    const cutout = document.createElement("div");
    cutout.className = "webcam-cutout";
    cutout.style.borderRadius = Math.max((cam.radius || 20) - 8, 10) + "px";
    frame.appendChild(cutout);
    app.appendChild(frame);
  }

  if (overlay.composition?.lowerBar) {
    const bar = document.createElement("div");
    bar.className = "footer-bar";
    bar.style.left = overlay.composition.lowerBar.x + "px";
    bar.style.top = overlay.composition.lowerBar.y + "px";
    bar.style.width = overlay.composition.lowerBar.width + "px";
    app.appendChild(bar);
  }
}
boot();`;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(VIEWER_DIR, { recursive: true });

  const names = (await readdir(INPUT_DIR)).filter((name) => name.endsWith(".json") && name !== "manifest.json").sort();
  const overlays: OverlayJson[] = [];
  for (const name of names) {
    overlays.push(JSON.parse(await readFile(path.join(INPUT_DIR, name), "utf8")) as OverlayJson);
  }

  await writeFile(path.join(VIEWER_DIR, "index.html"), viewerHtml(), "utf8");
  await writeFile(path.join(VIEWER_DIR, "viewer.css"), viewerCss(), "utf8");
  await writeFile(path.join(VIEWER_DIR, "viewer.js"), viewerJs(), "utf8");

  const sources: Array<Record<string, unknown>> = [];
  const sceneOrder: Array<{ name: string }> = [];

  for (const overlay of overlays) {
    const resolution = parseResolution(overlay.obsHints?.recommendedResolution);
    const overlayPath = path.join(INPUT_DIR, `${overlay.slug}.json`);
    const source = browserSource(`${overlay.title} Preview`, overlayPath, resolution.width, resolution.height);
    sources.push(source);
    sources.push(sceneSource(overlay.title, String(source.uuid)));
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
  console.log(`Wrote native OBS preview collection with ${sceneOrder.length} scenes to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
