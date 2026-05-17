import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { ButtonLink } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-[0.24em] text-white">
          {APP_NAME}
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/games">Games</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <div className="flex items-center gap-3">
          <ButtonLink href="/cart" variant="secondary">
            Cart
          </ButtonLink>
          {user ? (
            <ButtonLink href={user.role === "ADMIN" ? "/admin" : "/account"}>Dashboard</ButtonLink>
          ) : (
            <ButtonLink href="/login">Sign In</ButtonLink>
          )}
        </div>
      </div>
    </header>
  );
}
