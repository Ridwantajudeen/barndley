import { createFileRoute, Link } from "@tanstack/react-router";
import { Bike, Check, Clock, LoaderCircle, MapPin, MessageCircle, Package, Phone, Store, Truck, User, X } from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { formatNaira } from "@/lib/mock";
import { useRiderOrder } from "@/lib/rider-workspace";

export const Route = createFileRoute("/rider/trips/$id")({
  head: ({ params }) => ({ meta: [{ title: `Trip ${params.id} - Rider` }] }),
  component: RiderTripDetail,
});

function RiderTripDetail() {
  const { id } = Route.useParams();
  const { order, loading, syncing, markPickedUp, markStudentContacted, markDelivered } = useRiderOrder(id);
  const [saving, setSaving] = useState<null | "pickup" | "contact" | "deliver">(null);

  if (loading) {
    return (
      <MobileShell nav={riderNav} title="Trip details">
        <div className="card-soft p-4 inline-flex items-center gap-2 text-sm text-foreground/70">
          <LoaderCircle className="size-4 animate-spin" />
          Loading trip details...
        </div>
      </MobileShell>
    );
  }

  if (!order) {
    return (
      <MobileShell nav={riderNav} title="Trip details">
        <div className="card-soft p-5">
          <div className="font-semibold">Trip not found</div>
          <p className="text-sm text-foreground/60 mt-2">This order is not available in your rider queue anymore.</p>
          <Link to="/rider/trips" className="mt-4 inline-flex text-sm font-semibold text-primary">
            Back to trips
          </Link>
        </div>
      </MobileShell>
    );
  }

  const pickupDone = isAtLeastPickedUp(String(order.status));
  const contactDone = isAtLeastContacted(String(order.status));
  const delivered = String(order.status) === "Delivered";
  const shopLine = [order.shop_area, order.shop_location].filter(Boolean).join(" - ");
  const buyerPhone = order.customer_phone ?? "";

  async function handlePickup() {
    setSaving("pickup");
    try {
      await markPickedUp();
    } finally {
      setSaving(null);
    }
  }

  async function handleContact() {
    setSaving("contact");
    try {
      await markStudentContacted();
    } finally {
      setSaving(null);
    }
  }

  async function handleDelivered() {
    setSaving("deliver");
    try {
      await markDelivered();
    } finally {
      setSaving(null);
    }
  }

  return (
    <MobileShell nav={riderNav} title="Trip details">
      <div className="card-soft p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-foreground/60">Order {order.order_code}</div>
            <div className="font-display text-xl truncate">{order.shop_name}</div>
            <div className="text-xs text-foreground/60 mt-1 inline-flex items-center gap-1">
              <Clock className="size-3" /> {new Date(order.placed_at).toLocaleString()}
            </div>
          </div>
          <span className={"chip " + (delivered ? "" : "chip-accent")}>{String(order.status)}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <MiniStat label="Items" value={String(order.items_count)} />
          <MiniStat label="Total" value={formatNaira(order.total)} />
        </div>
        <div className="mt-3 text-xs text-foreground/60">
          Follow the pickup step first, then move to delivery. The student will see the same status changes live.
        </div>
      </div>

      <div className="card-soft p-4 mt-4 space-y-3">
        <DetailLine icon={<MapPin className="size-4" />} label="Pickup address" value={shopLine || "Pickup location not set"} />
        <DetailLine icon={<Truck className="size-4" />} label="Delivery address" value={order.delivery_address || `${order.hall}, ${order.room}`} />
        <DetailLine icon={<Phone className="size-4" />} label="Delivery phone" value={buyerPhone || "No phone number saved"} />
        <DetailLine icon={<Package className="size-4" />} label="Payment" value={order.payment_method} />
      </div>

      <section className={"card-soft p-4 mt-4 " + (pickupDone ? "ring-2 ring-primary/20" : "")}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-foreground/60 font-semibold">Stage 1</div>
            <div className="font-semibold text-lg">Pickup</div>
          </div>
          <span className={"chip " + (pickupDone ? "" : "chip-accent")}>{pickupDone ? "Picked up" : "Waiting"}</span>
        </div>
        <div className="mt-3 space-y-2">
          <ContactCard
            icon={<Store className="size-4" />}
            title={order.shop_name}
            subtitle={shopLine || "Pickup location"}
            phone={order.shop_phone || ""}
          />
        </div>
        <div className="mt-3 rounded-xl bg-secondary/40 px-3 py-2 text-sm">
          <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold">Pickup address</div>
          <div className="font-medium break-words">{shopLine || "Pickup location not set"}</div>
        </div>
        <button
          disabled={pickupDone || syncing || saving !== null}
          onClick={handlePickup}
          className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving === "pickup" ? <LoaderCircle className="size-4 animate-spin" /> : pickupDone ? <Check className="size-4" /> : null}
          {pickupDone ? "Pickup confirmed" : "Mark picked up"}
        </button>
        <p className="mt-2 text-xs text-foreground/60">This tells the shop and the student that the order has left the shop.</p>
      </section>

      <section className={"card-soft p-4 mt-4 " + (contactDone || delivered ? "ring-2 ring-primary/20" : "")}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-foreground/60 font-semibold">Stage 2</div>
            <div className="font-semibold text-lg">Delivery</div>
          </div>
          <span className={"chip " + (delivered ? "" : "chip-accent")}>{delivered ? "Delivered" : contactDone ? "Ready to finish" : "Waiting"}</span>
        </div>

        <div className="mt-3 space-y-2">
          <ContactCard
            icon={<User className="size-4" />}
            title={order.customer_name}
            subtitle={order.delivery_address}
            phone={buyerPhone}
            tone="primary"
          />
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-xl bg-secondary/40 px-3 py-2">
            <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold">Delivery address</div>
            <div className="font-medium break-words">{order.delivery_address || `${order.hall}, ${order.room}`}</div>
          </div>
          <div className="rounded-xl bg-secondary/40 px-3 py-2">
            <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold">Call number</div>
            <div className="font-medium break-words">{buyerPhone || "No phone number saved"}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            disabled={!pickupDone || contactDone || delivered || syncing || saving !== null}
            onClick={handleContact}
            className="py-3 rounded-xl bg-secondary font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving === "contact" ? <LoaderCircle className="size-4 animate-spin" /> : contactDone ? <Check className="size-4" /> : null}
            {contactDone ? "Student contacted" : "Confirm contacted"}
          </button>
          <button
            disabled={!contactDone || delivered || syncing || saving !== null}
            onClick={handleDelivered}
            className="py-3 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving === "deliver" ? <LoaderCircle className="size-4 animate-spin" /> : delivered ? <Check className="size-4" /> : null}
            {delivered ? "Delivered" : "Mark delivered"}
          </button>
        </div>

        <p className="mt-2 text-xs text-foreground/60">
          First confirm you have contacted the student, then mark the trip delivered once the handoff is complete.
        </p>
      </section>

      <section className="card-soft p-4 mt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-foreground/60 font-semibold">Order items</div>
            <div className="font-semibold text-lg">{order.items_count} item{order.items_count === 1 ? "" : "s"}</div>
          </div>
          <span className="chip">{formatNaira(order.subtotal)}</span>
        </div>
        <div className="mt-3 space-y-2">
          {order.line_items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/40 px-3 py-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{item.name}</div>
                <div className="text-xs text-foreground/60">
                  {item.qty} x {item.unit}
                  {item.shop ? ` · ${item.shop}` : ""}
                </div>
              </div>
              <div className="text-sm font-display shrink-0">{formatNaira(item.price * item.qty)}</div>
            </div>
          ))}
        </div>
      </section>

      <Link to="/rider" className="mt-5 block text-center py-3 rounded-2xl bg-secondary font-semibold text-sm">
        Back to rider home
      </Link>
    </MobileShell>
  );
}

function isAtLeastPickedUp(status: string) {
  return ["Picked up", "Student contacted", "Delivered"].includes(status);
}

function isAtLeastContacted(status: string) {
  return ["Student contacted", "Delivered"].includes(status);
}

function DetailLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[0.7rem] text-foreground/60">{label}</div>
        <div className="text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-3">
      <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold">{label}</div>
      <div className="font-display text-lg leading-tight break-words">{value}</div>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  subtitle,
  phone,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  phone: string;
  tone?: "primary";
}) {
  return (
    <div className="flex items-center gap-3 bg-secondary/60 rounded-xl p-3">
      <span className={"h-9 w-9 rounded-lg flex items-center justify-center shrink-0 " + (tone === "primary" ? "bg-primary text-primary-foreground" : "bg-foreground text-background")}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{title}</div>
        <div className="text-[0.7rem] text-foreground/60 truncate">{subtitle}</div>
      </div>
      {phone ? (
        <>
          <a href={`sms:${phone}`} className="h-8 w-8 rounded-lg bg-background flex items-center justify-center shrink-0">
            <MessageCircle className="size-3.5" />
          </a>
          <a href={`tel:${phone}`} className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Phone className="size-3.5" />
          </a>
        </>
      ) : null}
    </div>
  );
}
