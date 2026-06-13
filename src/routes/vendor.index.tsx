import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Check, CircleDollarSign, Link2, LoaderCircle, ShoppingBag, Star, TrendingUp } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { vendorNav } from "@/components/VendorNav";
import { formatNaira } from "@/lib/mock";
import { useVendorSales } from "@/lib/vendor-sales";
import { useVendorShop } from "@/lib/vendor-shop";

export const Route = createFileRoute("/vendor/")({
  head: () => ({ meta: [{ title: "Shop dashboard â€” Campus Basket" }] }),
  component: VendorHome,
});

function VendorHome() {
  const { shop, loading, saveShop, syncing } = useVendorShop();
  const { summary } = useVendorSales(shop?.id ?? null);
  const [copied, setCopied] = useState(false);
  const [shopLink, setShopLink] = useState("");
  const [savingOpen, setSavingOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (shop?.id) setShopLink(`${window.location.origin}/shop/${shop.id}`);
    else setShopLink("");
  }, [shop?.id]);

  const copyLink = async () => {
    if (!shopLink) return;
    try {
      await navigator.clipboard.writeText(shopLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shopLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const open = shop?.is_open ?? true;

  const toggleOpen = async () => {
    if (!shop) return;
    setSavingOpen(true);
    try {
      await saveShop({ is_open: !open });
    } finally {
      setSavingOpen(false);
    }
  };

  const liveOrders =
    summary.recentOrders.filter((order) => String(order.status) !== "Delivered").slice(0, 2) ||
    summary.recentOrders.slice(0, 2);

  return (
    <MobileShell nav={vendorNav} title={shop?.name || "Your shop"}>
      {loading && !shop?.id ? (
        <div className="card-soft p-4 text-sm text-foreground/70 inline-flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin" />
          Loading your shop...
        </div>
      ) : !shop?.id ? (
        <div className="card-soft p-4 text-sm text-foreground/70">
          Create your shop profile first, then your sales dashboard will fill itself with live data.
          <Link to="/vendor/profile" className="mt-3 block font-semibold text-primary">
            Go to shop profile
          </Link>
        </div>
      ) : (
        <>
          <div className="card-soft p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-foreground/60">Your shop is</div>
              <div className="font-display text-xl">{open ? "Open" : "Closed"}</div>
            </div>
            <button
              onClick={toggleOpen}
              disabled={savingOpen || loading || !shop?.id}
              className={"w-14 h-8 rounded-full p-1 transition-colors disabled:opacity-60 " + (open ? "bg-primary" : "bg-border")}
            >
              <span
                className={
                  "block h-6 w-6 rounded-full bg-background shadow transition-transform inline-flex items-center justify-center " +
                  (open ? "translate-x-6" : "")
                }
              >
                {savingOpen && <LoaderCircle className="size-3 animate-spin text-foreground/60" />}
              </span>
            </button>
          </div>

          <div className="card-soft p-4 mt-3">
            <div className="text-xs font-semibold text-foreground/70 mb-1.5">Your shop link</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 bg-secondary rounded-xl px-3 py-2 text-xs text-foreground/80 truncate">
                {shopLink || "Loading shop link..."}
              </div>
              <button
                onClick={copyLink}
                disabled={!shopLink}
                className="shrink-0 h-9 w-9 rounded-xl bg-primary text-primary-foreground inline-flex items-center justify-center disabled:opacity-60"
              >
                {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
              </button>
            </div>
            {copied && <p className="text-[0.7rem] text-primary mt-1.5 font-medium">Link copied to clipboard!</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Stat icon={<ShoppingBag className="size-4" />} label="Orders today" value={String(summary.ordersToday)} tone="primary" />
            <Stat icon={<CircleDollarSign className="size-4" />} label="Earned" value={formatNaira(summary.revenue)} tone="accent" />
            <Stat icon={<TrendingUp className="size-4" />} label="Avg basket" value={formatNaira(summary.avgBasket)} tone="primary" />
            <Stat icon={<Star className="size-4" />} label="Rating" value={(shop?.rating ?? 0).toFixed(1)} tone="accent" />
          </div>

          {syncing && <p className="mt-3 text-[0.7rem] text-foreground/50 inline-flex items-center gap-1.5"><LoaderCircle className="size-3.5 animate-spin" /> Syncing live orders...</p>}

          <h2 className="font-display text-lg mt-6 mb-2">Live orders</h2>
          <div className="space-y-3">
            {(liveOrders.length ? liveOrders : summary.recentOrders).map((order) => (
              <div key={order.id} className="card-soft p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{order.order_code || order.id} · {order.hall}</div>
                    <div className="text-xs text-foreground/60">
                      {order.items_count} items · {formatNaira(order.total)}
                    </div>
                  </div>
                  <span className={"chip " + (String(order.status) === "Placed" ? "chip-accent" : "")}>
                    {String(order.status)}
                  </span>
                </div>
                <div className="mt-3 text-xs text-foreground/60">
                  {order.placed_at}
                </div>
              </div>
            ))}
            {!summary.recentOrders.length && (
              <div className="card-soft p-5 text-center text-sm text-foreground/60">
                No live orders yet. When sales start coming in, they’ll show up here.
              </div>
            )}
          </div>
        </>
      )}
    </MobileShell>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "primary" | "accent";
}) {
  return (
    <div className="card-soft p-3">
      <div className={"h-8 w-8 rounded-lg flex items-center justify-center " + (tone === "primary" ? "bg-primary-soft" : "bg-accent-soft")}>
        {icon}
      </div>
      <div className="text-[0.7rem] text-foreground/60 mt-2">{label}</div>
      <div className="font-display text-lg">{value}</div>
    </div>
  );
}
