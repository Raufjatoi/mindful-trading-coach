import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { MotionCard } from "@/components/ui/motion-card";
import {
  newsItems as mockNews, aiNewsInsights,
  type NewsTopic, type NewsSentiment,
} from "@/lib/mock";
import { analyzeNewsFeed, type GemmaInsight } from "@/lib/gemma";
import {
  Newspaper, TrendingUp, TrendingDown, Minus,
  RefreshCw, Sparkles, Hash, Clock, Brain, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "Market Intelligence — MindCandle" },
      { name: "description", content: "Live market news with AI sentiment and pattern detection." },
    ],
  }),
  component: News,
});

// ── Finnhub fetch ─────────────────────────────────────────────────────────────

type FinnhubArticle = {
  id: number;
  headline: string;
  summary: string;
  source: string;
  datetime: number;
  url: string;
  category: string;
  related: string;
};

export type NewsItem = {
  id: string;
  headline: string;
  summary: string;
  source: string;
  publishedAgo: string;
  sentiment: NewsSentiment;
  tickers: string[];
  topic: NewsTopic;
  url?: string;
};

function timeAgo(unix: number): string {
  const diff = Math.floor((Date.now() / 1000) - unix);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function detectSentiment(text: string): NewsSentiment {
  const t = text.toLowerCase();
  const b = ["rise","gain","surge","rally","jump","soar","up","beat","record","strong","bullish","higher","growth","positive","recover","boost"];
  const r = ["fall","drop","plunge","decline","slide","tumble","down","miss","low","weak","bearish","lower","loss","negative","crash","sell","fear"];
  const bs = b.filter((w) => t.includes(w)).length;
  const rs = r.filter((w) => t.includes(w)).length;
  if (bs > rs + 1) return "bullish";
  if (rs > bs + 1) return "bearish";
  return "neutral";
}

function detectTopic(article: FinnhubArticle): NewsTopic {
  const cat = article.category?.toLowerCase() ?? "";
  const text = (article.headline + " " + article.summary).toLowerCase();
  if (cat === "forex" || text.match(/\b(eur|gbp|jpy|aud|cad|chf|usd|forex|fx|currency)\b/)) return "forex";
  if (cat === "crypto" || text.match(/\b(bitcoin|btc|eth|crypto|blockchain|defi)\b/)) return "crypto";
  if (text.match(/\b(fed|inflation|gdp|cpi|pce|rate|central bank|interest|macro|geopolit)\b/)) return "macro";
  return "stocks";
}

function extractTickers(article: FinnhubArticle): string[] {
  const tickers: string[] = [];
  if (article.related) {
    article.related.split(",").slice(0, 3).forEach((t) => tickers.push(t.trim()));
  }
  // Extract common forex pairs from headline
  const pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "USD/CHF", "XAU/USD", "BTC/USD"];
  pairs.forEach((p) => {
    if (article.headline.includes(p) || article.summary.includes(p)) {
      if (!tickers.includes(p)) tickers.push(p);
    }
  });
  return tickers.slice(0, 4);
}

async function fetchFinnhubNews(category: string): Promise<FinnhubArticle[]> {
  const key = import.meta.env.VITE_FINNHUB_KEY as string | undefined;
  if (!key || key === "your-finnhub-key") throw new Error("no key");
  const res = await fetch(
    `https://finnhub.io/api/v1/news?category=${category}&token=${key}`,
  );
  if (!res.ok) throw new Error(`Finnhub ${res.status}`);
  return res.json() as Promise<FinnhubArticle[]>;
}

