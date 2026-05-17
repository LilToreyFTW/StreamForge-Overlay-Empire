import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/products/product-interactions";
import { CustomizeDownloadForm } from "@/components/products/customize-download-form";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { formatCurrency } from "@/lib/utils";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product.gameCategory, product.id);
  const isTemplateProduct = "templateKey" in product;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-white/10">
          <Image src={product.previewImage} alt={product.title} fill className="object-cover" />
        </div>
        <div className="space-y-6 rounded-[2rem] border border-white/10 bg-white/6 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{product.gameCategory}</p>
          <h1 className="text-4xl font-semibold text-white">{product.title}</h1>
          <p className="text-lg text-slate-300">{product.overlayType}</p>
          <p className="text-3xl font-semibold text-white">{formatCurrency(product.price)}</p>
          <p className="text-slate-300">{product.description}</p>
          <div className="grid gap-3 text-sm text-slate-300">
            <p>Included files: {product.includedFiles.join(", ")}</p>
            <p>
              Compatibility: {isTemplateProduct ? "OBS browser sources using included HTML/CSS files." : "OBS Studio scene import JSON."}
            </p>
            <p>Download info: Instant access after successful Stripe payment.</p>
            <p>
              Installation: {isTemplateProduct
                ? "Download the package, keep the folder structure intact, then add the included HTML files as OBS browser sources."
                : "Download the JSON file, import into OBS, then relink assets if desired."}
            </p>
            {product.overlayType === "Webcam Overlay" ? (
              <p className="font-semibold text-cyan-300">Transparent webcam center — no black box.</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-4">
            <AddToCartButton product={product} />
            <ButtonLink href="/cart" variant="secondary">
              Purchase now
            </ButtonLink>
          </div>
          {"isCustomizable" in product && product.isCustomizable ? (
            <CustomizeDownloadForm
              slug={product.slug}
              label={product.customizationLabel ?? "Stream name"}
            />
          ) : null}
        </div>
      </div>
      <section className="mt-14">
        <h2 className="text-3xl font-semibold text-white">Related products</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
