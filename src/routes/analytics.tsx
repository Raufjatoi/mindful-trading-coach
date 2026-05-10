import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { MotionCard } from "@/components/ui/motion-card";
import {
  disciplineSeries, emotionDistribution, pnlByEmotion, behavioralPatterns,
} from "@/lib/mock";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — MindCandle" },
      { name: "description", content: "Discipline trend, emotion distribution, and behavioral patterns." },
      { property: "og:title", content: "MindCandle Analytics" },
      { property: "og:description", content: "Measure what matters." },
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

function Analytics() {
  return (
    <AppShell title="Analytics" subtitle="Process over outcome. Patterns over predictions.">
      <section className="grid gap-4 lg:grid-cols-3">
        <MotionCard className="lg:col-span-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Discipline · 7d</p>
          <h2 className="mt-1 font-display text-lg font-semibold">Trending up</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={disciplineSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={tipStyle} />
                <Line type="monotone" dataKey="score" stroke="var(--sage)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--sage)" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>

        <MotionCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Emotion mix · 30d</p>
          <h2 className="mt-1 font-display text-lg font-semibold">Mostly Calm</h2>
          <div className="mt-2 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emotionDistribution}
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {emotionDistribution.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1.5">
            {emotionDistribution.map((e) => (
              <li key={e.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
                  {e.name}
                </span>
                <span className="text-foreground">{e.value}%</span>
              </li>
            ))}
          </ul>
        </MotionCard>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <MotionCard className="lg:col-span-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">P&L by emotion</p>
          <h2 className="mt-1 font-display text-lg font-semibold">Calm pays. The others don't.</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlByEmotion} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mood" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tipStyle} cursor={{ fill: "var(--secondary)", opacity: 0.4 }} />
                <Bar dataKey="pnl" radius={[8, 8, 0, 0]}>
                  {pnlByEmotion.map((d) => (
                    <Cell key={d.mood} fill={d.pnl >= 0 ? "var(--sage)" : "var(--fear)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>

        <MotionCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Behavioral patterns</p>
          <h2 className="mt-1 font-display text-lg font-semibold">What we notice</h2>
          <ul className="mt-4 space-y-3">
            {behavioralPatterns.map((p, i) => (
              <motion.li
                key={p.title}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-border/40 bg-background/30 p-3"
              >
                <p className="text-sm font-medium">{p.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.detail}</p>
              </motion.li>
            ))}
          </ul>
        </MotionCard>
      </section>
    </AppShell>
  );
}
