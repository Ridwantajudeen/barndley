import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 group">
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm rotate-[-6deg] group-hover:rotate-0 transition-transform">
        <span className="text-lg">🧺</span>
        <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-accent border-2 border-background" />
      </span>
      <span className="font-display text-[1.15rem] leading-none">
        Campus<span className="text-primary">Basket</span>
      </span>
    </Link>
  );
}
