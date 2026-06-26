import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, AlertTriangle, Check, Clock, Heart, MapPin, Plus, ShoppingBasket, Star } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { cart, cartArea, cartTotal, useCart } from "@/lib/cart-store";
import { fetchLiveShopById, type LiveShop } from "@/lib/live-shops";
import { formatNaira, type Measurement, type Product } from "@/lib/mock";

export const Route = createFileRoute("/student/shop/$id")({
  loader: async ({ params }) => {
    const shop = await fetchLiveShopById(params.id);
    if (!shop) throw notFound();
    return { shop };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.shop.name ?? "Shop"} - Campus Basket` }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { shop } = Route.useLoaderData() as { shop: LiveShop };
  const cartSnap = useCart();
  const lockedArea = cartArea(cartSnap.lines);
  const blocked = lockedArea !== null && lockedArea !== shop.area;
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [blockMsg, setBlockMsg] = useState<string | null>(null);

  return (
    <MobileShell nav={studentNav}>
      <Link to="/student" className="inline-flex items-center gap-1 text-sm font-semibold text-foreground/70">
        <ArrowLeft className="size-4" /> Back
      </Link>

      <div className="mt-3 card-soft overflow-hidden">
        <div className={`relative h-32 bg-gradient-to-br ${shop.hue} flex items-end p-4 overflow-hidden`}>
          {shop.cover_image_url ? (
            <img src={shop.cover_image_url} alt={shop.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-foreground/10" />
          <span className="relative text-5xl">{shop.emoji}</span>
          <button className="relative ml-auto h-9 w-9 rounded-full bg-background/70 inline-flex items-center justify-center">
            <Heart className="size-4" />
          </button>
        </div>
        <div className="p-4">
          <h2 className="font-display text-2xl">{shop.name}</h2>
          <p className="text-sm text-foreground/60">{shop.tagline}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-foreground/70 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-accent text-accent" />
              {shop.rating.toFixed(1)} ({shop.reviews_count})
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {shop.hours || "Hours not set"}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {shop.area} - {shop.location}
            </span>
            <span className={"chip " + (shop.is_open ? "" : "bg-foreground text-background")}>
              {shop.is_open ? "Open now" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      {blocked && (
        <div className="mt-3 card-soft p-3 flex items-start gap-2 border border-destructive/30 bg-destructive/5">
          <AlertTriangle className="size-4 text-destructive mt-0.5 shrink-0" />
          <div className="text-xs">
            <div className="font-semibold">Different area - cannot pair</div>
            <div className="text-foreground/70 mt-0.5">
              Your basket is paired with <b>{lockedArea}</b> shops. {shop.name} is in <b>{shop.area}</b>. Finish or clear your basket to shop here.
            </div>
          </div>
        </div>
      )}

      <h3 className="font-display text-lg mt-6 mb-2">Available products</h3>
      <div className="grid grid-cols-2 gap-3">
        {shop.products.map((p) => (
          <button
            key={p.id}
            disabled={!p.available}
            onClick={() => setOpenProduct(p)}
            className="card-soft p-3 text-left disabled:opacity-50"
          >
            <div className="h-16 rounded-xl bg-primary-soft/60 flex items-center justify-center text-3xl mb-2 overflow-hidden">
              {p.photos && p.photos[0] ? (
                <img src={p.photos[0]} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                p.emoji
              )}
            </div>
            <div className="font-semibold text-sm leading-tight">{p.name}</div>
            <div className="text-[0.7rem] text-foreground/60 mt-0.5">{p.category}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-foreground/70">
                from {formatNaira(Math.min(...p.measurements.map((m) => m.price)))}
              </span>
              <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center">
                <Plus className="size-4" />
              </span>
            </div>
          </button>
        ))}
        {shop.products.length === 0 && (
          <div className="col-span-2 text-center text-sm text-foreground/60 py-8">
            This shop has not listed products yet.
          </div>
        )}
      </div>

      {openProduct && (
        <MeasurementSheet
          product={openProduct}
          onClose={() => setOpenProduct(null)}
          onAdd={(m) => {
            const result = cart.add(shop, openProduct, m);
            if (!result.ok) setBlockMsg(result.reason);
            setOpenProduct(null);
          }}
        />
      )}

      {blockMsg && (
        <div className="fixed inset-0 z-[55] flex items-end justify-center" onClick={() => setBlockMsg(null)}>
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-background rounded-t-3xl w-full max-w-[480px] p-5 pb-7 shadow-2xl"
          >
            <div className="mx-auto h-1.5 w-10 rounded-full bg-border mb-4" />
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <div className="flex-1">
                <div className="font-display text-lg leading-tight">Can not pair these shops</div>
                <p className="text-sm text-foreground/70 mt-1">{blockMsg}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setBlockMsg(null)} className="py-3 rounded-2xl bg-secondary font-semibold text-sm">
                Keep basket
              </button>
              <button
                onClick={() => {
                  cart.clear();
                  setBlockMsg(null);
                }}
                className="py-3 rounded-2xl bg-destructive text-destructive-foreground font-semibold text-sm"
              >
                Clear and start here
              </button>
            </div>
          </div>
        </div>
      )}

      {cartSnap.lines.length > 0 && (
        <Link
          to="/student/cart"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[440px] z-30 bg-foreground text-background rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <ShoppingBasket className="size-4" /> View basket ({cartSnap.lines.length})
          </span>
          <span className="font-display">{formatNaira(cartTotal(cartSnap.lines))}</span>
        </Link>
      )}
    </MobileShell>
  );
}

function MeasurementSheet({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (m: Measurement) => void;
}) {
  const [picked, setPicked] = useState<string>(product.measurements[0]?.id ?? "");
  const chosen = product.measurements.find((m) => m.id === picked);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-background rounded-t-3xl w-full max-w-[480px] p-5 pb-7 shadow-2xl"
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-border mb-4" />
        {product.photos && product.photos.length > 0 && (
          <div className="-mx-5 mb-4 px-5 overflow-x-auto">
            <div className="flex gap-2">
              {product.photos.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${product.name} ${i + 1}`}
                  className="h-40 w-40 object-cover rounded-2xl shrink-0 border border-border"
                />
              ))}
            </div>
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft flex items-center justify-center text-3xl">
            {product.emoji}
          </div>
          <div className="flex-1">
            <div className="font-display text-lg">{product.name}</div>
            <p className="text-xs text-foreground/60 mt-0.5">{product.description}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-semibold text-foreground/70 mb-2">CHOOSE A MEASUREMENT</div>
          <div className="space-y-2">
            {product.measurements.map((m) => (
              <button
                key={m.id}
                onClick={() => setPicked(m.id)}
                className={
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left " +
                  (picked === m.id ? "border-primary bg-primary-soft" : "border-border bg-card")
                }
              >
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  {picked === m.id ? <Check className="size-4 text-primary" /> : <span className="h-4 w-4 rounded-full border border-border" />}
                  {m.label}
                </span>
                <span className="font-display">{formatNaira(m.price)}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={!chosen}
          onClick={() => chosen && onAdd(chosen)}
          className="mt-5 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2"
        >
          Add to basket - {chosen ? formatNaira(chosen.price) : ""}
        </button>
      </div>
    </div>
  );
}
