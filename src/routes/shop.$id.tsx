import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { shops, formatNaira, type Product, type Measurement } from "@/lib/mock";
import { cart, useCart, cartTotal } from "@/lib/cart-store";
import { ArrowLeft, Star, Clock, MapPin, ShoppingBasket, Plus, Check } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/shop/$id")({
  loader: ({ params }) => {
    const shop = shops.find((s) => s.id === params.id);
    if (!shop) throw notFound();
    return { shop };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.shop.name ?? "Shop"} — Campus Basket` },
      { name: "description", content: `Order from ${loaderData?.shop.name ?? "this shop"} on Campus Basket. Fresh foodstuff delivered to your hostel.` },
      { property: "og:title", content: `${loaderData?.shop.name ?? "Shop"} — Campus Basket` },
      { property: "og:description", content: `Order from ${loaderData?.shop.name ?? "this shop"} on Campus Basket. Fresh foodstuff delivered to your hostel.` },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PublicShopPage,
});

function PublicShopPage() {
  const data = Route.useLoaderData() as { shop: typeof shops[number] };
  const shop = data.shop;
  const cartSnap = useCart();
  const [openProduct, setOpenProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen relative">
        <header className="sticky top-0 z-30 px-5 pt-5 pb-3 backdrop-blur-md bg-background/60 border-b border-border/50">
          <div className="flex items-center justify-between">
            <Logo to="/" />
            <Link
              to="/student"
              className="inline-flex items-center gap-1 text-xs font-semibold bg-secondary px-3 py-1.5 rounded-full"
            >
              Browse shops
            </Link>
          </div>
        </header>

        <main className="flex-1 px-5 pt-4 pb-28">
          <div className={`card-soft overflow-hidden`}>
            <div className={`h-32 bg-gradient-to-br ${shop.hue} flex items-end p-4`}>
              <span className="text-5xl">{shop.emoji}</span>
            </div>
            <div className="p-4">
              <h2 className="font-display text-2xl">{shop.name}</h2>
              <p className="text-sm text-foreground/60">{shop.tagline}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-foreground/70 flex-wrap">
                <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-accent text-accent"/>{shop.rating} ({shop.reviews})</span>
                <span className="inline-flex items-center gap-1"><Clock className="size-3.5"/>{shop.hours}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5"/>{shop.distanceKm} km</span>
                <span className={"chip " + (shop.open ? "" : "bg-foreground text-background")}>
                  {shop.open ? "Open now" : "Closed"}
                </span>
              </div>
            </div>
          </div>

          <h3 className="font-display text-lg mt-6 mb-2">Available products</h3>
          <div className="grid grid-cols-2 gap-3">
            {shop.products.map((p) => (
              <button
                key={p.id}
                disabled={!p.available}
                onClick={() => setOpenProduct(p)}
                className="card-soft p-3 text-left disabled:opacity-50"
              >
                <div className="h-16 rounded-xl bg-primary-soft/60 flex items-center justify-center text-3xl mb-2">
                  {p.emoji}
                </div>
                <div className="font-semibold text-sm leading-tight">{p.name}</div>
                <div className="text-[0.7rem] text-foreground/60 mt-0.5">{p.category}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-foreground/70">
                    from {formatNaira(Math.min(...p.measurements.map(m=>m.price)))}
                  </span>
                  <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center">
                    <Plus className="size-4" />
                  </span>
                </div>
              </button>
            ))}
            {shop.products.length === 0 && (
              <div className="col-span-2 text-center text-sm text-foreground/60 py-8">
                This shop hasn't listed products yet.
              </div>
            )}
          </div>

          <div className="mt-8 card-soft p-4 text-center">
            <p className="text-sm text-foreground/60">Want to order from more shops?</p>
            <Link
              to="/student"
              className="mt-2 inline-flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl"
            >
              <ShoppingBasket className="size-4" /> Browse all shops
            </Link>
          </div>
        </main>

        {openProduct && (
          <MeasurementSheet
            product={openProduct}
            shop={shop}
            onClose={() => setOpenProduct(null)}
            onAdd={(m) => {
              cart.add(shop, openProduct, m);
              setOpenProduct(null);
            }}
          />
        )}

        {cartSnap.lines.length > 0 && (
          <Link
            to="/student/cart"
            className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[440px] z-30 bg-foreground text-background rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <ShoppingBasket className="size-4" /> View basket ({cartSnap.lines.length})
            </span>
            <span className="font-display">{formatNaira(cartTotal(cartSnap.lines))}</span>
          </Link>
        )}
      </div>
    </div>
  );
}

function MeasurementSheet({
  product,
  shop,
  onClose,
  onAdd,
}: {
  product: Product;
  shop: typeof shops[number];
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
          <div className="text-xs font-semibold text-foreground/70 mb-2">
            CHOOSE A MEASUREMENT
          </div>
          <div className="space-y-2">
            {product.measurements.map((m) => (
              <button
                key={m.id}
                onClick={() => setPicked(m.id)}
                className={
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left " +
                  (picked === m.id
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-card")
                }
              >
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  {picked === m.id ? (
                    <Check className="size-4 text-primary" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-border" />
                  )}
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
          Add to basket — {chosen ? formatNaira(chosen.price) : ""}
        </button>
      </div>
    </div>
  );
}
