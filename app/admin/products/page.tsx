import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { createProductAction } from "@/app/server-actions";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getDb().product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Admin Products</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <form action={createProductAction} className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/6 p-6">
          <input name="title" required placeholder="Product title" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
          <input name="slug" placeholder="Slug" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
          <textarea name="description" required placeholder="Description" className="min-h-32 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
          <input name="price" required placeholder="Price in cents" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
          <input name="gameCategory" required placeholder="Game category" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
          <input name="overlayType" required placeholder="Overlay type" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
          <input name="previewImage" required placeholder="/generated-previews/file.svg" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
          <input name="downloadFilePath" required placeholder="filename.json" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
          <label className="flex items-center gap-3 text-sm text-slate-300"><input name="isFeatured" type="checkbox" /> Featured</label>
          <label className="flex items-center gap-3 text-sm text-slate-300"><input name="isActive" type="checkbox" defaultChecked /> Active</label>
          <button className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950">Create product</button>
        </form>
        <div className="grid gap-4">
          {products.map((product) => (
            <div key={product.id} className="rounded-3xl border border-white/10 bg-white/6 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{product.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{product.gameCategory} · {product.overlayType}</p>
                </div>
                <div className="flex gap-3">
                  <Link href={`/admin/products/${product.id}`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">Edit</Link>
                  <DeleteProductButton productId={product.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
