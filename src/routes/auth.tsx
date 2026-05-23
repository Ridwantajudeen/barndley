import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Logo } from "@/components/Logo";
import { Bike, GraduationCap, Store, Loader2, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

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

async function redirectByRole(navigate: ReturnType<typeof useNavigate>, userId: string, fallback: Role) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).limit(1).maybeSingle();
  let role: Role = (data?.role as Role) ?? fallback;

  // If user has no role yet (e.g. first Google sign-in), assign the chosen one.
  if (!data) {
    const pending = (localStorage.getItem("pending_role") as Role | null) ?? fallback;
    await supabase.from("user_roles").insert({ user_id: userId, role: pending });
    role = pending;
    localStorage.removeItem("pending_role");
  }
  navigate({ to: `/${role}` });
}

function AuthPage() {
  const { mode: initialMode, role: initialRole } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Already signed in? Route them to their dashboard.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session?.user) {
        redirectByRole(navigate, data.session.user.id, role);
      } else {
        setChecking(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) redirectByRole(navigate, session.user.id, role);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { display_name: name, role },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to verify, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    localStorage.setItem("pending_role", role);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth`,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

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
            {mode === "signup" ? "Pick how you'll use gomarkket" : "Sign in to continue"}
          </p>

          {mode === "signup" && (
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
          )}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-secondary disabled:opacity-50"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3 text-xs text-foreground/40">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <Field icon={<User className="size-4" />}>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </Field>
            )}
            <Field icon={<Mail className="size-4" />}>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-transparent outline-none text-sm"
              />
            </Field>
            <Field icon={<Lock className="size-4" />}>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent outline-none text-sm"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-foreground/70">
            {mode === "signup" ? "Already have an account?" : "New to gomarkket?"}{" "}
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

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6.2 5.2C41.6 35.6 44 30.2 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
