import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { cart, useCart, cartTotal } from "@/lib/cart-store";
import { shops, formatNaira } from "@/lib/mock";
import { Minus, Plus, Trash2, ArrowLeft, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/student/cart")({
  head: () => ({ meta: [{ title: "Your basket — Campus Basket" }] }),
  component: CartPage,
});

function CartPage() {
  const snap = useCart();
  const shop = shops.find((s) => s.id === snap.shopId);
  const total = cartTotal(snap.lines);
  const delivery = snap.lines.length ? 350 : 0;

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
          {shop && (
            <div className="card-soft p-3 flex items-center gap-3">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${shop.hue} flex items-center justify-center text-xl`}>
                {shop.emoji}
              </div>
              <div className="flex-1">
                <div className="text-xs text-foreground/60">Ordering from</div>
                <div className="font-semibold text-sm">{shop.name}</div>
              </div>
              <span className="chip">{shop.etaMin} min</span>
            </div>
          )}

          <div className="mt-3 card-soft p-1">
            <div className="px-3 py-2 bg-accent-soft text-[0.7rem] font-semibold flex items-center gap-1.5 rounded-xl">
              <AlertCircle className="size-3.5" />
              You can only order from one shop at a time.
            </div>
            <ul className="divide-y divide-border/60 mt-1">
              {snap.lines.map((l) => (
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
                      onClick={() => cart.setQty(l.productId, l.measurement.id, l.qty - 1)}
                      className="h-7 w-7 rounded-full bg-background flex items-center justify-center"
                    >
                      {l.qty === 1 ? <Trash2 className="size-3.5"/> : <Minus className="size-3.5"/>}
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">{l.qty}</span>
                    <button
                      onClick={() => cart.setQty(l.productId, l.measurement.id, l.qty + 1)}
                      className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                    >
                      <Plus className="size-3.5"/>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 card-soft p-4 text-sm space-y-2">
            <Row label="Subtotal" value={formatNaira(total)} />
            <Row label="Delivery" value={formatNaira(delivery)} />
            <Row label="Service fee" value={formatNaira(100)} />
            <div className="border-t border-border/60 pt-2 mt-2">
              <Row bold label="Total" value={formatNaira(total + delivery + 100)} />
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
    </MobileShell>
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
