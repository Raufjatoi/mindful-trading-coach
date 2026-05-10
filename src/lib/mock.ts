export type Mood = "Calm" | "Fear" | "Revenge" | "Greedy";

export const moodColor: Record<Mood, string> = {
  Calm: "var(--sage)",
  Fear: "var(--fear)",
  Revenge: "var(--blush)",
  Greedy: "var(--greed)",
};

export const moods: Mood[] = ["Calm", "Fear", "Revenge", "Greedy"];

export const recentTrades = [
  { id: 1, symbol: "AAPL", pnl: 142.3, entryMood: "Calm", exitMood: "Calm", discipline: "Followed plan", time: "09:42" },
  { id: 2, symbol: "TSLA", pnl: -88.5, entryMood: "Greedy", exitMood: "Fear", discipline: "Oversized", time: "10:14" },
  { id: 3, symbol: "NVDA", pnl: 320.0, entryMood: "Calm", exitMood: "Calm", discipline: "Patient entry", time: "11:02" },
  { id: 4, symbol: "SPY", pnl: -45.2, entryMood: "Revenge", exitMood: "Fear", discipline: "Chased loss", time: "12:30" },
  { id: 5, symbol: "MSFT", pnl: 76.4, entryMood: "Calm", exitMood: "Calm", discipline: "Took profit at target", time: "13:55" },
] as const;

export const aiReflections = [
  "Your best trades today happened when you waited for confirmation. Notice the pattern: patience precedes profit.",
  "You revenge-traded SPY 8 minutes after the TSLA loss. Next time, try a 15-minute pause.",
  "Discipline is trending upward 4 days in a row. Keep the pre-market routine.",
];

export const journalEntries = [
  { id: "j1", date: "Today · 14:20", mood: "Calm" as Mood, pnl: 405, snippet: "Stuck to the plan. Two A+ setups, sized correctly. Felt no urge to add risk.", insight: "Calm + plan-driven = your edge." },
  { id: "j2", date: "Today · 10:45", mood: "Revenge" as Mood, pnl: -88, snippet: "Hit stop on TSLA, immediately took a counter-trend short. Knew it was wrong.", insight: "Revenge entries cost you 1.4R on average." },
  { id: "j3", date: "Yesterday · 15:10", mood: "Greedy" as Mood, pnl: -210, snippet: "Was up nicely, doubled position chasing more. Gave it all back + some.", insight: "Greed clusters near the close. Set a daily profit lock." },
  { id: "j4", date: "Yesterday · 09:30", mood: "Fear" as Mood, pnl: 0, snippet: "Saw the setup, hesitated, didn't pull the trigger. Watched it run.", insight: "Fear of loss is also a cost. Practice paper-pulling triggers." },
  { id: "j5", date: "Mon · 11:00", mood: "Calm" as Mood, pnl: 180, snippet: "Pre-market journaling helped. Walked into the open with one clear thesis.", insight: "Mornings with a written thesis: 78% win rate." },
  { id: "j6", date: "Mon · 13:40", mood: "Calm" as Mood, pnl: 95, snippet: "Skipped a marginal setup. Felt good to do nothing.", insight: "Skipped trades are wins too." },
];

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
  { day: "Fri", calm: 72, fear: 12, revenge: 8, greedy: 8 },
  { day: "Sat", calm: 78, fear: 10, revenge: 6, greedy: 6 },
  { day: "Sun", calm: 80, fear: 8, revenge: 6, greedy: 6 },
];

export const emotionDistribution = [
  { name: "Calm", value: 58, color: "var(--sage)" },
  { name: "Fear", value: 18, color: "var(--fear)" },
  { name: "Revenge", value: 12, color: "var(--blush)" },
  { name: "Greedy", value: 12, color: "var(--greed)" },
];

export const pnlByEmotion = [
  { mood: "Calm", pnl: 1240 },
  { mood: "Fear", pnl: -210 },
  { mood: "Revenge", pnl: -640 },
  { mood: "Greedy", pnl: -380 },
];

export const behavioralPatterns = [
  { title: "Revenge after losses", detail: "You enter a counter-trade within 8 min after 67% of red trades. Expected cost: -1.4R / instance." },
  { title: "Monday overtrading", detail: "Trade count on Mondays is 2.3× your weekly average. Win rate drops to 38%." },
  { title: "Profit lock works", detail: "On days you hit +$300 and stop, you keep 92% of profits. Without a lock: 41%." },
  { title: "Pre-market journaling", detail: "Sessions with a written thesis: 78% win rate vs 49% without." },
];

export const coachStarters = [
  "Why did I revenge-trade today?",
  "Help me reset before the open",
  "I'm feeling FOMO — talk me through it",
  "Build me a 5-minute pre-market routine",
];

export const coachThread = [
  { role: "assistant" as const, text: "Good morning. Take a slow breath before we begin. How are you walking into today's session?" },
  { role: "user" as const, text: "Anxious. I'm down 3 days in a row." },
  { role: "assistant" as const, text: "That's worth honoring — three red days creates pressure to 'make it back', and that pressure is the real risk. Let's name it: what would a disciplined version of you do at the open today?" },
  { role: "user" as const, text: "Wait for one A+ setup. Skip the first 15 minutes." },
  { role: "assistant" as const, text: "Beautiful. Write it at the top of your journal: *Wait. One A+ setup. Skip the first 15.* When you feel the urge to deviate, that line is your anchor." },
];
