import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { cart, useCart, cartTotal, groupByShop, isBundle } from "@/lib/cart-store";
import { formatNaira } from "@/lib/mock";
import { LoaderCircle, MapPin, Wallet, Banknote, Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useStudentProfile } from "@/lib/student-profile";
import { backendRequest } from "@/lib/backend";

export const Route = createFileRoute("/student/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Campus Basket" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const snap = useCart();
  const nav = useNavigate();
  const { profile } = useStudentProfile();
  const [pay, setPay] = useState<"wallet"|"cash">("cash");
  const [hall, setHall] = useState("");
  const [room, setRoom] = useState("");
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const groups = groupByShop(snap.lines);
  const bundle = isBundle(snap.lines);
  const delivery = snap.lines.length === 0 ? 0 : 350 + Math.max(0, groups.length - 1) * 200;
  const total = cartTotal(snap.lines) + delivery + 100;
  const hallRequired = !hall.trim();
  const roomRequired = !room.trim();
  const canPlace = snap.lines.length > 0 && !placing && !hallRequired && !roomRequired;

  useEffect(() => {
    if (!profile?.location) return;
    if (hall.trim() || room.trim()) return;

    const parts = profile.location
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    setHall(parts[0] || profile.location.trim());
    setRoom(parts.slice(1).join(", ") || "");
  }, [profile?.location, hall, room]);

  async function place() {
    if (placing || snap.lines.length === 0) return;
    if (!hall.trim() || !room.trim()) {
      setPlaceError("Enter your hall and room before checkout.");
      return;
    }
    setPlaceError(null);
    setPlacing(true);
    try {
      const payload = await backendRequest<{ order: { id: string } }>("/student/orders", {
        method: "POST",
        body: {
          hall: hall.trim(),
          room: room.trim(),
          note: note.trim() || null,
          payment_method: pay,
          lines: snap.lines,
        },
      });
      cart.clear();
      nav({ to: "/student/track/$id", params: { id: payload.order.id } });
    } catch (err) {
      setPlaceError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <MobileShell nav={studentNav} title="Checkout">
      {bundle && (
        <div className="card-soft p-3 flex items-start gap-2 bg-accent-soft border-accent/30 mt-1">
          <Sparkles className="size-4 text-accent mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold">Bundle order · {groups.length} pickups</div>
            <div className="text-foreground/70 mt-0.5">
              Rider will collect from {groups.map(g => g.shopName).join(", ")} and deliver together.
            </div>
          </div>
        </div>
      )}

      <Section title="Deliver to">
        <div className="card-soft p-3 flex items-start gap-3">
          <MapPin className="size-5 text-primary mt-0.5" />
          <div className="flex-1 space-y-2">
            <label className="block">
              <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wide text-foreground/60">Hall</span>
              <input
                required
                className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-foreground/35 focus:outline-none"
                value={hall}
                onChange={(e) => setHall(e.target.value)}
                placeholder="e.g. Hall 1"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wide text-foreground/60">Room</span>
              <input
                required
                className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/35 focus:outline-none"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. 204"
              />
            </label>
            <p className="pt-1 text-[0.7rem] text-foreground/50">
              We need both hall and room so the rider can find you.
            </p>
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
        <Row label={bundle ? `Delivery (${groups.length} pickups)` : "Delivery"} value={formatNaira(delivery)} />
        <Row label="Service fee" value={formatNaira(100)} />
        <div className="pt-2 border-t border-border/60">
          <Row bold label="Total" value={formatNaira(total)} />
        </div>
      </div>

      <button
        onClick={place}
        disabled={!canPlace}
        className="mt-5 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {placing ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {placing ? "Placing order..." : hallRequired || roomRequired ? "Enter hall and room" : "Place order"}
      </button>
      {placeError ? <p className="mt-2 text-sm text-red-500">{placeError}</p> : null}
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


