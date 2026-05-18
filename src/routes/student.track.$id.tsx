import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { orderStages } from "@/lib/mock";
import { Bike, Phone, MessageCircle, Check, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/student/track/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Tracking ${params.id} — Campus Basket` }],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { id } = Route.useParams();
  const [stage, setStage] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setStage((s) => Math.min(orderStages.length - 1, s + 1)), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <MobileShell nav={studentNav} title="Tracking your basket">
      <div className="text-xs text-foreground/60 -mt-2">Order {id}</div>

      <div className="mt-4 card-soft overflow-hidden">
        <div className="h-44 relative bg-gradient-to-br from-primary-soft to-accent-soft">
          <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path d="M0,150 C100,140 150,80 250,90 S400,40 420,30" stroke="oklch(0.5 0.05 150)" strokeDasharray="6 6" fill="none" strokeWidth="2"/>
          </svg>
          <div className="absolute left-6 top-6 chip bg-foreground text-background">
            <MapPin className="size-3"/> Shop
          </div>
          <div className="absolute right-6 bottom-6 chip bg-primary">
            <MapPin className="size-3"/> Your hostel
          </div>
          <div
            className="absolute h-10 w-10 rounded-full bg-background shadow-lg flex items-center justify-center transition-all duration-1000"
            style={{ left: `${10 + stage * 14}%`, top: `${65 - stage * 7}%` }}
          >
            <Bike className="size-5 text-primary"/>
          </div>
        </div>

        <ContactRow
          avatar="T"
          name="Tunde A. · Rider"
          sub="Bicycle · KP-72 · ⭐ 4.9"
          location="En route · ~6 min away"
          phone="+234 803 411 0072"
        />

        <ContactRow
          avatar="🥬"
          name="Mama Tee's Foodstuff"
          sub="Open · ⭐ 4.8 (312)"
          location="Block 4, North Gate Market"
          phone="+234 802 990 1245"
        />

        <ContactRow
          avatar="🏠"
          name="You · Delivery address"
          sub="Independence Hall · Room 214"
          location="Drop here when rider arrives"
        />
      </div>

      <div className="card-soft p-4 mt-4">
        <div className="text-xs font-semibold text-foreground/70 mb-3">PROGRESS</div>
        <ol className="space-y-3">
          {orderStages.map((s, i) => {
            const done = i <= stage;
            const current = i === stage;
            return (
              <li key={s} className="flex items-center gap-3">
                <span className={"h-6 w-6 rounded-full flex items-center justify-center text-xs " + (done ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/50")}>
                  {done ? <Check className="size-3.5"/> : i + 1}
                </span>
                <span className={"text-sm " + (current ? "font-semibold" : done ? "" : "text-foreground/50")}>
                  {s}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <Link to="/student/orders" className="mt-5 block text-center py-3 rounded-2xl bg-secondary font-semibold text-sm">
        Back to orders
      </Link>
    </MobileShell>
  );
}

function ContactRow({
  avatar,
  name,
  sub,
  location,
  phone,
}: {
  avatar: string;
  name: string;
  sub: string;
  location: string;
  phone?: string;
}) {
  return (
    <div className="p-4 flex items-center gap-3 border-t border-border/60">
      <div className="h-11 w-11 rounded-full bg-primary-soft flex items-center justify-center font-display text-lg">{avatar}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{name}</div>
        <div className="text-xs text-foreground/60 truncate">{sub}</div>
        <div className="text-[0.7rem] text-foreground/70 mt-0.5 flex items-center gap-1 truncate">
          <MapPin className="size-3 shrink-0 text-primary"/> {location}
        </div>
      </div>
      {phone && (
        <>
          <a href={`sms:${phone}`} className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center"><MessageCircle className="size-4"/></a>
          <a href={`tel:${phone}`} className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Phone className="size-4"/></a>
        </>
      )}
    </div>
  );
}
