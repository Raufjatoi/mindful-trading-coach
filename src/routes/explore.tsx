import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Sparkles, BookOpen, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MotionCard } from "@/components/ui/motion-card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  SelectGroup, SelectLabel, SelectSeparator,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [{ title: "Explore Sandbox — MindCandle" }],
  }),
  component: ExploreSandbox,
});

type DbExploreTrade = {
  id: number;
  created_at: string;
  pair: string;
  duration: string;
  result: "win" | "loss" | "draw";
  amount: number;
  pnl: number;
  notes: string;
};

function ExploreSandbox() {
  const { user } = useAuth();
  const [pair, setPair] = useState("EUR/USD");
  const [customPair, setCustomPair] = useState("");
  const [duration, setDuration] = useState("1 min");
  const [amount, setAmount] = useState<number>(50);
  const [result, setResult] = useState<"win" | "loss" | "draw">("win");
  const [notes, setNotes] = useState("");
  
  const [exploreLogs, setExploreLogs] = useState<DbExploreTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Load explore trades (Supabase for users, LocalStorage for guests)
  useEffect(() => {
    if (user) {
      if (!supabase) { setLoading(false); return; }
      supabase
        .from("explore_trades")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setExploreLogs((data as DbExploreTrade[]) ?? []);
          setLoading(false);
        });
    } else {
      // Guest offline storage loader (SSR-safe)
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("mtc_guest_explore");
        setExploreLogs(saved ? JSON.parse(saved) : []);
      }
      setLoading(false);
    }
  }, [user]);

  // Sync Guest logs to localStorage
  useEffect(() => {
    if (user || typeof window === "undefined") return;
    localStorage.setItem("mtc_guest_explore", JSON.stringify(exploreLogs));
  }, [exploreLogs, user]);

  const currentCapital = 500 + exploreLogs.reduce((s, t) => s + t.pnl, 0);
  const isCapitalWiped = currentCapital <= 0;

  async function handleLogTrade(e: React.FormEvent) {
    e.preventDefault();
    if (isCapitalWiped || submitting) return;
    
    setSubmitting(true);
    const resolvedPair = pair === "CUSTOM" ? (customPair.trim() || "Custom Pair") : pair;
    
    // Simulate Payouts: Win (+85% payout standard), Loss (-100% amount), Draw (+$0.00 returns)
    const pnl = result === "win"
      ? +(amount * 0.85).toFixed(2)
      : result === "loss"
      ? -amount
      : 0;

    const newTrade: Partial<DbExploreTrade> & { user_id?: string } = {
      pair: resolvedPair,
      duration,
      result,
      amount,
      pnl,
      notes: notes.trim(),
    };

    if (user && supabase) {
      newTrade.user_id = user.id;
      try {
        const { data, error } = await supabase
          .from("explore_trades")
          .insert(newTrade)
          .select();
        
        if (error) throw error;
        if (data) {
          setExploreLogs((prev) => [data[0] as DbExploreTrade, ...prev]);
          setNotes("");
          setCustomPair("");
        }
      } catch (err) {
        console.error("Failed to insert explore trade:", err);
      } finally {
        setSubmitting(false);
      }
    } else {
      // Guest local state logger
      const mockTrade: DbExploreTrade = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        pair: resolvedPair,
        duration,
        result,
        amount,
        pnl,
        notes: notes.trim(),
      };
      setExploreLogs((prev) => [mockTrade, ...prev]);
      setNotes("");
      setCustomPair("");
      setSubmitting(false);
    }
  }

  async function handleResetSandbox() {
    setResetting(true);
    if (user && supabase) {
      try {
        const { error } = await supabase
          .from("explore_trades")
          .delete()
          .eq("user_id", user.id);
        
        if (error) throw error;
        setExploreLogs([]);
      } catch (err) {
        console.error("Failed to delete explore trades:", err);
      } finally {
        setResetting(false);
        setConfirmReset(false);
      }
    } else {
      // Guest local storage reset
      if (typeof window !== "undefined") {
        localStorage.removeItem("mtc_guest_explore");
      }
      setExploreLogs([]);
      setResetting(false);
      setConfirmReset(false);
    }
  }

  async function handleDeleteExploreTrade(tradeId: number) {
    setExploreLogs((prev) => prev.filter((t) => t.id !== tradeId));
    if (user && supabase) {
      try {
        await supabase
          .from("explore_trades")
          .delete()
          .eq("id", tradeId)
          .eq("user_id", user.id);
      } catch (err) {
        console.error("Failed to delete explore trade:", err);
      }
    }
  }

  function formatMoney(amount: number) {
    const isLoss = amount < 0;
    return `${isLoss ? "-" : "+"}$${Math.abs(amount).toFixed(2)}`;
  }

  return (
    <AppShell title="Explore Sandbox" subtitle="Take calculated demo risk. Identify timings, test rules, and log emotional insights.">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Side: Logger Configurator & Table */}
        <div className="space-y-6">
          <MotionCard>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Simulated Trade Logger</p>
            <h2 className="mt-1 font-display text-lg font-semibold">Log Sandbox Trial</h2>
            
            <form onSubmit={handleLogTrade} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Pair selection */}
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
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Cryptocurrencies</SelectLabel>
                        <SelectItem value="BTC/USD">BTC/USD (Bitcoin)</SelectItem>
                        <SelectItem value="ETH/USD">ETH/USD (Ethereum)</SelectItem>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Other</SelectLabel>
                        <SelectItem value="CUSTOM">Custom Pair...</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Overridden wagers durations */}
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Wager Duration</label>
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {["15s", "30s", "1m", "2m", "5m", "1h"].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setDuration(dur)}
                        className={cn(
                          "px-2.5 py-1 text-xs rounded-full border transition-all duration-200 cursor-pointer font-medium",
                          duration === dur
                            ? "bg-[var(--sage)]/25 border-[var(--sage)] text-[var(--sage)] font-semibold"
                            : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
                        )}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {pair === "CUSTOM" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="text-xs text-muted-foreground font-medium">Custom Asset Name</label>
                    <Input
                      type="text"
                      placeholder="e.g. Gold, GBP/AUD, EUR/CHF"
                      value={customPair}
                      onChange={(e) => setCustomPair(e.target.value.toUpperCase())}
                      className="mt-1.5 max-w-xs h-8 text-xs"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Amount Picker */}
              <div>
                <label className="text-xs text-muted-foreground font-medium">Demo Risk Sizing</label>
                <div className="flex gap-2 items-center mt-1.5">
                  {[50, 100, 150].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-xl border transition-all duration-200 cursor-pointer font-semibold",
                        amount === val
                          ? "bg-foreground text-background border-foreground shadow-sm"
                          : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
                      )}
                    >
                      ${val}
                    </button>
                  ))}
                  <Input
                    type="number"
                    placeholder="Custom $"
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="h-8 text-xs max-w-[100px]"
                    min={1}
                    max={currentCapital}
                  />
                </div>
              </div>

              {/* Outcome Picker */}
              <div>
                <label className="text-xs text-muted-foreground font-medium">Sandbox Trade Outcome</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setResult("win")}
                    className={cn(
                      "py-2.5 text-xs font-semibold rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5",
                      result === "win"
                        ? "bg-[#4ade80]/15 border-[#4ade80] text-[#4ade80]"
                        : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> WIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setResult("draw")}
                    className={cn(
                      "py-2.5 text-xs font-semibold rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5",
                      result === "draw"
                        ? "bg-slate-400/15 border-slate-400 text-slate-400"
                        : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-400 font-display text-[8px] flex items-center justify-center font-bold">0</span> DRAW
                  </button>
                  <button
                    type="button"
                    onClick={() => setResult("loss")}
                    className={cn(
                      "py-2.5 text-xs font-semibold rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center gap-1.5",
                      result === "loss"
                        ? "bg-[#f87171]/15 border-[#f87171] text-[#f87171]"
                        : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    <XCircle className="h-3.5 w-3.5" /> LOSS
                  </button>
                </div>
              </div>

              {/* Psychological lessons details */}
              <div>
                <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Lessons / Notes (What happened wrong? Insights & patterns)</label>
                <textarea
                  placeholder="e.g. Explored 15s timeframe during low-volatility Asian session. Caught in micro-whipsaws. Lesson: timings must match volatility wagers."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[90px] rounded-2xl border border-border/80 bg-background/50 p-3.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-border transition mt-1.5"
                />
              </div>

              {/* Submit trigger */}
              <button
                type="submit"
                disabled={isCapitalWiped || submitting}
                className={cn(
                  "w-full py-3 rounded-2xl text-xs font-bold transition shadow-soft flex items-center justify-center gap-1.5 cursor-pointer",
                  isCapitalWiped
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-foreground text-background hover:opacity-90 disabled:opacity-50"
                )}
              >
                {submitting ? "Logging Trade..." : isCapitalWiped ? "Simulated Capital Wiped" : "Log Sandbox Trade"}
              </button>
            </form>
          </MotionCard>

          {/* Sandbox Logs */}
          <MotionCard>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Sandbox Log History</p>
            <h2 className="mt-1 font-display text-lg font-semibold">Explore Ledger</h2>
            
            {loading ? (
              <div className="space-y-3 mt-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/40"></div>
                ))}
              </div>
            ) : exploreLogs.length === 0 ? (
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                No sandbox trials logged yet. Configure above and log a demo trade to start exploring.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
                      <th className="py-2 font-normal">Asset / Time</th>
                      <th className="py-2 font-normal">Result</th>
                      <th className="py-2 font-normal">Amount</th>
                      <th className="py-2 font-normal">PnL (Return)</th>
                      <th className="py-2 font-normal w-8 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {exploreLogs.map((log) => (
                      <tr key={log.id} className="group">
                        <td className="py-3 pr-2">
                          <div className="font-semibold text-foreground">{log.pair}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{log.duration} · {new Date(log.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          {log.notes && (
                            <div className="mt-1.5 p-2 rounded-xl bg-muted/30 border border-border/40 text-[10px] text-foreground leading-relaxed max-w-sm">
                              <span className="font-semibold text-[var(--sage)]">💡 Insight:</span> "{log.notes}"
                            </div>
                          )}
                        </td>
                        <td className="py-3">
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                            style={
                              log.result === "win"
                                ? { background: "#4ade8022", color: "#4ade80" }
                                : log.result === "loss"
                                ? { background: "#f8717122", color: "#f87171" }
                                : { background: "#94a3b822", color: "#94a3b8" }
                            }
                          >
                            {log.result}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">${log.amount}</td>
                        <td className={cn("py-3 font-semibold", log.pnl >= 0 ? "text-[var(--sage)]" : "text-[var(--fear)]")}>
                          {formatMoney(log.pnl)}
                          {log.result === "win" && <span className="text-[9px] opacity-75 font-normal block">+85%</span>}
                          {log.result === "loss" && <span className="text-[9px] opacity-75 font-normal block">-100%</span>}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteExploreTrade(log.id)}
                            className="text-muted-foreground/30 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete Sandbox Trade Log"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </MotionCard>
        </div>

        {/* Right Side: Capital Card & Guidance */}
        <div className="space-y-6">
          <MotionCard className="text-center py-8">
            <Compass className="h-10 w-10 text-[var(--sage)] mx-auto" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-3 font-semibold">Demo Explore Capital</p>
            <h1 className={cn("font-display text-4xl font-extrabold tracking-tight mt-1", isCapitalWiped ? "text-[var(--fear)]" : "text-foreground")}>
              ${currentCapital.toFixed(2)}
            </h1>
            
            {/* Limit Warning */}
            {isCapitalWiped ? (
              <div className="mt-3.5 mx-auto max-w-[280px] p-2.5 rounded-xl border border-[var(--fear)]/30 bg-[var(--fear)]/10 text-[11px] text-[var(--fear)] font-semibold flex items-center justify-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Capital fully depleted! Reset required.
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground mt-2 font-medium">
                Simulated balance initialized at $500.00
              </p>
            )}

            {/* Sandbox reset trigger */}
            <div className="mt-5 border-t border-border/40 pt-4 max-w-[280px] mx-auto">
              {confirmReset ? (
                <div className="flex items-center justify-center gap-2 bg-[var(--blush)]/10 p-1.5 rounded-xl border border-[var(--blush)]/20">
                  <button
                    onClick={handleResetSandbox}
                    disabled={resetting}
                    className="px-3.5 py-1.5 bg-[var(--blush)] hover:opacity-90 text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
                  >
                    {resetting ? "Resetting..." : "Yes, Reset"}
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    disabled={resetting}
                    className="px-3.5 py-1.5 bg-muted text-muted-foreground hover:text-foreground text-[11px] font-semibold rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="px-4 py-2 border border-border hover:bg-muted text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
                >
                  <RefreshCw className="h-3 w-3" /> Reset Sandbox / Top Up
                </button>
              )}
            </div>
          </MotionCard>

          {/* Educational Sandbox Tips Card */}
          <MotionCard className="bg-card/30 border-border/60">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[var(--sage)]" />
              <p className="text-xs uppercase tracking-wider text-foreground font-bold tracking-tight">Sandbox Objectives</p>
            </div>
            
            <div className="mt-4 space-y-4 text-xs text-muted-foreground leading-relaxed">
              <div className="flex gap-2">
                <span className="text-[var(--sage)] font-bold">1.</span>
                <p>
                  <span className="font-semibold text-foreground">Explore timeframes:</span> Does a 15-second contract work better for you than 1 minute? Use this demo capital to test and identify.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-[var(--sage)] font-bold">2.</span>
                <p>
                  <span className="font-semibold text-foreground">Log emotions:</span> When you lose sandbox capital, there is no real-money pain. Log exactly what went wrong in your decision structure.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-[var(--sage)] font-bold">3.</span>
                <p>
                  <span className="font-semibold text-foreground">Stick to sizing:</span> Try splitting your $500 balance into precisely three $150 trades. Test high-stakes situations without actual drawdowns.
                </p>
              </div>
            </div>
          </MotionCard>

          {/* Guest offline storage notification */}
          {!user && (
            <div className="p-4 rounded-2xl border border-border/60 bg-card/40 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-foreground font-semibold">Offline Sandbox active.</span> Your explore logs are stored safely in local storage. Sign in to sync across devices.
              </p>
              <Link to="/auth" className="mt-2.5 inline-block px-3.5 py-1.5 bg-foreground text-background text-[11px] font-bold rounded-lg hover:opacity-95 transition">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
