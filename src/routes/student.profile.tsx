import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { MapPin, Phone, Mail, LogOut, ChevronRight, Shield, Loader2, LoaderCircle, Package } from "lucide-react";
import { EditProfileButton } from "@/components/EditProfileDialog";
import { useSignOut } from "@/lib/auth-helpers";
import { formatNaira } from "@/lib/mock";
import { displayNameFromProfile, initialsFromName, profileToEdit, useStudentProfile } from "@/lib/student-profile";
import { useStudentOrders } from "@/lib/student-orders";

export const Route = createFileRoute("/student/profile")({
  head: () => ({ meta: [{ title: "You — Campus Basket" }] }),
  component: StudentProfile,
});

function StudentProfile() {
  const signOut = useSignOut();
  const { profile, loading, saveProfile } = useStudentProfile();
  const { recentOrders, loading: ordersLoading } = useStudentOrders();
  const displayName = displayNameFromProfile(profile);
  const editValues = profileToEdit(profile);

  if (loading) {
    return (
      <MobileShell nav={studentNav} title="Your profile">
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="size-6 animate-spin text-foreground/50" />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell nav={studentNav} title="Your profile">
      <div className="card-soft p-4 flex items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center font-display text-xl">
          {initialsFromName(displayName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg truncate">{displayName}</div>
          <div className="text-xs text-foreground/60 truncate">
            Student · {profile?.location?.trim() || "Add delivery address"}
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <EditProfileButton
            title="Edit your profile"
            values={editValues}
            onSave={async (next) => {
              await saveProfile(next);
            }}
            fields={[
              { key: "name", label: "Full name" },
              { key: "phone", label: "Phone", type: "tel" },
              { key: "address", label: "Delivery address" },
            ]}
          />
        </div>
      </div>

      <div className="card-soft p-4 mt-4">
        <div className="text-xs font-semibold text-foreground/70 mb-2">RECENT ACTIVITY</div>
        {ordersLoading ? (
          <div className="py-6 flex items-center justify-center text-sm text-foreground/60">
            <LoaderCircle className="size-4 animate-spin mr-2" />
            Loading your orders...
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-6 text-center text-sm text-foreground/60">
            <Package className="size-6 mx-auto text-foreground/40" />
            <p className="mt-2">Your orders will appear here once you place them.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {recentOrders.map((order) => (
              <li key={order.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{order.shop_name}</div>
                  <div className="text-xs text-foreground/60">
                    {new Date(order.placed_at).toLocaleString()} · {order.items_count} items
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="chip inline-flex">{order.status}</div>
                  <div className="font-display mt-1">{formatNaira(order.total)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card-soft mt-4 divide-y divide-border/60">
        <Row icon={<Mail className="size-4" />} label="Email" value={profile?.email || "Not set"} />
        <Row icon={<Phone className="size-4" />} label="Phone" value={profile?.phone || "Not set"} />
        <Row icon={<MapPin className="size-4" />} label="Delivery address" value={profile?.location || "Not set"} />
        <Row icon={<Shield className="size-4" />} label="Account" value="Verified student" />
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
