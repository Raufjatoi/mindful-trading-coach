// ── Mood ──────────────────────────────────────────────────────────────────────
export type Mood = "Calm" | "Fear" | "Revenge" | "Greedy";

export const moodColor: Record<Mood, string> = {
  Calm: "var(--sage)",
  Fear: "var(--fear)",
  Revenge: "var(--blush)",
  Greedy: "var(--greed)",
};

export const moods: Mood[] = ["Calm", "Fear", "Revenge", "Greedy"];

// ── Journal (used by /journal) ────────────────────────────────────────────────
export const journalEntries = [
  { id: "j1", date: "Today · 14:20", mood: "Calm" as Mood, pnl: 405, snippet: "Stuck to the plan. Two A+ setups, sized correctly. Felt no urge to add risk.", insight: "Calm + plan-driven = your edge." },
  { id: "j2", date: "Today · 10:45", mood: "Revenge" as Mood, pnl: -88, snippet: "Hit stop on EUR/USD, immediately took a counter-trend short. Knew it was wrong.", insight: "Revenge entries cost you 1.4R on average." },
  { id: "j3", date: "Yesterday · 15:10", mood: "Greedy" as Mood, pnl: -210, snippet: "Was up nicely, doubled position chasing more. Gave it all back + some.", insight: "Greed clusters near the close. Set a daily profit lock." },
  { id: "j4", date: "Yesterday · 09:30", mood: "Fear" as Mood, pnl: 0, snippet: "Saw the setup, hesitated, didn't pull the trigger. Watched it run.", insight: "Fear of loss is also a cost. Practice paper-pulling triggers." },
  { id: "j5", date: "Mon · 11:00", mood: "Calm" as Mood, pnl: 180, snippet: "Pre-market journaling helped. Walked into the open with one clear thesis.", insight: "Mornings with a written thesis: 78% win rate." },
  { id: "j6", date: "Mon · 13:40", mood: "Calm" as Mood, pnl: 95, snippet: "Skipped a marginal setup. Felt good to do nothing.", insight: "Skipped trades are wins too." },
];

// ── Analytics (used by /analytics) ───────────────────────────────────────────
export const disciplineSeries = [
  { day: "Mon", score: 72 },
  { day: "Tue", score: 68 },
  { day: "Wed", score: 79 },
  { day: "Thu", score: 81 },
  { day: "Fri", score: 84 },
  { day: "Sat", score: 86 },
  { day: "Sun", score: 87 },
];

export const moodTrendSeries = [
  { day: "Mon", calm: 60, fear: 20, revenge: 10, greedy: 10 },
  { day: "Tue", calm: 50, fear: 30, revenge: 10, greedy: 10 },
  { day: "Wed", calm: 65, fear: 15, revenge: 10, greedy: 10 },
  { day: "Thu", calm: 70, fear: 10, revenge: 10, greedy: 10 },
  { day: "Fri", calm: 72, fear: 12, revenge: 8,  greedy: 8  },
  { day: "Sat", calm: 78, fear: 10, revenge: 6,  greedy: 6  },
  { day: "Sun", calm: 80, fear: 8,  revenge: 6,  greedy: 6  },
];

export const emotionDistribution = [
  { name: "Calm",    value: 58, color: "var(--sage)"  },
  { name: "Fear",    value: 18, color: "var(--fear)"  },
  { name: "Revenge", value: 12, color: "var(--blush)" },
  { name: "Greedy",  value: 12, color: "var(--greed)" },
];

export const pnlByEmotion = [
  { mood: "Calm",    pnl:  1240 },
  { mood: "Fear",    pnl:  -210 },
  { mood: "Revenge", pnl:  -640 },
  { mood: "Greedy",  pnl:  -380 },
];

export const behavioralPatterns = [
  { title: "Revenge after losses",    detail: "You enter a counter-trade within 8 min after 67% of red trades. Expected cost: -1.4R / instance." },
  { title: "Monday overtrading",      detail: "Trade count on Mondays is 2.3× your weekly average. Win rate drops to 38%." },
  { title: "Profit lock works",       detail: "On days you hit +$300 and stop, you keep 92% of profits. Without a lock: 41%." },
  { title: "Pre-market journaling",   detail: "Sessions with a written thesis: 78% win rate vs 49% without." },
];

