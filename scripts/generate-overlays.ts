import { generateOverlayBatch } from "@/lib/overlay-generator/generator";

async function main() {
  const [gameCategory = "Call of Duty", overlayType = "Full Stream Pack", quantity = "5"] = process.argv.slice(2);
  const result = await generateOverlayBatch({
    gameCategory,
    overlayType,
    quantity: Number(quantity),
    minPrice: 2000,
    maxPrice: 2500,
    publish: true,
  });
  console.log(`Created batch ${result.batch.id} with ${result.createdProducts.length} products.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
