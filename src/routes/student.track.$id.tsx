import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { studentNav } from "@/components/StudentNav";
import { orderStages } from "@/lib/mock";
import { Bike, Phone, MessageCircle, Check, MapPin, X, Send, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/student/track/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Tracking ${params.id} — Campus Basket` }],
  }),
  component: TrackPage,
});

type ChatMsg = { from: "me" | "them"; text: string; at: string };

function TrackPage() {
  const { id } = Route.useParams();
  const [stage, setStage] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setStage((s) => Math.min(orderStages.length - 1, s + 1)), 3500);
    return () => clearInterval(t);
  }, []);

  const [chatWith, setChatWith] = useState<null | { name: string; avatar: string }>(null);
  const [callWith, setCallWith] = useState<null | { name: string; avatar: string; phone: string }>(null);

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
          onChat={() => setChatWith({ name: "Tunde A.", avatar: "T" })}
          onCall={(p) => setCallWith({ name: "Tunde A.", avatar: "T", phone: p })}
        />

        <ContactRow
          avatar="🥬"
          name="Mama Osas Foodstuff"
          sub="Open · ⭐ 4.8 (312)"
          location="Block 4, North Gate Market"
          phone="+234 802 990 1245"
          onChat={() => setChatWith({ name: "Mama Osas Foodstuff", avatar: "🥬" })}
          onCall={(p) => setCallWith({ name: "Mama Osas Foodstuff", avatar: "🥬", phone: p })}
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

      {chatWith && (
        <ChatModal
          name={chatWith.name}
          avatar={chatWith.avatar}
          onClose={() => setChatWith(null)}
        />
      )}
      {callWith && (
        <CallModal
          name={callWith.name}
          avatar={callWith.avatar}
          phone={callWith.phone}
          onClose={() => setCallWith(null)}
        />
      )}
    </MobileShell>
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
          <button
            type="button"
            onClick={onChat}
            className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center"
            aria-label={`Message ${name}`}
          >
            <MessageCircle className="size-4"/>
          </button>
          <button
            type="button"
            onClick={() => onCall?.(phone)}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
            aria-label={`Call ${name}`}
          >
            <Phone className="size-4"/>
          </button>
        </>
      )}
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
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { from: "them", text: `Hi! This is ${name}. How can I help?`, at: timeNow() },
  ]);
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
            <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block"/> Online
          </div>
        </div>
        <button onClick={onClose} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center" aria-label="Close">
          <X className="size-4"/>
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
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="p-3 border-t border-border/60 flex items-center gap-2"
      >
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 h-11 px-4 rounded-full bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="size-4"/>
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
    } catch {/* noop */}
  };
  return (
    <ModalShell onClose={onClose}>
      <div className="p-6 text-center">
        <div className="flex justify-end">
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center" aria-label="Close">
            <X className="size-4"/>
          </button>
        </div>
        <div className="mx-auto mt-1 h-20 w-20 rounded-full bg-primary-soft flex items-center justify-center font-display text-3xl">
          {avatar}
        </div>
        <div className="mt-4 font-display text-xl">{name}</div>
        <div className="text-xs text-foreground/60">Tap the number to call</div>

        <a
          href={`tel:${phone}`}
          className="mt-5 block font-display text-2xl tracking-wide text-primary"
        >
          {phone}
        </a>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={copy}
            className="h-12 rounded-2xl bg-secondary font-semibold text-sm inline-flex items-center justify-center gap-2"
          >
            <Copy className="size-4"/> {copied ? "Copied!" : "Copy"}
          </button>
          <a
            href={`tel:${phone}`}
            className="h-12 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center justify-center gap-2"
          >
            <Phone className="size-4"/> Call now
          </a>
        </div>
      </div>
    </ModalShell>
  );
}

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
