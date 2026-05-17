import Image from "next/image";
import Link from "next/link";
import { Product } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/product-interactions";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={product.previewImage} alt={product.title} fill className="object-cover" />
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{product.gameCategory}</p>
          <Link href={`/product/${product.slug}`} className="text-xl font-semibold text-white">
            {product.title}
          </Link>
          <p className="text-sm text-slate-400">{product.overlayType}</p>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>{formatCurrency(product.price)}</span>
          <span>{product.ratingAverage.toFixed(1)} rating</span>
        </div>
        <div className="flex items-center gap-3">
          <AddToCartButton product={product} />
          <Link
            href={`/product/${product.slug}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            View details
          </Link>
        </div>
      </div>
    </Card>
  );
}
