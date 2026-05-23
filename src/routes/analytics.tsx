import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, TrendingUp, TrendingDown, Target, Flame } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MotionCard } from "@/components/ui/motion-card";
import { useAuth } from "@/contexts/auth";
import { supabase, type DbTrade } from "@/lib/supabase";
import { behavioralPatterns } from "@/lib/mock";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, Cell,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — MindCandle" },
      { name: "description", content: "Your real trade data, patterns, and performance." },
    ],
  }),
  component: Analytics,
});

const tipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--foreground)",
};

// ── Stat tile ─────────────────────────────────────────────────────────────────
function Stat({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string; sub?: string;
  icon: typeof TrendingUp; color: string;
}) {
  return (
    <MotionCard className="flex items-center gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `color-mix(in oklab,${color} 15%,transparent)` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-display text-xl font-semibold" style={{ color }}>{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      </div>
    </MotionCard>
  );
}

// ── Guest wall overlay ────────────────────────────────────────────────────────
function GuestWall() {
  return (
    <div className="relative">
      {/* Blurred placeholder charts */}
      <div className="pointer-events-none select-none blur-sm opacity-40 space-y-4">
        <section className="grid gap-4 lg:grid-cols-4">
          {["Win Rate", "Total P&L", "Trades", "Streak"].map((l) => (
            <MotionCard key={l}>
              <p className="text-xs text-muted-foreground">{l}</p>
              <p className="font-display text-2xl font-semibold mt-1">—</p>
            </MotionCard>
          ))}
        </section>
        <div className="h-48 rounded-2xl border border-border/60 bg-card/60" />
        <div className="h-40 rounded-2xl border border-border/60 bg-card/60" />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl">
        <div className="rounded-2xl border border-border/60 bg-card/90 p-8 text-center backdrop-blur-xl shadow-soft max-w-xs">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="font-display text-base font-semibold">Your analytics live here</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Sign in to see your real win rate, P&L curve, and trade patterns based on your actual logs.
          </p>
          <Link
            to="/auth"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Sign In or Create Account
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">Free — no credit card needed</p>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <MotionCard className="py-12 text-center">
      <p className="font-display text-base font-semibold">No trades logged yet</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Head to Trade Logger and log your first session — your analytics will appear here.
      </p>
      <Link
        to="/trade"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:opacity-90"
      >
        Go to Trade Logger
      </Link>
    </MotionCard>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function Analytics() {
  const { user } = useAuth();
  const [trades, setTrades]   = useState<DbTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!user || !supabase) { setLoading(false); return; }
    supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setTrades((data as DbTrade[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  async function handleReset() {
    if (!supabase || !user) return;
    setResetting(true);
    try {
      const { error } = await supabase
        .from("trades")
        .delete()
        .eq("user_id", user.id);
      
      if (error) throw error;
      setTrades([]);
    } catch (err) {
      console.error("Failed to reset trades:", err);
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  }

  // ── Derived stats ────────────────────────────────────────────────────────
  const wins     = trades.filter((t) => t.result === "win").length;
  const losses   = trades.filter((t) => t.result === "loss").length;
  const draws    = trades.filter((t) => t.result === "draw").length;
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  // Calculate win rate by ignoring neutral draws
  const activeTradesCount = wins + losses;
  const winRate  = activeTradesCount > 0 ? Math.round((wins / activeTradesCount) * 100) : 0;

  // Current win streak
  const streak = (() => {
    let s = 0;
    for (let i = trades.length - 1; i >= 0; i--) {
      if (trades[i].result === "win") s++;
      else break;
    }
    return s;
  })();

  // Cumulative P&L over time
  const pnlCurve = trades.reduce<{ label: string; cumPnl: number }[]>((acc, t, i) => {
    const prev = acc[acc.length - 1]?.cumPnl ?? 0;
    return [...acc, { label: `#${i + 1}`, cumPnl: +(prev + t.pnl).toFixed(2) }];
  }, []);

  // P&L by pair
  const pairMap: Record<string, { pair: string; pnl: number; trades: number }> = {};
  trades.forEach((t) => {
    if (!pairMap[t.pair]) pairMap[t.pair] = { pair: t.pair, pnl: 0, trades: 0 };
    pairMap[t.pair].pnl    += t.pnl;
    pairMap[t.pair].trades += 1;
  });
  const pairData = Object.values(pairMap).sort((a, b) => b.pnl - a.pnl);

  return (
    <AppShell title="Analytics" subtitle="Process over outcome. Patterns over predictions.">

      {/* ── Guest wall ── */}
      {!user && <GuestWall />}

      {/* ── Loading ── */}
      {user && loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-card/60" />
          ))}
        </div>
      )}

      {/* ── No trades yet ── */}
      {user && !loading && trades.length === 0 && <EmptyState />}

      {/* ── Real data ── */}
      {user && !loading && trades.length > 0 && (
        <div className="space-y-4">
          {/* Stat tiles */}
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Win Rate"
              value={`${winRate}%`}
              sub={`${wins}W / ${draws}D / ${losses}L`}
              icon={Target}
              color="var(--sage)"
            />
            <Stat
              label="Total P&L"
              value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`}
              sub={`${trades.length} trades`}
              icon={totalPnl >= 0 ? TrendingUp : TrendingDown}
              color={totalPnl >= 0 ? "var(--sage)" : "var(--fear)"}
            />
            <Stat
              label="Total Trades"
              value={`${trades.length}`}
              sub="all time"
              icon={TrendingUp}
              color="var(--muted-foreground)"
            />
            <Stat
              label="Win Streak"
              value={`${streak}`}
              sub="current"
              icon={Flame}
              color={streak >= 3 ? "var(--greed)" : "var(--muted-foreground)"}
            />
          </section>

          {/* Cumulative P&L curve */}
          <MotionCard>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Cumulative P&L</p>
            <h2 className="mt-1 font-display text-lg font-semibold">
              {totalPnl >= 0 ? "Growing" : "Drawdown"} — ${Math.abs(totalPnl).toFixed(2)}
            </h2>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pnlCurve} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tipStyle} formatter={(v: number) => [`$${v}`, "Cum. P&L"]} />
                  <Line
                    type="monotone"
                    dataKey="cumPnl"
                    stroke={totalPnl >= 0 ? "var(--sage)" : "var(--fear)"}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </MotionCard>

          {/* P&L by pair */}
          {pairData.length > 0 && (
            <section className="grid gap-4 lg:grid-cols-3">
              <MotionCard className="lg:col-span-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">P&L by Pair</p>
                <h2 className="mt-1 font-display text-lg font-semibold">Which pairs work for you</h2>
                <div className="mt-4 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pairData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="pair" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tipStyle} cursor={{ fill: "var(--secondary)", opacity: 0.4 }} formatter={(v: number) => [`$${v.toFixed(2)}`, "P&L"]} />
                      <Bar dataKey="pnl" radius={[8, 8, 0, 0]}>
                        {pairData.map((d) => (
                          <Cell key={d.pair} fill={d.pnl >= 0 ? "var(--sage)" : "var(--fear)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </MotionCard>

              {/* Pair breakdown */}
              <MotionCard>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Pair breakdown</p>
                <ul className="mt-3 space-y-2">
                  {pairData.map((d) => (
                    <motion.li
                      key={d.pair}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between rounded-xl border border-border/40 bg-background/30 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium">{d.pair}</p>
                        <p className="text-[11px] text-muted-foreground">{d.trades} trade{d.trades !== 1 ? "s" : ""}</p>
                      </div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: d.pnl >= 0 ? "var(--sage)" : "var(--fear)" }}
                      >
                        {d.pnl >= 0 ? "+" : ""}${d.pnl.toFixed(2)}
                      </p>
                    </motion.li>
                  ))}
                </ul>
              </MotionCard>
            </section>
          )}

          {/* Behavioral patterns — always shown */}
          <MotionCard>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Behavioral patterns</p>
            <h2 className="mt-1 font-display text-lg font-semibold">What we notice</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {behavioralPatterns.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl border border-border/40 bg-background/30 p-3"
                >
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.detail}</p>
                </motion.div>
              ))}
            </div>
          </MotionCard>

          {/* Danger Zone */}
          <MotionCard className="border-[var(--blush)]/20 bg-[var(--blush)]/[0.02]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--blush)] font-semibold">Danger Zone</p>
                <h3 className="mt-1 font-display text-base font-semibold text-foreground">Reset Trading History</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
                  Permanently delete all your logged trades. This will reset your win rate, P&L curves, streaks, and analytics tables. This action cannot be undone.
                </p>
              </div>
              
              <div className="shrink-0 flex items-center">
                {confirmReset ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-[var(--blush)]/10 p-1.5 border border-[var(--blush)]/25">
                    <button
                      onClick={handleReset}
                      disabled={resetting}
                      className="px-3.5 py-1.5 bg-[var(--blush)] hover:bg-[var(--blush)]/90 text-white text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      {resetting ? "Resetting..." : "Yes, Reset All"}
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      disabled={resetting}
                      className="px-3.5 py-1.5 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmReset(true)}
                    className="px-5 py-2.5 bg-[var(--blush)]/15 border border-[var(--blush)]/30 hover:bg-[var(--blush)]/25 text-[var(--blush)] rounded-2xl text-sm font-semibold transition cursor-pointer"
                  >
                    Start Over / Reset Analytics
                  </button>
                )}
              </div>
            </div>
          </MotionCard>
        </div>
      )}

      {/* Behavioral patterns for guests too (no blur needed) */}
      {!user && (
        <MotionCard className="mt-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Behavioral patterns</p>
          <h2 className="mt-1 font-display text-lg font-semibold">Common trader mistakes</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {behavioralPatterns.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-border/40 bg-background/30 p-3"
              >
                <p className="text-sm font-medium">{p.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.detail}</p>
              </motion.div>
            ))}
          </div>
        </MotionCard>
      )}
    </AppShell>
  );
}
