import { Link } from "@tanstack/react-router";

export function Logo({ to = "/", className = "h-7" }: { to?: string; className?: string }) {
  return (
    <Link to={to} className="inline-flex items-center group">
      <img
        src="/GuorrowLogo.svg"
        alt="Guorrow"
        className={`${className} w-auto object-contain`}
      />
    </Link>
  );
}
