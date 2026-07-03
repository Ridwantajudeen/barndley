import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bike, Check, Clock, Eye, LoaderCircle, MapPin, MessageCircle, Navigation, Phone, Sparkles, Store, User, Wallet, X, Package } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { formatNaira } from "@/lib/mock";
import { useRiderOrders, useRiderProfile } from "@/lib/rider-workspace";

export const Route = createFileRoute("/rider/")({
  head: () => ({ meta: [{ title: "Rider - Campus Basket" }] }),
  component: RiderHome,
});

function RiderHome() {
  const [online, setOnline] = useState(true);
  const [details, setDetails] = useState<ReturnType<typeof useRiderOrders>["availableOrders"][number] | null>(null);
  const { profile, loading: profileLoading } = useRiderProfile();
  const {
    activeOrder,
    availableOrders,
    summary,
    loading,
    syncing,
    acceptOrder,
  } = useRiderOrders();

  const initials =
    profile?.display_name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  return (
    <MobileShell nav={riderNav} title={online ? "You're online" : "You're offline"}>
      <div className="card-soft p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={"h-11 w-11 rounded-xl flex items-center justify-center " + (online ? "bg-primary text-primary-foreground" : "bg-secondary")}>
            <Bike className="size-5" />
          </div>
          <div>
            <div className="text-xs text-foreground/60">Status</div>
            <div className="font-semibold">{online ? "Available for trips" : "Not receiving trips"}</div>
          </div>
        </div>
        <button
          onClick={() => setOnline(!online)}
          className={"w-14 h-8 rounded-full p-1 transition-colors " + (online ? "bg-primary" : "bg-border")}
        >
          <span className={"block h-6 w-6 rounded-full bg-background shadow transition-transform " + (online ? "translate-x-6" : "")} />
        </button>
      </div>

      {profileLoading || (loading && !profile?.user_id) ? (
        <div className="card-soft p-4 mt-4 inline-flex items-center gap-2 text-sm text-foreground/70">
          <LoaderCircle className="size-4 animate-spin" />
          Loading rider data...
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Mini label="Available" value={String(availableOrders.length)} />
        <Mini label="Active" value={String(summary.activeTrips)} />
        <Mini label="Completed" value={String(summary.completedTrips)} />
        <Mini label="Made today" value={formatNaira(summary.todayEarnings)} />
      </div>

      {activeOrder ? (
        <div className="card-soft p-4 mt-5 ring-2 ring-accent bg-accent-soft/20">
          <div className="flex items-center justify-between">
            <div className="text-xs text-foreground/60">Active trip - {activeOrder.order_code}</div>
            <span className="chip chip-accent inline-flex items-center gap-1">
              <Sparkles className="size-3" /> Live order
            </span>
          </div>
          <div className="font-display text-lg mt-1">{activeOrder.shop_name}</div>
          <div className="mt-1 text-xs text-foreground/60">
            Tap into the trip view to mark pickup, confirm contact, and finish delivery.
          </div>
          <div className="mt-3 space-y-2">
            <ContactCard
              icon={<Store className="size-4" />}
              title={activeOrder.shop_name}
              subtitle={`${activeOrder.shop_area} - ${activeOrder.shop_location}`}
              tag="Pickup"
              phone={activeOrder.shop_phone || ""}
            />
            <ContactCard
              icon={<User className="size-4" />}
              title={activeOrder.customer_name}
              subtitle={activeOrder.delivery_address}
              tag="Drop-off"
              phone={activeOrder.customer_phone || ""}
              tone="primary"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Link
              to="/rider/trips/$id"
              params={{ id: activeOrder.id }}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2"
            >
              Continue trip
            </Link>
            <button className="px-4 py-3 rounded-xl bg-secondary font-semibold inline-flex items-center gap-1">
              <Navigation className="size-4" /> Route
            </button>
          </div>
        </div>
      ) : (
        <div className="card-soft p-4 mt-5 text-sm text-foreground/60">
          No active trip assigned yet.
        </div>
      )}

      <h2 className="font-display text-lg mt-6 mb-2">Available requests</h2>
      {syncing ? (
        <p className="text-[0.7rem] text-foreground/50 inline-flex items-center gap-1.5 mb-2">
          <LoaderCircle className="size-3.5 animate-spin" />
          Updating live requests...
        </p>
      ) : null}
      {!online ? (
        <div className="card-soft p-6 text-center text-sm text-foreground/60">Go online to receive delivery requests.</div>
      ) : availableOrders.length === 0 ? (
        <div className="card-soft p-6 text-center text-sm text-foreground/60">No open delivery requests right now.</div>
      ) : (
        <div className="space-y-3">
          {availableOrders.map((order) => (
            <div key={order.id} className="card-soft p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold">Request - {order.order_code}</div>
                  <div className="font-semibold text-sm truncate mt-1">{order.shop_name}</div>
                  <div className="text-[0.7rem] text-foreground/60">{order.customer_name}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-lg">{formatNaira(order.delivery_fee)}</div>
                  <div className="text-xs text-foreground/60">{order.items_count} items</div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <CompactRow icon={<Store className="size-3.5" />} label="Pickup" value={`${order.shop_area} - ${order.shop_location}`} />
                <CompactRow icon={<MapPin className="size-3.5" />} label="Drop" value={order.delivery_address} />
              </div>

              <div className="mt-3 flex gap-2">
                <button onClick={() => setDetails(order)} className="flex-1 py-2.5 rounded-xl bg-secondary font-semibold text-sm inline-flex items-center justify-center gap-1.5">
                  <Eye className="size-4" /> View order details
                </button>
                <button
                  onClick={() => acceptOrder(order.id).catch(() => {})}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
                >
                  Accept - {formatNaira(order.delivery_fee)}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {details && (
        <RequestDetailsModal
          order={details}
          riderName={profile?.display_name || initials}
          riderPhone={profile?.phone || ""}
          onClose={() => setDetails(null)}
          onAccept={async () => {
            await acceptOrder(details.id);
            setDetails(null);
          }}
        />
      )}
    </MobileShell>
  );
}

function CompactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-secondary/60 rounded-xl p-2">
      <span className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-foreground text-background">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60">{label}</div>
        <div className="text-xs font-semibold truncate">{value}</div>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  subtitle,
  tag,
  phone,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tag: string;
  phone: string;
  tone?: "primary";
}) {
  return (
    <div className="flex items-center gap-3 bg-secondary/60 rounded-xl p-3">
      <span className={"h-9 w-9 rounded-lg flex items-center justify-center shrink-0 " + (tone === "primary" ? "bg-primary text-primary-foreground" : "bg-foreground text-background")}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60">{tag}</div>
        <div className="text-sm font-semibold truncate">{title}</div>
        <div className="text-[0.7rem] text-foreground/60 flex items-center gap-1 truncate">
          <MapPin className="size-3 shrink-0" /> {subtitle}
        </div>
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

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-soft p-3">
      <div className="text-[0.68rem] text-foreground/60">{label}</div>
      <div className="font-display text-lg">{value}</div>
    </div>
  );
}

function RequestDetailsModal({
  order,
  riderName,
  riderPhone,
  onClose,
  onAccept,
}: {
  order: ReturnType<typeof useRiderOrders>["availableOrders"][number];
  riderName: string;
  riderPhone: string;
  onClose: () => void;
  onAccept: () => void;
}) {
  const groups = order.bundle ? order.shop_names : [order.shop_name];

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-background w-full max-w-[480px] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col"
      >
        <div className="px-5 pt-5 pb-3 flex items-start justify-between border-b border-border/60">
          <div>
            <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold">
              {order.bundle ? "Bundle request" : "Request"} - {order.order_code}
            </div>
            <div className="font-display text-xl leading-tight mt-0.5">{order.shop_name}</div>
            <div className="text-xs text-foreground/60 flex items-center gap-1 mt-1">
              <Clock className="size-3" /> {new Date(order.placed_at).toLocaleString()}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-5">
          <section className="grid grid-cols-3 gap-2">
            <Stat label="Payout" value={formatNaira(order.delivery_fee)} accent />
            <Stat label="Items" value={String(order.items_count)} />
            <Stat label="Trips" value={String(groups.length)} />
          </section>

          <section>
            <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold mb-2">Buyer</div>
            <div className="flex items-center gap-3 bg-secondary/60 rounded-2xl p-3">
              <span className="h-10 w-10 rounded-xl bg-foreground text-background flex items-center justify-center">{riderName.slice(0, 1)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{order.customer_name}</div>
                <div className="text-[0.7rem] text-foreground/60 flex items-center gap-1">
                  <MapPin className="size-3" /> {order.delivery_address}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold mb-2">Pickup details</div>
            <div className="space-y-2">
              <CompactRow icon={<Store className="size-3.5" />} label="Shop" value={`${order.shop_area} - ${order.shop_location}`} />
              <CompactRow icon={<MapPin className="size-3.5" />} label="Delivery" value={order.delivery_address} />
            </div>
          </section>

          <section className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatNaira(order.subtotal)} />
            <Row label="Delivery" value={formatNaira(order.delivery_fee)} />
            <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
              <span className="font-semibold">Buyer paid</span>
              <span className="font-display text-lg">{formatNaira(order.total)}</span>
            </div>
          </section>
        </div>

        <div className="px-5 py-3 border-t border-border/60 flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-secondary font-semibold text-sm">Skip</button>
          <button onClick={onAccept} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
            Accept - {formatNaira(order.delivery_fee)}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={"rounded-xl p-3 " + (accent ? "bg-primary text-primary-foreground" : "bg-secondary")}>
      <div className={"text-[0.65rem] " + (accent ? "text-primary-foreground/80" : "text-foreground/60")}>{label}</div>
      <div className="font-display text-lg leading-tight">{value}</div>
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
