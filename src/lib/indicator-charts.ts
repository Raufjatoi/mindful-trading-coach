// Pre-computed sample data for indicator visualisation charts in /guide

// ── RSI ──────────────────────────────────────────────────────────────────────
export const rsiData = [
  { i: 1,  price: 100, rsi: 48 },
  { i: 2,  price: 103, rsi: 54 },
  { i: 3,  price: 107, rsi: 61 },
  { i: 4,  price: 111, rsi: 67 },
  { i: 5,  price: 115, rsi: 73 },
  { i: 6,  price: 118, rsi: 78 },
  { i: 7,  price: 120, rsi: 82 },
  { i: 8,  price: 119, rsi: 77 },
  { i: 9,  price: 116, rsi: 69 },
  { i: 10, price: 112, rsi: 59 },
  { i: 11, price: 108, rsi: 50 },
  { i: 12, price: 104, rsi: 41 },
  { i: 13, price: 100, rsi: 33 },
  { i: 14, price:  96, rsi: 26 },
  { i: 15, price:  92, rsi: 20 },
  { i: 16, price:  90, rsi: 17 },
  { i: 17, price:  93, rsi: 24 },
  { i: 18, price:  96, rsi: 32 },
  { i: 19, price: 100, rsi: 40 },
  { i: 20, price: 104, rsi: 50 },
];

export const rsiFormula = [
  "RSI = 100 − [100 ÷ (1 + RS)]",
  "RS  = Avg Gain(14) ÷ Avg Loss(14)",
  "Overbought: RSI > 70  →  watch for reversal sell",
  "Oversold:   RSI < 30  →  watch for reversal buy",
];

// ── MACD ─────────────────────────────────────────────────────────────────────
export const macdData = [
  { i: 1,  macd: -1.8, signal: -1.2, hist: -0.6 },
  { i: 2,  macd: -1.4, signal: -1.3, hist: -0.1 },
  { i: 3,  macd: -0.9, signal: -1.2, hist:  0.3 },
  { i: 4,  macd: -0.3, signal: -1.0, hist:  0.7 },
  { i: 5,  macd:  0.2, signal: -0.7, hist:  0.9 },
  { i: 6,  macd:  0.8, signal: -0.3, hist:  1.1 }, // bullish crossover
  { i: 7,  macd:  1.3, signal:  0.2, hist:  1.1 },
  { i: 8,  macd:  1.7, signal:  0.6, hist:  1.1 },
  { i: 9,  macd:  1.9, signal:  0.9, hist:  1.0 },
  { i: 10, macd:  1.8, signal:  1.2, hist:  0.6 },
  { i: 11, macd:  1.5, signal:  1.4, hist:  0.1 },
  { i: 12, macd:  1.1, signal:  1.4, hist: -0.3 },
  { i: 13, macd:  0.6, signal:  1.3, hist: -0.7 },
  { i: 14, macd:  0.1, signal:  1.1, hist: -1.0 },
  { i: 15, macd: -0.5, signal:  0.7, hist: -1.2 }, // bearish crossover
  { i: 16, macd: -1.0, signal:  0.3, hist: -1.3 },
  { i: 17, macd: -1.4, signal: -0.1, hist: -1.3 },
  { i: 18, macd: -1.6, signal: -0.4, hist: -1.2 },
  { i: 19, macd: -1.5, signal: -0.7, hist: -0.8 },
  { i: 20, macd: -1.2, signal: -0.8, hist: -0.4 },
];

export const macdFormula = [
  "MACD   = EMA(12) − EMA(26)",
  "Signal = EMA(MACD, 9)",
  "Hist   = MACD − Signal",
  "Buy:  MACD line crosses above Signal line",
  "Sell: MACD line crosses below Signal line",
];

// ── EMA 20 / 50 ──────────────────────────────────────────────────────────────
export const emaData = [
  { i: 1,  price:  98, ema20: 104, ema50: 108 },
  { i: 2,  price:  99, ema20: 103, ema50: 107 },
  { i: 3,  price: 100, ema20: 102, ema50: 107 },
  { i: 4,  price: 101, ema20: 101, ema50: 106 },
  { i: 5,  price: 103, ema20: 101, ema50: 106 },
  { i: 6,  price: 105, ema20: 101, ema50: 105 },
  { i: 7,  price: 107, ema20: 102, ema50: 105 },
  { i: 8,  price: 109, ema20: 103, ema50: 105 },
  { i: 9,  price: 111, ema20: 104, ema50: 105 },
  { i: 10, price: 113, ema20: 106, ema50: 105 }, // golden cross ↑
  { i: 11, price: 115, ema20: 107, ema50: 106 },
  { i: 12, price: 117, ema20: 109, ema50: 106 },
  { i: 13, price: 119, ema20: 111, ema50: 107 },
  { i: 14, price: 121, ema20: 113, ema50: 108 },
  { i: 15, price: 122, ema20: 115, ema50: 109 },
  { i: 16, price: 123, ema20: 116, ema50: 110 },
  { i: 17, price: 124, ema20: 118, ema50: 111 },
  { i: 18, price: 125, ema20: 119, ema50: 112 },
  { i: 19, price: 126, ema20: 120, ema50: 113 },
  { i: 20, price: 127, ema20: 121, ema50: 114 },
];

export const emaFormula = [
  "EMA(t) = P(t) × k + EMA(t−1) × (1 − k)",
  "k = 2 ÷ (N + 1)",
  "EMA 20 → k = 0.0952  (fast, responsive)",
  "EMA 50 → k = 0.0385  (slow, trend filter)",
  "Golden Cross: EMA20 crosses above EMA50  →  Buy",
  "Death Cross:  EMA20 crosses below EMA50  →  Sell",
];

