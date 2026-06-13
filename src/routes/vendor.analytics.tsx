import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Wallet, LoaderCircle } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { vendorNav } from "@/components/VendorNav";
import { formatNaira } from "@/lib/mock";
import { useVendorSales } from "@/lib/vendor-sales";
import { useVendorShop } from "@/lib/vendor-shop";

export const Route = createFileRoute("/vendor/analytics")({
  head: () => ({ meta: [{ title: "Sales â€” Vendor" }] }),
  component: VendorAnalytics,
});

function VendorAnalytics() {
  const { shop, loading } = useVendorShop();
  const { summary, refreshing } = useVendorSales(shop?.id ?? null);
  const max = Math.max(...summary.weekRevenue, 1);
  const labels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <MobileShell nav={vendorNav} title={shop?.name ? `${shop.name} sales` : "This week"}>
      {loading && !shop?.id ? (
        <div className="card-soft p-4 text-sm text-foreground/70 inline-flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin" />
          Loading sales...
        </div>
      ) : !shop?.id ? (
        <div className="card-soft p-4 text-sm text-foreground/70">
          Add your shop profile first, then we can read real revenue and product sales from Supabase.
          <Link to="/vendor/profile" className="mt-3 block font-semibold text-primary">
            Go to shop profile
          </Link>
        </div>
      ) : (
        <>
          <div className="card-soft p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-foreground/60">Revenue</div>
                <div className="font-display text-2xl">{formatNaira(summary.revenue)}</div>
              </div>
              <span className="chip inline-flex items-center gap-1">
                <TrendingUp className="size-3" /> Live
              </span>
            </div>

            <div className="mt-5 flex items-end gap-2 h-32">
              {summary.weekRevenue.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-soft"
                    style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
                  />
                  <span className="text-[0.65rem] text-foreground/60">{labels[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-soft p-4 mt-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-accent-soft flex items-center justify-center">
              <Wallet className="size-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-foreground/60">Available to withdraw</div>
              <div className="font-display text-xl">{formatNaira(summary.availableToWithdraw)}</div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold">
              Withdraw
            </button>
          </div>

          {refreshing && (
            <p className="mt-3 text-[0.7rem] text-foreground/50 inline-flex items-center gap-1.5">
              <LoaderCircle className="size-3.5 animate-spin" /> Refreshing live sales...
            </p>
          )}

          <div className="card-soft p-4 mt-4">
            <div className="text-xs font-semibold text-foreground/70 mb-2">TOP PRODUCTS</div>
            {summary.topProducts.length ? (
              <ul className="space-y-2 text-sm">
                {summary.topProducts.map((item) => (
                  <li key={item.name} className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="text-foreground/60">{item.sold} sold</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-foreground/60">No sold products yet.</div>
            )}
          </div>
        </>
      )}
    </MobileShell>
  );
}
