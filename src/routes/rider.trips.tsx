import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, LoaderCircle, MapPin, Sparkles, Store } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { formatNaira } from "@/lib/mock";
import { useRiderOrders } from "@/lib/rider-workspace";
import { useRiderHistory } from "@/lib/rider-workspace";

export const Route = createFileRoute("/rider/trips")({
  head: () => ({ meta: [{ title: "Trips - Rider" }] }),
  component: RiderTrips,
});

function RiderTrips() {
  const { assignedOrders, loading, syncing } = useRiderOrders();
  const navigate = useNavigate();

  return (
    <MobileShell nav={riderNav} title="Your trips">
      {syncing ? (
        <p className="mb-2 text-[0.7rem] text-foreground/50 inline-flex items-center gap-1.5">
          <LoaderCircle className="size-3.5 animate-spin" /> Updating trips...
        </p>
      ) : null}

      {loading && assignedOrders.length === 0 ? (
        <div className="card-soft p-4 text-sm text-foreground/60 inline-flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin" />
          Loading trips...
        </div>
      ) : assignedOrders.length === 0 ? (
        <div className="card-soft p-6 text-center text-sm text-foreground/60">
          You do not have any active trips yet. Accepted orders will show here.
        </div>
      ) : (
        <div className="space-y-3 mt-3">
          {assignedOrders.map((trip) => (
            <button
              key={trip.id}
              type="button"
              onClick={() => navigate({ to: "/rider/trips/$id", params: { id: trip.id } })}
              className={"w-full text-left card-soft p-4 flex items-center gap-3 hover:shadow-md transition-shadow " + (trip.bundle ? "ring-2 ring-accent bg-accent-soft/30" : "")}
            >
              <div className={"h-11 w-11 rounded-xl flex items-center justify-center shrink-0 " + (trip.bundle ? "bg-accent text-accent-foreground" : "bg-primary-soft")}>
                {trip.bundle ? <Sparkles className="size-5" /> : <Store className="size-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">
                  {trip.shop_name} → {trip.delivery_address}
                </div>
                <div className="text-xs text-foreground/60 mt-0.5">
                  {new Date(trip.placed_at).toLocaleString()} · {trip.order_code}
                </div>
                <div className="text-xs text-foreground/50 mt-0.5 truncate">
                  <MapPin className="size-3 inline-block mr-1" />
                  {trip.shop_area} - {trip.shop_location}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display">{formatNaira(trip.delivery_fee)}</div>
                <span className={"chip " + (String(trip.status) === "Delivered" ? "" : "chip-accent")}>{String(trip.status)}</span>
                <div className="mt-2 text-xs text-primary inline-flex items-center gap-1 justify-end w-full">
                  Open trip <ChevronRight className="size-3.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <HistorySection />
    </MobileShell>
  );
}

function HistorySection() {
  const { orders, loading } = useRiderHistory();
  const navigate = useNavigate();

  if (loading && orders.length === 0) return null;

  if (!orders || orders.length === 0) {
    return (
      <div className="mt-6 card-soft p-4 text-sm text-foreground/60">
        You have no past trips yet.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="font-display text-lg mb-3">History</h3>
      <div className="space-y-3">
        {orders.map((trip) => (
          <button
            key={trip.id}
            type="button"
            onClick={() => navigate({ to: "/rider/trips/$id", params: { id: trip.id } })}
            className={"w-full text-left card p-3 hover:shadow-md transition-shadow"}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-sm truncate">{trip.shop_name} → {trip.delivery_address}</div>
                <div className="text-xs text-foreground/60 mt-0.5">{new Date(trip.placed_at).toLocaleString()} · {trip.order_code}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display">{formatNaira(trip.delivery_fee)}</div>
                <span className={"chip"}>{String(trip.status)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
