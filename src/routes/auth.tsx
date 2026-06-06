import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { Bike, GraduationCap, Store, Mail, Lock, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
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

async function ensureRoleAndRoute(role: Role, navigate: ReturnType<typeof useNavigate>) {
  // Add the selected role to this account (no-op if already present)
  await supabase.rpc("add_user_role", { _role: role });
  navigate({ to: `/${role}`, replace: true });
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
  const roleRef = useRef<Role>(initialRole);
  roleRef.current = role;

  // If already signed-in, route straight to dashboard with the chosen role.
  // Also handle the post-Google redirect via onAuthStateChange.
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled || !data.session) return;
      ensureRoleAndRoute(roleRef.current, navigate);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // defer to avoid running supabase calls inside the callback
        setTimeout(() => ensureRoleAndRoute(roleRef.current, navigate), 0);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter your email and password");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              display_name: name || email.split("@")[0],
              role,
            },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Welcome to Guorrow!");
          await ensureRoleAndRoute(role, navigate);
        } else {
          toast.success("Account created. Check your email to confirm.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        await ensureRoleAndRoute(role, navigate);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth`,
        extraParams: { prompt: "select_account" },
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      // onAuthStateChange will pick this up; nothing else to do.
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(msg);
      setLoading(false);
    }
  };

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
            {mode === "signup"
              ? "Pick how you'll use Guorrow, then sign up."
              : "Choose how you want to continue."}
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

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {mode === "signup" && (
              <Field icon={<User className="size-4" />}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </Field>
            )}
            <Field icon={<Mail className="size-4" />}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-transparent outline-none text-sm"
              />
            </Field>
            <Field icon={<Lock className="size-4" />}>
              <input
                type="password"
                required
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
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-foreground/40">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-secondary disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>

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

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.4 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.4 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.9 13.1-5l-6.1-5c-1.9 1.3-4.3 2-7 2-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.1 5c-.4.4 6.6-4.8 6.6-14.5 0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
