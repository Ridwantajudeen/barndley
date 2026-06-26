import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, LoaderCircle, Package } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { formatNaira } from "@/lib/mock";
import { useStudentOrders } from "@/lib/student-orders";

export const Route = createFileRoute("/student/orders")({
  head: () => ({ meta: [{ title: "Your orders - Campus Basket" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const { orders, loading, refreshing } = useStudentOrders();

  return (
    <MobileShell nav={studentNav} title="Your orders">
      {loading ? (
        <div className="card-soft p-4 inline-flex items-center gap-2 text-sm text-foreground/70">
          <LoaderCircle className="size-4 animate-spin" />
          Loading your orders...
        </div>
      ) : (
        <>
          {refreshing ? (
            <p className="text-[0.7rem] text-foreground/50 inline-flex items-center gap-1.5 mb-3">
              <LoaderCircle className="size-3.5 animate-spin" />
              Refreshing orders...
            </p>
          ) : null}

          <div className="space-y-3 mt-3">
            {orders.length === 0 ? (
              <div className="card-soft p-8 text-center">
                <Package className="size-7 mx-auto text-foreground/40" />
                <p className="text-sm text-foreground/60 mt-2">You have not placed any orders yet.</p>
              </div>
            ) : (
              orders.map((order) => (
                <Link
                  to="/student/track/$id"
                  params={{ id: order.id }}
                  key={order.id}
                  className="block card-soft p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm">{order.shop_name}</div>
                      <div className="text-xs text-foreground/60 mt-0.5">
                        {new Date(order.placed_at).toLocaleString()} · {order.items_count} items
                      </div>
                    </div>
                    <span className={"chip " + (String(order.status) === "Delivered" ? "" : "chip-accent")}>
                      {String(order.status)}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-foreground/60">{order.order_code}</span>
                    <span className="font-display flex items-center gap-1">
                      {formatNaira(order.total)} <ChevronRight className="size-4" />
                    </span>
                  </div>
                </Link>
              ))
            )}

            {orders.length > 0 && (
              <div className="card-soft p-8 text-center">
                <Package className="size-7 mx-auto text-foreground/40" />
                <p className="text-sm text-foreground/60 mt-2">That’s all your recent orders.</p>
              </div>
            )}
          </div>
        </>
      )}
    </MobileShell>
  );
}
