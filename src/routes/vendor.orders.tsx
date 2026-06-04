import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { vendorNav } from "@/components/VendorNav";
import { formatNaira } from "@/lib/mock";
import { useState } from "react";
import { X, MapPin, Phone, MessageCircle, Bike, Star, Package, Clock, User } from "lucide-react";

type OrderItem = { name: string; qty: number; unit: string; price: number };
type Rider = {
  name: string;
  phone: string;
  rating: number;
  trips: number;
  plate: string;
  eta: string;
  avatar: string;
} | null;
type Order = {
  id: string;
  items: number;
  total: number;
  hall: string;
  state: string;
  time: string;
  student: { name: string; phone: string };
  lineItems: OrderItem[];
  subtotal: number;
  delivery: number;
  rider: Rider;
  placedAt: string;
  notes?: string;
};

const orders: Order[] = [
  {
    id: "#1052",
    items: 4,
    total: 6900,
    hall: "Indep. Hall · Rm 214",
    state: "New",
    time: "2 min ago",
    student: { name: "Ada Okeke", phone: "+2348021110052" },
    placedAt: "Today, 7:18 AM",
    lineItems: [
      { name: "Jollof rice (large)", qty: 2, unit: "plate", price: 2200 },
      { name: "Fried plantain", qty: 1, unit: "side", price: 700 },
      { name: "Chilled zobo", qty: 1, unit: "bottle", price: 1800 },
    ],
    subtotal: 6500,
    delivery: 400,
    rider: null,
    notes: "Extra pepper on the plantain, please.",
  },
  {
    id: "#1051",
    items: 2,
    total: 2900,
    hall: "Queens Hall · Rm 18",
    state: "Preparing",
    time: "9 min ago",
    student: { name: "Tomi Adebayo", phone: "+2348033330051" },
    placedAt: "Today, 7:11 AM",
    lineItems: [
      { name: "Indomie special", qty: 1, unit: "plate", price: 1700 },
      { name: "Bottled water", qty: 2, unit: "btl", price: 600 },
    ],
    subtotal: 2500,
    delivery: 400,
    rider: {
      name: "Mary E.",
      phone: "+2348099990051",
      rating: 4.9,
      trips: 312,
      plate: "EDO-471-XA",
      eta: "9 min after pickup",
      avatar: "M",
    },
  },
  {
    id: "#1050",
    items: 6,
    total: 12400,
    hall: "Mellanby · Rm 7",
    state: "Out for delivery",
    time: "18 min ago",
    student: { name: "Chinedu Obi", phone: "+2348055550050" },
    placedAt: "Today, 7:02 AM",
    lineItems: [
      { name: "Egusi & pounded yam", qty: 2, unit: "plate", price: 3500 },
      { name: "Goat meat (extra)", qty: 2, unit: "pcs", price: 1200 },
      { name: "Chapman", qty: 2, unit: "cup", price: 1500 },
    ],
    subtotal: 12000,
    delivery: 400,
    rider: {
      name: "Tunde A.",
      phone: "+2348077770050",
      rating: 4.8,
      trips: 488,
      plate: "EDO-220-BK",
      eta: "Arriving in 6 min",
      avatar: "T",
    },
  },
  {
    id: "#1049",
    items: 1,
    total: 800,
    hall: "Indep. Hall · Rm 9",
    state: "Delivered",
    time: "1 hr ago",
    student: { name: "Bisi K.", phone: "+2348012340049" },
    placedAt: "Today, 6:05 AM",
    lineItems: [{ name: "Meat pie", qty: 1, unit: "pc", price: 800 }],
    subtotal: 800,
    delivery: 0,
    rider: {
      name: "Samuel O.",
      phone: "+2348011110049",
      rating: 4.7,
      trips: 207,
      plate: "EDO-118-LA",
      eta: "Delivered 52 min ago",
      avatar: "S",
    },
  },
];

export const Route = createFileRoute("/vendor/orders")({
  head: () => ({ meta: [{ title: "Orders — Vendor" }] }),
  component: VendorOrders,
});

