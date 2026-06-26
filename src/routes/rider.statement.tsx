import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { StatementView, type StatementEntry } from "@/components/StatementView";
import { useRiderOrders } from "@/lib/rider-workspace";

export const Route = createFileRoute("/rider/statement")({
  head: () => ({ meta: [{ title: "Statement - Rider" }] }),
  component: RiderStatement,
});

function RiderStatement() {
  const { assignedOrders } = useRiderOrders();

  const entries: StatementEntry[] = assignedOrders
    .filter((order) => String(order.status) === "Delivered")
    .map((order) => ({
      id: order.id,
      label: `Trip payout - ${order.shop_name}`,
      ref: order.order_code,
      amount: Number(order.delivery_fee || 0),
      date: order.placed_at,
    }));

  return (
    <MobileShell nav={riderNav} title="Statement">
      <StatementView backTo="/rider/earnings" ownerLabel="Rider wallet" accountType="Rider wallet" entries={entries} />
    </MobileShell>
  );
}

