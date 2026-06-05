import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Trash2 } from "lucide-react";
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
  isLive: boolean;
};

function TradeLogger() {
  const { user } = useAuth();
  
  // Safe SSR initializers from localStorage
  const [pair,        setPair]        = useState(() => (typeof window !== "undefined" && localStorage.getItem("mtc_pair")) || "EUR/USD");
  const [customPair,  setCustomPair]  = useState(() => (typeof window !== "undefined" && localStorage.getItem("mtc_customPair")) || "");
  const [startTime,   setStart]       = useState(() => (typeof window !== "undefined" && localStorage.getItem("mtc_startTime")) || "09:00");
  const [endTime,     setEnd]         = useState(() => (typeof window !== "undefined" && localStorage.getItem("mtc_endTime")) || "17:00");
  const [maxTrades,   setMax]         = useState(() => (typeof window !== "undefined" && Number(localStorage.getItem("mtc_maxTrades") || "2")) || 2);
  const [amount,      setAmount]      = useState(() => (typeof window !== "undefined" && Number(localStorage.getItem("mtc_amount") || "50")) || 50);
  const [riskPct,     setRisk]        = useState(() => (typeof window !== "undefined" && Number(localStorage.getItem("mtc_riskPct") || "100")) || 100);
  const [payoutPct,   setPayoutPct]   = useState(() => (typeof window !== "undefined" && Number(localStorage.getItem("mtc_payoutPct") || "85")) || 85);
  const [currency,    setCurrency]    = useState(() => (typeof window !== "undefined" && localStorage.getItem("mtc_currency")) || "$");
  const [isLive,      setIsLive]      = useState(() => (typeof window !== "undefined" && localStorage.getItem("mtc_isLive") !== "false"));
  const [strategy,    setStrat]       = useState<ActiveStrategy | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("mtc_strategy");
    return saved ? JSON.parse(saved) : null;
  });
  const [log,         setLog]         = useState<TradeEntry[]>([]);
  const [range,       setRange]       = useState("today");
  const idRef = useRef(100);

  // Warning confirm live wagers states
  const [showConfirmLiveModal, setShowConfirmLiveModal] = useState(false);
  const [pendingLiveResult, setPendingLiveResult] = useState<"win" | "loss" | "draw" | null>(null);

  // Dynamic overrides and Strategy Templates states
  const [nextTradeDuration, setNextTradeDuration] = useState(() => (typeof window !== "undefined" && localStorage.getItem("mtc_nextTradeDuration")) || "1 min");
  const [showNaming, setShowNaming] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [savedStrats, setSavedStrats] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("mtc_templates");
    return saved ? JSON.parse(saved) : [];
  });
  const [confirmClearLogs, setConfirmClearLogs] = useState(false);
  const [clearingLogs, setClearingLogs] = useState(false);

  async function executeClearLogs() {
    if (!supabase || !user) return;
    setClearingLogs(true);
    try {
      const { error } = await supabase
        .from("trades")
        .delete()
        .eq("user_id", user.id);
      
      if (error) throw error;
      setLog([]);
    } catch (err) {
      console.error("Failed to clear trades logs:", err);
    } finally {
      setClearingLogs(false);
      setConfirmClearLogs(false);
    }
  }

  const rangeTitles: Record<string, string> = {
    today: "Today's Log",
    "3days": "3 Days Log",
    "1week": "1 Week Log",
    "1month": "1 Month Log",
    all: "All-Time Log",
  };

  // Persist nextTradeDuration
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("mtc_nextTradeDuration", nextTradeDuration);
  }, [nextTradeDuration]);

  // Sync currency based on isLive mode
  const handleToggleIsLive = (live: boolean) => {
    setIsLive(live);
    if (typeof window !== "undefined") {
      localStorage.setItem("mtc_isLive", String(live));
    }
    if (live) {
      if (currency === "Demo Rs.") setCurrency("Rs.");
      else if (currency === "Demo $") setCurrency("$");
      else if (currency === "Demo ₹") setCurrency("₹");
      else if (currency === "Demo Rp") setCurrency("Rp");
      else if (currency === "Demo") setCurrency("$");
    } else {
      if (currency === "Rs.") setCurrency("Demo Rs.");
      else if (currency === "$") setCurrency("Demo $");
      else if (currency === "₹") setCurrency("Demo ₹");
      else if (currency === "Rp") setCurrency("Demo Rp");
    }
  };

  // Persist session configuration inputs to localStorage (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("mtc_pair", pair);
    localStorage.setItem("mtc_customPair", customPair);
    localStorage.setItem("mtc_startTime", startTime);
    localStorage.setItem("mtc_endTime", endTime);
    localStorage.setItem("mtc_maxTrades", String(maxTrades));
    localStorage.setItem("mtc_amount", String(amount));
    localStorage.setItem("mtc_riskPct", String(riskPct));
    localStorage.setItem("mtc_payoutPct", String(payoutPct));
    localStorage.setItem("mtc_currency", currency);
    localStorage.setItem("mtc_isLive", String(isLive));
  }, [pair, customPair, startTime, endTime, maxTrades, amount, riskPct, payoutPct, currency, isLive]);

  // Persist strategy state to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (strategy) {
      localStorage.setItem("mtc_strategy", JSON.stringify(strategy));
    } else {
      localStorage.removeItem("mtc_strategy");
    }
  }, [strategy]);

  // Strategy Template helpers
  function handleSaveTemplateClick() {
    setShowNaming(true);
  }

  function executeSaveTemplate() {
    if (!newTemplateName.trim()) return;
    const newTemplate = {
      templateName: newTemplateName.trim(),
      pair,
      customPair,
      startTime,
      endTime,
      maxTrades,
      amount,
      riskPct,
      payoutPct,
      currency,
      isLive,
    };
    const updated = [...savedStrats, newTemplate];
    setSavedStrats(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("mtc_templates", JSON.stringify(updated));
    }
    setNewTemplateName("");
    setShowNaming(false);
  }

  function handleLoadTemplate(indexStr: string) {
    const idx = Number(indexStr);
    const t = savedStrats[idx];
    if (!t) return;
    setPair(t.pair);
    setCustomPair(t.customPair || "");
    setStart(t.startTime);
    setEnd(t.endTime);
    setMax(t.maxTrades);
    setAmount(t.amount);
    setRisk(t.riskPct);
    setPayoutPct(t.payoutPct);
    setCurrency(t.currency);
    handleToggleIsLive(t.isLive !== false);
  }

  // Load this user's trades for today or selected range from Supabase
  useEffect(() => {
    if (!supabase || !user) return;
    
    let query = supabase.from("trades").select("*").eq("user_id", user.id);
    
    if (range === "today") {
      const today = new Date().toISOString().split("T")[0];
      query = query.gte("created_at", `${today}T00:00:00Z`);
    } else if (range === "3days") {
      const date = new Date();
      date.setDate(date.getDate() - 3);
      query = query.gte("created_at", date.toISOString());
    } else if (range === "1week") {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      query = query.gte("created_at", date.toISOString());
    } else if (range === "1month") {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      query = query.gte("created_at", date.toISOString());
    } // "all" has no date limit

    query
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) {
          setLog(
            data.map((t) => ({
              id: t.id,
              time: t.time,
              pair: t.pair,
              result: t.result as "win" | "loss" | "draw",
              amount: t.amount,
              pnl: t.pnl,
              duration: t.duration,
              is_live: t.is_live !== false,
            })),
          );
        }
      });
  }, [user, range]);

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
      strategy.currency !== currency ||
      strategy.isLive !== isLive
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
        isLive,
      });
    }
  }, [pair, customPair, startTime, endTime, maxTrades, amount, riskPct, payoutPct, currency, isLive, strategy]);

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
  const draws      = log.filter((t) => t.result === "draw").length;
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
      isLive,
    });
    setRange("today");
    setLog([]);
  }

  function handleResetSession() {
    setStrat(null);
    setLog([]);
  }

  async function logTrade(result: "win" | "loss" | "draw") {
    if (!active || limitHit) return;

    // Intercept check: if about to log a LIVE trade and last 2 trades were demo losses
    const isThisLive = strategy?.isLive !== false;
    const lastTwoDemoLosses = (() => {
      if (log.length < 2) return false;
      const last1 = log[log.length - 1];
      const last2 = log[log.length - 2];
      return last1.is_live === false && last1.result === "loss" &&
             last2.is_live === false && last2.result === "loss";
    })();

    if (isThisLive && lastTwoDemoLosses) {
      setPendingLiveResult(result);
      setShowConfirmLiveModal(true);
      return;
    }

    await executeLogTrade(result);
  }

  async function executeLogTrade(result: "win" | "loss" | "draw") {
    const now  = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
    // Win PnL calculates based on the payoutPct percentage of trade amount
    // Loss PnL calculates based on the riskPct percentage of trade amount
    // Draw PnL is exactly 0
    const payoutMultiplier = strategy!.payoutPct / 100;
    const riskMultiplier = strategy!.riskPct / 100;
    const pnl = result === "win"
      ? +(strategy!.amount * payoutMultiplier).toFixed(2)
      : result === "loss"
      ? -+(strategy!.amount * riskMultiplier).toFixed(2)
      : 0;

    const tempId = idRef.current++;
    const entry: TradeEntry = {
      id: tempId,
      time,
      pair: strategy!.pair,
      result,
      amount: strategy!.amount,
      pnl,
      duration: nextTradeDuration,
      is_live: strategy!.isLive !== false,
    };

    setLog((prev) => [...prev, entry]);

    if (supabase && user) {
      try {
        const { data, error } = await supabase
          .from("trades")
          .insert({
            user_id: user.id,
            time: entry.time,
            pair: entry.pair,
            result: entry.result,
            amount: entry.amount,
            pnl: entry.pnl,
            duration: entry.duration,
            is_live: entry.is_live,
          })
          .select();
        
        if (!error && data && data.length > 0) {
          const dbId = data[0].id;
          setLog((prev) => prev.map((t) => t.id === tempId ? { ...t, id: dbId } : t));
        }
      } catch (err) {
        console.error("Failed to insert trade:", err);
      }
    }
  }

  async function handleDeleteTrade(tradeId: number) {
    setLog((prev) => prev.filter((t) => t.id !== tradeId));
    if (supabase && user) {
      try {
        await supabase
          .from("trades")
          .delete()
          .eq("id", tradeId)
          .eq("user_id", user.id);
      } catch (err) {
        console.error("Failed to delete trade:", err);
      }
    }
  }

  return (
    <AppShell title="Trade Logger" subtitle="Set your rules. Stick to them. Log every trade.">
      <div className="space-y-5">
        {/* Strategy setup */}
        <MotionCard>
          {/* Strategy Templates Manager */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-border/40 pb-3">
            <div className="flex items-center gap-1.5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Session Configuration</p>
              {active && (
                <div className="flex items-center gap-1 rounded-full bg-[var(--sage)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--sage)]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--sage)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--sage)]"></span>
                  </span>
                  <span>Live</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {savedStrats.length > 0 && (
                <Select onValueChange={handleLoadTemplate}>
                  <SelectTrigger className="h-7 text-[10px] w-[130px] bg-muted/40 border-border/80"><SelectValue placeholder="Load Strategy..." /></SelectTrigger>
                  <SelectContent>
                    {savedStrats.map((s, idx) => (
                      <SelectItem key={idx} value={String(idx)}>{s.templateName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <button
                type="button"
                onClick={handleSaveTemplateClick}
                className="px-2.5 py-1 border border-border hover:bg-muted text-[10px] font-semibold rounded-lg transition cursor-pointer"
              >
                Save as Template
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showNaming && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl border border-[var(--sage)]/30 bg-[var(--sage)]/[0.02] overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Template Name</label>
                    <Input
                      placeholder="e.g. Scalp EUR/USD 30s"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={executeSaveTemplate}
                      className="px-3.5 py-1.5 bg-[var(--sage)] hover:opacity-90 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Save Template
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNaming(false); setNewTemplateName(""); }}
                      className="px-3.5 py-1.5 bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
              <Select
                value={currency}
                onValueChange={(val) => {
                  setCurrency(val);
                  const isDemo = val.startsWith("Demo");
                  setIsLive(!isDemo);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("mtc_isLive", String(!isDemo));
                  }
                }}
              >
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
              <label className="text-xs text-muted-foreground font-medium">Trade Mode</label>
              <div className="flex bg-muted/40 p-1 rounded-xl border border-border/60 mt-1.5 h-9">
                <button
                  type="button"
                  onClick={() => handleToggleIsLive(true)}
                  className={cn(
                    "flex-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1",
                    isLive
                      ? "bg-emerald-500 text-white shadow-soft border border-emerald-400/30"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                    <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", isLive ? "bg-emerald-400" : "bg-muted-foreground")}></span>
                  </span>
                  LIVE
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleIsLive(false)}
                  className={cn(
                    "flex-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1",
                    !isLive
                      ? "bg-slate-500 text-white shadow-soft border border-slate-400/30"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  DEMO
                </button>
              </div>
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

        {/* Next Trade Duration override */}
        {active && !limitHit && (
          <MotionCard className="py-2.5 px-4 border-border/50 bg-card/20 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Duration for Next Trade:</span>
            <div className="flex gap-1.5 flex-wrap">
              {["15 sec", "30 sec", "1 min", "2 min", "5 min", "1 hour"].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setNextTradeDuration(dur)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full border transition-all duration-200 cursor-pointer font-medium",
                    nextTradeDuration === dur
                      ? "bg-foreground text-background border-foreground font-semibold"
                      : "bg-muted/40 border-border text-muted-foreground hover:bg-muted/70"
                  )}
                >
                  {dur}
                </button>
              ))}
            </div>
          </MotionCard>
        )}

        {/* WIN / DRAW / LOSS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!active || limitHit}
            onClick={() => logTrade("win")}
            className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-[#4ade80]/30 bg-[#4ade80]/10 py-10 text-[#4ade80] transition hover:bg-[#4ade80]/20 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
          >
            <CheckCircle2 className="h-12 w-12" />
            <span className="font-display text-2xl font-bold tracking-tight">WIN</span>
            {active && !limitHit && (
              <span className="text-[10px] opacity-75 font-semibold bg-[#4ade80]/20 px-2 py-0.5 rounded-full">
                {strategy!.max - log.length} left (+{strategy!.payoutPct}%)
              </span>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!active || limitHit}
            onClick={() => logTrade("draw")}
            className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-slate-400/30 bg-slate-400/10 py-10 text-slate-400 transition hover:bg-slate-400/20 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
          >
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-400 font-display text-xl font-bold">0</span>
            <span className="font-display text-2xl font-bold tracking-tight">DRAW</span>
            {active && !limitHit && (
              <span className="text-[10px] opacity-75 font-semibold bg-slate-400/20 px-2 py-0.5 rounded-full">
                Neutral (+0.00)
              </span>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!active || limitHit}
            onClick={() => logTrade("loss")}
            className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-[#f87171]/30 bg-[#f87171]/10 py-10 text-[#f87171] transition hover:bg-[#f87171]/20 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
          >
            <XCircle className="h-12 w-12" />
            <span className="font-display text-2xl font-bold tracking-tight">LOSS</span>
            {active && !limitHit && (
              <span className="text-[10px] opacity-75 font-semibold bg-[#f87171]/20 px-2 py-0.5 rounded-full">
                {strategy!.currency}{strategy!.currency.length > 1 ? " " : ""}{(strategy!.amount * (strategy!.riskPct / 100)).toFixed(2)} Risked
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
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {rangeTitles[range] || "Trade Log"}
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold">
                <span className="text-[#4ade80]">{wins}W</span>
                <span className="mx-1 text-muted-foreground">/</span>
                <span className="text-slate-400">{draws}D</span>
                <span className="mx-1 text-muted-foreground">/</span>
                <span className="text-[#f87171]">{losses}L</span>
                <span className="mx-2 text-muted-foreground">·</span>
                <span className={totalPnl >= 0 ? "text-[var(--sage)]" : "text-[var(--fear)]"}>
                  {formatMoney(totalPnl, currency)}
                </span>
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground font-medium shrink-0">Range:</label>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="h-8 w-[105px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="3days">3 Days</SelectItem>
                  <SelectItem value="1week">1 Week</SelectItem>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              {/* Dynamic Reset Logs Action */}
              {log.length > 0 && (
                <div className="flex items-center ml-1 animate-fade-in">
                  {confirmClearLogs ? (
                    <div className="flex items-center gap-1 bg-[var(--blush)]/10 p-0.5 rounded-xl border border-[var(--blush)]/20">
                      <button
                        type="button"
                        onClick={executeClearLogs}
                        disabled={clearingLogs}
                        className="px-2 py-1 bg-[var(--blush)] hover:opacity-90 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                      >
                        {clearingLogs ? "..." : "Yes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClearLogs(false)}
                        disabled={clearingLogs}
                        className="px-2 py-1 bg-muted text-muted-foreground hover:text-foreground text-[10px] font-semibold rounded-lg transition cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClearLogs(true)}
                      className="px-2.5 py-1.5 bg-[var(--blush)]/15 border border-[var(--blush)]/30 hover:bg-[var(--blush)]/25 text-[var(--blush)] text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Reset Logs
                    </button>
                  )}
                </div>
              )}
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
                    <th className="px-2 py-2 font-normal w-8 text-right"></th>
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
                          className={cn(
                            "border-t border-border/50 group transition-all duration-300",
                            t.is_live && "bg-cyan-500/[0.015] shadow-[0_0_12px_rgba(6,182,212,0.06)]"
                          )}
                        >
                          <td className={cn("px-2 py-2.5 text-muted-foreground transition-all duration-300", t.is_live && "border-l-2 border-l-cyan-400 pl-3")}>
                            {t.time}
                          </td>
                          <td className="px-2 py-2.5 font-medium">
                            <div className="flex items-center">
                              {t.pair}
                              {t.is_live && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.2)]">
                                  LIVE
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                              {t.duration || "1 min"}
                            </div>
                          </td>
                          <td className="px-2 py-2.5">
                            <span
                                className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                                style={
                                  t.result === "win"
                                    ? { background: "#4ade8022", color: "#4ade80" }
                                    : t.result === "loss"
                                    ? { background: "#f8717122", color: "#f87171" }
                                    : { background: "#94a3b822", color: "#94a3b8" }
                                }
                              >
                                {t.result.toUpperCase()}
                              </span>
                          </td>
                          <td className="px-2 py-2.5 text-muted-foreground">{displayCurrency}{displayCurrency.length > 1 ? " " : ""}{t.amount}</td>
                          <td className={cn(
                            "px-2 py-2.5 font-medium",
                            t.pnl >= 0 ? "text-[var(--sage)]" : "text-[var(--fear)]",
                            t.is_live && (t.pnl >= 0 ? "drop-shadow-[0_0_6px_rgba(74,222,128,0.45)]" : "drop-shadow-[0_0_6px_rgba(248,113,113,0.45)]")
                          )}>
                            <span className="block font-semibold">
                              {formatMoney(t.pnl, displayCurrency)}
                            </span>
                            <span className="text-xs opacity-80 block">
                              {t.pnl >= 0 ? `+${inferredPct}% Win` : `-${inferredPct}% Loss`}
                            </span>
                          </td>
                          <td className="px-2 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteTrade(t.id)}
                              className="text-muted-foreground/30 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete/Undo Trade Log"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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

      {/* Dynamic confirm live warning modal */}
      <AnimatePresence>
        {showConfirmLiveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowConfirmLiveModal(false);
                setPendingLiveResult(null);
              }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--blush)]/30 bg-card/95 p-6 shadow-2xl backdrop-blur-xl"
            >
              {/* Alert icon or glow */}
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--blush)]/10 text-[var(--blush)] border border-[var(--blush)]/20 animate-pulse shadow-[0_0_15px_rgba(248,113,113,0.25)]">
                <AlertTriangle className="h-6 w-6" />
              </div>
              
              <h3 className="text-center font-display text-lg font-bold tracking-tight text-foreground">
                Pause & Reflect: Switching to Live?
              </h3>
              
              <div className="mt-3 text-xs text-muted-foreground leading-relaxed text-center space-y-2.5">
                <p>
                  You just lost <span className="font-semibold text-[var(--blush)]">two Demo trades in a row</span>. Under pressure, it's natural to seek to 'make it back', which is the prime state for <span className="text-foreground font-semibold">revenge trading</span>.
                </p>
                <p className="p-3 rounded-2xl bg-muted/40 border border-border/40 font-medium text-foreground italic">
                  "Why are you switching to real capital now? Is it based on a high-probability A+ setup, or is it an emotional reaction?"
                </p>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmLiveModal(false);
                    setPendingLiveResult(null);
                  }}
                  className="flex-1 rounded-xl bg-muted border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  Cancel & Take a Break
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (pendingLiveResult) {
                      await executeLogTrade(pendingLiveResult);
                    }
                    setShowConfirmLiveModal(false);
                    setPendingLiveResult(null);
                  }}
                  className="flex-1 rounded-xl bg-foreground px-4 py-2.5 text-xs font-bold text-background transition hover:opacity-90 cursor-pointer"
                >
                  Yes, Log Live Trade
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