async function loadRealNews(): Promise<NewsItem[]> {
  const [general, forex, crypto] = await Promise.allSettled([
    fetchFinnhubNews("general"),
    fetchFinnhubNews("forex"),
    fetchFinnhubNews("crypto"),
  ]);

  const all: FinnhubArticle[] = [];
  [general, forex, crypto].forEach((r) => {
    if (r.status === "fulfilled") all.push(...r.value);
  });

  // Deduplicate by id, take newest 30
  const seen = new Set<number>();
  const deduped = all
    .filter((a) => { if (seen.has(a.id)) return false; seen.add(a.id); return true; })
    .sort((a, b) => b.datetime - a.datetime)
    .slice(0, 30);

  return deduped.map((a) => ({
    id: String(a.id),
    headline: a.headline,
    summary: a.summary?.slice(0, 200) ?? "",
    source: a.source,
    publishedAgo: timeAgo(a.datetime),
    sentiment: detectSentiment(a.headline + " " + (a.summary ?? "")),
    tickers: extractTickers(a),
    topic: detectTopic(a),
    url: a.url,
  }));
}

// ── UI helpers ────────────────────────────────────────────────────────────────

const TOPICS: { label: string; value: NewsTopic | "all" }[] = [
  { label: "All",    value: "all"    },
  { label: "Forex",  value: "forex"  },
  { label: "Stocks", value: "stocks" },
  { label: "Crypto", value: "crypto" },
  { label: "Macro",  value: "macro"  },
];

const sentimentConfig: Record<
  NewsSentiment,
  { label: string; color: string; Icon: typeof TrendingUp }
> = {
  bullish: { label: "Bullish", color: "var(--sage)",             Icon: TrendingUp   },
  bearish: { label: "Bearish", color: "var(--fear)",             Icon: TrendingDown },
  neutral: { label: "Neutral", color: "var(--muted-foreground)", Icon: Minus        },
};

