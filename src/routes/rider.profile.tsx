import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { Bike, ChevronRight, Shield, Star } from "lucide-react";

export const Route = createFileRoute("/rider/profile")({
  head: () => ({ meta: [{ title: "Profile — Rider" }] }),
  component: () => (
    <MobileShell nav={riderNav} title="Your profile">
      <div className="card-soft p-4 flex items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-display text-xl">TA</div>
        <div className="flex-1">
          <div className="font-display text-lg">Tunde Adebayo</div>
          <div className="text-xs text-foreground/60 flex items-center gap-1"><Star className="size-3 fill-accent text-accent"/> 4.9 · 218 trips</div>
        </div>
        <span className="chip">Verified</span>
      </div>

      {[
        { i: <Bike className="size-4"/>, label: "Bicycle details", sub: "Hero · Green · KP-72" },
        { i: <Shield className="size-4"/>, label: "ID verification", sub: "Approved" },
      ].map((r) => (
        <Link key={r.label} to="/rider" className="card-soft p-4 flex items-center gap-3 mt-3">
          <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center">{r.i}</div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{r.label}</div>
            <div className="text-xs text-foreground/60">{r.sub}</div>
          </div>
          <ChevronRight className="size-4 text-foreground/40"/>
        </Link>
      ))}
    </MobileShell>
  ),
});
