import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { shops, formatNaira } from "@/lib/mock";
import { useCart, cartTotal, cartArea } from "@/lib/cart-store";
import { MapPin, Search, Star, Clock, ShoppingBasket, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { displayNameFromProfile, useStudentProfile } from "@/lib/student-profile";

const CATEGORY_FILTERS = ["All", "Grains", "Vegetables", "Protein", "Packaged", "Drinks"] as const;

export const Route = createFileRoute("/student/")({
  head: () => ({ meta: [{ title: "Shop nearby - Campus Basket" }] }),
  component: StudentHome,
});

function StudentHome() {
  const cart = useCart();
  const { profile, loading } = useStudentProfile();
  const lockedArea = cartArea(cart.lines);
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORY_FILTERS)[number]>("All");
  const displayName = displayNameFromProfile(profile);
  const firstName = displayName.split(/\s+/)[0] || "there";

  const filtered = useMemo(() => {
    const query = normalizeSearch(q);
    const category = normalizeSearch(selectedCategory);

    const scored = shops
      .map((shop) => {
        const categoryMatches =
          selectedCategory === "All" ||
          shop.products.some((product) => normalizeSearch(product.category) === category);

        if (!categoryMatches) {
          return null;
        }

        const fields = [
          shop.name,
          shop.tagline,
          shop.area,
          ...shop.products.flatMap((product) => [
            product.name,
            product.category,
            product.description,
          ]),
        ].map(normalizeSearch);

        let score = selectedCategory === "All" ? 1 : 10;
        if (selectedCategory !== "All") score += 20;

        if (!query) {
          return { shop, score };
        }

        if (normalizeSearch(shop.name) === query) score += 100;
        if (normalizeSearch(shop.area) === query) score += 85;
        if (normalizeSearch(shop.tagline) === query) score += 70;

        if (normalizeSearch(shop.name).includes(query)) score += 60;
        if (normalizeSearch(shop.area).includes(query)) score += 45;
        if (normalizeSearch(shop.tagline).includes(query)) score += 35;

        for (const product of shop.products) {
          const productName = normalizeSearch(product.name);
          const productCategory = normalizeSearch(product.category);
          const productDescription = normalizeSearch(product.description);

          if (productName === query) score += 30;
          if (productCategory === query) score += 18;
          if (productName.includes(query)) score += 24;
          if (productCategory.includes(query)) score += 14;
          if (productDescription.includes(query)) score += 8;
        }

        if (score === 0) {
          const matches = fields.some((field) => field.includes(query));
          if (!matches) return null;
          score = 1;
        }

        return { shop, score };
      })
      .filter((entry): entry is { shop: (typeof shops)[number]; score: number } => entry !== null)
      .sort((a, b) => b.score - a.score || a.shop.name.localeCompare(b.shop.name));

    return scored.map((entry) => entry.shop);
  }, [q, selectedCategory]);

  return (
    <MobileShell
      nav={studentNav}
      rightSlot={
        <button className="inline-flex items-center gap-1.5 text-xs font-semibold bg-secondary px-3 py-1.5 rounded-full">
          <MapPin className="size-3.5 text-primary" />
          {profile?.location?.trim() || "Add delivery address"}
        </button>
      }
      title={
        loading
          ? "Hi there, your next market run is just a few clicks away."
          : `Hi ${firstName}, your next market run is just a few clicks away.`
      }
    >
      <div className="mt-2 relative">
        <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search rice, beans, indomie..."
          aria-label="Search stores"
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
        />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 no-scrollbar">
        {CATEGORY_FILTERS.map((c) => {
          const active = selectedCategory === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedCategory(c)}
              className={
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors " +
                (active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border text-foreground/70 hover:text-foreground")
              }
            >
              {c}
            </button>
          );
        })}
      </div>

      {lockedArea && (
        <div className="mt-5 card-soft p-3 flex items-start gap-2 bg-accent-soft border-accent/30">
          <Lock className="size-4 text-accent mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold">Paired to {lockedArea}</div>
            <div className="text-foreground/70 mt-0.5">
              You can only add from shops in <b>{lockedArea}</b> while this basket is open. Other
              areas are dimmed.
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl">Shops near you</h2>
        <span className="text-xs text-foreground/60">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="card-soft p-4 text-sm text-foreground/70">
          No stores match
          {q.trim() ? (
            <>
              {" "}
              <span className="font-semibold text-foreground">"{q.trim()}"</span>
            </>
          ) : null}
          {selectedCategory !== "All" ? (
            <>
              {" "}
              in <span className="font-semibold text-foreground">{selectedCategory}</span>
            </>
          ) : null}
          . Try a shop name, area, product, or a different category.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const offArea = !!lockedArea && s.area !== lockedArea;
            return (
              <Link
                to="/student/shop/$id"
                params={{ id: s.id }}
                key={s.id}
                className={
                  "block card-soft overflow-hidden hover:shadow-md transition-shadow relative " +
                  (offArea ? "opacity-50" : "")
                }
              >
                <div className={`h-24 bg-gradient-to-br ${s.hue} flex items-end p-3`}>
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="ml-auto chip bg-background/80 text-foreground">
                    <MapPin className="size-3 inline -mt-0.5 mr-0.5" />
                    {s.area}
                  </span>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-[1.05rem] leading-tight truncate">
                        {s.name}
                      </div>
                      <div className="text-xs text-foreground/60 mt-0.5">{s.tagline}</div>
                    </div>
                    {!s.open && (
                      <span className="chip bg-foreground text-background shrink-0">Closed</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-foreground/70 flex-wrap">
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
                    {offArea && (
                      <span className="chip bg-foreground/10 text-foreground/70 ml-auto">
                        <Lock className="size-3 inline -mt-0.5 mr-0.5" />
                        Off-area
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

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

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
