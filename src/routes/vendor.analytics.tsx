import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { vendorNav } from "@/components/VendorNav";
import { formatNaira } from "@/lib/mock";
import { TrendingUp, Wallet } from "lucide-react";

const week = [12, 18, 9, 22, 16, 28, 24];

export const Route = createFileRoute("/vendor/analytics")({
  head: () => ({ meta: [{ title: "Sales — Vendor" }] }),
  component: () => {
    const max = Math.max(...week);
    return (
      <MobileShell nav={vendorNav} title="This week">
        <div className="card-soft p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-foreground/60">Revenue</div>
              <div className="font-display text-2xl">{formatNaira(168200)}</div>
            </div>
            <span className="chip inline-flex items-center gap-1"><TrendingUp className="size-3"/> +18%</span>
          </div>

          <div className="mt-5 flex items-end gap-2 h-32">
            {week.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary-soft"
                  style={{ height: `${(v / max) * 100}%` }}
                />
                <span className="text-[0.65rem] text-foreground/60">{["M","T","W","T","F","S","S"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-soft p-4 mt-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-accent-soft flex items-center justify-center"><Wallet className="size-5"/></div>
          <div className="flex-1">
            <div className="text-xs text-foreground/60">Available to withdraw</div>
            <div className="font-display text-xl">{formatNaira(142800)}</div>
          </div>
          <button className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold">Withdraw</button>
        </div>

        <div className="card-soft p-4 mt-4">
          <div className="text-xs font-semibold text-foreground/70 mb-2">TOP PRODUCTS</div>
          <ul className="space-y-2 text-sm">
            {[
              ["Local Rice (Ofada)", 42],
              ["Honey Beans", 31],
              ["Fresh Pepper Mix", 27],
              ["Yellow Garri", 18],
            ].map(([n, c]) => (
              <li key={n as string} className="flex items-center justify-between">
                <span>{n}</span>
                <span className="text-foreground/60">{c} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </MobileShell>
    );
  },
});
