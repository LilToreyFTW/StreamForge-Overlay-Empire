import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { NextResponse } from "next/server";
import { getTemplateProductBySlug } from "@/lib/template-products";

const SHARED_SCRIPT = "D:/obs-studio/overlays/shared/kick-status.js";

function sanitizeName(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24);
}

async function addFile(zip: JSZip, targetPath: string, sourcePath: string, streamName: string) {
  let content = await readFile(sourcePath, "utf8");
  content = content
    .replaceAll("bl0wdart", streamName.toLowerCase())
    .replaceAll("BL0WDART", streamName.toUpperCase())
    .replace(/params\.get\("username"\)/g, `"${streamName}"`);
  zip.file(targetPath, content);
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(request.url);
  const streamName = sanitizeName(url.searchParams.get("streamName") ?? "");
  const product = getTemplateProductBySlug(slug);

  if (!product) return NextResponse.json({ error: "Template product not found." }, { status: 404 });
  if (!streamName && product.isCustomizable) {
    return NextResponse.json({ error: "Stream name is required." }, { status: 400 });
  }

  const zip = new JSZip();
  const root = product.sourceDir;

  if (product.assetMode === "scene-pack") {
    await addFile(zip, "scene-overlay.html", path.join(root, "scene-overlay.html"), streamName);
    await addFile(zip, "scene-styles.css", path.join(root, "scene-styles.css"), streamName);
    await addFile(zip, "webcam/index.html", path.join(root, "webcam", "index.html"), streamName);
    await addFile(zip, "webcam/styles.css", path.join(root, "webcam", "styles.css"), streamName);
    await addFile(zip, "nametag-kickusername/index.html", path.join(root, "nametag-kickusername", "index.html"), streamName);
    await addFile(zip, "nametag-kickusername/styles.css", path.join(root, "nametag-kickusername", "styles.css"), streamName);
    zip.file("shared/kick-status.js", await readFile(SHARED_SCRIPT, "utf8"));
    zip.file(
      "README.txt",
      `StreamForge customized overlay pack\nStream name: ${streamName}\n\nAdd the included HTML files as OBS browser sources and keep the folder structure intact.`,
    );
  } else {
    await addFile(zip, "webcam/index.html", path.join(root, "webcam", "index.html"), streamName);
    await addFile(zip, "webcam/styles.css", path.join(root, "webcam", "styles.css"), streamName);
    zip.file(
      "README.txt",
      "StreamForge webcam overlay\n\nAdd webcam/index.html as an OBS browser source and keep styles.css in the same folder.",
    );
  }

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  const bytes = new Uint8Array(buffer);

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${product.slug}${streamName ? `-${streamName}` : ""}.zip"`,
    },
  });
}
