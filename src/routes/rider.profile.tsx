import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { Bike, ChevronRight, LogOut, Mail, MapPin, Phone, Shield, Star } from "lucide-react";
import { EditProfileButton, useProfile } from "@/components/EditProfileDialog";
import { useSignOut } from "@/lib/auth-helpers";

export const Route = createFileRoute("/rider/profile")({
  head: () => ({ meta: [{ title: "Profile — Rider" }] }),
  component: RiderProfile,
});

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "?";
}

function RiderProfile() {
  const signOut = useSignOut();
  const [profile, setProfile] = useProfile("cb.rider.profile", {
    name: "Tunde Adebayo",
    phone: "+234 803 112 5577",
    email: "tunde.a@campusbasket.ng",
    base: "North Gate hub",
    bike: "Hero · Green · KP-72",
  });

  return (
    <MobileShell nav={riderNav} title="Your profile">
      <div className="card-soft p-4 flex items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-display text-xl">{initials(profile.name)}</div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg truncate">{profile.name}</div>
          <div className="text-xs text-foreground/60 flex items-center gap-1">
            <Star className="size-3 fill-accent text-accent" /> 4.9 · 218 trips
          </div>
        </div>
        <EditProfileButton
          title="Edit your profile"
          values={profile}
          onSave={setProfile}
          fields={[
            { key: "name", label: "Full name" },
            { key: "phone", label: "Phone", type: "tel" },
            { key: "email", label: "Email", type: "email" },
            { key: "base", label: "Base location" },
            { key: "bike", label: "Bicycle details" },
          ]}
        />
      </div>

      <div className="card-soft mt-4 divide-y divide-border/60">
        <Row icon={<Phone className="size-4" />} label="Phone" value={profile.phone} />
        <Row icon={<Mail className="size-4" />} label="Email" value={profile.email} />
        <Row icon={<MapPin className="size-4" />} label="Base" value={profile.base} />
        <Row icon={<Bike className="size-4" />} label="Bicycle" value={profile.bike} />
        <Row icon={<Shield className="size-4" />} label="ID verification" value="Approved" />
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
