import { requireAdmin } from "@/lib/auth/session";
import { getDashboardMetrics } from "@/lib/data";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const metrics = await getDashboardMetrics();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Analytics</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/6 p-6">
          <h2 className="text-xl font-semibold text-white">Best-selling games</h2>
          <div className="mt-4 grid gap-3">
            {metrics.topGames.map((entry) => (
              <div key={entry.gameCategory} className="rounded-2xl border border-white/10 p-4 text-white">
                {entry.gameCategory} · {entry._sum.totalSales ?? 0} sales
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/6 p-6">
          <h2 className="text-xl font-semibold text-white">Best-selling overlay types</h2>
          <div className="mt-4 grid gap-3">
            {metrics.topTypes.map((entry) => (
              <div key={entry.overlayType} className="rounded-2xl border border-white/10 p-4 text-white">
                {entry.overlayType} · {entry._sum.totalSales ?? 0} sales
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
