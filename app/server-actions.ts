"use server";

import { hash, compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { clearSession, requireAdmin, setSession } from "@/lib/auth/session";
import { generateOverlayBatch } from "@/lib/overlay-generator/generator";
import { clampPrice, sanitizeText, slugify } from "@/lib/utils";

export async function registerAction(formData: FormData) {
  const db = getDb();
  const email = sanitizeText(formData.get("email")).toLowerCase();
  const password = sanitizeText(formData.get("password"));
  const name = sanitizeText(formData.get("name"));
  const passwordHash = await hash(password, 10);

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: email === process.env.ADMIN_EMAIL ? "ADMIN" : "CUSTOMER",
    },
  });

  await setSession(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/account");
}

export async function loginAction(formData: FormData) {
  const db = getDb();
  const email = sanitizeText(formData.get("email")).toLowerCase();
  const password = sanitizeText(formData.get("password"));
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await compare(password, user.passwordHash))) {
    redirect("/login?message=Invalid credentials");
  }
  await setSession(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/account");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const db = getDb();
  const title = sanitizeText(formData.get("title"));
  const slug = slugify(sanitizeText(formData.get("slug")) || title);
  await db.product.create({
    data: {
      title,
      slug,
      description: sanitizeText(formData.get("description")),
      price: clampPrice(Number(formData.get("price")) || 2000),
      gameCategory: sanitizeText(formData.get("gameCategory")),
      overlayType: sanitizeText(formData.get("overlayType")),
      previewImage: sanitizeText(formData.get("previewImage")),
      downloadFilePath: sanitizeText(formData.get("downloadFilePath")),
      includedFiles: ["OBS scene JSON", "Preview asset", "Install notes"],
      isFeatured: formData.get("isFeatured") === "on",
      isActive: formData.get("isActive") === "on",
    },
  });
  revalidatePath("/admin/products");
  redirect("/admin/products?message=Product created");
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();
  const db = getDb();
  const id = sanitizeText(formData.get("id"));
  await db.product.update({
    where: { id },
    data: {
      title: sanitizeText(formData.get("title")),
      description: sanitizeText(formData.get("description")),
      price: clampPrice(Number(formData.get("price")) || 2000),
      gameCategory: sanitizeText(formData.get("gameCategory")),
      overlayType: sanitizeText(formData.get("overlayType")),
      previewImage: sanitizeText(formData.get("previewImage")),
      downloadFilePath: sanitizeText(formData.get("downloadFilePath")),
      isFeatured: formData.get("isFeatured") === "on",
      isActive: formData.get("isActive") === "on",
    },
  });
  revalidatePath("/admin/products");
  redirect("/admin/products?message=Product updated");
}

export async function generateOverlaysAction(formData: FormData) {
  await requireAdmin();
  await generateOverlayBatch({
    gameCategory: sanitizeText(formData.get("gameCategory")),
    overlayType: sanitizeText(formData.get("overlayType")),
    quantity: Number(formData.get("quantity")) || 1,
    minPrice: Number(formData.get("minPrice")) || 2000,
    maxPrice: Number(formData.get("maxPrice")) || 2500,
    publish: formData.get("publish") === "on",
  });
  revalidatePath("/admin");
  revalidatePath("/admin/generator");
  revalidatePath("/admin/generate-overlays");
  revalidatePath("/marketplace");
  redirect("/admin/generate-overlays?message=Overlay batch generated");
}
