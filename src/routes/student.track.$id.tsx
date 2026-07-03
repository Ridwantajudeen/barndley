import { createFileRoute, Link } from "@tanstack/react-router";
import { backendRequest } from "@/lib/backend";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { formatNaira } from "@/lib/mock";
import { useStudentOrder } from "@/lib/student-orders";
import { useStudentProfile } from "@/lib/student-profile";
import { Check, Clock, Copy, LoaderCircle, MapPin, MessageCircle, Package, Phone, Send, Truck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/student/track/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Tracking ${params.id} - Campus Basket` }],
  }),
  component: TrackPage,
});

type ChatMsg = { from: "me" | "them"; text: string; at: string };

const ORDER_STEPS = [
  "Placed",
  "Vendor confirmed",
  "Rider en route to shop",
  "Picked up",
  "Student contacted",
  "Delivered",
  "Student confirmed",
] as const;

function TrackPage() {
  const { id } = Route.useParams();
  const { profile } = useStudentProfile();
  const { order, loading, refreshing, refresh } = useStudentOrder(id);
  const [chatWith, setChatWith] = useState<null | { name: string; avatar: string }>(null);
  const [callWith, setCallWith] = useState<null | { name: string; avatar: string; phone: string }>(null);
  const [confirmingReceipt, setConfirmingReceipt] = useState(false);

  async function handleConfirmReceipt() {
    if (!order) return;
    setConfirmingReceipt(true);
    try {
      await backendRequest(`/student/orders/${encodeURIComponent(order.id)}/confirm`, {
        method: "PUT",
      });
      await refresh();
    } finally {
      setConfirmingReceipt(false);
    }
  }

  if (loading) {
    return (
      <MobileShell nav={studentNav} title="Tracking your order">
        <div className="min-h-[45vh] flex items-center justify-center text-sm text-foreground/60 inline-flex gap-2">
          <LoaderCircle className="size-4 animate-spin" />
          Loading order details...
        </div>
      </MobileShell>
    );
  }

  if (!order) {
    return (
      <MobileShell nav={studentNav} title="Tracking your order">
        <div className="card-soft p-5">
          <div className="font-semibold">Order not found</div>
          <p className="text-sm text-foreground/60 mt-2">We could not load that order from Supabase.</p>
          <Link to="/student/orders" className="mt-4 inline-flex text-sm font-semibold text-primary">
            Back to orders
          </Link>
        </div>
      </MobileShell>
    );
  }

  const currentStep = getStepIndex(String(order.status));
  const shopAvatar = order.shop_name.trim().slice(0, 1).toUpperCase() || "S";
  const riderAvatar = "R";
  const studentAvatar = (profile?.display_name?.trim().charAt(0) || "Y").toUpperCase();

  return (
    <MobileShell nav={studentNav} title="Tracking your order">
      <div className="text-xs text-foreground/60 -mt-2">Order {order.order_code}</div>

      <div className="mt-4 card-soft p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display text-xl truncate">{order.shop_name}</div>
            <div className="text-xs text-foreground/60 mt-1">
              {new Date(order.placed_at).toLocaleString()} - {order.items_count} items
            </div>
            <div className="mt-2 text-sm text-foreground/70">{getStatusNote(String(order.status))}</div>
          </div>
          <span className={"chip " + (["Delivered", "Student confirmed"].includes(String(order.status)) ? "" : "chip-accent")}>
            {String(order.status)}
          </span>
        </div>
        {refreshing ? (
          <p className="mt-3 text-xs text-foreground/50 inline-flex items-center gap-1.5">
            <LoaderCircle className="size-3.5 animate-spin" />
            Refreshing order details...
          </p>
        ) : null}
      </div>

      <div className="card-soft p-4 mt-4">
        <div className="text-xs font-semibold text-foreground/70 mb-3">PROGRESS</div>
        <ol className="space-y-3">
          {ORDER_STEPS.map((step, index) => {
            const done = index <= currentStep;
            const current = index === currentStep;
            return (
              <li key={step} className="flex items-center gap-3">
                <span
                  className={
                    "h-6 w-6 rounded-full flex items-center justify-center text-xs shrink-0 " +
                    (done ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/50")
                  }
                >
                  {done ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className={"text-sm " + (current ? "font-semibold" : done ? "" : "text-foreground/50")}>
                  {step}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="card-soft p-4 mt-4 space-y-3">
        <DetailRow icon={<MapPin className="size-4" />} label="Delivery address" value={order.delivery_address || `${order.hall}, ${order.room}`} />
        <DetailRow icon={<Truck className="size-4" />} label="Payment" value={order.payment_method} />
        <DetailRow icon={<Package className="size-4" />} label="Total" value={formatNaira(order.total)} />
        <DetailRow icon={<Clock className="size-4" />} label="Placed" value={new Date(order.placed_at).toLocaleString()} />
      </div>

      <div className="card-soft p-4 mt-4">
        <div className="text-xs font-semibold text-foreground/70 mb-3">CONTACTS</div>
        <ContactRow
          avatar={shopAvatar}
          name={order.shop_name}
          sub={order.shop_area || "Shop"}
          location={order.shop_location || "Shop location not set"}
          phone={order.shop_phone ?? undefined}
          onChat={order.shop_phone ? () => setChatWith({ name: order.shop_name, avatar: shopAvatar }) : undefined}
          onCall={order.shop_phone ? (phone) => setCallWith({ name: order.shop_name, avatar: shopAvatar, phone }) : undefined}
        />
        <ContactRow
          avatar={riderAvatar}
          name={order.rider_name || "Waiting for rider"}
          sub={order.rider_phone ? "Rider assigned" : "No rider assigned yet"}
          location={getRiderStatusLabel(String(order.status))}
          phone={order.rider_phone ?? undefined}
          onChat={order.rider_phone ? () => setChatWith({ name: order.rider_name || "Rider", avatar: riderAvatar }) : undefined}
          onCall={order.rider_phone ? (phone) => setCallWith({ name: order.rider_name || "Rider", avatar: riderAvatar, phone }) : undefined}
        />
        <ContactRow
          avatar={studentAvatar}
          name="You"
          sub={profile?.location?.trim() || "Add delivery address"}
          location={profile?.location?.trim() || "Drop here when rider arrives"}
        />
      </div>

      {order.status === "Delivered" ? (
        <button
          type="button"
          onClick={handleConfirmReceipt}
          disabled={confirmingReceipt}
          className="mt-5 w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          {confirmingReceipt ? (
            <span className="inline-flex items-center justify-center gap-2">
              <LoaderCircle className="size-4 animate-spin" /> Confirming receipt
            </span>
          ) : (
            "Confirm receipt"
          )}
        </button>
      ) : order.status === "Student confirmed" ? (
        <div className="mt-5 rounded-2xl bg-primary-soft p-4 text-center text-sm font-semibold text-primary">
          Receipt confirmed. Thank you.
        </div>
      ) : null}

      <Link to="/student/orders" className="mt-5 block text-center py-3 rounded-2xl bg-secondary font-semibold text-sm">
        Back to orders
      </Link>

      {chatWith ? <ChatModal name={chatWith.name} avatar={chatWith.avatar} onClose={() => setChatWith(null)} /> : null}
      {callWith ? <CallModal name={callWith.name} avatar={callWith.avatar} phone={callWith.phone} onClose={() => setCallWith(null)} /> : null}
    </MobileShell>
  );
}

function getStepIndex(status: string) {
  switch (status) {
    case "Placed":
      return 0;
    case "Vendor confirmed":
      return 1;
    case "Rider en route to shop":
      return 2;
    case "Picked up":
      return 3;
    case "Picking items":
      return 3;
    case "Student contacted":
      return 4;
    case "Delivering":
      return 4;
    case "Delivered":
      return 5;
    case "Student confirmed":
      return 6;
    default:
      return 0;
  }
}

function getRiderStatusLabel(status: string) {
  switch (status) {
    case "Rider en route to shop":
      return "Rider is heading to the shop";
    case "Picked up":
      return "Order picked up from the shop";
    case "Picking items":
      return "Order picked up from the shop";
    case "Student contacted":
      return "Student has been contacted";
    case "Delivering":
      return "Student has been contacted";
    case "Delivered":
      return "Order delivered";
    default:
      return "We will show rider details once assigned";
  }
}

function getStatusNote(status: string) {
  switch (status) {
    case "Picked up":
      return "The rider has collected the order from the shop.";
    case "Student contacted":
      return "The rider has contacted the student and is on the way.";
    case "Delivering":
      return "The rider is delivering the order now.";
    case "Delivered":
      return "The order has been delivered.";
    case "Rider en route to shop":
      return "The rider is heading to the shop for pickup.";
    default:
      return "We will keep this updated as the order moves.";
  }
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-[0.7rem] text-foreground/60">{label}</div>
        <div className="text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

function ContactRow({
  avatar,
  name,
  sub,
  location,
  phone,
  onChat,
  onCall,
}: {
  avatar: string;
  name: string;
  sub: string;
  location: string;
  phone?: string;
  onChat?: () => void;
  onCall?: (phone: string) => void;
}) {
  return (
    <div className="py-3 flex items-center gap-3 border-b border-border/60 last:border-b-0">
      <div className="h-11 w-11 rounded-full bg-primary-soft flex items-center justify-center font-display text-lg shrink-0">
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{name}</div>
        <div className="text-xs text-foreground/60 truncate">{sub}</div>
        <div className="text-[0.7rem] text-foreground/70 mt-0.5 flex items-center gap-1 truncate">
          <MapPin className="size-3 shrink-0 text-primary" /> {location}
        </div>
      </div>
      {phone ? (
        <>
          <button
            type="button"
            onClick={onChat}
            className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center"
            aria-label={`Message ${name}`}
          >
            <MessageCircle className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onCall?.(phone)}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
            aria-label={`Call ${name}`}
          >
            <Phone className="size-4" />
          </button>
        </>
      ) : null}
    </div>
  );
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[440px] mx-auto sm:rounded-3xl rounded-t-3xl bg-background shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
        {children}
      </div>
    </div>
  );
}

function ChatModal({ name, avatar, onClose }: { name: string; avatar: string; onClose: () => void }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ from: "them", text: `Hi! This is ${name}. How can I help?`, at: timeNow() }]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = () => {
    const v = text.trim();
    if (!v) return;
    setMsgs((m) => [...m, { from: "me", text: v, at: timeNow() }]);
    setText("");
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "them", text: "Got it, thanks!", at: timeNow() }]);
    }, 900);
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
        <div className="h-10 w-10 rounded-full bg-primary-soft flex items-center justify-center font-display">{avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{name}</div>
          <div className="text-[0.7rem] text-primary flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" /> Online
          </div>
        </div>
        <button onClick={onClose} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center" aria-label="Close">
          <X className="size-4" />
        </button>
      </div>

      <div ref={scrollRef} className="h-[55vh] max-h-[420px] overflow-y-auto px-4 py-4 space-y-3 bg-secondary/30">
        {msgs.map((m, i) => (
          <div key={i} className={"flex " + (m.from === "me" ? "justify-end" : "justify-start")}>
            <div className={"max-w-[75%] px-3.5 py-2 rounded-2xl text-sm " + (m.from === "me" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-background border border-border/60 rounded-bl-md")}>
              <div>{m.text}</div>
              <div className={"text-[0.6rem] mt-0.5 " + (m.from === "me" ? "text-primary-foreground/70" : "text-foreground/50")}>{m.at}</div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="p-3 border-t border-border/60 flex items-center gap-2"
      >
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 h-11 px-4 rounded-full bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="size-4" />
        </button>
      </form>
    </ModalShell>
  );
}

function CallModal({ name, avatar, phone, onClose }: { name: string; avatar: string; phone: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="p-6 text-center">
        <div className="flex justify-end">
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        <div className="mx-auto mt-1 h-20 w-20 rounded-full bg-primary-soft flex items-center justify-center font-display text-3xl">
          {avatar}
        </div>
        <div className="mt-4 font-display text-xl">{name}</div>
        <div className="text-xs text-foreground/60">Tap the number to call</div>

        <a href={`tel:${phone}`} className="mt-5 block font-display text-2xl tracking-wide text-primary">
          {phone}
        </a>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={copy} className="h-12 rounded-2xl bg-secondary font-semibold text-sm inline-flex items-center justify-center gap-2">
            <Copy className="size-4" /> {copied ? "Copied!" : "Copy"}
          </button>
          <a href={`tel:${phone}`} className="h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center justify-center gap-2">
            <Phone className="size-4" /> Call now
          </a>
        </div>
      </div>
    </ModalShell>
  );
}

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
