import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { shops, formatNaira } from "@/lib/mock";
import { useCart, cartTotal } from "@/lib/cart-store";
import { MapPin, Search, Star, Clock, ShoppingBasket } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/student/")({
  head: () => ({ meta: [{ title: "Shop nearby — Campus Basket" }] }),
  component: StudentHome,
});

function StudentHome() {
  const cart = useCart();
  const [q, setQ] = useState("");
  const filtered = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.products.some((p) => p.name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <MobileShell
      nav={studentNav}
      rightSlot={
        <button className="inline-flex items-center gap-1.5 text-xs font-semibold bg-secondary px-3 py-1.5 rounded-full">
          <MapPin className="size-3.5 text-primary" /> Indep. Hall · Rm 214
        </button>
      }
      title="What's in your basket today, Ada?"
    >
      <div className="mt-2 relative">
        <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search rice, beans, indomie…"
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
        />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 no-scrollbar">
        {["All", "Grains", "Vegetables", "Protein", "Packaged", "Drinks"].map(
          (c, i) => (
            <button
              key={c}
              className={
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border " +
                (i === 0
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border text-foreground/70")
              }
            >
              {c}
            </button>
          ),
        )}
      </div>

      <h2 className="font-display text-xl mt-6 mb-3">Shops near you</h2>
      <div className="space-y-3">
        {filtered.map((s) => (
          <Link
            to="/student/shop/$id"
            params={{ id: s.id }}
            key={s.id}
            className={`block card-soft overflow-hidden hover:shadow-md transition-shadow`}
          >
            <div className={`h-24 bg-gradient-to-br ${s.hue} flex items-end p-3`}>
              <span className="text-3xl">{s.emoji}</span>
              {!s.open && (
                <span className="ml-auto chip bg-foreground text-background">
                  Closed
                </span>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-[1.05rem] leading-tight">
                    {s.name}
                  </div>
                  <div className="text-xs text-foreground/60 mt-0.5">
                    {s.tagline}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-foreground/70">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3.5 fill-accent text-accent" />
                  {s.rating} <span className="text-foreground/40">({s.reviews})</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> {s.etaMin} min
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" /> {s.distanceKm} km
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {cart.lines.length > 0 && (
        <Link
          to="/student/cart"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[440px] z-30 bg-foreground text-background rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <ShoppingBasket className="size-4" /> {cart.lines.length} item
            {cart.lines.length > 1 ? "s" : ""} in basket
          </span>
          <span className="font-display">{formatNaira(cartTotal(cart.lines))}</span>
        </Link>
      )}
    </MobileShell>
  );
}