function SentimentBadge({ sentiment }: { sentiment: NewsSentiment }) {
  const { label, color, Icon } = sentimentConfig[sentiment];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
    >
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function News() {
  const [topic, setTopic]         = useState<NewsTopic | "all">("all");
  const [articles, setArticles]   = useState<NewsItem[]>(mockNews);
  const [isLive, setIsLive]       = useState(false);
  const [scanning, setScanning]   = useState(false);
  const [scanned, setScanned]     = useState(false);
  const [insights, setInsights]   = useState<GemmaInsight[]>(aiNewsInsights);
  const [scanError, setScanError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = useCallback(async () => {
    setRefreshing(true);
    try {
      const real = await loadRealNews();
      setArticles(real);
      setIsLive(true);
      setScanned(false);
    } catch {
      setArticles(mockNews);
      setIsLive(false);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 5 min
  useEffect(() => {
    fetchNews();
    const id = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchNews]);

  const filtered = useMemo(
    () => topic === "all" ? articles : articles.filter((n) => n.topic === topic),
    [topic, articles],
  );

  const pulse = useMemo(() => {
    const total = filtered.length || 1;
    const b = filtered.filter((n) => n.sentiment === "bullish").length;
    const r = filtered.filter((n) => n.sentiment === "bearish").length;
    return {
      bullish: Math.round((b / total) * 100),
      bearish: Math.round((r / total) * 100),
      neutral: Math.round(((total - b - r) / total) * 100),
    };
  }, [filtered]);

  const hotTickers = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((n) => n.tickers.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([ticker, count]) => ({ ticker, count }));
  }, [filtered]);

  async function handleScan() {
    setScanning(true);
    setScanned(false);
    setScanError(false);
    try {
      const result = await analyzeNewsFeed(
        filtered.slice(0, 10).map((n) => ({
          headline: n.headline,
          summary: n.summary,
          sentiment: n.sentiment,
          tickers: n.tickers,
          source: n.source,
        })),
      );
      setInsights(result);
      setScanned(true);
    } catch {
      setInsights(aiNewsInsights);
      setScanError(true);
      setScanned(true);
    } finally {
      setScanning(false);
    }
  }

  return (
    <AppShell title="Market Intelligence" subtitle="Live news · sentiment · AI pattern detection">

      {/* Source badge */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-xl border border-border/60 bg-card/40 p-1">
            {TOPICS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTopic(t.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  topic === t.value ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <span className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
            isLive
              ? "bg-[color-mix(in_srgb,var(--sage)_12%,transparent)] text-[var(--sage)]"
              : "bg-secondary text-muted-foreground",
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full", isLive ? "bg-[var(--sage)] animate-pulse" : "bg-muted-foreground")} />
            {isLive ? "Live · Finnhub" : "Sample data"}
          </span>
        </div>

        <button
          onClick={fetchNews}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          {refreshing ? "Fetching…" : "Refresh"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">

        {/* ── News feed ── */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.03 }}
              >
                <MotionCard interactive>
                  <div className="flex flex-wrap items-center gap-2">
                    <SentimentBadge sentiment={item.sentiment} />
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Newspaper className="h-3 w-3" />{item.source}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{item.publishedAgo}
                    </span>
                  </div>

                  <h3 className="mt-2 font-display text-sm font-semibold leading-snug">{item.headline}</h3>

                  {item.summary && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {item.summary}
                    </p>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {item.tickers.map((ticker) => (
                      <span
                        key={ticker}
                        className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-secondary/40 px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        <Hash className="h-2.5 w-2.5" />{ticker}
                      </span>
                    ))}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground transition hover:text-foreground"
                      >
                        Read <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </MotionCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-border/40 bg-card/30 p-8 text-center text-sm text-muted-foreground">
              No stories match this filter.
            </div>
          )}
        </div>

        {/* ── AI insights panel ── */}
        <div className="flex flex-col gap-3">

          {/* Scanner card */}
          <MotionCard>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Analysis</p>
                <h2 className="mt-0.5 font-display text-sm font-semibold">Pattern Scanner</h2>
              </div>
              <button
                onClick={handleScan}
                disabled={scanning}
                className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium transition hover:bg-secondary/70 disabled:opacity-60"
              >
                {scanning ? (
                  <><Brain className="h-3.5 w-3.5 animate-pulse text-[var(--sage)]" />Scanning…</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5 text-[var(--sage)]" />{scanned ? "Re-scan" : "Scan feed"}</>
                )}
              </button>
            </div>
            <AnimatePresence>
              {scanning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {["Reading headlines…", "Extracting tickers…", "Detecting patterns…"].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.55 }}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--sage)]" />
                      {step}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </MotionCard>

          {/* Market pulse */}
          <MotionCard>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Market Pulse</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{filtered.length} articles</p>
            <div className="mt-3 space-y-3">
              {(
                [
                  { label: "Bullish", pct: pulse.bullish, color: "var(--sage)" },
                  { label: "Bearish", pct: pulse.bearish, color: "var(--fear)" },
                  { label: "Neutral", pct: pulse.neutral, color: "var(--muted-foreground)" },
                ] as const
              ).map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </MotionCard>

          {/* Hot tickers */}
          {hotTickers.length > 0 && (
            <MotionCard>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Hot Tickers</p>
              <ul className="mt-3 space-y-2">
                {hotTickers.map(({ ticker, count }, i) => (
                  <motion.li
                    key={ticker}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-5 text-xs text-muted-foreground">#{i + 1}</span>
                      <span className="font-medium">{ticker}</span>
                    </span>
                    <span className="rounded-md border border-border/40 bg-secondary/40 px-2 py-0.5 text-xs text-muted-foreground">
                      {count} {count === 1 ? "story" : "stories"}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </MotionCard>
          )}

          {/* AI patterns — revealed after scan */}
          <AnimatePresence>
            {scanned && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <MotionCard>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--sage)]" />
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Patterns</p>
                  </div>
                  {scanError && (
                    <p className="mt-1 text-[11px] text-muted-foreground">API key not set — showing sample patterns.</p>
                  )}
                  <ul className="mt-3 space-y-3">
                    {insights.map((insight, i) => (
                      <motion.li
                        key={insight.title}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.09 }}
                        className="rounded-xl border border-border/40 bg-background/30 p-3"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold">{insight.title}</p>
                          <SentimentBadge sentiment={insight.impact} />
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">{insight.detail}</p>
                      </motion.li>
                    ))}
                  </ul>
                </MotionCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
