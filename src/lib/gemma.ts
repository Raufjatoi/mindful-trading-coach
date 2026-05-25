import { GoogleGenAI } from "@google/genai";
import { type DbTrade } from "./supabase";

const MODEL = "gemma-4-26b-a4b-it";

const MENTOR_SYSTEM = `You are a mindful trading coach named Mentor. Help traders build emotional discipline and calm decision-making.
- Respond in 2–4 short sentences only.
- Ask one reflective question at the end when appropriate.
- Never give specific financial or investment advice.
- If the trader describes revenge trading, FOMO, or overtrading, name it gently and redirect.
- Tone: calm, wise, warm.`;

const NEWS_SYSTEM = `You are an AI market analyst. Analyze the financial news headlines provided.
Return ONLY a valid JSON array with exactly 4 objects. Each object must have:
- "title": string (4–6 words naming the pattern)
- "detail": string (1–2 sentences with an actionable insight for traders)
- "impact": "bullish" | "bearish" | "neutral"
Output nothing outside the JSON array — no markdown, no explanation.`;

function getClient(): GoogleGenAI {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY as string | undefined;
  if (!apiKey || apiKey === "your-google-ai-studio-key") {
    throw new Error("VITE_GOOGLE_AI_KEY is not set in .env");
  }
  return new GoogleGenAI({ apiKey });
}

// ── Chat mentor ───────────────────────────────────────────────────────────────

export type ChatMessage = { role: "user" | "assistant"; text: string };

export async function askMentor(
  messages: ChatMessage[],
  mood: string,
): Promise<string> {
  const ai = getClient();

  const history = messages
    .slice(0, -1)
    .map((m) => `${m.role === "user" ? "Trader" : "Mentor"}: ${m.text}`)
    .join("\n");

  const last = messages[messages.length - 1];

  const prompt = [history, `Trader [mood: ${mood}]: ${last.text}`, "Mentor:"]
    .filter(Boolean)
    .join("\n");

  const response = await ai.models.generateContent({
    model: MODEL,
    config: {
      systemInstruction: MENTOR_SYSTEM,
      temperature: 0.7,
      maxOutputTokens: 600,
    },
    contents: prompt,
  });

  return (response.text ?? "").replace(/^Mentor:\s*/i, "").trim();
}

// ── News pattern analysis ─────────────────────────────────────────────────────

export type GemmaInsight = {
  title: string;
  detail: string;
  impact: "bullish" | "bearish" | "neutral";
};

export type NewsInput = {
  headline: string;
  summary: string;
  sentiment: string;
  tickers: string[];
  source: string;
};

export async function analyzeNewsFeed(items: NewsInput[]): Promise<GemmaInsight[]> {
  const ai = getClient();

  const formatted = items
    .map(
      (item, i) =>
        `${i + 1}. [${item.sentiment.toUpperCase()}] ${item.source}\n` +
        `Headline: ${item.headline}\n` +
        `Summary: ${item.summary}\n` +
        `Tickers: ${item.tickers.join(", ")}`,
    )
    .join("\n\n");

  const response = await ai.models.generateContent({
    model: MODEL,
    config: {
      systemInstruction: NEWS_SYSTEM,
      temperature: 0.4,
      maxOutputTokens: 900,
    },
    contents: formatted,
  });

  const raw = response.text ?? "[]";
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned) as GemmaInsight[];
}

// ── Trading behavior psychology analysis ──────────────────────────────────────

const BEHAVIOR_SYSTEM = `You are a professional trading psychologist and quantitative analyst.
Analyze the user's trading log provided.
Identify key behavioral patterns, habits, mistakes, or psychological flags (e.g., revenge trading, overtrading, size consistency, FOMO, discipline indicators).
Return ONLY a valid JSON array with a maximum of 4 objects. Each object must have:
- "title": string (3–5 words naming the observed behavioral pattern)
- "detail": string (1–2 sentences explaining what was observed in the real data and a brief piece of actionable advice)

Keep descriptions grounded in the actual numbers, pairs, outcomes, sizes, or timelines from the user's trades where possible.
Output nothing outside the JSON array — no markdown, no explanation.`;

export type BehaviorInsight = {
  title: string;
  detail: string;
};

export async function analyzeTradingBehavior(
  trades: DbTrade[],
): Promise<BehaviorInsight[]> {
  if (!trades || trades.length === 0) return [];

  const formatted = trades
    .map(
      (trade, i) =>
        `Trade #${i + 1}:\n` +
        `Date/Time: ${trade.created_at || trade.time}\n` +
        `Asset/Pair: ${trade.pair}\n` +
        `Duration: ${trade.duration || "1 min"}\n` +
        `Outcome: ${trade.result.toUpperCase()}\n` +
        `Amount: ${trade.amount}\n` +
        `PnL: ${trade.pnl}`
    )
    .join("\n\n");

  try {
    // ── Primary: Google GenAI (Gemini / Gemma) ──
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: MODEL,
      config: {
        systemInstruction: BEHAVIOR_SYSTEM,
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
      contents: `Here are the logged trades:\n\n${formatted}`,
    });

    const raw = response.text ?? "[]";
    const cleaned = raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();
    return JSON.parse(cleaned) as BehaviorInsight[];
  } catch (primaryErr) {
    console.warn("Primary Google GenAI behavior analysis failed, attempting Groq fallback...", primaryErr);
    
    // ── Fallback: Groq API Chat Completion ──
    const groqKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
    if (!groqKey || groqKey === "your-groq-api-key") {
      console.error("Groq fallback VITE_GROQ_API_KEY is not set in environment.");
      throw primaryErr; // Rethrow original to let UI fallback gracefully to mocks
    }

    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-r1-distill-llama-70b", // DeepSeek reasoning/compound model hosted on Groq!
          messages: [
            { role: "system", content: BEHAVIOR_SYSTEM },
            { role: "user", content: `Here are the logged trades:\n\n${formatted}` },
          ],
          temperature: 0.3,
          max_tokens: 1200,
        }),
      });

      if (!groqRes.ok) {
        throw new Error(`Groq HTTP completion error: status ${groqRes.status}`);
      }

      const groqData = await groqRes.json();
      const rawText = groqData.choices?.[0]?.message?.content ?? "[]";
      
      // Clean DeepSeek-R1 chain-of-thought think blocks and markdown code wraps
      const cleaned = rawText
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      return JSON.parse(cleaned) as BehaviorInsight[];
    } catch (fallbackErr) {
      console.error("Groq fallback analysis failed as well:", fallbackErr);
      throw primaryErr; // Rethrow primary error to keep visual mock grids intact
    }
  }
}
