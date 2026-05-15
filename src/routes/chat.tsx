import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MotionCard } from "@/components/ui/motion-card";
import { MoodChip } from "@/components/ui/mood-chip";
import { coachStarters, coachThread, moods, type Mood } from "@/lib/mock";
import { askMentor, type ChatMessage } from "@/lib/gemma";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [{ title: "Chat — MindCandle" }],
  }),
  component: Chat,
});

function Chat() {
  const [thread, setThread] = useState<ChatMessage[]>(
    coachThread.map((m) => ({ role: m.role, text: m.text })),
  );
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<Mood>("Calm");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread, typing]);

  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    const updatedThread: ChatMessage[] = [...thread, { role: "user", text }];
    setThread(updatedThread);
    setInput("");
    setTyping(true);
    try {
      const reply = await askMentor(updatedThread, mood);
      setThread((t) => [...t, { role: "assistant", text: reply }]);
    } catch {
      setThread((t) => [
        ...t,
        {
          role: "assistant",
          text: "Take a breath. I'm having a little trouble connecting right now — try again in a moment.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <AppShell title="Chat" subtitle="A calm voice. Always present.">
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <MotionCard className="flex h-[70vh] min-h-[520px] flex-col p-0">
          <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--blush)] text-background">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="font-display text-sm font-medium">Mentor</p>
              <p className="text-[11px] text-muted-foreground">Online · Listening</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
            <AnimatePresence initial={false}>
              {thread.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-foreground text-background"
                        : "border border-border/60 bg-card/60"
                    )}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl border border-border/60 bg-card/60 px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          <div className="border-t border-border/60 p-3">
            <div className="mb-2 flex flex-wrap items-center gap-1.5 px-1">
              <span className="text-[11px] text-muted-foreground">I feel:</span>
              {moods.map((m) => (
                <MoodChip key={m} mood={m} size="sm" selected={mood === m} onClick={() => setMood(m)} />
              ))}
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-end gap-2 rounded-2xl border border-border/60 bg-background/60 p-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="What's on your mind?"
                className="flex-1 resize-none bg-transparent px-2 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </form>
          </div>
        </MotionCard>

        <div className="space-y-4">
          <MotionCard>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Try asking</p>
            <div className="mt-3 flex flex-col gap-2">
              {coachStarters.map((p) => (
                <motion.button
                  key={p}
                  whileHover={{ x: 2 }}
                  onClick={() => send(p)}
                  className="rounded-xl border border-border/50 bg-background/30 px-3 py-2.5 text-left text-sm text-foreground/90 transition hover:bg-background/60"
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </MotionCard>
        </div>
      </div>
    </AppShell>
  );
}
