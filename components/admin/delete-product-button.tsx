"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold text-white">Delete product?</h3>
            <p className="mt-2 text-sm text-slate-400">
              This permanently removes the product from the catalog.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <form action={`/api/admin/products/${productId}`} method="post">
                <input type="hidden" name="_method" value="delete" />
                <Button variant="danger" type="submit">
                  Confirm delete
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
