import { ProductCard } from "@/components/products/product-card";
import { getActiveProducts } from "@/lib/data";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = String(params.search ?? "").toLowerCase();
  const category = String(params.category ?? "");
  const overlayType = String(params.overlayType ?? "");
  const filter = String(params.filter ?? "");
  const sort = String(params.sort ?? "featured");
  const min = params.min ? Number(params.min) : null;
  const max = params.max ? Number(params.max) : null;

  let products = await getActiveProducts();

  products = products.filter((product) => {
    const price = product.price / 100;
    return (
      (!query || `${product.title} ${product.description}`.toLowerCase().includes(query)) &&
      (!category || product.gameCategory === category) &&
      (!overlayType || product.overlayType === overlayType) &&
      (!filter ||
        (filter === "featured" && product.isFeatured) ||
        (filter === "best" && product.totalSales > 0) ||
        (filter === "newest" && true)) &&
      (min === null || price >= min) &&
      (max === null || price <= max)
    );
  });

  if (sort === "newest") products.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  if (sort === "best") products.sort((a, b) => b.totalSales - a.totalSales);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Marketplace</h1>
      <form className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-white/6 p-6 md:grid-cols-2 xl:grid-cols-6">
        <input name="search" placeholder="Search overlays" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" defaultValue={query} />
        <input name="category" placeholder="Game category" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" defaultValue={category} />
        <input name="overlayType" placeholder="Overlay type" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" defaultValue={overlayType} />
        <input name="min" placeholder="Min price" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
        <input name="max" placeholder="Max price" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
        <select name="sort" defaultValue={sort} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none">
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="best">Best selling</option>
        </select>
      </form>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
