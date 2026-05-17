import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getDb().order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Orders</h1>
      <div className="mt-8 grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-3xl border border-white/10 bg-white/6 p-5">
            <p className="font-semibold text-white">{order.user.email}</p>
            <p className="mt-1 text-sm text-slate-400">{formatCurrency(order.total)} · {order.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
