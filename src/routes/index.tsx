import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { ArrowRight, Bike, Store, GraduationCap, MapPin, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "guorrow — Foodstuff delivered to your hostel, fast." },
      {
        name: "description",
        content:
          "A campus marketplace where nearby foodstuff shops, students, and bicycle riders meet. Order rice by the milk cup. Get it at your door.",
      },
    ],
  }),
  component: Landing,
});

const roles = [
  {
    id: "student" as const,
    title: "I'm a Student",
    desc: "Browse shops, \nfill up your basket, track your rider.",
    icon: <GraduationCap className="size-5" />,
    tag: "Most popular",
    accent: "bg-primary-soft",
  },
  {
    id: "vendor" as const,
    title: "I run a Shop",
    desc: "List products with custom measurements & take orders.",
    icon: <Store className="size-5" />,
    accent: "bg-accent-soft",
  },
  {
    id: "rider" as const,
    title: "I ride a Bike",
    desc: "Pick up, deliver, earn. Toggle online and go.",
    icon: <Bike className="size-5" />,
    accent: "bg-secondary",
  },
];

function Landing() {
  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-[1100px] px-5 sm:px-10 py-6 sm:py-10">
        <header className="flex items-center justify-between">
          <Logo className="h-14 sm:h-16" />
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              search={{ mode: "signin", role: "student" }}
              className="text-sm font-semibold text-foreground/70 hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup", role: "student" }}
              className="inline-flex items-center gap-1 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Get started <ArrowRight className="size-4" />
            </Link>
          </div>
        </header>

        <section className="mt-4 sm:mt-6 grid sm:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <span className="chip">
              <Sparkles className="size-3.5" /> hyperlocal student marketplace
            </span>
            <h1 className="font-display text-[2.4rem] sm:text-[3.4rem] leading-[1.02] mt-4">
              Foodstuff at your{" "}
              <span className="relative inline-block">
                <span className="absolute inset-x-0 bottom-1 h-3 squiggle rounded-md -z-10" />
                hostel door
              </span>
              , fast.
            </h1>
            <p className="mt-4 text-foreground/70 text-[1.02rem] max-w-[44ch] whitespace-pre-line">
              From a milk-cup of rice to a full paint rubber of beans - order from
              nearby shops by the measure that makes sense to you. {"\n"}
              Your campus rider does the rest.
            </p>

            <div className="mt-7 grid sm:grid-cols-3 gap-3">
              {roles.map((r) => (
                <Link
                  key={r.id}
                  to="/auth"
                  search={{ mode: "signup", role: r.id }}
                  className={`card-soft p-4 hover:shadow-md transition-shadow group ${r.accent}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-background/70">
                      {r.icon}
                    </span>
                    {r.tag && <span className="chip">{r.tag}</span>}
                  </div>
                  <div className="mt-3 font-display text-lg">{r.title}</div>
                  <div className="text-xs text-foreground/70 mt-0.5">
                    {r.desc}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
                    Continue <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4 text-xs text-foreground/60">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" /> Campus-only delivery
              </span>
              <span>•</span>
              <span>Multi-shop Experience</span>
              <span>•</span>
              <span>Bulk Shopping</span>
            </div>
          </div>

          <div className="relative">
            <div className="card-soft p-5 rotate-[2deg] shadow-xl shadow-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-foreground/60">Your basket</div>
                  <div className="font-display text-xl">Mama Osas</div>
                </div>
                <span className="chip-accent chip">18 min</span>
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  { e: "🍚", n: "Local Rice", m: "Half paint", p: "₦4,400" },
                  { e: "🫘", n: "Honey Beans", m: "1 derica", p: "₦2,200" },
                  { e: "🌶️", n: "Pepper mix", m: "Blended sachet", p: "₦700" },
                ].map((x) => (
                  <li key={x.n} className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-xl bg-primary-soft inline-flex items-center justify-center text-lg">
                      {x.e}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium">{x.n}</div>
                      <div className="text-xs text-foreground/60">{x.m}</div>
                    </div>
                    <div className="font-semibold">{x.p}</div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-foreground/60 text-sm">Total</span>
                <span className="font-display text-lg">₦7,300</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-2 card-soft px-3 py-2 rotate-[-4deg] text-xs flex items-center gap-2 shadow">
              <Bike className="size-4 text-primary" /> Tunde is 3 min away
            </div>
          </div>
        </section>

        <footer className="mt-16 text-center text-xs text-foreground/50">
          © guorrow — built for Nigerian students. Your next market run starts here.
        </footer>
      </div>
    </div>
  );
}
