import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { formatNaira } from "@/lib/mock";
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, MapPin, Phone, Mail, LogOut, ChevronRight, Shield } from "lucide-react";
import { EditProfileButton, useProfile } from "@/components/EditProfileDialog";

export const Route = createFileRoute("/student/profile")({
  head: () => ({ meta: [{ title: "You — Campus Basket" }] }),
  component: StudentProfile,
});

const tx = [
  { id: "t1", label: "Order CB-1042 · Mama Osas", amount: -6900, when: "Today, 13:24", kind: "out" as const },
  { id: "t2", label: "Wallet top-up", amount: 10000, when: "Today, 12:50", kind: "in" as const },
  { id: "t3", label: "Order CB-1031 · Iya Bunmi", amount: -3200, when: "Yesterday", kind: "out" as const },
  { id: "t4", label: "Referral bonus", amount: 500, when: "Mon", kind: "in" as const },
];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("") || "?";
}

function StudentProfile() {
  const [profile, setProfile] = useProfile("cb.student.profile", {
    name: "Adaeze Okafor",
    email: "adaeze.o@uni.edu.ng",
    phone: "+234 805 221 8890",
    address: "Indep. Hall, Rm 214",
  });

  return (
    <MobileShell nav={studentNav} title="Your profile">
      <div className="card-soft p-4 flex items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center font-display text-xl">{initials(profile.name)}</div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg truncate">{profile.name}</div>
          <div className="text-xs text-foreground/60 truncate">Student · {profile.address}</div>
        </div>
        <EditProfileButton
          title="Edit your profile"
          values={profile}
          onSave={setProfile}
          fields={[
            { key: "name", label: "Full name" },
            { key: "email", label: "Email", type: "email" },
            { key: "phone", label: "Phone", type: "tel" },
            { key: "address", label: "Delivery address" },
          ]}
        />
      </div>

      <div className="card-soft p-5 mt-4 bg-gradient-to-br from-primary-soft to-accent-soft">
        <div className="flex items-center gap-2 text-xs text-foreground/70">
          <Wallet className="size-3.5" /> Basket wallet
        </div>
        <div className="font-display text-3xl mt-1">{formatNaira(4350)}</div>
        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold inline-flex items-center justify-center gap-1">
            <Plus className="size-4" /> Top up
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-background/70 text-sm font-semibold">History</button>
        </div>
      </div>

      <div className="card-soft p-4 mt-4">
        <div className="text-xs font-semibold text-foreground/70 mb-2">RECENT ACTIVITY</div>
        <ul className="divide-y divide-border/60">
          {tx.map((t) => (
            <li key={t.id} className="py-3 flex items-center gap-3 text-sm">
              <span className={"h-8 w-8 rounded-lg flex items-center justify-center " + (t.kind === "in" ? "bg-primary-soft" : "bg-accent-soft")}>
                {t.kind === "in" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="truncate">{t.label}</div>
                <div className="text-xs text-foreground/60">{t.when}</div>
              </div>
              <div className={"font-display " + (t.amount > 0 ? "text-primary" : "")}>
                {t.amount > 0 ? "+" : ""}{formatNaira(Math.abs(t.amount))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-soft mt-4 divide-y divide-border/60">
        <Row icon={<Mail className="size-4" />} label="Email" value={profile.email} />
        <Row icon={<Phone className="size-4" />} label="Phone" value={profile.phone} />
        <Row icon={<MapPin className="size-4" />} label="Delivery address" value={profile.address} />
        <Row icon={<Shield className="size-4" />} label="Account" value="Verified student" />
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
