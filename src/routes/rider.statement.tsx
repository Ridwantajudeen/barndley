import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { StatementView, type StatementEntry } from "@/components/StatementView";

export const Route = createFileRoute("/rider/statement")({
  head: () => ({ meta: [{ title: "Statement — Rider" }] }),
  component: RiderStatement,
});

const today = new Date();
const d = (daysAgo: number, h = 12, m = 0) => {
  const x = new Date(today);
  x.setDate(x.getDate() - daysAgo);
  x.setHours(h, m, 0, 0);
  return x.toISOString();
};

const entries: StatementEntry[] = [
  { id: "t1", label: "Trip payout · Indep. Hall", ref: "REQ-771", amount: 850, date: d(0, 13, 30) },
  { id: "t2", label: "Trip payout · Queens Hall", ref: "REQ-770", amount: 700, date: d(0, 11, 5) },
  { id: "t3", label: "Tip from Adaeze O.", ref: "TIP-22", amount: 300, date: d(0, 10, 40) },
  { id: "t4", label: "Trip payout · Mellanby", ref: "REQ-765", amount: 950, date: d(1, 18, 10) },
  { id: "t5", label: "Trip payout · Tedder Hall", ref: "REQ-764", amount: 600, date: d(1, 14, 0) },
  { id: "t6", label: "Bank withdrawal · ****8210", ref: "WD-018", amount: -15000, date: d(2, 9, 0) },
  { id: "t7", label: "Trip payout · Awo Hall", ref: "REQ-760", amount: 720, date: d(3, 17, 20) },
  { id: "t8", label: "Weekly bonus", ref: "BNS-09", amount: 1500, date: d(5, 12, 0) },
  { id: "t9", label: "Bank withdrawal · ****8210", ref: "WD-017", amount: -9500, date: d(5, 9, 0) },
  { id: "t10", label: "Trip payout · Bello Hall", ref: "REQ-740", amount: 820, date: d(9, 16, 0) },
];

function RiderStatement() {
  return (
    <MobileShell nav={riderNav} title="Statement">
      <StatementView
        backTo="/rider/earnings"
        ownerLabel="Tunde Adebayo"
        accountType="Rider wallet"
        entries={entries}
      />
    </MobileShell>
  );
}
