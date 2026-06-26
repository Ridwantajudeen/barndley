import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ArrowDownLeft,
  ChevronRight,
  Clock,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Star,
  Store,
  Wallet,
} from "lucide-react";
import { EditProfileButton } from "@/components/EditProfileDialog";
import { MobileShell } from "@/components/MobileShell";
import { vendorNav } from "@/components/VendorNav";
import { useSignOut } from "@/lib/auth-helpers";
import { useVendorSales } from "@/lib/vendor-sales";
import { useVendorShop } from "@/lib/vendor-shop";
import { formatNaira } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/vendor/profile")({
  head: () => ({ meta: [{ title: "Your shop - Campus Basket" }] }),
  component: VendorProfile,
});

function VendorProfile() {
  const signOut = useSignOut();
  const { shop, loading, saveShop } = useVendorShop();
  const { summary: salesSummary, orders, loading: salesLoading, refreshing: salesRefreshing } = useVendorSales(shop?.id ?? null);
  const hasShop = Boolean(shop?.id);
  const recentOrders = orders.slice(0, 4);

  const profileFields = [
    { key: "name", label: "Shop name" },
    { key: "tagline", label: "Tagline" },
    { key: "area", label: "Area" },
    { key: "location", label: "Location" },
    { key: "hours", label: "Opening hours" },
    { key: "phone", label: "Phone", type: "tel" as const },
    { key: "email", label: "Email", type: "email" as const },
  ];

  const profileValues = {
    name: shop?.name ?? "",
    tagline: shop?.tagline ?? "",
    area: shop?.area ?? "",
    location: shop?.location ?? "",
    hours: shop?.hours ?? "",
    phone: shop?.phone ?? "",
    email: shop?.email ?? "",
  };

  const saveProfile = async (next: typeof profileValues) => {
    try {
      const updated = await saveShop({
        name: next.name.trim(),
        tagline: next.tagline.trim(),
        area: next.area.trim(),
        location: next.location.trim(),
        hours: next.hours.trim(),
        phone: next.phone.trim(),
        email: next.email.trim(),
      });
      toast.success(updated ? (hasShop ? "Shop profile updated" : "Shop profile created") : "Shop saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save shop");
    }
  };

  return (
    <MobileShell nav={vendorNav} title={loading ? "Loading your shop..." : hasShop ? "Your shop" : "Set up your shop"}>
      {!hasShop && !loading ? (
        <div className="card-soft p-5">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
            <Store className="size-6" />
          </div>
          <div className="mt-4 font-display text-xl">No shop profile yet</div>
          <p className="mt-1 text-sm text-foreground/65">
            Add your shop details once and we’ll use them everywhere else in the app.
          </p>
          <div className="mt-4">
            <EditProfileButton
              title="Create shop profile"
              values={profileValues}
              onSave={saveProfile}
              fields={profileFields}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="card-soft p-4 flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-display text-xl overflow-hidden">
              {shop?.emoji?.trim() ? (
                <span>{shop.emoji}</span>
              ) : (
                <Store className="size-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg truncate">{shop?.name || "Create your shop"}</div>
              <div className="text-xs text-foreground/60 flex items-center gap-1">
                <Star className="size-3 fill-accent text-accent" /> {shop?.rating?.toFixed(1) ?? "0.0"} - {shop?.reviews_count ?? 0} reviews
              </div>
            </div>
            <div className="shrink-0">
              <EditProfileButton
                title="Edit shop profile"
                values={profileValues}
                onSave={saveProfile}
                fields={profileFields}
              />
            </div>
          </div>

          {shop?.cover_image_url ? (
            <div className="card-soft p-2 mt-4 overflow-hidden">
              <img src={shop.cover_image_url} alt={shop.name} className="h-40 w-full rounded-xl object-cover" />
            </div>
          ) : null}

          <div className="card-soft p-5 mt-4 bg-gradient-to-br from-primary-soft to-accent-soft">
            <div className="flex items-center gap-2 text-xs text-foreground/70">
              <Wallet className="size-3.5" /> Shop wallet
            </div>
            {salesLoading ? (
              <div className="mt-2 inline-flex items-center gap-2 text-sm text-foreground/70">
                <LoaderCircle className="size-4 animate-spin" />
                Loading sales...
              </div>
            ) : (
              <>
                <div className="font-display text-3xl mt-1">{formatNaira(salesSummary.availableToWithdraw)}</div>
                <div className="text-[0.7rem] text-foreground/60 mt-1">
                  {salesRefreshing ? "Refreshing live sales..." : `${salesSummary.ordersToday} orders today`}
                </div>
              </>
            )}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold">
                Withdraw
              </button>
              <Link to="/vendor/statement" className="flex-1 py-2.5 rounded-xl bg-background/70 text-sm font-semibold text-center">
                Statement
              </Link>
            </div>
          </div>

          <div className="card-soft p-4 mt-4">
            <div className="text-xs font-semibold text-foreground/70 mb-2">RECENT ACTIVITY</div>
            <ul className="divide-y divide-border/60">
              {recentOrders.length === 0 ? (
                <li className="py-3 text-sm text-foreground/60">No completed orders yet.</li>
              ) : (
                recentOrders.map((order) => (
                  <li key={order.id} className="py-3 flex items-center gap-3 text-sm">
                    <span className="h-8 w-8 rounded-lg flex items-center justify-center bg-primary-soft">
                      <ArrowDownLeft className="size-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">
                        {order.order_code} - {order.customer_name}
                      </div>
                      <div className="text-xs text-foreground/60">{new Date(order.placed_at).toLocaleString()}</div>
                    </div>
                    <div className="font-display">{formatNaira(order.total)}</div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="card-soft mt-4 divide-y divide-border/60">
            <Row icon={<Store className="size-4" />} label="Shop name" value={shop?.name || "Not set"} />
            <Row icon={<MapPin className="size-4" />} label="Area" value={shop?.area || "Not set"} />
            <Row icon={<MapPin className="size-4" />} label="Location" value={shop?.location || "Not set"} />
            <Row icon={<Clock className="size-4" />} label="Hours" value={shop?.hours || "Not set"} />
            <Row icon={<Phone className="size-4" />} label="Phone" value={shop?.phone || "Not set"} />
            <Row icon={<Mail className="size-4" />} label="Email" value={shop?.email || "Not set"} />
          </div>

          <button
            onClick={signOut}
            className="mt-4 w-full py-3 rounded-xl bg-secondary text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-secondary/80"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </>
      )}
    </MobileShell>
  );
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-xl bg-primary-soft flex items-center justify-center">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[0.7rem] text-foreground/60">{label}</div>
        <div className="text-sm truncate">{value}</div>
      </div>
      <ChevronRight className="size-4 text-foreground/40" />
    </div>
  );
}
