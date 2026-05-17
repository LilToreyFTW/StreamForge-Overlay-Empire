import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { TEMPLATE_PRODUCTS } from "@/lib/template-products";

const PREVIEW_ROOT = path.join(process.cwd(), "public", "generated-previews");
const CATALOG_PATH = path.join(process.cwd(), "storage", "overlays", "fallback-catalog.json");

function previewSvg(title: string, category: string, note: string, accent: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" rx="40" fill="#050914"/>
  <rect x="40" y="40" width="1520" height="820" rx="32" fill="rgba(255,255,255,0.04)" stroke="${accent}" stroke-width="2"/>
  <rect x="76" y="76" width="1040" height="580" rx="28" fill="rgba(255,255,255,0.025)"/>
  <rect x="1170" y="130" width="290" height="510" rx="26" fill="none" stroke="${accent}" stroke-width="6"/>
  <text x="96" y="170" fill="${accent}" font-size="54" font-family="Arial" font-weight="700">${title}</text>
  <text x="96" y="236" fill="#dbeafe" font-size="28" font-family="Arial">${category}</text>
  <text x="96" y="302" fill="#94a3b8" font-size="24" font-family="Arial">${note}</text>
  <text x="96" y="780" fill="#67e8f9" font-size="24" font-family="Arial">Custom stream name supported on-site</text>
</svg>`;
}

async function main() {
  await mkdir(PREVIEW_ROOT, { recursive: true });
  const accents: Record<string, string> = {
    "ARC Raiders": "#f59e0b",
    Fortnite: "#22d3ee",
    Overwatch: "#fb923c",
    "Just Chatting": "#f472b6",
  };

  for (const product of TEMPLATE_PRODUCTS) {
    const previewFile = path.join(PREVIEW_ROOT, path.basename(product.previewImage));
    await writeFile(
      previewFile,
      previewSvg(product.title, product.gameCategory, product.overlayType, accents[product.gameCategory] ?? "#67e8f9"),
      "utf8",
    );
  }

  await writeFile(CATALOG_PATH, JSON.stringify(TEMPLATE_PRODUCTS, null, 2), "utf8");
  console.log(`Imported ${TEMPLATE_PRODUCTS.length} template overlays into fallback catalog.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
