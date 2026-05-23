import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Bike, GraduationCap, Store, Mail, Lock, User } from "lucide-react";

type Role = "student" | "vendor" | "rider";

const ROLES: { id: Role; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "student", label: "Student", icon: <GraduationCap className="size-4" />, desc: "Order foodstuff" },
  { id: "vendor", label: "Shop", icon: <Store className="size-4" />, desc: "Sell on campus" },
  { id: "rider", label: "Rider", icon: <Bike className="size-4" />, desc: "Deliver & earn" },
];

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: (s.mode as "signin" | "signup") ?? "signin",
    role: (s.role as Role) ?? "student",
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode, role: initialRole } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [role, setRole] = useState<Role>(initialRole);

  const enter = (r: Role) => navigate({ to: `/${r}` });

  return (
    <div className="min-h-screen flex justify-center bg-background">
      <div className="w-full max-w-md px-5 py-8">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="card-soft p-6">
          <h1 className="font-display text-2xl text-center">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-foreground/60 text-center mt-1">
            Demo mode — pick a role and jump in. No password needed.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  role === r.id
                    ? "border-primary bg-primary-soft"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-background/70">
                  {r.icon}
                </span>
                <div className="font-semibold text-sm mt-2">{r.label}</div>
                <div className="text-[11px] text-foreground/60 leading-tight">{r.desc}</div>
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enter(role);
            }}
            className="mt-5 space-y-3"
          >
            {mode === "signup" && (
              <Field icon={<User className="size-4" />}>
                <input placeholder="Your name (optional)" className="w-full bg-transparent outline-none text-sm" />
              </Field>
            )}
            <Field icon={<Mail className="size-4" />}>
              <input type="email" placeholder="Email (optional)" className="w-full bg-transparent outline-none text-sm" />
            </Field>
            <Field icon={<Lock className="size-4" />}>
              <input type="password" placeholder="Password (optional)" className="w-full bg-transparent outline-none text-sm" />
            </Field>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {mode === "signup" ? "Create account & continue" : "Sign in"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-foreground/40">
            <div className="h-px flex-1 bg-border" />
            quick access
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <Link
                key={r.id}
                to={`/${r.id}`}
                className="rounded-xl border border-border bg-background px-2 py-2 text-center text-xs font-semibold hover:bg-secondary"
              >
                {r.label}
              </Link>
            ))}
          </div>

          <div className="mt-5 text-center text-sm text-foreground/70">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary">
      <span className="text-foreground/50">{icon}</span>
      {children}
    </label>
  );
}
