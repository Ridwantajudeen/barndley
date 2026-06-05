import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/guorrow-logo.png.asset.json";

export function Logo({ to = "/", className = "h-7" }: { to?: string; className?: string }) {
  return (
    <Link to={to} className="inline-flex items-center group">
      <img
        src={logoAsset.url}
        alt="guorrow"
        className={`${className} w-auto object-contain`}
      />
    </Link>
  );
}
