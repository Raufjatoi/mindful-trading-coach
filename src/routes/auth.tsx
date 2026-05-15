import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { GradientOrbs } from "@/components/layout/GradientOrbs";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Sign In — MindCandle" }],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 34.1 29.4 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.7 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.1-2.7-.4-4z" />
      <path fill="#FF3D00" d="M6.3 14.7l7 5.1C15.1 15.3 19.2 12 24 12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.7 5.1 29.6 3 24 3 16.3 3 9.7 7.9 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.9 14.1-5.1l-6.5-5.5C29.5 36.4 26.9 37 24 37c-5.3 0-9.6-2.9-11.3-7H5.5C8.9 38.2 15.9 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.5 5.5C40.5 36.3 44 30.7 44 24c0-1.3-.1-2.7-.4-4z" />
    </svg>
  );
}

function AuthPage() {
  const [tab, setTab]       = useState<"signin" | "signup">("signin");
  const [email, setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect if already signed in (also handles Google OAuth callback)
  useEffect(() => {
    if (user) navigate({ to: "/time" });
  }, [user, navigate]);

  const reset = () => { setError(""); setSuccess(""); };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setBusy(true);
    try {
      if (tab === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        setSuccess("Account created — welcome to MindCandle!");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    reset();
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <GradientOrbs />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <img src="/logo.png" alt="MindCandle" className="h-10 w-10 rounded-xl object-cover shadow-soft" />
          <span className="font-display text-xl font-semibold tracking-tight">MindCandle</span>
        </Link>

        <div className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-soft backdrop-blur-xl">

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-border/60 bg-background/40 p-1">
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); reset(); }}
                className={cn(
                  "flex-1 rounded-lg py-2 text-sm font-medium transition",
                  tab === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-border/60 bg-background/40 py-2.5 text-sm font-medium transition hover:bg-secondary"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-[11px] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border/60 bg-background/40 py-2.5 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--sage)]"
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-border/60 bg-background/40 py-2.5 pl-9 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--sage)]"
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error   && <p className="text-xs text-[var(--fear)]">{error}</p>}
            {success && <p className="text-xs text-[var(--sage)]">{success}</p>}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Please wait…" : tab === "signin" ? "Sign In" : "Create Account"}
            </motion.button>
          </form>
        </div>

        {/* Guest link */}
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Just exploring?{" "}
          <Link
            to="/time"
            className="font-medium text-foreground underline underline-offset-2 transition hover:text-[var(--sage)]"
          >
            Continue as guest
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
