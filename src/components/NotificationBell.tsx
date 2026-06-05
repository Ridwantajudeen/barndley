import { Bell, X, Package, Sparkles, Wallet, Store, Bike } from "lucide-react";
import { useState, type ReactNode } from "react";

type Notif = {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: ReactNode;
  unread?: boolean;
};

const NOTIFS: Notif[] = [
  {
    id: "n1",
    title: "Bundle order on the way",
    body: "Your rider Tunde just picked up from Mama Osas. 2 stops left in your Ekosodin bundle.",
    time: "2 min ago",
    icon: <Sparkles className="size-4 text-accent" />,
    unread: true,
  },
  {
    id: "n2",
    title: "Order delivered",
    body: "CB-1031 from Iya Bunmi Vegetables was delivered. Rate your rider Mary E.",
    time: "1 hr ago",
    icon: <Package className="size-4 text-primary" />,
    unread: true,
  },
  {
    id: "n3",
    title: "Payout sent",
    body: "₦4,200 has been credited to your wallet for trips on Monday.",
    time: "Yesterday",
    icon: <Wallet className="size-4 text-foreground/70" />,
  },
  {
    id: "n4",
    title: "New shop nearby",
    body: "Nselu Fresh Market just joined Campus Basket. Bulk produce, 18 km away.",
    time: "2 days ago",
    icon: <Store className="size-4 text-foreground/70" />,
  },
  {
    id: "n5",
    title: "Rider request available",
    body: "REQ-773 — 3-shop bundle in Ekosodin paying ₦1,450.",
    time: "2 days ago",
    icon: <Bike className="size-4 text-foreground/70" />,
  },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unread = NOTIFS.filter((n) => n.unread).length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Notifications"
        className="relative h-9 w-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-foreground text-[0.6rem] font-bold flex items-center justify-center border-2 border-background">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-background rounded-b-3xl w-full max-w-[480px] shadow-2xl max-h-[80vh] flex flex-col"
          >
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border/60">
              <div>
                <div className="font-display text-lg leading-tight">Notifications</div>
                <div className="text-xs text-foreground/60">
                  {unread > 0 ? `${unread} unread` : "You're all caught up"}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto divide-y divide-border/60">
              {NOTIFS.map((n) => (
                <li
                  key={n.id}
                  className={
                    "px-5 py-3 flex items-start gap-3 " +
                    (n.unread ? "bg-primary-soft/30" : "")
                  }
                >
                  <div className="h-9 w-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-sm">{n.title}</div>
                      {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    </div>
                    <div className="text-xs text-foreground/70 mt-0.5">{n.body}</div>
                    <div className="text-[0.65rem] text-foreground/50 mt-1">{n.time}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-5 py-3 border-t border-border/60 text-center">
              <button className="text-xs font-semibold text-primary">Mark all as read</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
