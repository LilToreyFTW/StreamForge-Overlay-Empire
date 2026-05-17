import { CartClient } from "@/components/products/product-interactions";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Cart</h1>
      <div className="mt-8">
        <CartClient products={[]} />
      </div>
    </div>
  );
}
