import { Link } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, Download, Calendar, Filter } from "lucide-react";
import { formatNaira } from "@/lib/mock";
import { useMemo, useState } from "react";

export type StatementEntry = {
  id: string;
  label: string;
  ref?: string;
  amount: number; // positive = credit (in), negative = debit (out)
  date: string; // ISO date
};

export type StatementProps = {
  backTo: string;
  ownerLabel: string; // e.g. "Tunde Adebayo" or "Mama Tee's Foodstuff"
  accountType: "Rider wallet" | "Shop wallet";
  entries: StatementEntry[];
};

type Range = "7d" | "30d" | "all";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function StatementView({ backTo, ownerLabel, accountType, entries }: StatementProps) {
  const [range, setRange] = useState<Range>("30d");
  const [kind, setKind] = useState<"all" | "in" | "out">("all");

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff =
      range === "7d" ? now - 7 * 864e5 : range === "30d" ? now - 30 * 864e5 : 0;
    return entries
      .filter((e) => new Date(e.date).getTime() >= cutoff)
      .filter((e) => (kind === "all" ? true : kind === "in" ? e.amount > 0 : e.amount < 0))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [entries, range, kind]);

  const totals = useMemo(() => {
    const credits = filtered.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
    const debits = filtered.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);
    return { credits, debits, net: credits - debits };
  }, [filtered]);

  const grouped = useMemo(() => {
    const map = new Map<string, StatementEntry[]>();
    for (const e of filtered) {
      const k = dayKey(e.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const download = () => {
    const rows = [
      ["Date", "Reference", "Description", "Type", "Amount (NGN)"],
      ...filtered.map((e) => [
        fmtDate(e.date),
        e.ref ?? e.id,
        e.label,
        e.amount > 0 ? "Credit" : "Debit",
        e.amount.toString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statement-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Link to={backTo} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ChevronLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <div className="font-display text-lg leading-tight">Account statement</div>
          <div className="text-xs text-foreground/60">{accountType} · {ownerLabel}</div>
        </div>
        <button onClick={download} className="h-9 px-3 rounded-full bg-foreground text-background text-xs font-semibold inline-flex items-center gap-1.5">
          <Download className="size-3.5" /> CSV
        </button>
      </div>

      <div className="card-soft p-4 bg-gradient-to-br from-primary-soft to-accent-soft">
        <div className="text-[0.7rem] text-foreground/70 flex items-center gap-1">
          <Calendar className="size-3" /> {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "All time"}
        </div>
        <div className="font-display text-2xl mt-1">{formatNaira(totals.net)}</div>
        <div className="text-[0.7rem] text-foreground/60">Net change</div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-xl bg-background/70 p-2.5">
            <div className="text-[0.65rem] text-foreground/60">Money in</div>
            <div className="font-display text-base text-primary">+{formatNaira(totals.credits)}</div>
          </div>
          <div className="rounded-xl bg-background/70 p-2.5">
            <div className="text-[0.65rem] text-foreground/60">Money out</div>
            <div className="font-display text-base">-{formatNaira(totals.debits)}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="size-3.5 text-foreground/50 shrink-0" />
        {(["7d", "30d", "all"] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={
              "px-3 h-8 rounded-full text-xs font-semibold whitespace-nowrap " +
              (range === r ? "bg-foreground text-background" : "bg-secondary")
            }
          >
            {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "All"}
          </button>
        ))}
        <span className="w-px h-5 bg-border mx-1" />
        {(["all", "in", "out"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={
              "px-3 h-8 rounded-full text-xs font-semibold whitespace-nowrap " +
              (kind === k ? "bg-foreground text-background" : "bg-secondary")
            }
          >
            {k === "all" ? "All" : k === "in" ? "In" : "Out"}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-4">
        {grouped.length === 0 && (
          <div className="card-soft p-6 text-center text-sm text-foreground/60">
            No transactions in this period.
          </div>
        )}
        {grouped.map(([day, items]) => {
          const dayNet = items.reduce((s, e) => s + e.amount, 0);
          return (
            <div key={day} className="card-soft overflow-hidden">
              <div className="px-4 py-2.5 flex items-center justify-between bg-secondary/60">
                <div className="text-xs font-semibold text-foreground/70">{day}</div>
                <div className="text-[0.7rem] text-foreground/60">
                  Net {dayNet >= 0 ? "+" : "-"}{formatNaira(Math.abs(dayNet))}
                </div>
              </div>
              <ul className="divide-y divide-border/60">
                {items.map((e) => (
                  <li key={e.id} className="p-4 flex items-center gap-3 text-sm">
                    <span
                      className={
                        "h-9 w-9 rounded-xl flex items-center justify-center " +
                        (e.amount > 0 ? "bg-primary-soft text-primary" : "bg-accent-soft")
                      }
                    >
                      {e.amount > 0 ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{e.label}</div>
                      <div className="text-[0.7rem] text-foreground/60">
                        {fmtDate(e.date)} {e.ref ? "· " + e.ref : ""}
                      </div>
                    </div>
                    <div className={"font-display " + (e.amount > 0 ? "text-primary" : "")}>
                      {e.amount > 0 ? "+" : "-"}{formatNaira(Math.abs(e.amount))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
