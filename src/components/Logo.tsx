import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/guorrow-logo.png.asset.json";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center group">
      <img
        src={logoAsset.url}
        alt="guorrow"
        className="h-7 w-auto object-contain"
      />
    </Link>
  );
}
