import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export default async function DownloadsPage() {
  const user = await requireUser();
  const downloads = await getDb().download.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Your Downloads</h1>
      <div className="mt-8 grid gap-4">
        {downloads.map((download) => (
          <div key={download.id} className="flex flex-wrap items-center justify-between rounded-3xl border border-white/10 bg-white/6 p-5">
            <div>
              <p className="font-semibold text-white">{download.product.title}</p>
              <p className="mt-1 text-sm text-slate-400">{download.product.overlayType}</p>
            </div>
            <Link href={`/api/download/${download.productId}`} className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950">
              Download
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
