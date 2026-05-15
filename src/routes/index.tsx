import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, MessageSquare, BookOpen,
  LineChart, Newspaper, GraduationCap, PenTool, ShieldCheck,
} from "lucide-react";
import { GradientOrbs } from "@/components/layout/GradientOrbs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindCandle — Trade your mind, not the market" },
      { name: "description", content: "AI-powered trading psychology coach. Log trades, spot patterns, chat with Gemma 4 AI." },
      { property: "og:title", content: "MindCandle" },
      { property: "og:description", content: "AI mentor for trading discipline and emotional control." },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: MessageSquare,
    title: "AI Mentor Chat",
    body: "Talk to Mentor — a Gemma 4-powered coach that helps you break FOMO, revenge trading, and impulse decisions in real time.",
    to: "/chat",
  },
  {
    icon: BookOpen,
    title: "Trade Logger",
    body: "Log every trade with pair, P&L, emotion tag, and notes. Build a habit of reflecting on process, not just outcome.",
    to: "/trade",
  },
  {
    icon: LineChart,
    title: "Analytics",
    body: "See your real win rate, cumulative P&L curve, and which pairs actually work for you — all from your logged sessions.",
    to: "/analytics",
  },
  {
    icon: Newspaper,
    title: "Market Intelligence",
    body: "Live financial news from Finnhub across forex, stocks, and crypto. AI scans the feed and surfaces actionable patterns.",
    to: "/news",
  },
  {
    icon: GraduationCap,
    title: "Indicator Guide",
    body: "Visual, interactive guides for RSI, MACD, EMA, Bollinger Bands, Support/Resistance, and Fibonacci — with real charts.",
    to: "/guide",
  },
  {
    icon: PenTool,
    title: "Chart Canvas",
    body: "Upload a chart screenshot and annotate it with pen, arrows, shapes, and notes. Download your marked-up analysis.",
    to: "/trade",
  },
];

const steps = [
  { n: "01", t: "Create your free account", d: "Sign up with email or Google — no credit card, no subscription." },
  { n: "02", t: "Log your trades", d: "After each session, record the pair, result, P&L, and how you felt." },
  { n: "03", t: "Chat with the AI coach", d: "Describe what happened. Mentor reflects it back and asks the right question." },
  { n: "04", t: "Review and grow", d: "Analytics surface your real patterns. Guide keeps your edge sharp." },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <GradientOrbs />

      {/* ── Header ── */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="MindCandle" className="h-12 w-12 rounded-xl object-cover" />
          <span className="font-display text-lg font-semibold">MindCandle</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground sm:flex">
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#how" className="transition hover:text-foreground">How it works</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm backdrop-blur-xl transition hover:bg-card"
          >
            Sign in
          </Link>
          <Link
            to="/time"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            Open app
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pb-32 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur-xl">
            <ShieldCheck className="h-3 w-3 text-[var(--sage)]" />
            Powered by Gemma 4 AI · Free to use
          </span>
          <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Trade your mind,
            <br />
            <span className="bg-gradient-to-r from-[var(--sage)] via-[var(--blush)] to-[var(--greed)] bg-clip-text text-transparent">
              not the market.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            MindCandle gives you an AI mentor, a trade journal, live market news, and
            analytics — all designed to build emotional discipline, not just screen time.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/chat"
              className="rounded-full border border-border bg-card/40 px-5 py-3 text-sm backdrop-blur-xl transition hover:bg-card"
            >
              Try the AI coach
            </Link>
          </div>
        </motion.div>

        {/* Preview strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <div className="relative rounded-3xl border border-border/60 bg-card/40 p-2 shadow-soft backdrop-blur-2xl">
            <div className="rounded-2xl bg-gradient-to-br from-card to-background p-6 sm:p-10">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { l: "Win Rate",      v: "62%",      s: "34W · 21L",         c: "var(--sage)"             },
                  { l: "Market Pulse",  v: "Bullish",  s: "58% of live news",  c: "var(--greed)"            },
                  { l: "AI Patterns",   v: "4 found",  s: "from news scan",    c: "var(--blush)"            },
                ].map((s, i) => (
                  <motion.div
                    key={s.l}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="rounded-2xl border border-border/60 bg-background/50 p-5"
                  >
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</p>
                    <p className="mt-3 font-display text-3xl font-semibold" style={{ color: s.c }}>{s.v}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.s}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-border/60 bg-background/50 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--sage)]" />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Mentor says</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed">
                  "Your last three losses happened in the first 15 minutes of the session.
                  What would change if you waited for the open to settle before entering?"
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Six tools. One goal.
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Everything you need to trade with awareness — no noise, no subscriptions, no upsell.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -3 }}
              >
                <Link
                  to={f.to as "/"}
                  className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl transition hover:border-border hover:bg-card/70"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--sage)]/20 to-[var(--blush)]/20 text-foreground transition group-hover:from-[var(--sage)]/30 group-hover:to-[var(--blush)]/30">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  <span className="mt-4 flex items-center gap-1 text-xs text-muted-foreground transition group-hover:text-foreground">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-border/60 bg-card/30 p-8 backdrop-blur-xl sm:p-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">Four steps. Five minutes a day.</p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="font-display text-sm text-[var(--sage)]">{s.n}</p>
                <h3 className="mt-2 font-display text-base font-medium">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-border/60 bg-gradient-to-br from-card/60 to-background/60 p-10 text-center backdrop-blur-xl sm:p-16"
        >
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Ready to trade with a calmer mind?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Free account. No credit card. Start in 30 seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              Create free account
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/time"
              className="rounded-full border border-border bg-card/40 px-6 py-3 text-sm backdrop-blur-xl transition hover:bg-card"
            >
              Browse as guest
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="MindCandle" className="h-10 w-10 rounded-lg object-cover opacity-80" />
            <span className="font-display text-sm font-semibold text-muted-foreground">MindCandle</span>
          </Link>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} MindCandle. Trade slowly.</p>
          <p className="text-xs text-muted-foreground">Not financial advice. Built for emotional growth.</p>
        </div>
      </footer>
    </div>
  );
}
