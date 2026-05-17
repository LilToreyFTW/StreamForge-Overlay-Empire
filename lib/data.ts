import { subDays } from "date-fns";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { TEMPLATE_PRODUCTS } from "@/lib/template-products";
import { getDb } from "@/lib/db";
import type { StoreProduct } from "@/lib/catalog-types";

const FALLBACK_CATALOG_PATH = path.join(process.cwd(), "storage", "overlays", "fallback-catalog.json");

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
    if (isDatabaseUnavailable(error)) return readFallbackCatalog();
    throw error;
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await getDb().product.findUnique({
      where: { slug },
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      const products = await readFallbackCatalog();
      return products.find((product) => product.slug === slug) ?? null;
    }
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
    if (isDatabaseUnavailable(error)) {
      const products = await readFallbackCatalog();
      return products
        .filter((product) => product.isActive && product.gameCategory === gameCategory && product.id !== excludeId)
        .slice(0, 3);
    }
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

async function readFallbackCatalog(): Promise<StoreProduct[]> {
  try {
    const raw = await readFile(FALLBACK_CATALOG_PATH, "utf8");
    return JSON.parse(raw) as StoreProduct[];
  } catch {
    return TEMPLATE_PRODUCTS;
  }
}
