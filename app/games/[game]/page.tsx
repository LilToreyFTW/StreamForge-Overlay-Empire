import { notFound } from "next/navigation";
import { GAME_THEMES, SLUG_TO_GAME } from "@/lib/constants";
import { getActiveProducts } from "@/lib/data";
import { ProductCard } from "@/components/products/product-card";

const designCopy: Record<string, string> = {
  "Call of Duty": "Tactical military HUD style with dark metal framing, red accents, and weapon-loadout inspired panels.",
  "ARC Raiders": "Sci-fi extraction styling with rusted metal, orange warning lights, and futuristic survival HUD energy.",
  "Dying Light: The Beast": "Horror survival presentation with infected city tones, hazard color palettes, and scratched industrial paneling.",
  "Subnautica 2": "Underwater sci-fi design language with deep ocean blues, neon aqua accents, and submarine-dashboard styling.",
  Fallout: "Retro wasteland presentation with rusted metal, vault-style borders, and terminal-inspired highlight colors.",
  "Escape from Tarkov": "Hardcore extraction visuals with dark military palettes, inventory framing, and raid-ready minimalist HUDs.",
  "Tom Clancy's Rainbow Six Siege": "Competitive operator-inspired layouts with esports polish, tactical framing, and team-color accents.",
};

export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  const gameCategory = SLUG_TO_GAME[game];
  if (!gameCategory) notFound();

  const products = (await getActiveProducts()).filter((product) => product.gameCategory === gameCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/6 p-8">
        <h1 className="text-4xl font-semibold text-white">{gameCategory}</h1>
        <p className="mt-3 max-w-3xl text-slate-300">{designCopy[gameCategory] ?? GAME_THEMES[gameCategory].description}</p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
