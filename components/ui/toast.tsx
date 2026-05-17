"use client";

import { useSearchParams } from "next/navigation";

export function ToastMessage() {
  const params = useSearchParams();
  const message = params.get("message") ?? "";

  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-2xl border border-cyan-400/30 bg-slate-900/95 px-4 py-3 text-sm text-cyan-100 shadow-2xl">
      {message}
    </div>
  );
}
