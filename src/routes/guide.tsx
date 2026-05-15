import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, TrendingUp, BookOpen } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MotionCard } from "@/components/ui/motion-card";
import { cn } from "@/lib/utils";
import { indicators, strategies } from "@/lib/mock";
import {
  rsiData, rsiFormula,
  macdData, macdFormula,
  emaData, emaFormula,
  bbData, bbFormula,
  srData, srFormula, srSupport, srResistance,
  fibData, fibFormula, fibLevels,
} from "@/lib/indicator-charts";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine, ComposedChart, Bar, Area, AreaChart,
} from "recharts";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [{ title: "Guide — MindCandle" }],
  }),
  component: Guide,
});

const tipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 11,
  color: "var(--foreground)",
};

const axisProps = {
  tick: { fill: "var(--muted-foreground)", fontSize: 10 },
  axisLine: false as const,
  tickLine: false as const,
};

// ── Per-indicator chart components ────────────────────────────────────────────

function RsiChart() {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">RSI Oscillator (0–100)</p>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rsiData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="i" hide />
            <YAxis domain={[0, 100]} ticks={[0, 30, 70, 100]} {...axisProps} />
            <Tooltip contentStyle={tipStyle} formatter={(v: number) => [`${v}`, "RSI"]} />
            {/* Overbought / oversold zones */}
            <ReferenceLine y={70} stroke="var(--fear)" strokeDasharray="4 3" strokeOpacity={0.7} label={{ value: "70", fill: "var(--fear)", fontSize: 9, position: "right" }} />
            <ReferenceLine y={30} stroke="var(--sage)" strokeDasharray="4 3" strokeOpacity={0.7} label={{ value: "30", fill: "var(--sage)", fontSize: 9, position: "right" }} />
            <Line type="monotone" dataKey="rsi" stroke="#60a5fa" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MacdChart() {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">MACD · Signal · Histogram</p>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={macdData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="i" hide />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tipStyle} />
            <ReferenceLine y={0} stroke="var(--border)" />
            <Bar dataKey="hist" radius={[2, 2, 0, 0]}
              fill="var(--sage)"
              // color by sign via Cell would need import — use a neutral color
            />
            <Line type="monotone" dataKey="macd"   stroke="#60a5fa" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="signal" stroke="#f472b6" strokeWidth={2} dot={false} strokeDasharray="4 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-[#60a5fa]" /> MACD</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-[#f472b6]" /> Signal</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-[var(--sage)]" /> Histogram</span>
      </div>
    </div>
  );
}

function EmaChart() {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Price · EMA 20 · EMA 50 (Golden Cross at bar 10)</p>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={emaData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="i" hide />
            <YAxis domain={[95, 130]} {...axisProps} />
            <Tooltip contentStyle={tipStyle} />
            <ReferenceLine x={10} stroke="var(--sage)" strokeDasharray="4 3" strokeOpacity={0.6} label={{ value: "✦ Cross", fill: "var(--sage)", fontSize: 9 }} />
            <Line type="monotone" dataKey="price" stroke="var(--foreground)" strokeWidth={1.5} dot={false} strokeOpacity={0.5} />
            <Line type="monotone" dataKey="ema20"  stroke="#facc15" strokeWidth={2}   dot={false} />
            <Line type="monotone" dataKey="ema50"  stroke="#f472b6" strokeWidth={2}   dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-[#facc15]" /> EMA 20</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-[#f472b6]" /> EMA 50</span>
      </div>
    </div>
  );
}

function BbChart() {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Price inside Bollinger Bands (squeeze at bars 9–12)</p>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={bbData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="i" hide />
            <YAxis domain={[88, 122]} {...axisProps} />
            <Tooltip contentStyle={tipStyle} />
            <Area type="monotone" dataKey="upper" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.08} strokeWidth={1.5} dot={false} />
            <Area type="monotone" dataKey="lower" stroke="#60a5fa" fill="var(--background)" fillOpacity={1}    strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="mid"   stroke="var(--muted-foreground)" strokeWidth={1} dot={false} strokeDasharray="3 3" />
            <Line type="monotone" dataKey="price" stroke="#facc15" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-[#facc15]" /> Price</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded bg-[#60a5fa]" /> Bands</span>
      </div>
    </div>
  );
}

function SrChart() {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Price bouncing between Support & Resistance</p>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={srData} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="i" hide />
            <YAxis domain={[96, 120]} {...axisProps} />
            <Tooltip contentStyle={tipStyle} />
            <ReferenceLine y={srResistance} stroke="var(--fear)"  strokeWidth={1.5} strokeDasharray="5 3" label={{ value: "Resistance", fill: "var(--fear)",  fontSize: 9, position: "right" }} />
            <ReferenceLine y={srSupport}    stroke="var(--sage)"  strokeWidth={1.5} strokeDasharray="5 3" label={{ value: "Support",    fill: "var(--sage)",  fontSize: 9, position: "right" }} />
            <Line type="monotone" dataKey="price" stroke="var(--foreground)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FibChart() {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Impulse → retracement to 61.8% golden ratio → continuation</p>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={fibData} margin={{ top: 4, right: 48, left: -28, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="i" hide />
            <YAxis domain={[96, 134]} {...axisProps} />
            <Tooltip contentStyle={tipStyle} />
            {fibLevels.map((lvl) => (
              <ReferenceLine
                key={lvl.label}
                y={lvl.price}
                stroke={lvl.color}
                strokeOpacity={0.6}
                strokeDasharray="4 3"
                label={{ value: lvl.label, fill: lvl.color, fontSize: 9, position: "right" }}
              />
            ))}
            <Line type="monotone" dataKey="price" stroke="var(--foreground)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const INDICATOR_CHARTS: Record<string, { chart: React.FC; formula: string[] }> = {
  rsi: { chart: RsiChart, formula: rsiFormula },
  macd: { chart: MacdChart, formula: macdFormula },
  ema: { chart: EmaChart, formula: emaFormula },
  bb: { chart: BbChart, formula: bbFormula },
  sr: { chart: SrChart, formula: srFormula },
  fib: { chart: FibChart, formula: fibFormula },
};

// ── Main component ────────────────────────────────────────────────────────────

function Guide() {
  const [view,     setView]     = useState<"indicators" | "strategies">("indicators");
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AppShell title="Guide" subtitle="Indicators, formulas, live charts, and strategies.">
      <div className="space-y-5">
        {/* Toggle */}
        <div className="flex gap-2">
          {([
            { v: "indicators", icon: BookOpen,   label: "Indicators" },
            { v: "strategies", icon: TrendingUp, label: "Strategies" },
          ] as const).map(({ v, icon: Icon, label }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium capitalize transition",
                view === v
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Indicators ── */}
        {view === "indicators" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {indicators.map((ind, i) => {
              const extra = INDICATOR_CHARTS[ind.id];
              const isOpen = expanded === ind.id;
              const Chart = extra?.chart;

              return (
                <motion.div
                  key={ind.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(isOpen && "sm:col-span-2 xl:col-span-2")}
                >
                  <MotionCard
                    interactive
                    className="cursor-pointer h-full"
                    onClick={() => setExpanded(isOpen ? null : ind.id)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {ind.category}
                        </span>
                        <p className="mt-2 font-display text-base font-semibold">{ind.name}</p>
                      </div>
                      <ChevronDown
                        className={cn(
                          "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ind.description}</p>

                    {/* Stats row */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: "Win Rate", value: `${ind.winRate}%`, color: "var(--sage)" },
                        { label: "Avg R:R",  value: `${ind.rr}:1` },
                        { label: "Samples",  value: `${ind.tries}` },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-xl bg-background/40 p-2">
                          <p className="text-[10px] text-muted-foreground">{label}</p>
                          <p className="font-display text-sm font-semibold" style={color ? { color } : {}}>
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-4">
                            {/* Formula block */}
                            {extra && (
                              <div className="rounded-xl border border-border/40 bg-background/50 p-3">
                                <p className="mb-2 text-[10px] uppercase tracking-wider text-[var(--greed)]">Formula</p>
                                <div className="space-y-0.5 font-mono text-[11px] leading-5 text-muted-foreground">
                                  {extra.formula.map((line, li) => (
                                    <p key={li} className={line.startsWith("  ") ? "pl-4" : ""}>
                                      {line || <br />}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Live chart */}
                            {Chart && (
                              <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                                <Chart />
                              </div>
                            )}

                            {/* Signal + Best when */}
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                                <p className="text-[10px] uppercase tracking-wider text-[var(--blush)]">Signal Rule</p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ind.signal}</p>
                              </div>
                              <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                                <p className="text-[10px] uppercase tracking-wider text-[var(--sage)]">Best When</p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ind.bestWhen}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </MotionCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Strategies ── */}
        {view === "strategies" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {strategies.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <MotionCard>
                  <div className="flex items-start justify-between">
                    <p className="font-display text-base font-semibold">{s.name}</p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px]"
                      style={
                        s.risk === "Low"
                          ? { background: "color-mix(in oklab,var(--sage)  15%,transparent)", color: "var(--sage)"  }
                          : s.risk === "Medium"
                          ? { background: "color-mix(in oklab,var(--greed) 15%,transparent)", color: "var(--greed)" }
                          : { background: "color-mix(in oklab,var(--fear)  15%,transparent)", color: "var(--fear)"  }
                      }
                    >
                      {s.risk} Risk
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.indicators.map((ind) => (
                      <span key={ind} className="rounded border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                        {ind}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[var(--sage)]">Entry</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.entry}</p>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[var(--blush)]">Exit</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.exit}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl bg-background/40 p-2">
                      <p className="text-[10px] text-muted-foreground">Win Rate</p>
                      <p className="font-display text-sm font-semibold text-[var(--sage)]">{s.winRate}%</p>
                    </div>
                    <div className="rounded-xl bg-background/40 p-2">
                      <p className="text-[10px] text-muted-foreground">Avg R:R</p>
                      <p className="font-display text-sm font-semibold">{s.rr}:1</p>
                    </div>
                  </div>
                </MotionCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
