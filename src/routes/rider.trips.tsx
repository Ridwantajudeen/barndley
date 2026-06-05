import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { formatNaira } from "@/lib/mock";
import { Sparkles } from "lucide-react";

const trips = [
  { id: "TR-218", shop: "Mama Osas", drop: "Indep. Hall", payout: 850, when: "Today, 13:24", status: "Active", bundle: false },
  { id: "TR-219", shop: "Bundle · 3 shops", drop: "Mellanby Hall", payout: 1450, when: "Today, 12:10", status: "Done", bundle: true },
  { id: "TR-217", shop: "Iya Bunmi", drop: "Queens Hall", payout: 700, when: "Today, 11:02", status: "Done", bundle: false },
  { id: "TR-216", shop: "Brother K", drop: "Mellanby", payout: 600, when: "Today, 09:45", status: "Done", bundle: false },
];

export const Route = createFileRoute("/rider/trips")({
  head: () => ({ meta: [{ title: "Trips — Rider" }] }),
  component: () => (
    <MobileShell nav={riderNav} title="Your trips">
      <div className="space-y-3 mt-3">
        {trips.map((t) => (
          <div key={t.id} className={"card-soft p-4 flex items-center gap-3 " + (t.bundle ? "ring-2 ring-accent bg-accent-soft/30" : "")}>
            <div className={"h-11 w-11 rounded-xl flex items-center justify-center " + (t.bundle ? "bg-accent text-accent-foreground" : "bg-primary-soft")}>
              {t.bundle ? <Sparkles className="size-5"/> : "🚲"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{t.shop} → {t.drop}</div>
              <div className="text-xs text-foreground/60">{t.when} · {t.id}{t.bundle ? " · Multi-shop" : ""}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display">{formatNaira(t.payout)}</div>
              <span className={"chip " + (t.status === "Active" ? "chip-accent" : "")}>{t.status}</span>
            </div>
          </div>
        ))}
      </div>
    </MobileShell>
  ),
});
