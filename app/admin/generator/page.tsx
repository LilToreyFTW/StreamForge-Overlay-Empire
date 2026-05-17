import { generateOverlaysAction } from "@/app/server-actions";
import { GAME_CATEGORIES, OVERLAY_TYPES } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminGeneratorPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Overlay Generator</h1>
      <form action={generateOverlaysAction} className="mt-8 grid gap-4 rounded-[2rem] border border-white/10 bg-white/6 p-8 md:grid-cols-2">
        <select name="gameCategory" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none">
          {GAME_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select>
        <select name="overlayType" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none">
          {OVERLAY_TYPES.map((type) => <option key={type}>{type}</option>)}
        </select>
        <input name="quantity" defaultValue="10" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
        <input name="minPrice" defaultValue="2000" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
        <input name="maxPrice" defaultValue="2500" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
        <label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" name="publish" defaultChecked /> Automatically publish to marketplace</label>
        <button className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950">Generate overlay batch</button>
      </form>
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/6 p-6 text-sm text-slate-300">
        Supports product metadata generation, slug creation, category tagging, price assignment
        between $20 and $25, preview image assignment, batch generation, OBS JSON creation, and
        writing files under `storage/overlays/generated/`.
      </div>
    </div>
  );
}
