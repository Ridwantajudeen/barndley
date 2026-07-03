import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { StatementView } from "@/components/StatementView";
import { buildRiderStatementEntries, useRiderHistory } from "@/lib/rider-workspace";

export const Route = createFileRoute("/rider/statement")({
  head: () => ({ meta: [{ title: "Statement - Rider" }] }),
  component: RiderStatement,
});

function RiderStatement() {
  const { orders } = useRiderHistory();
  const entries = buildRiderStatementEntries(orders);

  return (
    <MobileShell nav={riderNav} title="Statement">
      <StatementView backTo="/rider/earnings" ownerLabel="Rider wallet" accountType="Rider wallet" entries={entries} />
    </MobileShell>
  );
}

