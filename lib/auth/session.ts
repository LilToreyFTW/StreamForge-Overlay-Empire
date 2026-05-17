import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/lib/db";

const COOKIE_NAME = "streamforge_session";

function signValue(value: string) {
  return createHmac("sha256", process.env.AUTH_SECRET!).update(value).digest("hex");
}

function encodeSession(userId: string) {
  const signature = signValue(userId);
  return `${userId}.${signature}`;
}

function decodeSession(raw: string) {
  const [userId, signature] = raw.split(".");
  if (!userId || !signature) return null;
  const expected = Buffer.from(signValue(userId));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  return userId;
}

export async function setSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const userId = decodeSession(raw);
  if (!userId) return null;
  return getDb().user.findUnique({
    where: { id: userId },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/account");
  return user;
}
