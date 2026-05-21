import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MotionCard } from "@/components/ui/motion-card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  SelectGroup, SelectLabel, SelectSeparator,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type TradeEntry } from "@/lib/mock";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/trade")({
  head: () => ({
    meta: [{ title: "Trade Logger — MindCandle" }],
  }),
  component: TradeLogger,
});

type ActiveStrategy = {
  pair: string;
  start: string;
  end: string;
  max: number;
  amount: number;
  riskPct: number;
  payoutPct: number;
  currency: string;
};

function TradeLogger() {
  const { user } = useAuth();
  const [pair,        setPair]        = useState("EUR/USD");
  const [customPair,  setCustomPair]  = useState("");
  const [startTime,   setStart]       = useState("09:00");
  const [endTime,     setEnd]         = useState("17:00");
  const [maxTrades,   setMax]         = useState(2);
  const [amount,      setAmount]      = useState(50);
  const [riskPct,     setRisk]        = useState(100); // Risk per trade default 100%
  const [payoutPct,   setPayoutPct]   = useState(85);  // Benefit payout default 85%
  const [currency,    setCurrency]    = useState("$"); // Default currency selector
  const [strategy,    setStrat]       = useState<ActiveStrategy | null>(null);
  const [log,         setLog]         = useState<TradeEntry[]>([]);
  const idRef = useRef(100);

  // Load this user's trades for today from Supabase
  useEffect(() => {
    if (!supabase || !user) return;
    const today = new Date().toISOString().split("T")[0];
    supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00Z`)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) {
          setLog(
            data.map((t) => ({
              id: t.id,
              time: t.time,
              pair: t.pair,
              result: t.result as "win" | "loss",
              amount: t.amount,
              pnl: t.pnl,
            })),
          );
        }
      });
  }, [user]);

  // Auto-sync input fields to active strategy state in real-time
  useEffect(() => {
    if (!strategy) return;
    const resolvedPair = pair === "CUSTOM" ? (customPair.trim() || "Custom Pair") : pair;
    if (
      strategy.pair !== resolvedPair ||
      strategy.start !== startTime ||
      strategy.end !== endTime ||
      strategy.max !== maxTrades ||
      strategy.amount !== amount ||
      strategy.riskPct !== riskPct ||
      strategy.payoutPct !== payoutPct ||
      strategy.currency !== currency
    ) {
      setStrat({
        pair: resolvedPair,
        start: startTime,
        end: endTime,
        max: maxTrades,
        amount,
        riskPct,
        payoutPct,
        currency,
      });
    }
  }, [pair, customPair, startTime, endTime, maxTrades, amount, riskPct, payoutPct, currency, strategy]);

  // Helper to format money amounts based on the current currency symbol
  function formatMoney(amount: number, symbol: string) {
    const isLoss = amount < 0;
    const absVal = Math.abs(amount).toFixed(2);
    const space = symbol.length > 1 ? " " : "";
    return `${isLoss ? "-" : "+"}${symbol}${space}${absVal}`;
  }

  const dollarRisk = (amount * riskPct) / 100;
  const active     = strategy !== null;
  const limitHit   = active && log.length >= strategy.max;
  const wins       = log.filter((t) => t.result === "win").length;
  const losses     = log.filter((t) => t.result === "loss").length;
  const totalPnl   = log.reduce((s, t) => s + t.pnl, 0);

  function handleSet() {
    const resolvedPair = pair === "CUSTOM" ? (customPair.trim() || "Custom Pair") : pair;
    setStrat({
      pair: resolvedPair,
      start: startTime,
      end: endTime,
      max: maxTrades,
      amount,
      riskPct,
      payoutPct,
      currency,
    });
    setLog([]);
  }

  function handleResetSession() {
    setStrat(null);
    setLog([]);
  }

  async function logTrade(result: "win" | "loss") {
    if (!active || limitHit) return;
    const now  = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
    // Win PnL calculates based on the payoutPct percentage of trade amount
    // Loss PnL calculates based on the riskPct percentage of trade amount
    const payoutMultiplier = strategy!.payoutPct / 100;
    const riskMultiplier = strategy!.riskPct / 100;
    const pnl = result === "win"
      ? +(strategy!.amount * payoutMultiplier).toFixed(2)
      : -+(strategy!.amount * riskMultiplier).toFixed(2);

    const entry: TradeEntry = { id: idRef.current++, time, pair: strategy!.pair, result, amount: strategy!.amount, pnl };

    setLog((prev) => [...prev, entry]);

    if (supabase && user) {
      await supabase.from("trades").insert({
        user_id: user.id,
        time: entry.time,
        pair: entry.pair,
        result: entry.result,
        amount: entry.amount,
        pnl: entry.pnl,
      });
    }
  }

  return (
    <AppShell title="Trade Logger" subtitle="Set your rules. Stick to them. Log every trade.">
      <div className="space-y-5">
        {/* Strategy setup */}
        <MotionCard>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Session Configuration</p>
            {active && (
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--sage)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--sage)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sage)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--sage)]"></span>
                </span>
                <span>Live Sync Active</span>
              </div>
            )}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-xs text-muted-foreground font-medium">Asset / Pair</label>
              <Select value={pair} onValueChange={setPair}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Forex Pairs</SelectLabel>
                    <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                    <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                    <SelectItem value="USD/JPY">USD/JPY</SelectItem>
                    <SelectItem value="AUD/USD">AUD/USD</SelectItem>
                    <SelectItem value="USD/CAD">USD/CAD</SelectItem>
                    <SelectItem value="NZD/USD">NZD/USD</SelectItem>
                    <SelectItem value="USD/CHF">USD/CHF</SelectItem>
                    <SelectItem value="GBP/JPY">GBP/JPY</SelectItem>
                    <SelectItem value="AUD/NZD">AUD/NZD</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Cryptocurrencies</SelectLabel>
                    <SelectItem value="BTC/USD">BTC/USD (Bitcoin)</SelectItem>
                    <SelectItem value="ETH/USD">ETH/USD (Ethereum)</SelectItem>
                    <SelectItem value="SOL/USD">SOL/USD (Solana)</SelectItem>
                    <SelectItem value="XRP/USD">XRP/USD (Ripple)</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Other</SelectLabel>
                    <SelectItem value="CUSTOM">Custom Pair...</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground font-medium">Currency Symbol</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Real Currencies</SelectLabel>
                    <SelectItem value="$">$ (USD / Dollar)</SelectItem>
                    <SelectItem value="Rs.">Rs. (PKR / Pakistan)</SelectItem>
                    <SelectItem value="₹">₹ (INR / India)</SelectItem>
                    <SelectItem value="€">€ (EUR / Euro)</SelectItem>
                    <SelectItem value="£">£ (GBP / Pound)</SelectItem>
                    <SelectItem value="Rp">Rp (IDR / Rupiah)</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Demo Currencies</SelectLabel>
                    <SelectItem value="Demo Rp">Demo Rp (Demo Rupiah)</SelectItem>
                    <SelectItem value="Demo $">Demo $ (Demo Dollar)</SelectItem>
                    <SelectItem value="Demo Rs.">Demo Rs. (Demo PKR)</SelectItem>
                    <SelectItem value="Demo ₹">Demo ₹ (Demo INR)</SelectItem>
                    <SelectItem value="Demo">Demo (Demo Units)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium">Session Start</label>
              <Input type="time" value={startTime} onChange={(e) => setStart(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Session End</label>
              <Input type="time" value={endTime} onChange={(e) => setEnd(e.target.value)} className="mt-1.5" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium">Trade Amount ({currency})</label>
              <Input type="number" value={amount} min={1} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1.5" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium">Payout / Benefit (%)</label>
              <Input
                type="number"
                value={payoutPct}
                min={1}
                max={100}
                onChange={(e) => setPayoutPct(Number(e.target.value))}
                className="mt-1.5"
              />
              <div className="flex gap-2 mt-1.5">
                {[82, 85, 90].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPayoutPct(val)}
                    className={cn(
                      "px-2 py-0.5 text-[10px] rounded-full border transition-all duration-200 cursor-pointer",
                      payoutPct === val
                        ? "bg-[var(--sage)]/20 border-[var(--sage)] text-[var(--sage)] font-semibold"
                        : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
                    )}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium">Risk per Trade (%)</label>
              <Input
                type="number"
                value={riskPct}
                min={0.1}
                max={100}
                step={0.1}
                onChange={(e) => setRisk(Number(e.target.value))}
                className="mt-1.5"
              />
              <div className="flex gap-2 mt-1.5">
                {[50, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRisk(val)}
                    className={cn(
                      "px-2 py-0.5 text-[10px] rounded-full border transition-all duration-200 cursor-pointer",
                      riskPct === val
                        ? "bg-[var(--blush)]/20 border-[var(--blush)] text-[var(--blush)] font-semibold"
                        : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
                    )}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium">
                Max Trades: <span className="font-semibold text-foreground">{maxTrades}</span>
              </label>
              <input
                type="range" min={1} max={10} value={maxTrades}
                onChange={(e) => setMax(Number(e.target.value))}
                className="mt-3.5 w-full accent-[var(--sage)] cursor-pointer"
              />
            </div>
          </div>

          <AnimatePresence>
            {pair === "CUSTOM" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="border-t border-border/50 pt-3">
                  <label className="text-xs text-muted-foreground font-medium">Enter Custom Pair Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. USD/PKR, GBP/AUD, Gold, etc."
                    value={customPair}
                    onChange={(e) => setCustomPair(e.target.value.toUpperCase())}
                    className="mt-1.5 max-w-xs"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-5 border-t border-border/50 pt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Risk exposure: <span className="font-semibold text-[var(--fear)]">{currency}{currency.length > 1 ? " " : ""}{dollarRisk.toFixed(2)}</span> per trade ({riskPct}% risk)
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              {active && (
                <span className="text-xs text-muted-foreground font-medium mr-2">
                  All changes auto-save instantly
                </span>
              )}
              {active ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleResetSession}
                  className="rounded-full bg-[var(--blush)]/15 border border-[var(--blush)]/40 px-5 py-2 text-sm font-medium text-[var(--blush)] hover:bg-[var(--blush)]/20 transition cursor-pointer"
                >
                  Reset & Close Session
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSet}
                  className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition hover:opacity-90 shadow-md cursor-pointer"
                >
                  Start Trading Session
                </motion.button>
              )}
            </div>
          </div>
        </MotionCard>

        {/* Limit warning */}
        <AnimatePresence>
          {limitHit && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 rounded-2xl border border-[var(--fear)]/30 bg-[var(--fear)]/10 px-4 py-3 text-sm text-[var(--fear)] font-medium"
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
            className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-[#4ade80]/30 bg-[#4ade80]/10 py-12 text-[#4ade80] transition hover:bg-[#4ade80]/20 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
          >
            <CheckCircle2 className="h-14 w-14" />
            <span className="font-display text-3xl font-bold tracking-tight">WIN</span>
            {active && !limitHit && (
              <span className="text-xs opacity-75 font-semibold bg-[#4ade80]/20 px-2 py-0.5 rounded-full">
                {strategy!.max - log.length} left (+{strategy!.payoutPct}% Payout)
              </span>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!active || limitHit}
            onClick={() => logTrade("loss")}
            className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-[#f87171]/30 bg-[#f87171]/10 py-12 text-[#f87171] transition hover:bg-[#f87171]/20 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
          >
            <XCircle className="h-14 w-14" />
            <span className="font-display text-3xl font-bold tracking-tight">LOSS</span>
            {active && !limitHit && (
              <span className="text-xs opacity-75 font-semibold bg-[#f87171]/20 px-2 py-0.5 rounded-full">
                {strategy!.currency}{strategy!.currency.length > 1 ? " " : ""}{(strategy!.amount * (strategy!.riskPct / 100)).toFixed(2)} Risked (-{strategy!.riskPct}%)
              </span>
            )}
          </motion.button>
        </div>

        {!active && (
          <p className="text-center text-xs text-muted-foreground font-medium">Set your session configuration above to enable trade logging.</p>
        )}

        {/* Guest nudge — shown only when not logged in */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/40 px-4 py-3 text-sm"
          >
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">You're in guest mode.</span>{" "}
              Sign in to save your trades across sessions.
            </p>
            <Link
              to="/auth"
              className="shrink-0 rounded-xl bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition hover:opacity-90"
            >
              Sign In
            </Link>
          </motion.div>
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
                  {formatMoney(totalPnl, currency)}
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
                    <th className="px-2 py-2 font-normal">Asset / Pair</th>
                    <th className="px-2 py-2 font-normal">Result</th>
                    <th className="px-2 py-2 font-normal">Amount</th>
                    <th className="px-2 py-2 font-normal">P&L (Return)</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {log.map((t) => {
                      // Infer exact percentages if not explicitly saved (e.g. for mock data)
                      const inferredPct = Math.round((Math.abs(t.pnl) / t.amount) * 100);
                      const displayCurrency = currency; // Page-wide currency symbol

                      return (
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
                          <td className="px-2 py-2.5 text-muted-foreground">{displayCurrency}{displayCurrency.length > 1 ? " " : ""}{t.amount}</td>
                          <td className={cn("px-2 py-2.5 font-medium", t.pnl >= 0 ? "text-[var(--sage)]" : "text-[var(--fear)]")}>
                            <span className="block font-semibold">
                              {formatMoney(t.pnl, displayCurrency)}
                            </span>
                            <span className="text-xs opacity-80 block">
                              {t.pnl >= 0 ? `+${inferredPct}% Win` : `-${inferredPct}% Loss`}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
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

