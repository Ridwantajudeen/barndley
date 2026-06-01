import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { riderNav } from "@/components/RiderNav";
import { riderRequests, formatNaira, orderStages } from "@/lib/mock";
import { useState } from "react";
import { Bike, MapPin, Navigation, Check, Phone, MessageCircle, Store, User, Sparkles } from "lucide-react";

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
        <div className={"card-soft p-4 mt-5 " + (active.bundle ? "ring-2 ring-accent bg-accent-soft/30" : "")}>
          <div className="flex items-center justify-between">
            <div className="text-xs text-foreground/60">Active trip · {active.id}</div>
            {active.bundle && (
              <span className="chip chip-accent inline-flex items-center gap-1">
                <Sparkles className="size-3"/> Bundle · {active.pickups?.length ?? 0} shops
              </span>
            )}
          </div>
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

          <div className="mt-4 space-y-2">
            {active.bundle && active.pickups ? (
              <>
                <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60 font-semibold">Pickups in order</div>
                {active.pickups.map((p, i) => (
                  <ContactCard
                    key={p.shop}
                    icon={<span className="text-xs font-bold">{i+1}</span>}
                    title={p.shop}
                    subtitle={`${p.address} · ${p.items} item${p.items>1?"s":""}`}
                    tag={`Stop ${i+1}`}
                    phone={p.phone}
                  />
                ))}
              </>
            ) : (
              <ContactCard
                icon={<Store className="size-4"/>}
                title={active.shop}
                subtitle={active.pickup}
                tag="Pickup"
                phone={active.shopPhone}
              />
            )}
            <ContactCard
              icon={<User className="size-4"/>}
              title={active.student}
              subtitle={active.drop}
              tag="Drop-off"
              phone={active.studentPhone}
              tone="primary"
            />
          </div>

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
                <div key={r.id} className={"card-soft p-4 " + (r.bundle ? "ring-2 ring-accent bg-accent-soft/30" : "")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {r.bundle && (
                          <span className="chip chip-accent inline-flex items-center gap-1">
                            <Sparkles className="size-3"/> Bundle · {r.pickups?.length ?? 0} shops
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-sm truncate mt-1">{r.shop}</div>
                      <div className="text-[0.7rem] text-foreground/60">Request {r.id}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-lg">{formatNaira(r.payout)}</div>
                      <div className="text-xs text-foreground/60">{r.distanceKm} km · {r.items} items</div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {r.bundle && r.pickups ? (
                      r.pickups.map((p, i) => (
                        <PartyRow
                          key={p.shop}
                          icon={<span className="text-[0.65rem] font-bold">{i+1}</span>}
                          label={`Stop ${i+1}`}
                          name={p.shop}
                          address={`${p.address} · ${p.items} item${p.items>1?"s":""}`}
                          phone={p.phone}
                        />
                      ))
                    ) : (
                      <PartyRow
                        icon={<Store className="size-3.5"/>}
                        label="Pickup"
                        name={r.shop}
                        address={r.pickup}
                        phone={r.shopPhone}
                      />
                    )}
                    <PartyRow
                      icon={<User className="size-3.5"/>}
                      label="Drop"
                      name={r.student}
                      address={r.drop}
                      phone={r.studentPhone}
                      tone="primary"
                    />
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

function PartyRow({
  icon, label, name, address, phone, tone,
}: { icon: React.ReactNode; label: string; name: string; address: string; phone: string; tone?: "primary" }) {
  return (
    <div className="flex items-center gap-2 bg-secondary/60 rounded-xl p-2">
      <span className={"h-7 w-7 rounded-lg flex items-center justify-center shrink-0 " + (tone === "primary" ? "bg-primary text-primary-foreground" : "bg-foreground text-background")}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60">{label}</div>
        <div className="text-xs font-semibold truncate">{name}</div>
        <div className="text-[0.7rem] text-foreground/60 flex items-center gap-1 truncate">
          <MapPin className="size-3 shrink-0"/> {address}
        </div>
      </div>
      <a href={`sms:${phone}`} className="h-8 w-8 rounded-lg bg-background flex items-center justify-center shrink-0"><MessageCircle className="size-3.5"/></a>
      <a href={`tel:${phone}`} className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0"><Phone className="size-3.5"/></a>
    </div>
  );
}

function ContactCard({
  icon, title, subtitle, tag, phone, tone,
}: { icon: React.ReactNode; title: string; subtitle: string; tag: string; phone: string; tone?: "primary" }) {
  return (
    <div className="flex items-center gap-3 bg-secondary/60 rounded-xl p-3">
      <span className={"h-9 w-9 rounded-lg flex items-center justify-center shrink-0 " + (tone === "primary" ? "bg-primary text-primary-foreground" : "bg-foreground text-background")}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[0.65rem] uppercase tracking-wide text-foreground/60">{tag}</div>
        <div className="text-sm font-semibold truncate">{title}</div>
        <div className="text-[0.7rem] text-foreground/60 flex items-center gap-1 truncate">
          <MapPin className="size-3 shrink-0"/> {subtitle}
        </div>
      </div>
      <a href={`sms:${phone}`} className="h-9 w-9 rounded-lg bg-background flex items-center justify-center shrink-0"><MessageCircle className="size-4"/></a>
      <a href={`tel:${phone}`} className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0"><Phone className="size-4"/></a>
    </div>
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
