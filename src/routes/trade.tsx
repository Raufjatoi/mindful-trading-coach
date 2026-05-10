import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MotionCard } from "@/components/ui/motion-card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { initialTradeLog, currencyPairs, type TradeEntry } from "@/lib/mock";

export const Route = createFileRoute("/trade")({
  head: () => ({
    meta: [{ title: "Trade Logger — MindCandle" }],
  }),
  component: TradeLogger,
});

type ActiveStrategy = { pair: string; start: string; end: string; max: number; amount: number; risk: number };

function TradeLogger() {
  const [pair,      setPair]   = useState("EUR/USD");
  const [startTime, setStart]  = useState("09:00");
  const [endTime,   setEnd]    = useState("17:00");
  const [maxTrades, setMax]    = useState(2);
  const [amount,    setAmount] = useState(50);
  const [riskPct,   setRisk]   = useState(2);
  const [strategy,  setStrat]  = useState<ActiveStrategy | null>(null);
  const [log,       setLog]    = useState<TradeEntry[]>(initialTradeLog);
  const idRef = useRef(100);

  const dollarRisk = (amount * riskPct) / 100;
  const active     = strategy !== null;
  const limitHit   = active && log.length >= strategy.max;
  const wins       = log.filter((t) => t.result === "win").length;
  const losses     = log.filter((t) => t.result === "loss").length;
  const totalPnl   = log.reduce((s, t) => s + t.pnl, 0);

  function handleSet() {
    setStrat({ pair, start: startTime, end: endTime, max: maxTrades, amount, risk: riskPct });
    setLog([]);
  }

  function logTrade(result: "win" | "loss") {
    if (!active || limitHit) return;
    const now  = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const pnl  = result === "win" ? +(amount * 1.9).toFixed(2) : -amount;
    setLog((prev) => [...prev, { id: idRef.current++, time, pair: strategy!.pair, result, amount, pnl }]);
  }

  return (
    <AppShell title="Trade Logger" subtitle="Set your rules. Stick to them. Log every trade.">
      <div className="space-y-5">
        {/* Strategy setup */}
        <MotionCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Strategy Setup</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-xs text-muted-foreground">Currency Pair</label>
              <Select value={pair} onValueChange={setPair}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currencyPairs.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Session Start</label>
              <Input type="time" value={startTime} onChange={(e) => setStart(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Session End</label>
              <Input type="time" value={endTime} onChange={(e) => setEnd(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Max Trades: <span className="font-medium text-foreground">{maxTrades}</span>
              </label>
              <input
                type="range" min={1} max={10} value={maxTrades}
                onChange={(e) => setMax(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--sage)]"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Trade Amount ($)</label>
              <Input type="number" value={amount} min={1} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1.5" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Risk per Trade (%)</label>
              <Input type="number" value={riskPct} min={0.1} max={100} step={0.1} onChange={(e) => setRisk(Number(e.target.value))} className="mt-1.5" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Dollar risk: <span className="font-medium text-[var(--fear)]">${dollarRisk.toFixed(2)}</span> per trade
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSet}
              className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-90"
            >
              Set Strategy
            </motion.button>
          </div>
        </MotionCard>

        {/* Limit warning */}
        <AnimatePresence>
          {limitHit && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 rounded-2xl border border-[var(--fear)]/30 bg-[var(--fear)]/10 px-4 py-3 text-sm text-[var(--fear)]"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Daily limit reached ({strategy?.max} trades). Stay disciplined — come back tomorrow.
            </motion.div>
          )}
        </AnimatePresence>

        {/* WIN / LOSS */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!active || limitHit}
            onClick={() => logTrade("win")}
            className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-[#4ade80]/30 bg-[#4ade80]/10 py-12 text-[#4ade80] transition hover:bg-[#4ade80]/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <CheckCircle2 className="h-14 w-14" />
            <span className="font-display text-3xl font-bold tracking-tight">WIN</span>
            {active && !limitHit && <span className="text-xs opacity-70">{strategy!.max - log.length} trades left</span>}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!active || limitHit}
            onClick={() => logTrade("loss")}
            className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-[#f87171]/30 bg-[#f87171]/10 py-12 text-[#f87171] transition hover:bg-[#f87171]/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <XCircle className="h-14 w-14" />
            <span className="font-display text-3xl font-bold tracking-tight">LOSS</span>
            {active && !limitHit && <span className="text-xs opacity-70">${amount} at risk</span>}
          </motion.button>
        </div>

        {!active && (
          <p className="text-center text-xs text-muted-foreground">Set your strategy above to enable trade logging.</p>
        )}

        {/* Log table */}
        <MotionCard>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Today's Log</p>
              <h2 className="mt-1 font-display text-lg font-semibold">
                <span className="text-[#4ade80]">{wins}W</span>
                <span className="mx-1 text-muted-foreground">/</span>
                <span className="text-[#f87171]">{losses}L</span>
                <span className="mx-2 text-muted-foreground">·</span>
                <span className={totalPnl >= 0 ? "text-[var(--sage)]" : "text-[var(--fear)]"}>
                  {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
                </span>
              </h2>
            </div>
          </div>

          {log.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No trades logged yet.</p>
          ) : (
            <div className="mt-4 -mx-2 overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-2 py-2 font-normal">Time</th>
                    <th className="px-2 py-2 font-normal">Pair</th>
                    <th className="px-2 py-2 font-normal">Result</th>
                    <th className="px-2 py-2 font-normal">Amount</th>
                    <th className="px-2 py-2 font-normal">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {log.map((t) => (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border-t border-border/50"
                      >
                        <td className="px-2 py-2.5 text-muted-foreground">{t.time}</td>
                        <td className="px-2 py-2.5 font-medium">{t.pair}</td>
                        <td className="px-2 py-2.5">
                          <span
                            className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={t.result === "win" ? { background: "#4ade8022", color: "#4ade80" } : { background: "#f8717122", color: "#f87171" }}
                          >
                            {t.result.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-muted-foreground">${t.amount}</td>
                        <td className={cn("px-2 py-2.5 font-medium", t.pnl >= 0 ? "text-[var(--sage)]" : "text-[var(--fear)]")}>
                          {t.pnl >= 0 ? "+" : ""}${Math.abs(t.pnl).toFixed(2)}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </MotionCard>
      </div>
    </AppShell>
  );
}
