import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flame, Sparkles, BookHeart, LineChart, ArrowRight, ShieldCheck } from "lucide-react";
import { GradientOrbs } from "@/components/layout/GradientOrbs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindCandle — Trade your mind, not the market" },
      { name: "description", content: "An AI mentor for trading psychology. Build discipline, awareness, and emotional balance." },
      { property: "og:title", content: "MindCandle" },
      { property: "og:description", content: "An AI mentor for trading psychology." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Sparkles, title: "AI Coach", body: "A calm voice that helps you reset, reflect, and walk into every session prepared." },
  { icon: BookHeart, title: "Emotion Journal", body: "Capture mood, intention, and outcome. Patterns surface — gently." },
  { icon: LineChart, title: "Discipline Score", body: "Measure what matters. A daily score that rewards process, not P&L." },
];

const steps = [
  { n: "01", t: "Check in", d: "Two-minute morning ritual. Set one intention for the session." },
  { n: "02", t: "Trade aware", d: "Tag every trade with the emotion behind it. Friction breaks impulse." },
  { n: "03", t: "Reflect at close", d: "Your AI coach turns the day into one honest insight." },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <GradientOrbs />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--sage)] to-[var(--blush)] text-background">
            <Flame className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-semibold">MindCandle</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground sm:flex">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#voices" className="hover:text-foreground transition">Voices</a>
        </nav>
        <Link
          to="/dashboard"
          className="rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm backdrop-blur-xl hover:bg-card transition"
        >
          Open app
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur-xl">
            <ShieldCheck className="h-3 w-3 text-[var(--sage)]" />
            Built for beginner traders. Not gamblers.
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Trade your mind,
            <br />
            <span className="bg-gradient-to-r from-[var(--sage)] via-[var(--blush)] to-[var(--greed)] bg-clip-text text-transparent">
              not the market.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            MindCandle is the calm AI mentor that turns every session into a lesson in discipline,
            awareness, and emotional control.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              Begin your session
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/coach"
              className="rounded-full border border-border bg-card/40 px-5 py-3 text-sm backdrop-blur-xl hover:bg-card transition"
            >
              Talk to the coach
            </Link>
          </div>
        </motion.div>

        {/* preview card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <div className="relative rounded-3xl border border-border/60 bg-card/40 p-2 shadow-soft backdrop-blur-2xl">
            <div className="rounded-2xl bg-gradient-to-br from-card to-background p-6 sm:p-10">
              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  { l: "Discipline", v: "87", s: "/100", c: "var(--sage)" },
                  { l: "Emotion", v: "Calm", s: "", c: "var(--blush)" },
                  { l: "Awareness", v: "Focused", s: "", c: "var(--greed)" },
                ].map((s, i) => (
                  <motion.div
                    key={s.l}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="rounded-2xl border border-border/60 bg-background/50 p-5"
                  >
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</p>
                    <p className="mt-3 font-display text-3xl font-semibold" style={{ color: s.c }}>
                      {s.v}<span className="text-base text-muted-foreground">{s.s}</span>
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-border/60 bg-background/50 p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Reflection</p>
                <p className="mt-2 text-sm leading-relaxed">
                  "Your best trades happened when you waited for confirmation.
                  Notice the pattern — patience precedes profit."
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">A quieter way to trade.</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Three tools, designed to slow you down at exactly the right moments.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--sage)]/30 to-[var(--blush)]/30 text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-border/60 bg-card/30 p-8 backdrop-blur-xl sm:p-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="font-display text-sm text-[var(--sage)]">{s.n}</p>
                <h3 className="mt-2 font-display text-lg font-medium">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Voices */}
      <section id="voices" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { q: "I stopped revenge trading after two weeks. The morning ritual changed everything.", a: "Maya — 7 months trading" },
            { q: "It feels like a therapist that actually understands the screen.", a: "Theo — futures, beginner" },
          ].map((v) => (
            <div key={v.a} className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl">
              <p className="font-display text-lg leading-relaxed text-balance">"{v.q}"</p>
              <p className="mt-4 text-xs text-muted-foreground">{v.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} MindCandle. Trade slowly.</p>
          <p className="text-xs text-muted-foreground">Not financial advice. Built for emotional growth.</p>
        </div>
      </footer>
    </div>
  );
}
