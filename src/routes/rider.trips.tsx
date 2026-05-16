import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { formatNaira } from "@/lib/mock";

const trips = [
  { id: "TR-218", shop: "Mama Tee's", drop: "Indep. Hall", payout: 850, when: "Today, 13:24", status: "Active" },
  { id: "TR-217", shop: "Iya Bunmi", drop: "Queens Hall", payout: 700, when: "Today, 11:02", status: "Done" },
  { id: "TR-216", shop: "Brother K", drop: "Mellanby", payout: 600, when: "Today, 09:45", status: "Done" },
];

export const Route = createFileRoute("/rider/trips")({
  head: () => ({ meta: [{ title: "Trips — Rider" }] }),
  component: () => (
    <MobileShell nav={riderNav} title="Your trips">
      <div className="space-y-3 mt-3">
        {trips.map((t) => (
          <div key={t.id} className="card-soft p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary-soft flex items-center justify-center">🚲</div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{t.shop} → {t.drop}</div>
              <div className="text-xs text-foreground/60">{t.when} · {t.id}</div>
            </div>
            <div className="text-right">
              <div className="font-display">{formatNaira(t.payout)}</div>
              <span className={"chip " + (t.status === "Active" ? "chip-accent" : "")}>{t.status}</span>
            </div>
          </div>
        ))}
      </div>
    </MobileShell>
  ),
});
