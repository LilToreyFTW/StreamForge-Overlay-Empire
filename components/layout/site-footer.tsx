import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-slate-400 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="font-semibold text-white">StreamForge Overlay Empire</p>
          <p className="mt-2 max-w-sm">
            Premium original OBS overlay packs for serious streamers. No licensed game logos or
            official copyrighted art used.
          </p>
        </div>
        <div className="grid gap-2">
          <Link href="/privacy">Privacy</Link>
          <Link href="/refund-policy">Refund Policy</Link>
          <Link href="/terms">Terms</Link>
        </div>
        <div className="grid gap-2">
          <Link href="/contact">Contact</Link>
          <Link href="/downloads">Downloads</Link>
          <Link href="/marketplace">Browse Marketplace</Link>
        </div>
      </div>
    </footer>
  );
}
