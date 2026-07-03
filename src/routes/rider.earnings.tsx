import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { formatNaira } from "@/lib/mock";
import { buildRiderStatementEntries, useRiderHistory, useRiderOrders } from "@/lib/rider-workspace";

export const Route = createFileRoute("/rider/earnings")({
  head: () => ({ meta: [{ title: "Earnings - Rider" }] }),
  component: RiderEarnings,
});

function RiderEarnings() {
  const { summary } = useRiderOrders();
  const { orders } = useRiderHistory();
  const recentPayouts = buildRiderStatementEntries(orders).slice(0, 5);

  return (
    <MobileShell nav={riderNav} title="Earnings">
      <div className="card-soft p-5 bg-gradient-to-br from-primary-soft to-accent-soft">
        <div className="text-xs text-foreground/70">Wallet balance</div>
        <div className="font-display text-3xl mt-1">{formatNaira(summary.availableToWithdraw)}</div>
        <div className="flex gap-2 mt-4">
          <button className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold">Withdraw</button>
          <Link to="/rider/statement" className="flex-1 py-2.5 rounded-xl bg-background/70 text-sm font-semibold text-center">
            Statement
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Stat label="This week" value={formatNaira(summary.weekEarnings)} />
        <Stat label="Trips this week" value={String(summary.weekTrips)} />
        <Stat label="Active trips" value={String(summary.activeTrips)} />
        <Stat label="Avg payout" value={formatNaira(summary.avgPayout)} />
      </div>

      <div className="card-soft p-4 mt-4">
        <div className="text-xs font-semibold text-foreground/70 mb-2">RECENT PAYOUTS</div>
        {recentPayouts.length === 0 ? (
          <div className="text-sm text-foreground/60">Completed trips will appear here once they are delivered.</div>
        ) : (
          <ul className="divide-y divide-border/60">
            {recentPayouts.map((entry) => (
              <li key={entry.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div>{entry.label}</div>
                  <div className="text-xs text-foreground/60">{new Date(entry.date).toLocaleDateString()}</div>
                </div>
                <div className="font-display">{formatNaira(entry.amount)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MobileShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-soft p-3">
      <div className="text-[0.68rem] text-foreground/60">{label}</div>
      <div className="font-display text-lg">{value}</div>
    </div>
  );
}

