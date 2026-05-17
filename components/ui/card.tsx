import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/12 bg-white/6 p-6 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
