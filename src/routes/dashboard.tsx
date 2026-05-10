import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, Brain, Eye, Target, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MotionCard } from "@/components/ui/motion-card";
import { StatTile } from "@/components/ui/stat-tile";
import { MoodChip } from "@/components/ui/mood-chip";
import { aiReflections, recentTrades, moodTrendSeries, type Mood } from "@/lib/mock";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, Tooltip,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MindCandle" },
      { name: "description", content: "Your discipline, emotional state, and session awareness at a glance." },
      { property: "og:title", content: "MindCandle Dashboard" },
      { property: "og:description", content: "Discipline, awareness, and reflection." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell title="Good morning, Maya" subtitle="Sunday · Pre-market · Stay slow.">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Discipline Score" value={87} suffix="/100" delta="+4 this week" accent="sage" icon={<Activity className="h-4 w-4" />} hint="Process over outcome." />
        <StatTile label="Emotional State" value="Calm" delta="Steady · 2h" accent="blush" icon={<Brain className="h-4 w-4" />} hint="Breathing within range." />
        <StatTile label="Session Awareness" value="Focused" delta="Low impulsivity" accent="greed" icon={<Eye className="h-4 w-4" />} hint="0 hesitation flags." />
        <StatTile label="Daily Goal" value={2} suffix="/ 3 setups" delta="On track" accent="sage" icon={<Target className="h-4 w-4" />} hint="Wait for the third A+." />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <MotionCard className="lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Reflections</p>
              <h2 className="mt-1 font-display text-lg font-semibold">From your last session</h2>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--blush)]/15 text-[var(--blush)]">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <ul className="mt-5 space-y-4">
            {aiReflections.map((r, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex gap-3 rounded-xl border border-border/40 bg-background/30 p-4"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sage)]" />
                <p className="text-sm leading-relaxed text-foreground/90">{r}</p>
              </motion.li>
            ))}
          </ul>
        </MotionCard>

        <MotionCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Mood trend · 7d</p>
          <h2 className="mt-1 font-display text-lg font-semibold">Mostly calm</h2>
          <div className="mt-3 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodTrendSeries} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--sage)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--sage)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="calm" stroke="var(--sage)" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(["Calm", "Fear", "Revenge", "Greedy"] as Mood[]).map((m) => (
              <MoodChip key={m} mood={m} size="sm" />
            ))}
          </div>
        </MotionCard>
      </section>

      <section className="mt-6">
        <MotionCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Recent trades</p>
              <h2 className="mt-1 font-display text-lg font-semibold">Today's tape</h2>
            </div>
          </div>
          <div className="mt-4 -mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-2 py-2 font-normal">Time</th>
                  <th className="px-2 py-2 font-normal">Symbol</th>
                  <th className="px-2 py-2 font-normal">P&L</th>
                  <th className="px-2 py-2 font-normal">Entry mood</th>
                  <th className="px-2 py-2 font-normal">Exit mood</th>
                  <th className="px-2 py-2 font-normal">Discipline</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((t) => {
                  const positive = t.pnl >= 0;
                  return (
                    <tr key={t.id} className="border-t border-border/50">
                      <td className="px-2 py-3 text-muted-foreground">{t.time}</td>
                      <td className="px-2 py-3 font-medium">{t.symbol}</td>
                      <td className="px-2 py-3">
                        <span className={`inline-flex items-center gap-1 ${positive ? "text-[var(--sage)]" : "text-[var(--fear)]"}`}>
                          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          ${Math.abs(t.pnl).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-2 py-3"><MoodChip mood={t.entryMood as Mood} size="sm" /></td>
                      <td className="px-2 py-3"><MoodChip mood={t.exitMood as Mood} size="sm" /></td>
                      <td className="px-2 py-3 text-muted-foreground">{t.discipline}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </MotionCard>
      </section>
    </AppShell>
  );
}
