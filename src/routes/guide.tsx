import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MotionCard } from "@/components/ui/motion-card";
import { cn } from "@/lib/utils";
import { indicators, strategies } from "@/lib/mock";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [{ title: "Guide — MindCandle" }],
  }),
  component: Guide,
});

function Guide() {
  const [view,     setView]     = useState<"indicators" | "strategies">("indicators");
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AppShell title="Guide" subtitle="Indicators, strategies, and when to use them.">
      <div className="space-y-5">
        {/* Toggle */}
        <div className="flex gap-2">
          {(["indicators", "strategies"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium capitalize transition",
                view === v
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {view === "indicators" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {indicators.map((ind, i) => (
              <motion.div
                key={ind.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <MotionCard
                  interactive
                  className="cursor-pointer"
                  onClick={() => setExpanded(expanded === ind.id ? null : ind.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                        {ind.category}
                      </span>
                      <p className="mt-2 font-display text-base font-semibold">{ind.name}</p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        expanded === ind.id && "rotate-180",
                      )}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ind.description}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Win Rate", value: `${ind.winRate}%`, color: "var(--sage)" },
                      { label: "Avg R:R",  value: `${ind.rr}` },
                      { label: "Tried",    value: `${ind.tries}` },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="rounded-xl bg-background/40 p-2">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className="font-display text-sm font-semibold" style={color ? { color } : {}}>{value}</p>
                      </div>
                    ))}
                  </div>

                  <AnimatePresence initial={false}>
                    {expanded === ind.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-2">
                          <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                            <p className="text-[11px] uppercase tracking-wider text-[var(--blush)]">Signal</p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ind.signal}</p>
                          </div>
                          <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                            <p className="text-[11px] uppercase tracking-wider text-[var(--sage)]">Best When</p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ind.bestWhen}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </MotionCard>
              </motion.div>
            ))}
          </div>
        )}

        {view === "strategies" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {strategies.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <MotionCard>
                  <div className="flex items-start justify-between">
                    <p className="font-display text-base font-semibold">{s.name}</p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px]"
                      style={
                        s.risk === "Low"
                          ? { background: "color-mix(in oklab,var(--sage) 15%,transparent)",  color: "var(--sage)"  }
                          : s.risk === "Medium"
                            ? { background: "color-mix(in oklab,var(--greed) 15%,transparent)", color: "var(--greed)" }
                            : { background: "color-mix(in oklab,var(--fear) 15%,transparent)",  color: "var(--fear)"  }
                      }
                    >
                      {s.risk} Risk
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.indicators.map((ind) => (
                      <span key={ind} className="rounded border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">{ind}</span>
                    ))}
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                      <p className="text-[11px] uppercase tracking-wider text-[var(--sage)]">Entry</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.entry}</p>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/30 p-3">
                      <p className="text-[11px] uppercase tracking-wider text-[var(--blush)]">Exit</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.exit}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl bg-background/40 p-2">
                      <p className="text-[10px] text-muted-foreground">Win Rate</p>
                      <p className="font-display text-sm font-semibold text-[var(--sage)]">{s.winRate}%</p>
                    </div>
                    <div className="rounded-xl bg-background/40 p-2">
                      <p className="text-[10px] text-muted-foreground">Avg R:R</p>
                      <p className="font-display text-sm font-semibold">{s.rr}</p>
                    </div>
                  </div>
                </MotionCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
