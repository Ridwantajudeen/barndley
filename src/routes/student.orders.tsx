import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { sampleOrders, formatNaira } from "@/lib/mock";
import { ChevronRight, Package } from "lucide-react";

export const Route = createFileRoute("/student/orders")({
  head: () => ({ meta: [{ title: "Your orders — Campus Basket" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <MobileShell nav={studentNav} title="Your orders">
      <div className="space-y-3 mt-3">
        {sampleOrders.map((o) => (
          <Link
            to="/student/track/$id"
            params={{ id: o.id }}
            key={o.id}
            className="block card-soft p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-sm">{o.shop}</div>
                <div className="text-xs text-foreground/60 mt-0.5">{o.placedAt} · {o.items} items</div>
              </div>
              <span className={"chip " + (o.status === "Delivered" ? "" : "chip-accent")}>
                {o.status}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-foreground/60">{o.id}</span>
              <span className="font-display flex items-center gap-1">
                {formatNaira(o.total)} <ChevronRight className="size-4"/>
              </span>
            </div>
          </Link>
        ))}

        <div className="card-soft p-8 text-center">
          <Package className="size-7 mx-auto text-foreground/40"/>
          <p className="text-sm text-foreground/60 mt-2">That's all your recent orders.</p>
        </div>
      </div>
    </MobileShell>
  );
}
