import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";

export type NavItem = { to: string; label: string; icon: ReactNode };

export function MobileShell({
  children,
  nav,
  title,
  rightSlot,
}: {
  children: ReactNode;
  nav: NavItem[];
  title?: string;
  rightSlot?: ReactNode;
}) {
  const { location } = useRouterState();
  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen relative">
        <header className="sticky top-0 z-30 px-5 pt-5 pb-3 backdrop-blur-md bg-background/60 border-b border-border/50">
          <div className="flex items-center justify-between gap-2">
            <Logo to="/" />
            <div className="flex items-center gap-2">
              {rightSlot}
              <NotificationBell />
            </div>
          </div>
          {title && (
            <h1 className="font-display text-[1.7rem] mt-3 leading-tight">
              {title}
            </h1>
          )}
        </header>


        <main className="flex-1 px-5 pt-4 pb-28">{children}</main>

        <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-[456px] z-40">
          <div className="card-soft shadow-lg shadow-primary/10 px-2 py-2 flex items-center justify-around">
            {nav.map((n) => {
              const active =
                n.to === "/" + n.to.split("/")[1]
                  ? location.pathname === n.to ||
                    (n.to !== "/" && location.pathname.startsWith(n.to + "/"))
                  : location.pathname === n.to;
              const isExact = location.pathname === n.to;
              const matches =
                isExact ||
                (n.to.split("/").length === 3 &&
                  location.pathname.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={
                    "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[0.68rem] font-semibold transition-colors " +
                    (matches || active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {n.icon}
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
