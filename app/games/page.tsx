import Link from "next/link";
import { GAME_CATEGORIES, GAME_SLUGS, GAME_THEMES } from "@/lib/constants";

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Game Collections</h1>
      <p className="mt-3 max-w-3xl text-slate-300">
        Original game-inspired OBS overlay collections designed for tactical shooters, survival
        worlds, raid content, and premium streamer branding without using copyrighted official game assets.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {GAME_CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/games/${GAME_SLUGS[category]}`}
            className="rounded-3xl border border-white/10 bg-white/6 p-6 transition hover:-translate-y-1"
          >
            <p className="text-2xl font-semibold text-white">{category}</p>
            <p className="mt-3 text-sm text-slate-400">{GAME_THEMES[category].description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
