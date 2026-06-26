import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { formatNaira } from "@/lib/mock";
import { useCart, cartTotal, cartArea } from "@/lib/cart-store";
import { LoaderCircle, MapPin, Search, Star, Clock, ShoppingBasket, Lock, Store, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { displayNameFromProfile, useStudentProfile } from "@/lib/student-profile";
import { matchesShopQuery, matchesStudentCategory, useLiveShops, type LiveShop } from "@/lib/live-shops";

const CATEGORY_FILTERS = ["All", "Grains", "Vegetables", "Protein", "Packaged", "Drinks"] as const;

export const Route = createFileRoute("/student/")({
  head: () => ({ meta: [{ title: "Shop nearby - Campus Basket" }] }),
  component: StudentHome,
});

function StudentHome() {
  const cart = useCart();
  const { profile, loading } = useStudentProfile();
  const { shops, loading: shopsLoading, syncing, error, refresh } = useLiveShops();
  const lockedArea = cartArea(cart.lines);
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORY_FILTERS)[number]>("All");
  const displayName = displayNameFromProfile(profile);
  const firstName = displayName.split(/\s+/)[0] || "there";
  const resetFilters = () => {
    setQ("");
    setSelectedCategory("All");
  };

  const filtered = useMemo(() => {
    const scored = shops
      .map((shop) => {
        if (!matchesStudentCategory(shop, selectedCategory)) {
          return null;
        }
        if (!matchesShopQuery(shop, q)) return null;
        let score = shop.rating * 10 + shop.reviews_count;
        if (q.trim()) {
          const query = normalizeSearch(q);
          if (normalizeSearch(shop.name) === query) score += 120;
          if (normalizeSearch(shop.area) === query) score += 90;
          if (normalizeSearch(shop.location) === query) score += 70;
          if (normalizeSearch(shop.name).includes(query)) score += 60;
          if (normalizeSearch(shop.area).includes(query)) score += 40;
          if (normalizeSearch(shop.location).includes(query)) score += 30;
          for (const product of shop.products) {
            const productName = normalizeSearch(product.name);
            const productCategory = normalizeSearch(product.category);
            const productDescription = normalizeSearch(product.description);
            if (productName === query) score += 28;
            if (productCategory === query) score += 18;
            if (productName.includes(query)) score += 22;
            if (productCategory.includes(query)) score += 12;
            if (productDescription.includes(query)) score += 8;
          }
        }
        return { shop, score };
      })
      .filter((entry): entry is { shop: LiveShop; score: number } => entry !== null)
      .sort((a, b) => b.score - a.score || a.shop.name.localeCompare(b.shop.name));

    return scored.map((entry) => entry.shop);
  }, [q, selectedCategory, shops]);

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
      {shopsLoading && shops.length === 0 ? (
        <div className="card-soft p-4 mb-4 inline-flex items-center gap-2 text-sm text-foreground/70">
          <LoaderCircle className="size-4 animate-spin" />
          Loading nearby shops...
        </div>
      ) : syncing ? (
        <div className="mb-4 text-[0.7rem] text-foreground/50 inline-flex items-center gap-1.5">
          <LoaderCircle className="size-3.5 animate-spin" />
          Refreshing shop list...
        </div>
      ) : null}

      {error ? (
        <div className="card-soft p-4 mb-4 text-sm">
          <div className="font-semibold">Shops could not load</div>
          <p className="text-foreground/70 mt-1">{error}</p>
          <button
            type="button"
            onClick={() => refresh().catch(() => undefined)}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Try again
          </button>
        </div>
      ) : null}

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
        <div className="card-soft p-5 text-sm text-foreground/70">
          {shops.length === 0 && !shopsLoading ? (
            <div className="flex flex-col items-start gap-4">
              <div className="h-11 w-11 rounded-2xl bg-primary-soft flex items-center justify-center text-primary">
                <Store className="size-5" />
              </div>
              <div>
                <div className="font-display text-lg text-foreground">No shops yet</div>
                <p className="mt-1 text-sm text-foreground/65">
                  Once a shop is added in Supabase, it will show up here automatically.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => refresh().catch(() => undefined)}
                  className="inline-flex items-center gap-2 rounded-xl bg-foreground px-3.5 py-2 text-sm font-semibold text-background"
                >
                  <RotateCcw className="size-4" />
                  Refresh
                </button>
                {(q.trim() || selectedCategory !== "All") && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 rounded-xl bg-secondary px-3.5 py-2 text-sm font-semibold text-foreground"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-4">
              <div className="h-11 w-11 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
                <Search className="size-5" />
              </div>
              <div>
                <div className="font-display text-lg text-foreground">No shops match your search</div>
                <p className="mt-1 text-sm text-foreground/65">
                  {q.trim() ? (
                    <>
                      No store matches <span className="font-semibold text-foreground">"{q.trim()}"</span>
                    </>
                  ) : (
                    <>Try a different category or clear the current filter.</>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {q.trim() || selectedCategory !== "All" ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 rounded-xl bg-foreground px-3.5 py-2 text-sm font-semibold text-background"
                  >
                    <RotateCcw className="size-4" />
                    Clear filters
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => refresh().catch(() => undefined)}
                  className="inline-flex items-center gap-2 rounded-xl bg-secondary px-3.5 py-2 text-sm font-semibold text-foreground"
                >
                  <RotateCcw className="size-4" />
                  Refresh
                </button>
              </div>
            </div>
          )}
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
                <div className={`h-24 bg-gradient-to-br ${s.hue} flex items-end p-3 overflow-hidden`}>
                  {s.cover_image_url ? (
                    <img src={s.cover_image_url} alt={s.name} className="absolute inset-0 h-full w-full object-cover" />
                  ) : null}
                  <div className="absolute inset-0 bg-foreground/10" />
                  <span className="relative text-3xl">{s.emoji}</span>
                  <span className="relative ml-auto chip bg-background/80 text-foreground">
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
                    {!s.is_open && (
                      <span className="chip bg-foreground text-background shrink-0">Closed</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-foreground/70 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3.5 fill-accent text-accent" />
                      {s.rating.toFixed(1)} <span className="text-foreground/40">({s.reviews_count})</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" /> {s.hours || "Hours not set"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" /> {s.location}
                    </span>
                    <span className="chip bg-secondary text-foreground/70 ml-auto">
                      {s.products.length} products
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
