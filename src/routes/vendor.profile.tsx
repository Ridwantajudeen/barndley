import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { vendorNav } from "@/components/VendorNav";
import { formatNaira } from "@/lib/mock";
import { Wallet, ArrowDownLeft, ArrowUpRight, MapPin, Phone, Mail, LogOut, ChevronRight, Store, Clock, Star } from "lucide-react";
import { EditProfileButton, useProfile } from "@/components/EditProfileDialog";

export const Route = createFileRoute("/vendor/profile")({
  head: () => ({ meta: [{ title: "You — Shop" }] }),
  component: VendorProfile,
});

const payouts = [
  { id: "p1", label: "Order #1052 · Indep. Hall", amount: 6900, when: "Today, 13:24", kind: "in" as const },
  { id: "p2", label: "Order #1051 · Queens Hall", amount: 2900, when: "Today, 11:12", kind: "in" as const },
  { id: "p3", label: "Payout to bank ****8210", amount: -18500, when: "Yesterday", kind: "out" as const },
  { id: "p4", label: "Order #1048 · Mellanby", amount: 4100, when: "Yesterday", kind: "in" as const },
];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "?";
}

function VendorProfile() {
  const [profile, setProfile] = useProfile("cb.vendor.profile", {
    name: "Mama Tee's Foodstuff",
    location: "Block 4, North Gate Market",
    hours: "7:00 — 21:00",
    phone: "+234 802 990 1245",
    email: "mamatee@campusbasket.ng",
  });

  return (
    <MobileShell nav={vendorNav} title="Your shop">
      <div className="card-soft p-4 flex items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-display text-xl">{initials(profile.name)}</div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg truncate">{profile.name}</div>
          <div className="text-xs text-foreground/60 flex items-center gap-1">
            <Star className="size-3 fill-accent text-accent" /> 4.8 · 312 reviews
          </div>
        </div>
        <EditProfileButton
          title="Edit shop profile"
          values={profile}
          onSave={setProfile}
          fields={[
            { key: "name", label: "Shop name" },
            { key: "location", label: "Location" },
            { key: "hours", label: "Opening hours" },
            { key: "phone", label: "Phone", type: "tel" },
            { key: "email", label: "Email", type: "email" },
          ]}
        />
      </div>

      <div className="card-soft p-5 mt-4 bg-gradient-to-br from-primary-soft to-accent-soft">
        <div className="flex items-center gap-2 text-xs text-foreground/70">
          <Wallet className="size-3.5" /> Shop wallet
        </div>
        <div className="font-display text-3xl mt-1">{formatNaira(56200)}</div>
        <div className="text-[0.7rem] text-foreground/60 mt-1">Next payout: Friday</div>
        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold">Withdraw</button>
          <button className="flex-1 py-2.5 rounded-xl bg-background/70 text-sm font-semibold">Statement</button>
        </div>
      </div>

      <div className="card-soft p-4 mt-4">
        <div className="text-xs font-semibold text-foreground/70 mb-2">RECENT ACTIVITY</div>
        <ul className="divide-y divide-border/60">
          {payouts.map((t) => (
            <li key={t.id} className="py-3 flex items-center gap-3 text-sm">
              <span className={"h-8 w-8 rounded-lg flex items-center justify-center " + (t.kind === "in" ? "bg-primary-soft" : "bg-accent-soft")}>
                {t.kind === "in" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="truncate">{t.label}</div>
                <div className="text-xs text-foreground/60">{t.when}</div>
              </div>
              <div className={"font-display " + (t.kind === "in" ? "text-primary" : "")}>
                {t.kind === "in" ? "+" : "-"}{formatNaira(Math.abs(t.amount))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-soft mt-4 divide-y divide-border/60">
        <Row icon={<Store className="size-4" />} label="Shop name" value={profile.name} />
        <Row icon={<MapPin className="size-4" />} label="Location" value={profile.location} />
        <Row icon={<Clock className="size-4" />} label="Hours" value={profile.hours} />
        <Row icon={<Phone className="size-4" />} label="Phone" value={profile.phone} />
        <Row icon={<Mail className="size-4" />} label="Email" value={profile.email} />
      </div>

      <button className="mt-4 w-full py-3 rounded-xl bg-secondary text-sm font-semibold inline-flex items-center justify-center gap-2">
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
