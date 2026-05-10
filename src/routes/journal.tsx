import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MotionCard } from "@/components/ui/motion-card";
import { MoodChip } from "@/components/ui/mood-chip";
import { journalEntries, moods, type Mood } from "@/lib/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — MindCandle" },
      { name: "description", content: "Emotion-based trading journal. Capture mood, intention, and outcome." },
      { property: "og:title", content: "MindCandle Journal" },
      { property: "og:description", content: "Patterns surface — gently." },
    ],
  }),
  component: Journal,
});

function Journal() {
  const [filter, setFilter] = useState<Mood | "All">("All");
  const [open, setOpen] = useState(false);

  const filtered = filter === "All" ? journalEntries : journalEntries.filter((e) => e.mood === filter);

  return (
    <AppShell title="Trading Journal" subtitle="Write it down. The mind clears.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilter("All")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition",
              filter === "All"
                ? "border-foreground/30 bg-foreground/5 text-foreground"
                : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
            )}
          >All</button>
          {moods.map((m) => (
            <MoodChip key={m} mood={m} size="sm" selected={filter === m} onClick={() => setFilter(m)} />
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New entry
        </motion.button>
      </div>

      <motion.section layout className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {filtered.map((e, i) => {
            const positive = e.pnl > 0;
            const neutral = e.pnl === 0;
            return (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.04 }}
              >
                <MotionCard interactive className="h-full">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{e.date}</p>
                      <div className="mt-2"><MoodChip mood={e.mood} size="sm" /></div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px]",
                        neutral
                          ? "border-border/60 text-muted-foreground"
                          : positive
                            ? "border-[var(--sage)]/30 text-[var(--sage)]"
                            : "border-[var(--fear)]/30 text-[var(--fear)]"
                      )}
                    >
                      {neutral ? "Flat" : positive ? `+$${e.pnl}` : `-$${Math.abs(e.pnl)}`}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/90">{e.snippet}</p>
                  <div className="mt-4 rounded-xl border border-border/40 bg-background/30 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--blush)]">AI insight</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{e.insight}</p>
                  </div>
                </MotionCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.section>

      <AnimatePresence>
        {open && <NewEntryDialog onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </AppShell>
  );
}

function NewEntryDialog({ onClose }: { onClose: () => void }) {
  const [mood, setMood] = useState<Mood>("Calm");
  const [confidence, setConfidence] = useState(60);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", damping: 24, stiffness: 240 }}
        className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border/60 bg-card p-6 shadow-soft"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">New journal entry</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Mood</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {moods.map((m) => (
                <MoodChip key={m} mood={m} size="sm" selected={mood === m} onClick={() => setMood(m)} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Confidence</p>
              <span className="text-xs text-foreground">{confidence}%</span>
            </div>
            <input
              type="range" min={0} max={100} value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--sage)]"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">What happened?</p>
            <textarea
              rows={4}
              placeholder="Describe the trade, the feeling, the moment of decision..."
              className="mt-2 w-full resize-none rounded-2xl border border-border/60 bg-background/60 p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-full border border-border/60 px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
            <button onClick={onClose} className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90">Save entry</button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
