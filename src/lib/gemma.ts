import { GoogleGenAI } from "@google/genai";

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
