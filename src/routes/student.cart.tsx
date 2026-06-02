import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { cart, useCart, cartTotal, groupByShop, isBundle, cartArea } from "@/lib/cart-store";
import { shops, formatNaira, type Product, type Measurement, type Shop } from "@/lib/mock";
import { Minus, Plus, Trash2, ArrowLeft, Search, X, Sparkles, Store, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/student/cart")({
  head: () => ({ meta: [{ title: "Your basket — Campus Basket" }] }),
  component: CartPage,
});

function CartPage() {
  const snap = useCart();
  const groups = groupByShop(snap.lines);
  const bundle = isBundle(snap.lines);
  const total = cartTotal(snap.lines);
  // Bundle: one base delivery + small extra per additional pickup
  const delivery = snap.lines.length === 0 ? 0 : 350 + Math.max(0, groups.length - 1) * 200;
  const serviceFee = 100;
  const [openSearch, setOpenSearch] = useState(false);

  return (
    <MobileShell nav={studentNav} title="Your basket">
      <Link to="/student" className="inline-flex items-center gap-1 text-sm font-semibold text-foreground/70 -mt-2 mb-3">
        <ArrowLeft className="size-4" /> Keep shopping
      </Link>

      {snap.lines.length === 0 ? (
        <div className="card-soft p-10 text-center mt-4">
          <div className="text-5xl">🧺</div>
          <h2 className="font-display text-xl mt-3">Your basket is empty</h2>
          <p className="text-sm text-foreground/60 mt-1">
            Pick a shop and start adding items.
          </p>
          <Link
            to="/student"
            className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            Browse shops
          </Link>
        </div>
      ) : (
        <>
          {bundle && (
            <div className="card-soft p-3 flex items-start gap-2 bg-accent-soft border-accent/30">
              <Sparkles className="size-4 text-accent mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold">Bundle order · {groups.length} shops</div>
                <div className="text-foreground/70 mt-0.5">
                  Your rider picks up from each shop in close proximity, then drops everything together. Small extra delivery applies.
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 space-y-3">
            {groups.map((g) => {
              const shop = shops.find((s) => s.id === g.shopId);
              return (
                <div key={g.shopId} className="card-soft p-1">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="h-9 w-9 rounded-lg bg-primary-soft flex items-center justify-center text-lg">
                      {g.shopEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{g.shopName}</div>
                      <div className="text-[0.7rem] text-foreground/60">{g.lines.length} item{g.lines.length>1?"s":""}{shop ? ` · ${shop.etaMin} min` : ""}</div>
                    </div>
                    {bundle && <span className="chip chip-accent">Shop {groups.indexOf(g)+1}</span>}
                  </div>
                  <ul className="divide-y divide-border/60">
                    {g.lines.map((l) => (
                      <li key={l.productId + l.measurement.id} className="flex items-center gap-3 p-3">
                        <div className="h-12 w-12 rounded-xl bg-primary-soft flex items-center justify-center text-2xl">
                          {l.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{l.productName}</div>
                          <div className="text-xs text-foreground/60">{l.measurement.label} • {formatNaira(l.measurement.price)}</div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-secondary rounded-full p-0.5">
                          <button
                            onClick={() => cart.setQty(l.shopId, l.productId, l.measurement.id, l.qty - 1)}
                            className="h-7 w-7 rounded-full bg-background flex items-center justify-center"
                          >
                            {l.qty === 1 ? <Trash2 className="size-3.5"/> : <Minus className="size-3.5"/>}
                          </button>
                          <span className="text-sm font-semibold w-5 text-center">{l.qty}</span>
                          <button
                            onClick={() => cart.setQty(l.shopId, l.productId, l.measurement.id, l.qty + 1)}
                            className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                          >
                            <Plus className="size-3.5"/>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setOpenSearch(true)}
            className="mt-3 w-full card-soft p-3 flex items-center gap-3 text-left hover:bg-secondary/50"
          >
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Search className="size-4"/>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Add items from another shop</div>
              <div className="text-[0.7rem] text-foreground/60">Can't find it here? Search nearby shops.</div>
            </div>
            <Plus className="size-4 text-foreground/40"/>
          </button>

          <div className="mt-4 card-soft p-4 text-sm space-y-2">
            <Row label="Subtotal" value={formatNaira(total)} />
            <Row label={bundle ? `Delivery (${groups.length} pickups)` : "Delivery"} value={formatNaira(delivery)} />
            <Row label="Service fee" value={formatNaira(serviceFee)} />
            <div className="border-t border-border/60 pt-2 mt-2">
              <Row bold label="Total" value={formatNaira(total + delivery + serviceFee)} />
            </div>
          </div>

          <Link
            to="/student/checkout"
            className="mt-5 block text-center py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold"
          >
            Proceed to checkout
          </Link>
        </>
      )}

      {openSearch && <CrossShopSearch onClose={() => setOpenSearch(false)} />}
    </MobileShell>
  );
}

function CrossShopSearch({ onClose }: { onClose: () => void }) {
  const snap = useCart();
  const lockedArea = cartArea(snap.lines);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<{ shop: Shop; product: Product } | null>(null);

  // Only shops in the same area as the first selected shop can be paired.
  const eligibleShops = useMemo(
    () => (lockedArea ? shops.filter((s) => s.area === lockedArea) : shops),
    [lockedArea],
  );

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    const out: { shop: Shop; product: Product }[] = [];
    for (const s of eligibleShops) {
      for (const p of s.products) {
        if (!p.available) continue;
        if (
          p.name.toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle)
        ) {
          out.push({ shop: s, product: p });
        }
      }
    }
    return out.sort((a, b) => a.shop.distanceKm - b.shop.distanceKm);
  }, [q, eligibleShops]);


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-background rounded-t-3xl w-full max-w-[480px] p-5 pb-7 shadow-2xl max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-lg">Search nearby shops</div>
            <div className="text-xs text-foreground/60">
              {lockedArea
                ? `Paired to ${lockedArea} only`
                : "Add items from any shop in close proximity"}
            </div>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
            <X className="size-4"/>
          </button>
        </div>

        {lockedArea && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-accent-soft border border-accent/30 text-xs">
            <MapPin className="size-4 text-accent mt-0.5 shrink-0"/>
            <div>
              <div className="font-semibold">Only {lockedArea} shops are pair-eligible</div>
              <div className="text-foreground/70 mt-0.5">
                Pairing is locked to the area of your first shop so your rider can do one short multi-stop trip.
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 px-3 h-11 rounded-xl bg-secondary">

          <Search className="size-4 text-foreground/50"/>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. eggs, garri, indomie…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>

        <div className="mt-4 flex-1 overflow-y-auto -mx-2 px-2">
          {!q.trim() && (
            <div className="text-xs text-foreground/50 text-center py-8">
              Type a product name to search every nearby shop.
            </div>
          )}
          {q.trim() && results.length === 0 && (
            <div className="text-xs text-foreground/50 text-center py-8">
              No matches for "{q}".
            </div>
          )}
          <ul className="space-y-2">
            {results.map(({ shop, product }) => (
              <li key={shop.id + product.id}>
                <button
                  onClick={() => setPicked({ shop, product })}
                  className="w-full card-soft p-3 flex items-center gap-3 text-left"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary-soft flex items-center justify-center text-2xl">
                    {product.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{product.name}</div>
                    <div className="text-[0.7rem] text-foreground/60 flex items-center gap-1 truncate">
                      <Store className="size-3 shrink-0"/> {shop.name} · {shop.area} · {shop.distanceKm} km
                    </div>
                  </div>
                  <div className="text-xs text-foreground/70 shrink-0">
                    from {formatNaira(Math.min(...product.measurements.map(m=>m.price)))}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {picked && (
          <PickMeasure
            shop={picked.shop}
            product={picked.product}
            onClose={() => setPicked(null)}
            onAdd={(m) => {
              cart.add(picked.shop, picked.product, m);
              setPicked(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function PickMeasure({
  shop, product, onClose, onAdd,
}: {
  shop: Shop;
  product: Product;
  onClose: () => void;
  onAdd: (m: Measurement) => void;
}) {
  const [picked, setPicked] = useState<string>(product.measurements[0]?.id ?? "");
  const chosen = product.measurements.find((m) => m.id === picked);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-background rounded-t-3xl w-full max-w-[480px] p-5 pb-7 shadow-2xl"
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-border mb-4" />
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center text-3xl">
            {product.emoji}
          </div>
          <div className="flex-1">
            <div className="font-display text-lg">{product.name}</div>
            <div className="text-xs text-foreground/60 mt-0.5">from {shop.name}</div>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          {product.measurements.map((m) => (
            <button
              key={m.id}
              onClick={() => setPicked(m.id)}
              className={
                "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left " +
                (picked === m.id ? "border-primary bg-primary-soft" : "border-border bg-card")
              }
            >
              <span className="text-sm font-medium">{m.label}</span>
              <span className="font-display">{formatNaira(m.price)}</span>
            </button>
          ))}
        </div>
        <button
          disabled={!chosen}
          onClick={() => chosen && onAdd(chosen)}
          className="mt-5 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold"
        >
          Add to basket — {chosen ? formatNaira(chosen.price) : ""}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={"flex items-center justify-between " + (bold ? "font-display text-lg" : "text-foreground/70")}>
      <span>{label}</span>
      <span className={bold ? "" : "text-foreground"}>{value}</span>
    </div>
  );
}
