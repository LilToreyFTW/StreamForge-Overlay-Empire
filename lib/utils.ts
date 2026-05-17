import { clsx } from "clsx";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function sanitizeText(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .trim();
}

export function clampPrice(price: number) {
  return Math.max(2000, Math.min(2500, price));
}