// ── Coach (used by /coach) ────────────────────────────────────────────────────
export const coachStarters = [
  "Why did I revenge-trade today?",
  "Help me reset before the open",
  "I'm feeling FOMO — talk me through it",
  "Build me a 5-minute pre-market routine",
];

export const coachThread = [
  { role: "assistant" as const, text: "Good morning. Take a slow breath before we begin. How are you walking into today's session?" },
  { role: "user" as const,      text: "Anxious. I'm down 3 days in a row." },
  { role: "assistant" as const, text: "That's worth honoring — three red days creates pressure to 'make it back', and that pressure is the real risk. Let's name it: what would a disciplined version of you do at the open today?" },
  { role: "user" as const,      text: "Wait for one A+ setup. Skip the first 15 minutes." },
  { role: "assistant" as const, text: "Beautiful. Write it at the top of your journal: *Wait. One A+ setup. Skip the first 15.* When you feel the urge to deviate, that line is your anchor." },
];

// ── Time Finder (used by /dashboard Tab 1) ────────────────────────────────────
export type ForexSession = {
  name: string;
  utcOpen: number;
  utcClose: number;
  pairs: string[];
  color: string;
  description: string;
};

export const forexSessions: ForexSession[] = [
  { name: "Sydney",   utcOpen: 22, utcClose: 7,  color: "#4ade80", pairs: ["AUD/USD", "NZD/USD", "AUD/NZD", "AUD/JPY"], description: "Quietest session. Low volatility, good for AUD & NZD pairs." },
  { name: "Tokyo",    utcOpen: 0,  utcClose: 9,  color: "#60a5fa", pairs: ["USD/JPY", "AUD/JPY", "EUR/JPY", "GBP/JPY"], description: "Asian session. JPY pairs most active. Range-bound moves common." },
  { name: "London",   utcOpen: 8,  utcClose: 17, color: "#f472b6", pairs: ["EUR/USD", "GBP/USD", "EUR/GBP", "USD/CHF"], description: "Highest volume. Major trend moves start here. Best for EUR & GBP." },
  { name: "New York", utcOpen: 13, utcClose: 22, color: "#facc15", pairs: ["USD/CAD", "USD/CHF", "XAU/USD", "USD/JPY"], description: "Overlaps with London 13–17 UTC — peak volatility window of the day." },
];

export type Country = { label: string; offset: number };

export const countries: Country[] = [
  { label: "Pakistan (PKT)",          offset: 5    },
  { label: "UAE / Dubai (GST)",       offset: 4    },
  { label: "India (IST)",             offset: 5.5  },
  { label: "United Kingdom (GMT)",    offset: 0    },
  { label: "Germany / EU (CET)",      offset: 1    },
  { label: "USA — New York (EST)",    offset: -5   },
  { label: "USA — Los Angeles (PST)", offset: -8   },
  { label: "Canada — Toronto (EST)",  offset: -5   },
  { label: "Australia — Sydney",      offset: 11   },
  { label: "Japan (JST)",             offset: 9    },
];

// ── Trade Logger (used by /dashboard Tab 2) ───────────────────────────────────
export type TradeResult = "win" | "loss";

export type TradeEntry = {
  id: number;
  time: string;
  pair: string;
  result: TradeResult;
  amount: number;
  pnl: number;
};

export const initialTradeLog: TradeEntry[] = [
  { id: 1, time: "09:14", pair: "EUR/USD", result: "win",  amount: 50, pnl:  95 },
  { id: 2, time: "10:38", pair: "EUR/USD", result: "loss", amount: 50, pnl: -50 },
];

export const currencyPairs = [
  "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD",
  "XAU/USD", "USD/CAD", "NZD/USD", "USD/CHF", "GBP/JPY",
];

