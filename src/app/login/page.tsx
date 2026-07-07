"use client";

import { useState } from "react";
import Link from "next/link";
import { Chrome, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useT } from "@/lib/i18n";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const t = useT();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);

    let supabase: ReturnType<typeof createSupabaseBrowserClient>;
    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      setError("Supabase keys are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  async function submitEmailPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    let supabase: ReturnType<typeof createSupabaseBrowserClient>;
    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      setError("Supabase keys are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
      setLoading(false);
      return;
    }

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm your account, then sign in.");
      return;
    }

    window.location.href = "/services";
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-9rem)] w-full max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[1fr_440px]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-saffron-dark">
          {t("auth.kicker", "Citizen access")}
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("auth.title", "Sign in to track civic services securely.")}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
          {t(
            "auth.subtitle",
            "Use Google or email/password. Passwords are handled by Supabase Auth, which hashes and stores credentials securely outside the app database."
          )}
        </p>
        <div className="mt-8 grid max-w-xl gap-3 text-sm text-muted sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-white p-4">
            <strong className="block text-foreground">Google OAuth</strong>
            One-click sign in
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <strong className="block text-foreground">Email auth</strong>
            Supabase hashed passwords
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <strong className="block text-foreground">RLS ready</strong>
            User-owned records
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="tricolor-bar h-1 w-full" />
        <div className="p-6">
          <div className="grid grid-cols-2 rounded-xl bg-surface p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                mode === "signin" ? "bg-white text-foreground shadow-sm" : "text-muted"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                mode === "signup" ? "bg-white text-foreground shadow-sm" : "text-muted"
              }`}
            >
              Sign up
            </button>
          </div>

          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            disabled={loading}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-50"
          >
            <Chrome className="h-4 w-4" />
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={(event) => void submitEmailPassword(event)} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Email</span>
              <span className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 focus-within:ring-2 focus-within:ring-saffron/40">
                <Mail className="h-4 w-4 text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Password</span>
              <span className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 focus-within:ring-2 focus-within:ring-saffron/40">
                <Lock className="h-4 w-4 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
                  placeholder="Minimum 6 characters"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-muted hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-xl border border-green/20 bg-green/5 px-3 py-2 text-sm text-green">
                {message}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {mode === "signin" ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-5 text-center text-xs leading-5 text-muted">
            By continuing, you use Supabase Auth. This app does not store raw
            passwords in `profiles` or any public table.
          </p>
          <p className="mt-3 text-center text-sm">
            <Link href="/services" className="font-medium text-navy hover:underline">
              Continue with demo data
            </Link>
          </p>
        </div>
      </Card>
    </section>
  );
}
