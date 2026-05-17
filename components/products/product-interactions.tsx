"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { StoreProduct } from "@/lib/catalog-types";

type CartItem = {
  id: string;
  title: string;
  price: number;
  previewImage: string;
};

const STORAGE_KEY = "streamforge-cart";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export function AddToCartButton({ product }: { product: StoreProduct }) {
  const [added, setAdded] = useState(() => readCart().some((item) => item.id === product.id));

  useEffect(() => {
    const sync = () => setAdded(readCart().some((item) => item.id === product.id));
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, [product.id]);

  return (
    <Button
      className="flex-1"
      onClick={() => {
        const items = readCart();
        if (!items.some((item) => item.id === product.id)) {
          items.push({
            id: product.id,
            title: product.title,
            price: product.price,
            previewImage: product.previewImage,
          });
          writeCart(items);
          setAdded(true);
        }
      }}
    >
      {added ? "Added to cart" : "Add to cart"}
    </Button>
  );
}

export function CartClient({
  products,
}: {
  products: Array<{ id: string; title: string; price: number; previewImage: string }>;
}) {
  const [items, setItems] = useState(products);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/12 p-10 text-slate-400">
          Your cart is empty.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-4"
              >
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-sm text-slate-400">${(item.price / 100).toFixed(2)}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const next = items.filter((entry) => entry.id !== item.id);
                    setItems(next);
                    writeCart(next);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <CheckoutButton items={items} total={total} />
        </>
      )}
    </div>
  );
}

function CheckoutButton({ items, total }: { items: CartItem[]; total: number }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds: items.map((item) => item.id) }),
        });
        const data = await response.json();
        if (data.url) window.location.href = data.url;
        setLoading(false);
      }}
    >
      {loading ? `Preparing checkout for $${(total / 100).toFixed(2)}...` : `Checkout securely`}
    </Button>
  );
}