// ── Guide (used by /dashboard Tab 4) ─────────────────────────────────────────
export type Indicator = {
  id: string;
  name: string;
  category: string;
  description: string;
  signal: string;
  bestWhen: string;
  winRate: number;
  rr: number;
  tries: number;
};

export const indicators: Indicator[] = [
  { id: "rsi",  name: "RSI",               category: "Momentum",    description: "Oscillates 0–100. Above 70 = overbought, below 30 = oversold.", signal: "Sell when RSI crosses below 70 from above; buy when it crosses above 30 from below.", bestWhen: "Ranging, sideways markets",   winRate: 58, rr: 1.4, tries: 312 },
  { id: "macd", name: "MACD",              category: "Trend",       description: "Difference between 12 & 26 EMA. Signal line = 9 EMA of MACD.", signal: "Buy when MACD line crosses above signal; sell when it crosses below.", bestWhen: "Trending markets",              winRate: 61, rr: 1.8, tries: 274 },
  { id: "ema",  name: "EMA 20 / 50",       category: "Trend",       description: "Fast EMA (20) vs slow EMA (50) crossover system.", signal: "Buy when 20 EMA crosses above 50 EMA; sell when it crosses below.", bestWhen: "Strong trending markets",       winRate: 63, rr: 2.1, tries: 401 },
  { id: "bb",   name: "Bollinger Bands",   category: "Volatility",  description: "20 SMA ± 2 standard deviations. Bands expand in volatility, contract in calm.", signal: "Trade breakouts when bands squeeze tight for 5+ candles.", bestWhen: "Pre-breakout squeeze setups",   winRate: 54, rr: 1.6, tries: 198 },
  { id: "sr",   name: "Support / Resistance", category: "Price Action", description: "Historical price levels where buyers or sellers repeatedly step in.", signal: "Sell at resistance with bearish candle confirmation; buy at support with bullish confirmation.", bestWhen: "Any market condition",          winRate: 66, rr: 2.4, tries: 520 },
  { id: "fib",  name: "Fibonacci",         category: "Price Action", description: "Key retracement levels: 38.2%, 50%, 61.8% after a strong impulse move.", signal: "Look for reversal candles at 61.8% (golden ratio) after a clear impulse.", bestWhen: "After a strong trend impulse",  winRate: 59, rr: 1.9, tries: 287 },
];

export type Strategy = {
  name: string;
  indicators: string[];
  entry: string;
  exit: string;
  risk: "Low" | "Medium" | "High";
  winRate: number;
  rr: number;
};

export const strategies: Strategy[] = [
  {
    name: "EMA + RSI Confluence",
    indicators: ["EMA 20/50", "RSI"],
    entry: "Wait for EMA 20 to cross above EMA 50. Confirm RSI is between 40–60 (not overbought). Enter on the next candle close.",
    exit: "Take profit at 2× your stop loss. Move stop to breakeven when 1R is reached.",
    risk: "Medium", winRate: 67, rr: 2.2,
  },
  {
    name: "S/R + Price Action",
    indicators: ["Support / Resistance"],
    entry: "Identify a key S/R level. Wait for a pin bar or engulfing candle at that level. Enter after candle close.",
    exit: "TP at next major S/R level. SL below the rejection wick.",
    risk: "Low", winRate: 71, rr: 2.8,
  },
  {
    name: "MACD + Fibonacci",
    indicators: ["MACD", "Fibonacci"],
    entry: "Draw Fibonacci from the last major swing. Wait for price to reach 61.8% retracement. Enter when MACD line crosses signal line at that level.",
    exit: "TP at the 0% fib level (start of the impulse). SL below the 78.6% fib.",
    risk: "Medium", winRate: 64, rr: 2.0,
  },
  {
    name: "BB Squeeze Breakout",
    indicators: ["Bollinger Bands"],
    entry: "Wait for the bands to squeeze (narrow) for at least 5 candles. Enter in the direction of the first candle that breaks outside the bands.",
    exit: "TP at 2× the band width. SL on the opposite band.",
    risk: "High", winRate: 58, rr: 1.8,
  },
];
