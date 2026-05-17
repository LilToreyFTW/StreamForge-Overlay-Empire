import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getDashboardMetrics } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const metrics = await getDashboardMetrics();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold text-white">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/admin/generate-overlays" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950">
            Generate overlays
          </Link>
          <Link href="/admin/products" className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white">
            Create product manually
          </Link>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Total products", String(metrics.productCount)],
          ["Total orders", String(metrics.orderCount)],
          ["Total revenue", formatCurrency(metrics.revenue)],
          ["Generated today", String(metrics.productsToday)],
          ["Generated this month", String(metrics.productsMonth)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/6 p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/6 p-6">
          <h2 className="text-xl font-semibold text-white">Recent orders</h2>
          <div className="mt-4 grid gap-3">
            {metrics.recentOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-white/10 p-4">
                <p className="font-medium text-white">{order.user.email}</p>
                <p className="text-sm text-slate-400">{formatCurrency(order.total)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/6 p-6">
          <h2 className="text-xl font-semibold text-white">Batch activity</h2>
          <div className="mt-4 grid gap-3">
            {metrics.batches.map((batch) => (
              <div key={batch.id} className="rounded-2xl border border-white/10 p-4">
                <p className="font-medium text-white">{batch.gameCategory}</p>
                <p className="text-sm text-slate-400">
                  {batch.overlayType} · {batch.quantity} · {batch.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