function VendorOrders() {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = orders.find((o) => o.id === openId) || null;

  return (
    <MobileShell nav={vendorNav} title="Incoming orders">
      <div className="space-y-3 mt-3">
        {orders.map((o) => (
          <button
            key={o.id}
            onClick={() => setOpenId(o.id)}
            className="w-full text-left card-soft p-4 hover:shadow-md transition-shadow"
          >
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
          </button>
        ))}
      </div>

      {active && <OrderModal order={active} onClose={() => setOpenId(null)} />}
    </MobileShell>
  );
}

function OrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-background w-full max-w-[480px] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col"
      >
        <div className="px-5 pt-5 pb-3 flex items-start justify-between border-b border-border/60">
          <div>
            <div className="font-display text-xl leading-tight">Order {order.id}</div>
            <div className="text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
              <Clock className="size-3" /> {order.placedAt}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={"chip " + (order.state === "New" ? "chip-accent" : "")}>{order.state}</span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-5">
          {/* Customer */}
          <section>
            <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold mb-2">
              Customer
            </div>
            <div className="flex items-center gap-3 bg-secondary/60 rounded-2xl p-3">
              <span className="h-10 w-10 rounded-xl bg-foreground text-background flex items-center justify-center">
                <User className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{order.student.name}</div>
                <div className="text-[0.7rem] text-foreground/60 flex items-center gap-1">
                  <MapPin className="size-3" /> {order.hall}
                </div>
              </div>
              <a
                href={`sms:${order.student.phone}`}
                className="h-9 w-9 rounded-lg bg-background flex items-center justify-center"
              >
                <MessageCircle className="size-4" />
              </a>
              <a
                href={`tel:${order.student.phone}`}
                className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"
              >
                <Phone className="size-4" />
              </a>
            </div>
          </section>

          {/* Items */}
          <section>
            <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold mb-2">
              Items ({order.items})
            </div>
            <ul className="divide-y divide-border/60 bg-card border border-border rounded-2xl">
              {order.lineItems.map((li, i) => (
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
            {order.notes && (
              <div className="mt-2 text-xs text-foreground/70 bg-accent-soft/50 border border-accent/30 rounded-xl px-3 py-2">
                <span className="font-semibold">Note: </span>
                {order.notes}
              </div>
            )}
          </section>

          {/* Totals */}
          <section className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatNaira(order.subtotal)} />
            <Row label="Delivery" value={formatNaira(order.delivery)} />
            <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-display text-lg">{formatNaira(order.total)}</span>
            </div>
          </section>

          {/* Rider */}
          <section>
            <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold mb-2">
              Rider
            </div>
            {order.rider ? (
              <div className="card-soft p-4">
                <div className="flex items-center gap-3">
                  <span className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-lg">
                    {order.rider.avatar}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{order.rider.name}</div>
                    <div className="text-[0.7rem] text-foreground/60 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3 fill-current" /> {order.rider.rating}
                      </span>
                      <span>· {order.rider.trips} trips</span>
                    </div>
                    <div className="text-[0.7rem] text-foreground/60 flex items-center gap-1 mt-0.5">
                      <Bike className="size-3" /> {order.rider.plate}
                    </div>
                  </div>
                  <a
                    href={`tel:${order.rider.phone}`}
                    className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"
                  >
                    <Phone className="size-4" />
                  </a>
                </div>
                <div className="mt-3 text-xs bg-secondary/60 rounded-xl px-3 py-2">
                  {order.rider.eta}
                </div>
              </div>
            ) : (
              <div className="card-soft p-4 text-center">
                <div className="h-10 w-10 mx-auto rounded-full bg-secondary flex items-center justify-center">
                  <Bike className="size-4 text-foreground/60" />
                </div>
                <div className="text-sm font-semibold mt-2">Awaiting rider</div>
                <div className="text-xs text-foreground/60 mt-0.5">
                  We're matching the nearest rider. You'll see their details here once accepted.
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground/60">{label}</span>
      <span>{value}</span>
    </div>
  );
}
