import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { cart, useCart, cartTotal } from "@/lib/cart-store";
import { formatNaira } from "@/lib/mock";
import { MapPin, Wallet, Banknote, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/student/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Campus Basket" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const snap = useCart();
  const nav = useNavigate();
  const [pay, setPay] = useState<"wallet"|"cash">("cash");
  const [hall, setHall] = useState("Independence Hall");
  const [room, setRoom] = useState("Room 214");
  const [note, setNote] = useState("");
  const total = cartTotal(snap.lines) + 350 + 100;

  function place() {
    cart.clear();
    nav({ to: "/student/track/$id", params: { id: "CB-NEW" } });
  }

  return (
    <MobileShell nav={studentNav} title="Checkout">
      <Section title="Deliver to">
        <div className="card-soft p-3 flex items-start gap-3">
          <MapPin className="size-5 text-primary mt-0.5" />
          <div className="flex-1 space-y-2">
            <input className="w-full bg-transparent text-sm font-semibold focus:outline-none" value={hall} onChange={(e)=>setHall(e.target.value)} />
            <input className="w-full bg-transparent text-xs text-foreground/70 focus:outline-none" value={room} onChange={(e)=>setRoom(e.target.value)} />
          </div>
        </div>
      </Section>

      <Section title="Note for rider (optional)">
        <textarea
          value={note}
          onChange={(e)=>setNote(e.target.value)}
          placeholder="Please pick the ripest tomatoes…"
          className="w-full bg-card border border-border rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          rows={3}
        />
      </Section>

      <Section title="Payment">
        <div className="grid grid-cols-2 gap-2">
          <PayOption active={pay==="cash"} onClick={()=>setPay("cash")} icon={<Banknote className="size-4"/>} label="Cash on delivery" />
          <PayOption active={pay==="wallet"} onClick={()=>setPay("wallet")} icon={<Wallet className="size-4"/>} label="Wallet (₦12,400)" />
        </div>
        <p className="text-[0.7rem] text-foreground/50 mt-2">
          Paystack & Flutterwave coming soon.
        </p>
      </Section>

      <div className="card-soft p-4 mt-5 space-y-1.5 text-sm">
        <Row label={`Items (${snap.lines.length})`} value={formatNaira(cartTotal(snap.lines))} />
        <Row label="Delivery" value={formatNaira(350)} />
        <Row label="Service fee" value={formatNaira(100)} />
        <div className="pt-2 border-t border-border/60">
          <Row bold label="Total" value={formatNaira(total)} />
        </div>
      </div>

      <button
        onClick={place}
        disabled={snap.lines.length===0}
        className="mt-5 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-50"
      >
        Place order
      </button>
    </MobileShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="text-xs font-semibold text-foreground/70 mb-2">{title.toUpperCase()}</div>
      {children}
    </div>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={"flex items-center justify-between " + (bold ? "font-display text-lg" : "text-foreground/70")}>
      <span>{label}</span>
      <span className={bold ? "" : "text-foreground"}>{value}</span>
    </div>
  );
}
function PayOption({ active, onClick, icon, label }:{active:boolean;onClick:()=>void;icon:React.ReactNode;label:string}) {
  return (
    <button onClick={onClick} className={"card-soft p-3 text-left flex items-start gap-2 " + (active?"ring-2 ring-primary":"")}>
      <span className="h-8 w-8 rounded-lg bg-primary-soft inline-flex items-center justify-center">{icon}</span>
      <div className="flex-1">
        <div className="text-sm font-semibold">{label}</div>
        {active && <Check className="size-4 text-primary mt-0.5"/>}
      </div>
    </button>
  );
}
