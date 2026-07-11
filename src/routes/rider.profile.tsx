import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronRight,
  Clock,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  Star,
  Store,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { EditProfileButton } from "@/components/EditProfileDialog";
import { useSignOut } from "@/lib/auth-helpers";
import { formatNaira } from "@/lib/mock";
import { riderProfileToEdit, useRiderOrders, useRiderProfile } from "@/lib/rider-workspace";

export const Route = createFileRoute("/rider/profile")({
  head: () => ({ meta: [{ title: "Profile - Rider" }] }),
  component: RiderProfile,
});

function RiderProfile() {
  const signOut = useSignOut();
  const { profile, loading, saveProfile } = useRiderProfile();
  const {
    summary,
    availableOrders,
    syncing,
    loading: ordersLoading,
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
    <MobileShell nav={riderNav} title={loading ? "Loading your profile..." : "Your profile"}>
      <div className="card-soft p-4 flex items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-display text-xl">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg truncate">
            {profile?.display_name || "Create your rider profile"}
          </div>
          <div className="text-xs text-foreground/60 flex items-center gap-1">
            <Star className="size-3 fill-accent text-accent" />
            <span>{summary.completedTrips} completed trips</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <EditProfileButton
            title="Edit your profile"
            values={riderProfileToEdit(profile)}
            onSave={async (next) => {
              await saveProfile(next);
            }}
            fields={[
              { key: "name", label: "Full name" },
              { key: "phone", label: "Phone", type: "tel" },
              { key: "email", label: "Email", type: "email" },
              { key: "base", label: "Base location" },
            ]}
          />
        </div>
      </div>

      <div className="card-soft p-4 mt-4">
        <Row
          icon={<Phone className="size-4" />}
          label="Phone"
          value={profile?.phone || "Not set"}
        />
        <Row icon={<Mail className="size-4" />} label="Email" value={profile?.email || "Not set"} />
        <Row
          icon={<MapPin className="size-4" />}
          label="Base"
          value={profile?.location || "Not set"}
        />
        <Row
          icon={<Shield className="size-4" />}
          label="Trips completed"
          value={String(summary.completedTrips)}
        />
      </div>

      <div className="card-soft p-4 mt-4 bg-gradient-to-br from-primary-soft to-accent-soft">
        <div className="text-xs text-foreground/70">Live delivery balance</div>
        <div className="font-display text-3xl mt-1">{formatNaira(summary.availableToWithdraw)}</div>
        <div className="text-[0.7rem] text-foreground/60 mt-1">From completed rider trips</div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-lg">Available requests</h2>
          {syncing ? (
            <span className="text-[0.7rem] text-foreground/50 inline-flex items-center gap-1">
              <LoaderCircle className="size-3.5 animate-spin" />
              Updating
            </span>
          ) : null}
        </div>

        {ordersLoading && availableOrders.length === 0 ? (
          <div className="card-soft p-4 text-sm text-foreground/60 inline-flex items-center gap-2">
            <LoaderCircle className="size-4 animate-spin" />
            Loading delivery requests...
          </div>
        ) : availableOrders.length === 0 ? (
          <div className="card-soft p-5 text-sm text-foreground/60">
            No open delivery requests right now. Check back once a shop confirms an order.
          </div>
        ) : (
          <div className="space-y-3">
            {availableOrders.map((order) => (
              <div key={order.id} className="card-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold">
                      Request - {order.order_code}
                    </div>
                    <div className="font-semibold text-sm truncate mt-1">{order.shop_name}</div>
                    <div className="text-[0.7rem] text-foreground/60 mt-0.5 flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(order.placed_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-lg">{formatNaira(order.delivery_fee)}</div>
                    <div className="text-xs text-foreground/60">{order.items_count} items</div>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <CompactRow
                    icon={<Store className="size-3.5" />}
                    label="Pickup"
                    value={`${order.shop_area} - ${order.shop_location}`}
                  />
                  <CompactRow
                    icon={<MapPin className="size-3.5" />}
                    label="Drop"
                    value={order.delivery_address}
                  />
                </div>

                <button
                  onClick={() => acceptOrder(order.id).catch(() => {})}
                  className="mt-3 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="size-4" />
                  Accept - {formatNaira(order.delivery_fee)}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={signOut}
        className="mt-4 w-full py-3 rounded-xl bg-secondary text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-secondary/80"
      >
        <LogOut className="size-4" /> Sign out
      </button>
    </MobileShell>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 flex items-center gap-3 border-b border-border/60 last:border-b-0">
      <div className="h-9 w-9 rounded-xl bg-primary-soft flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[0.7rem] text-foreground/60">{label}</div>
        <div className="text-sm truncate">{value}</div>
      </div>
      <ChevronRight className="size-4 text-foreground/40" />
    </div>
  );
}

function CompactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-secondary/60 rounded-xl p-2">
      <span className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-foreground text-background">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60">{label}</div>
        <div className="text-xs font-semibold truncate">{value}</div>
      </div>
      <ChevronRight className="size-3.5 text-foreground/40" />
    </div>
  );
}
