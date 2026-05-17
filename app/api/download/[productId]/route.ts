import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ productId: string }> }) {
  const user = await requireUser();
  const { productId } = await params;
  const db = getDb();
  const download = await db.download.findFirst({
    where: { userId: user.id, productId },
    include: { product: true },
  });
  if (!download) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const filename = path.basename(download.product.downloadFilePath);
  const filePath = path.join(process.cwd(), "storage", "overlays", "generated", filename);
  const file = await readFile(filePath);
  await db.download.update({
    where: { id: download.id },
    data: { downloadCount: { increment: 1 } },
  });

  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
