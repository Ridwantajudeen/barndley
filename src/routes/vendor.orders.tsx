import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { vendorNav } from "@/components/VendorNav";
import { formatNaira } from "@/lib/mock";

const orders = [
  { id: "#1052", items: 4, total: 6900, hall: "Indep. Hall · Rm 214", state: "New", time: "2 min ago" },
  { id: "#1051", items: 2, total: 2900, hall: "Queens Hall · Rm 18", state: "Preparing", time: "9 min ago" },
  { id: "#1050", items: 6, total: 12400, hall: "Mellanby · Rm 7", state: "Out for delivery", time: "18 min ago" },
  { id: "#1049", items: 1, total: 800, hall: "Indep. Hall · Rm 9", state: "Delivered", time: "1 hr ago" },
];

export const Route = createFileRoute("/vendor/orders")({
  head: () => ({ meta: [{ title: "Orders — Vendor" }] }),
  component: () => (
    <MobileShell nav={vendorNav} title="Incoming orders">
      <div className="space-y-3 mt-3">
        {orders.map((o) => (
          <div key={o.id} className="card-soft p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{o.id}</div>
                <div className="text-xs text-foreground/60">{o.hall}</div>
                <div className="text-xs text-foreground/50 mt-0.5">{o.time}</div>
              </div>
              <span className={"chip " + (o.state === "New" ? "chip-accent" : "")}>{o.state}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-foreground/70">{o.items} items</span>
              <span className="font-display">{formatNaira(o.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </MobileShell>
  ),
});
