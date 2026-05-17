import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const formData = await request.formData();
  const { id } = await params;
  if (String(formData.get("_method")) === "delete") {
    await getDb().product.delete({ where: { id } });
  }
  return NextResponse.redirect(new URL("/admin/products?message=Product deleted", request.url));
}