// ── Bollinger Bands ───────────────────────────────────────────────────────────
export const bbData = [
  { i: 1,  price: 100, upper: 108, mid: 100, lower:  92 },
  { i: 2,  price: 102, upper: 108, mid: 100, lower:  92 },
  { i: 3,  price: 104, upper: 108, mid: 101, lower:  94 },
  { i: 4,  price: 106, upper: 109, mid: 101, lower:  93 },
  { i: 5,  price: 108, upper: 109, mid: 102, lower:  95 },
  { i: 6,  price: 108, upper: 109, mid: 102, lower:  95 }, // at upper band
  { i: 7,  price: 107, upper: 110, mid: 103, lower:  96 },
  { i: 8,  price: 105, upper: 110, mid: 103, lower:  96 },
  { i: 9,  price: 104, upper: 107, mid: 103, lower:  99 }, // squeeze begins
  { i: 10, price: 104, upper: 106, mid: 103, lower: 100 },
  { i: 11, price: 103, upper: 105, mid: 103, lower: 101 },
  { i: 12, price: 104, upper: 105, mid: 103, lower: 101 }, // tightest squeeze
  { i: 13, price: 106, upper: 107, mid: 104, lower: 101 }, // breakout
  { i: 14, price: 109, upper: 110, mid: 105, lower: 100 },
  { i: 15, price: 112, upper: 114, mid: 107, lower: 100 },
  { i: 16, price: 115, upper: 117, mid: 109, lower: 101 },
  { i: 17, price: 114, upper: 118, mid: 110, lower: 102 },
  { i: 18, price: 112, upper: 118, mid: 111, lower: 104 },
  { i: 19, price: 111, upper: 117, mid: 111, lower: 105 },
  { i: 20, price: 112, upper: 117, mid: 112, lower: 107 },
];

export const bbFormula = [
  "Middle = SMA(20)",
  "Upper  = SMA(20) + 2σ",
  "Lower  = SMA(20) − 2σ",
  "σ = standard deviation of price over 20 bars",
  "Squeeze (bands narrow)  →  big move incoming",
  "Price touches upper band →  potential reversal down",
  "Price touches lower band →  potential reversal up",
];

// ── Support / Resistance ──────────────────────────────────────────────────────
export const srData = [
  { i: 1,  price: 105 },
  { i: 2,  price: 104 },
  { i: 3,  price: 103 },
  { i: 4,  price: 100 }, // support touch 1
  { i: 5,  price: 101 },
  { i: 6,  price: 104 },
  { i: 7,  price: 108 },
  { i: 8,  price: 112 },
  { i: 9,  price: 115 }, // resistance touch 1
  { i: 10, price: 113 },
  { i: 11, price: 109 },
  { i: 12, price: 105 },
  { i: 13, price: 101 },
  { i: 14, price: 100 }, // support touch 2
  { i: 15, price: 102 },
  { i: 16, price: 106 },
  { i: 17, price: 110 },
  { i: 18, price: 114 },
  { i: 19, price: 115 }, // resistance touch 2
  { i: 20, price: 116 }, // breakout
];

export const srSupport    = 100;
export const srResistance = 115;

export const srFormula = [
  "No formula — Price Action based",
  "Support:    level where buyers repeatedly step in",
  "Resistance: level where sellers repeatedly step in",
  "More touches = stronger level",
  "Breakout above resistance → becomes new support",
  "Breakdown below support   → becomes new resistance",
];

// ── Fibonacci ─────────────────────────────────────────────────────────────────
export const fibData = [
  { i: 1,  price: 100 }, // swing low
  { i: 2,  price: 104 },
  { i: 3,  price: 109 },
  { i: 4,  price: 113 },
  { i: 5,  price: 118 },
  { i: 6,  price: 122 },
  { i: 7,  price: 126 },
  { i: 8,  price: 130 }, // swing high
  { i: 9,  price: 127 },
  { i: 10, price: 124 },
  { i: 11, price: 122 },
  { i: 12, price: 119 }, // 38.2% level ~118.5
  { i: 13, price: 116 },
  { i: 14, price: 112 }, // 61.8% golden ratio ~111.5
  { i: 15, price: 113 },
  { i: 16, price: 116 }, // bounce from golden ratio
  { i: 17, price: 120 },
  { i: 18, price: 124 },
  { i: 19, price: 128 },
  { i: 20, price: 130 },
];

// swing low=100, swing high=130, range=30
export const fibLevels = [
  { price: 130,   label: "0%",      color: "#94a3b8" },
  { price: 122.9, label: "23.6%",   color: "#94a3b8" },
  { price: 118.5, label: "38.2%",   color: "#60a5fa" },
  { price: 115,   label: "50%",     color: "#a78bfa" },
  { price: 111.5, label: "61.8% ★", color: "#4ade80" }, // golden ratio
  { price: 106.4, label: "78.6%",   color: "#f472b6" },
  { price: 100,   label: "100%",    color: "#f87171" },
];

export const fibFormula = [
  "Derived from the golden ratio  φ = 1.618",
  "Key retracement levels after an impulse move:",
  "  23.6% — shallow pullback (strong trend)",
  "  38.2% — moderate retracement",
  "  50%   — mid-point (psychological level)",
  "  61.8% — golden ratio ★ most watched level",
  "  78.6% — deep retracement (trend weakening)",
];
