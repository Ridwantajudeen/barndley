import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { riderRequests, formatNaira, orderStages } from "@/lib/mock";
import { useState } from "react";
import { Bike, MapPin, Navigation, Check } from "lucide-react";

export const Route = createFileRoute("/rider/")({
  head: () => ({ meta: [{ title: "Rider — Campus Basket" }] }),
  component: RiderHome,
});

function RiderHome() {
  const [online, setOnline] = useState(true);
  const [active, setActive] = useState<typeof riderRequests[number] | null>(null);
  const [stage, setStage] = useState(2);

  return (
    <MobileShell nav={riderNav} title={online ? "You're online" : "You're offline"}>
      <div className="card-soft p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={"h-11 w-11 rounded-xl flex items-center justify-center " + (online ? "bg-primary text-primary-foreground" : "bg-secondary")}>
            <Bike className="size-5"/>
          </div>
          <div>
            <div className="text-xs text-foreground/60">Status</div>
            <div className="font-semibold">{online ? "Available for trips" : "Not receiving"}</div>
          </div>
        </div>
        <button
          onClick={() => setOnline(!online)}
          className={"w-14 h-8 rounded-full p-1 transition-colors " + (online ? "bg-primary" : "bg-border")}
        >
          <span className={"block h-6 w-6 rounded-full bg-background shadow transition-transform " + (online ? "translate-x-6" : "")} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <Mini label="Today" value={formatNaira(3450)} />
        <Mini label="Trips" value="7" />
        <Mini label="Rating" value="4.9" />
      </div>

      {active ? (
        <div className="card-soft p-4 mt-5">
          <div className="text-xs text-foreground/60">Active trip · {active.id}</div>
          <div className="font-display text-lg mt-1">{active.shop}</div>

          <ol className="mt-4 space-y-3">
            {orderStages.slice(1,5).map((s, i) => {
              const done = i <= stage;
              return (
                <li key={s} className="flex items-center gap-3">
                  <span className={"h-6 w-6 rounded-full flex items-center justify-center text-xs " + (done ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/50")}>
                    {done ? <Check className="size-3.5"/> : i+1}
                  </span>
                  <span className={"text-sm " + (i === stage ? "font-semibold" : "")}>{s}</span>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => stage < 3 ? setStage(stage+1) : (setActive(null), setStage(0))}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              {stage < 3 ? "Next step" : "Complete delivery"}
            </button>
            <button className="px-4 py-3 rounded-xl bg-secondary font-semibold inline-flex items-center gap-1">
              <Navigation className="size-4"/> Route
            </button>
          </div>
        </div>
      ) : (
        <>
          <h2 className="font-display text-lg mt-6 mb-2">Nearby requests</h2>
          {!online && (
            <div className="card-soft p-6 text-center text-sm text-foreground/60">
              Go online to receive delivery requests.
            </div>
          )}
          {online && (
            <div className="space-y-3">
              {riderRequests.map((r) => (
                <div key={r.id} className="card-soft p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-sm">{r.shop}</div>
                      <div className="text-xs text-foreground/60 mt-1 flex items-center gap-1">
                        <MapPin className="size-3"/> {r.pickup}
                      </div>
                      <div className="text-xs text-foreground/60 flex items-center gap-1">
                        <MapPin className="size-3 text-primary"/> {r.drop}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg">{formatNaira(r.payout)}</div>
                      <div className="text-xs text-foreground/60">{r.distanceKm} km · {r.items} items</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setActive(r)} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Accept</button>
                    <button className="flex-1 py-2.5 rounded-xl bg-secondary font-semibold text-sm">Skip</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </MobileShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-soft p-3">
      <div className="text-[0.68rem] text-foreground/60">{label}</div>
      <div className="font-display text-lg">{value}</div>
    </div>
  );
}
