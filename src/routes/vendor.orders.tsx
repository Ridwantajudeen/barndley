import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bike, Clock, LoaderCircle, MapPin, MessageCircle, Package, Phone, User, X } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { vendorNav } from "@/components/VendorNav";
import { formatNaira } from "@/lib/mock";
import { backendRequest } from "@/lib/backend";
import { useVendorSales, type VendorOrder } from "@/lib/vendor-sales";
import { useVendorShop } from "@/lib/vendor-shop";

type DisplayOrder = VendorOrder & {
  customerName: string;
  customerPhone: string | null;
};

export const Route = createFileRoute("/vendor/orders")({
  head: () => ({ meta: [{ title: "Orders - Vendor" }] }),
  component: VendorOrders,
});

function VendorOrders() {
  const { shop, loading: shopLoading } = useVendorShop();
  const { orders, loading, refreshing, refresh } = useVendorSales(shop?.id ?? null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

  async function confirmOrder(orderId: string) {
    setSavingOrderId(orderId);
    try {
      await backendRequest(`/vendor/orders/${encodeURIComponent(orderId)}/confirm`, {
        method: "PUT",
      });
      await refresh();
    } finally {
      setSavingOrderId(null);
    }
  }

  const displayOrders = orders.map((order) => ({
    ...order,
    customerName: order.customer_name || "Customer",
    customerPhone: order.customer_phone ?? null,
  })) satisfies DisplayOrder[];

  const active = displayOrders.find((order) => order.id === openId) || null;

  return (
    <MobileShell nav={vendorNav} title="Incoming orders">
      {shopLoading && !shop?.id ? (
        <div className="card-soft p-4 text-sm text-foreground/70 inline-flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin" />
          Loading orders...
        </div>
      ) : !shop?.id ? (
        <div className="card-soft p-4 text-sm text-foreground/70">
          Create your shop profile first, then real orders will appear here from the backend.
        </div>
      ) : (
        <>
          {refreshing && (
            <p className="mb-2 text-[0.7rem] text-foreground/50 inline-flex items-center gap-1.5">
              <LoaderCircle className="size-3.5 animate-spin" /> Updating orders...
            </p>
          )}

          <div className="space-y-3 mt-3">
            {loading && !displayOrders.length ? (
              <div className="card-soft p-4 text-sm text-foreground/60">Loading orders...</div>
            ) : (
              displayOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => setOpenId(order.id)}
                  className="w-full text-left card-soft p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm">{order.order_code || order.id}</div>
                      <div className="text-xs text-foreground/60 mt-0.5">{order.customerName}</div>
                      <div className="text-xs text-foreground/50 mt-0.5">
                        {new Date(order.placed_at).toLocaleString()} · {order.items_count} items
                      </div>
                    </div>
                    <span className={"chip " + (String(order.status) === "Placed" ? "chip-accent" : "")}>
                      {String(order.status)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-foreground/70">
                      {order.hall}
                      {order.room ? ` · ${order.room}` : ""}
                    </span>
                    <span className="font-display">{formatNaira(order.total)}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {active && <OrderModal order={active} onClose={() => setOpenId(null)} />}
        </>
      )}
    </MobileShell>
  );
}

function OrderModal({ order, onClose }: { order: DisplayOrder; onClose: () => void }) {
  const riderAssigned = Boolean(order.rider_name || order.rider_phone);
  const status = String(order.status);
  const statusNote = getOrderStatusNote(status);

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-background w-full max-w-[480px] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col"
      >
        <div className="px-5 pt-5 pb-3 flex items-start justify-between border-b border-border/60">
          <div>
            <div className="font-display text-xl leading-tight">Order {order.order_code || order.id}</div>
            <div className="text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
              <Clock className="size-3" /> {new Date(order.placed_at).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={"chip " + (String(order.status) === "Placed" ? "chip-accent" : "")}>
              {String(order.status)}
            </span>
            <button onClick={onClose} aria-label="Close" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-5">
          <div className="rounded-2xl bg-secondary/60 px-4 py-3 text-sm">
            <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold">Status update</div>
            <div className="font-medium mt-0.5">{statusNote}</div>
          </div>

          <section>
            <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold mb-2">Customer</div>
            <div className="flex items-center gap-3 bg-secondary/60 rounded-2xl p-3">
              <span className="h-10 w-10 rounded-xl bg-foreground text-background flex items-center justify-center">
                <User className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{order.customerName}</div>
                <div className="text-[0.7rem] text-foreground/60 flex items-center gap-1">
                  <MapPin className="size-3" /> {order.delivery_address}
                </div>
              </div>
              {order.customerPhone && (
                <>
                  <a href={`sms:${order.customerPhone}`} className="h-9 w-9 rounded-lg bg-background flex items-center justify-center">
                    <MessageCircle className="size-4" />
                  </a>
                  <a href={`tel:${order.customerPhone}`} className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                    <Phone className="size-4" />
                  </a>
                </>
              )}
            </div>
          </section>

          <section>
            <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold mb-2">
              Items ({order.items_count})
            </div>
            <ul className="divide-y divide-border/60 bg-card border border-border rounded-2xl">
              {order.line_items.map((li, i) => (
                <li key={i} className="px-3 py-3 flex items-center gap-3">
                  <span className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Package className="size-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{li.name}</div>
                    <div className="text-[0.7rem] text-foreground/60">
                      {li.qty} × {li.unit}
                    </div>
                  </div>
                  <div className="text-sm font-display">{formatNaira(li.price * li.qty)}</div>
                </li>
              ))}
            </ul>
            {order.note && (
              <div className="mt-2 text-xs text-foreground/70 bg-accent-soft/50 border border-accent/30 rounded-xl px-3 py-2">
                <span className="font-semibold">Note: </span>
                {order.note}
              </div>
            )}
          </section>

          <section className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatNaira(order.subtotal)} />
            <Row label="Delivery" value={formatNaira(order.delivery_fee)} />
            {order.service_fee > 0 && <Row label="Service fee" value={formatNaira(order.service_fee)} />}
            <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-display text-lg">{formatNaira(order.total)}</span>
            </div>
          </section>

          {status === "Placed" ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => confirmOrder(order.id)}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold"
                disabled={savingOrderId === order.id}
              >
                {savingOrderId === order.id ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle className="size-4 animate-spin" /> Confirming...
                  </span>
                ) : (
                  "Confirm order"
                )}
              </button>
            </div>
          ) : null}

          <section>
            <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold mb-2">Rider</div>
            {riderAssigned ? (
              <div className="card-soft p-4">
                <div className="flex items-center gap-3">
                  <span className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-lg">
                    {(order.rider_name || "R").slice(0, 1)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{order.rider_name || "Assigned rider"}</div>
                    {order.rider_phone && <div className="text-[0.7rem] text-foreground/60">{order.rider_phone}</div>}
                  </div>
                  {order.rider_phone && (
                    <a href={`tel:${order.rider_phone}`} className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                      <Phone className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="card-soft p-4 text-center">
                <div className="h-10 w-10 mx-auto rounded-full bg-secondary flex items-center justify-center">
                  <Bike className="size-4 text-foreground/60" />
                </div>
                <div className="text-sm font-semibold mt-2">Awaiting rider</div>
                <div className="text-xs text-foreground/60 mt-0.5">We’ll show the rider here once one is assigned.</div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function getOrderStatusNote(status: string) {
  switch (status) {
    case "Vendor confirmed":
      return "Your shop has confirmed the order and it is ready for pickup.";
    case "Rider en route to shop":
      return "The rider is on the way to collect the order.";
    case "Picked up":
      return "The rider has marked the order as picked up.";
    case "Student contacted":
      return "The rider has contacted the student and is on the delivery leg.";
    case "Delivering":
      return "The rider is on the way to the student.";
    case "Delivered":
      return "The order has been completed.";
    case "Student confirmed":
      return "The student confirmed receipt of the order.";
    default:
      return "The order is waiting for the next update.";
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground/60">{label}</span>
      <span>{value}</span>
    </div>
  );
}
