import { subDays } from "date-fns";
import { getDb } from "@/lib/db";

function isDatabaseUnavailable(error: unknown) {
  if (!(error instanceof Error)) return false;
  return (
    error.name.includes("PrismaClientInitializationError") ||
    error.message.includes("Can't reach database server") ||
    error.message.includes("Environment variable not found: DATABASE_URL")
  );
}

export async function getActiveProducts() {
  try {
    return await getDb().product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) return [];
    throw error;
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await getDb().product.findUnique({
      where: { slug },
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) return null;
    throw error;
  }
}

export async function getRelatedProducts(gameCategory: string, excludeId: string) {
  try {
    return await getDb().product.findMany({
      where: {
        isActive: true,
        gameCategory,
        NOT: { id: excludeId },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) return [];
    throw error;
  }
}

export async function getDashboardMetrics() {
  try {
    const db = getDb();
    const startOfToday = subDays(new Date(), 1);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [productCount, orderCount, paidOrders, productsToday, productsMonth, recentOrders, topGames, topTypes, batches] =
      await Promise.all([
        db.product.count(),
        db.order.count(),
        db.order.findMany({ where: { status: "PAID" } }),
        db.product.count({ where: { createdAt: { gte: startOfToday } } }),
        db.product.count({ where: { createdAt: { gte: startOfMonth } } }),
        db.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: true, items: { include: { product: true } } },
        }),
        db.product.groupBy({
          by: ["gameCategory"],
          _sum: { totalSales: true },
          orderBy: { _sum: { totalSales: "desc" } },
          take: 5,
        }),
        db.product.groupBy({
          by: ["overlayType"],
          _sum: { totalSales: true },
          orderBy: { _sum: { totalSales: "desc" } },
          take: 5,
        }),
        db.generatedOverlayBatch.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      ]);

    return {
      productCount,
      orderCount,
      revenue: paidOrders.reduce((sum, order) => sum + order.total, 0),
      productsToday,
      productsMonth,
      recentOrders,
      topGames,
      topTypes,
      batches,
    };
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return {
        productCount: 0,
        orderCount: 0,
        revenue: 0,
        productsToday: 0,
        productsMonth: 0,
        recentOrders: [],
        topGames: [],
        topTypes: [],
        batches: [],
      };
    }
    throw error;
  }
}
