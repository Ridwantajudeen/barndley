import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { vendorNav } from "@/components/VendorNav";
import { StatementView, type StatementEntry } from "@/components/StatementView";

export const Route = createFileRoute("/vendor/statement")({
  head: () => ({ meta: [{ title: "Statement — Shop" }] }),
  component: VendorStatement,
});

const today = new Date();
const d = (daysAgo: number, h = 12, m = 0) => {
  const x = new Date(today);
  x.setDate(x.getDate() - daysAgo);
  x.setHours(h, m, 0, 0);
  return x.toISOString();
};

const entries: StatementEntry[] = [
  { id: "s1", label: "Order · Indep. Hall", ref: "#1052", amount: 6900, date: d(0, 13, 24) },
  { id: "s2", label: "Order · Queens Hall", ref: "#1051", amount: 2900, date: d(0, 11, 12) },
  { id: "s3", label: "Order · Mellanby", ref: "#1050", amount: 4100, date: d(0, 9, 40) },
  { id: "s4", label: "Order · Awo Hall", ref: "#1049", amount: 5300, date: d(1, 19, 5) },
  { id: "s5", label: "Order · Tedder Hall", ref: "#1048", amount: 3200, date: d(1, 14, 30) },
  { id: "s6", label: "Payout to bank · ****8210", ref: "PAY-104", amount: -18500, date: d(2, 9, 0) },
  { id: "s7", label: "Order · Bello Hall", ref: "#1045", amount: 7800, date: d(3, 16, 0) },
  { id: "s8", label: "Platform fee", ref: "FEE-22", amount: -1200, date: d(3, 23, 50) },
  { id: "s9", label: "Order · Sultan Bello", ref: "#1040", amount: 4500, date: d(6, 12, 0) },
  { id: "s10", label: "Payout to bank · ****8210", ref: "PAY-103", amount: -22300, date: d(7, 9, 0) },
];

function VendorStatement() {
  return (
    <MobileShell nav={vendorNav} title="Statement">
      <StatementView
        backTo="/vendor/profile"
        ownerLabel="Mama Tee's Foodstuff"
        accountType="Shop wallet"
        entries={entries}
      />
    </MobileShell>
  );
}
