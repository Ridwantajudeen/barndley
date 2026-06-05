import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { vendorNav } from "@/components/VendorNav";
import { formatNaira } from "@/lib/mock";
import { useEffect, useState } from "react";
import { CircleDollarSign, ShoppingBag, Star, TrendingUp, Link2, Check } from "lucide-react";

export const Route = createFileRoute("/vendor/")({
  head: () => ({ meta: [{ title: "Shop dashboard — Campus Basket" }] }),
  component: VendorHome,
});

function VendorHome() {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const shopId = "mama-tee";
  const [shopLink, setShopLink] = useState(`/shop/${shopId}`);
  useEffect(() => {
    setShopLink(`${window.location.origin}/shop/${shopId}`);
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shopLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
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

  return (
    <MobileShell
      nav={vendorNav}
      title="Mama Osas Foodstuff"
    
    >
      <div className="card-soft p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-foreground/60">Your shop is</div>
          <div className="font-display text-xl">{open ? "Open" : "Closed"}</div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className={"w-14 h-8 rounded-full p-1 transition-colors " + (open ? "bg-primary" : "bg-border")}
        >
          <span className={"block h-6 w-6 rounded-full bg-background shadow transition-transform " + (open ? "translate-x-6" : "")} />
        </button>
      </div>

      <div className="card-soft p-4 mt-3">
        <div className="text-xs font-semibold text-foreground/70 mb-1.5">Your shop link</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-secondary rounded-xl px-3 py-2 text-xs text-foreground/80 truncate">
            {shopLink}
          </div>
          <button
            onClick={copyLink}
            className="shrink-0 h-9 w-9 rounded-xl bg-primary text-primary-foreground inline-flex items-center justify-center"
          >
            {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
          </button>
        </div>
        {copied && <p className="text-[0.7rem] text-primary mt-1.5 font-medium">Link copied to clipboard!</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Stat icon={<ShoppingBag className="size-4"/>} label="Orders today" value="12" tone="primary"/>
        <Stat icon={<CircleDollarSign className="size-4"/>} label="Earned" value={formatNaira(24300)} tone="accent"/>
        <Stat icon={<TrendingUp className="size-4"/>} label="Avg basket" value={formatNaira(3450)} tone="primary"/>
        <Stat icon={<Star className="size-4"/>} label="Rating" value="4.8" tone="accent"/>
      </div>

      <h2 className="font-display text-lg mt-6 mb-2">Live orders</h2>
      <div className="space-y-3">
        {[
          { id: "#1052", items: 4, total: 6900, hall: "Indep. Hall", state: "New" },
          { id: "#1051", items: 2, total: 2900, hall: "Queens Hall", state: "Preparing" },
        ].map((o) => (
          <div key={o.id} className="card-soft p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{o.id} · {o.hall}</div>
                <div className="text-xs text-foreground/60">{o.items} items · {formatNaira(o.total)}</div>
              </div>
              <span className={"chip " + (o.state === "New" ? "chip-accent" : "")}>{o.state}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Accept</button>
              <button className="flex-1 py-2 rounded-xl bg-secondary text-sm font-semibold">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "primary"|"accent" }) {
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
