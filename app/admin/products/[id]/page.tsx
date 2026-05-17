import { notFound } from "next/navigation";
import { updateProductAction } from "@/app/server-actions";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const product = await getDb().product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <form action={updateProductAction} className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/6 p-6">
        <input type="hidden" name="id" value={product.id} />
        <input name="title" defaultValue={product.title} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
        <textarea name="description" defaultValue={product.description} className="min-h-32 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
        <input name="price" defaultValue={product.price} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
        <input name="gameCategory" defaultValue={product.gameCategory} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
        <input name="overlayType" defaultValue={product.overlayType} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
        <input name="previewImage" defaultValue={product.previewImage} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
        <input name="downloadFilePath" defaultValue={product.downloadFilePath} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none" />
        <label className="flex items-center gap-3 text-sm text-slate-300"><input name="isFeatured" type="checkbox" defaultChecked={product.isFeatured} /> Featured</label>
        <label className="flex items-center gap-3 text-sm text-slate-300"><input name="isActive" type="checkbox" defaultChecked={product.isActive} /> Active</label>
        <button className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950">Save changes</button>
      </form>
    </div>
  );
}
