import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function AccountPage() {
  const user = await requireUser();
  const orders = await getDb().order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Account</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/6 p-6">
          <p className="text-xl font-semibold text-white">{user.name}</p>
          <p className="mt-2 text-slate-400">{user.email}</p>
          <Link href="/downloads" className="mt-6 inline-flex text-cyan-300">
            View downloads
          </Link>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/6 p-6">
          <p className="text-xl font-semibold text-white">Recent Orders</p>
          <div className="mt-4 grid gap-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-white/10 p-4">
                <p className="font-medium text-white">{formatCurrency(order.total)}</p>
                <p className="text-sm text-slate-400">{order.items.length} products</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
