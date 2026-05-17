import Link from "next/link";
import { cn } from "@/lib/utils";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary:
    "bg-[linear-gradient(135deg,#6ee7ff,#3b82f6)] text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.35)] hover:scale-[1.01]",
  secondary: "border border-white/15 bg-white/10 text-white hover:bg-white/16",
  ghost: "text-slate-200 hover:bg-white/8",
  danger: "bg-red-500/90 text-white hover:bg-red-500",
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  variant = "primary",
  href,
}: BaseProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
