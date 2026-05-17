import Link from "next/link";
import { GAME_CATEGORIES, GAME_SLUGS, GAME_THEMES, GAMER_METHOD, PREMIUM_PRICING } from "@/lib/constants";
import { getActiveProducts } from "@/lib/data";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { Card } from "@/components/ui/card";

export default async function HomePage() {
  const products = await getActiveProducts();
  const featured = products.slice(0, 4);
  const databaseOffline = products.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-10 rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-2xl backdrop-blur-xl lg:grid-cols-[1.15fr_0.85fr] lg:p-12">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">Premium OBS Storefront</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
            Game-Themed OBS Overlays Built For Streamers Who Want To Look Premium
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Buy downloadable overlay packs designed around original game-inspired visual themes for
            serious creators who want their stream branding to feel polished, specific, and ready
            to sell.
          </p>
          <div className="flex flex-wrap gap-4">
            <ButtonLink href="/marketplace">Browse Marketplace</ButtonLink>
            <ButtonLink href="/marketplace?sort=newest" variant="secondary">
              View New Releases
            </ButtonLink>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {GAME_CATEGORIES.slice(0, 4).map((category) => (
            <Card key={category} className="min-h-40">
              <p className="text-sm uppercase tracking-[0.3em]" style={{ color: GAME_THEMES[category].accent }}>
                {category}
              </p>
              <p className="mt-4 text-sm text-slate-300">{GAME_THEMES[category].description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-white">Featured Game Categories</h2>
          <Link href="/games" className="text-sm text-cyan-300">
            View all game collections
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {GAME_CATEGORIES.map((category) => (
            <Link key={category} href={`/games/${GAME_SLUGS[category]}`} className="rounded-3xl border border-white/10 bg-white/6 p-6 transition hover:-translate-y-1 hover:border-cyan-300/40">
              <p className="text-xl font-semibold text-white">{category}</p>
              <p className="mt-2 text-sm text-slate-400">{GAME_THEMES[category].description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-5 lg:grid-cols-5">
        {["Choose your game", "Pick your overlay pack", "Checkout securely", "Download your OBS .json files", "Import into OBS"].map((step, index) => (
          <Card key={step}>
            <p className="text-sm text-cyan-300">Step {index + 1}</p>
            <p className="mt-3 text-lg font-medium text-white">{step}</p>
          </Card>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-semibold text-white">Featured Overlay Packs</h2>
        {databaseOffline ? (
          <Card className="mt-8 border-amber-400/20 bg-amber-400/8">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Local Setup Notice</p>
            <p className="mt-3 max-w-3xl text-slate-200">
              The storefront is running, but the PostgreSQL database is not connected yet. Start
              Postgres on `localhost:5432` and run the Prisma migrate and seed steps to load the
              marketplace catalog.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950/70 p-4 text-sm text-slate-300">
{`npx prisma migrate dev --name init
npm run db:seed`}
            </pre>
          </Card>
        ) : null}
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Premium Service</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Custom overlay production for creators and businesses</h2>
          <p className="mt-4 max-w-2xl text-slate-300">
            Subscribe for custom weekly or monthly production and get original game-specific OBS
            overlay JSON creation, preview generation, website product upload, and secure download
            delivery built into the workflow.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-slate-300">
            <li>50 overlays generated per day target</li>
            <li>500+ overlays per month production capacity</li>
            <li>Original visual themes only, no unlicensed game logos or official art</li>
            <li>Automated marketplace publishing and fulfillment</li>
          </ul>
        </Card>
        <div className="grid gap-4">
          {PREMIUM_PRICING.map((plan) => (
            <Card key={plan.name}>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{plan.name}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{plan.price}</p>
              <p className="mt-3 text-sm text-slate-400">{plan.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Proprietary Method</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">The G.A.M.E.R. Overlay System</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          {GAMER_METHOD.map((pillar) => (
            <Card key={pillar.letter} className="h-full">
              <p className="text-3xl font-semibold text-cyan-300">{pillar.letter}</p>
              <p className="mt-3 text-lg font-medium text-white">{pillar.title}</p>
              <p className="mt-3 text-sm text-slate-400">{pillar.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          "50 overlays generated per day",
          "500+ overlays per month",
          "$20-$25 per overlay product",
          "7+ game categories supported",
        ].map((stat) => (
          <Card key={stat}>
            <p className="text-2xl font-semibold text-white">{stat}</p>
          </Card>
        ))}
      </section>

      <section className="mt-16 rounded-[2rem] border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(59,130,246,0.08))] p-10 text-center">
        <h2 className="text-4xl font-semibold text-white">Start Building Your Stream Brand Today</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          Browse downloadable OBS overlay packs, launch secure Stripe checkout, and deliver your
          audience a stream presentation that feels premium from the first frame.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/marketplace">Shop overlays</ButtonLink>
        </div>
      </section>
    </div>
  );
}
