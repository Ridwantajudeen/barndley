import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { formatNaira } from "@/lib/mock";

export const Route = createFileRoute("/rider/earnings")({
  head: () => ({ meta: [{ title: "Wallet — Rider" }] }),
  component: () => (
    <MobileShell nav={riderNav} title="Earnings">
      <div className="card-soft p-5 bg-gradient-to-br from-primary-soft to-accent-soft">
        <div className="text-xs text-foreground/70">Wallet balance</div>
        <div className="font-display text-3xl mt-1">{formatNaira(18400)}</div>
        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold">Withdraw</button>
          <button className="flex-1 py-2.5 rounded-xl bg-background/70 text-sm font-semibold">Statement</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Stat label="This week" value={formatNaira(22300)} />
        <Stat label="Trips this week" value="34" />
        <Stat label="Acceptance" value="92%" />
        <Stat label="Avg payout" value={formatNaira(650)} />
      </div>

      <div className="card-soft p-4 mt-4">
        <div className="text-xs font-semibold text-foreground/70 mb-2">RECENT PAYOUTS</div>
        <ul className="divide-y divide-border/60">
          {[
            ["Bank transfer · ****8210", 15000, "2 days ago"],
            ["Bank transfer · ****8210", 9500, "5 days ago"],
          ].map(([l, v, t]) => (
            <li key={t as string} className="py-3 flex items-center justify-between text-sm">
              <div>
                <div>{l}</div>
                <div className="text-xs text-foreground/60">{t}</div>
              </div>
              <div className="font-display">{formatNaira(v as number)}</div>
            </li>
          ))}
        </ul>
      </div>
    </MobileShell>
  ),
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-soft p-3">
      <div className="text-[0.68rem] text-foreground/60">{label}</div>
      <div className="font-display text-lg">{value}</div>
    </div>
  );
}
