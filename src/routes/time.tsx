import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Clock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MotionCard } from "@/components/ui/motion-card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { forexSessions, countries } from "@/lib/mock";

export const Route = createFileRoute("/time")({
  head: () => ({
    meta: [{ title: "Time Finder — MindCandle" }],
  }),
  component: TimeFinder,
});

function isActive(utcOpen: number, utcClose: number, utcH: number) {
  if (utcOpen < utcClose) return utcH >= utcOpen && utcH < utcClose;
  return utcH >= utcOpen || utcH < utcClose;
}

function toLocal(utcH: number, offset: number) {
  return ((utcH + offset) % 24 + 24) % 24;
}

function fmt(h: number) {
  return `${Math.floor(h % 24).toString().padStart(2, "0")}:${Math.round((h % 1) * 60).toString().padStart(2, "0")}`;
}

function TimeFinder() {
  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const country = countries[idx];
  const utcH    = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const localH  = toLocal(utcH, country.offset);

  const activeSessions = forexSessions.filter((s) => isActive(s.utcOpen, s.utcClose, utcH));
  const bestPairs      = [...new Set(activeSessions.flatMap((s) => s.pairs))];

  return (
    <AppShell title="Time Finder" subtitle="Best trading sessions for your timezone.">
      <div className="space-y-5">
        {/* Country + clock */}
        <MotionCard>
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex-1 min-w-52">
              <label className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                <Globe className="h-3.5 w-3.5" /> Your Country
              </label>
              <Select value={idx.toString()} onValueChange={(v) => setIdx(Number(v))}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {countries.map((c, i) => (
                    <SelectItem key={c.label} value={i.toString()}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Local Time
              </p>
              <p className="mt-1 font-display text-5xl font-semibold tabular-nums tracking-tight">{fmt(localH)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Active Sessions</p>
              <p
                className="mt-1 font-display text-5xl font-semibold"
                style={{ color: activeSessions.length ? "var(--sage)" : "var(--muted-foreground)" }}
              >
                {activeSessions.length}
              </p>
            </div>
          </div>
        </MotionCard>

        {/* Timeline */}
        <MotionCard>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">24 h Session Timeline (UTC)</p>
          <div className="relative mt-4 h-10 overflow-hidden rounded-xl bg-secondary/40">
            {forexSessions.map((s) => {
              const spans = s.utcOpen < s.utcClose
                ? [{ a: s.utcOpen, b: s.utcClose }]
                : [{ a: s.utcOpen, b: 24 }, { a: 0, b: s.utcClose }];
              return spans.map((sp, i) => (
                <div
                  key={s.name + i}
                  className="absolute top-0 bottom-0 opacity-60"
                  style={{ left: `${(sp.a / 24) * 100}%`, width: `${((sp.b - sp.a) / 24) * 100}%`, background: s.color }}
                />
              ));
            })}
            <div className="absolute top-0 bottom-0 z-10 w-0.5 bg-white" style={{ left: `${(utcH / 24) * 100}%` }} />
            {[6, 12, 18].map((h) => (
              <div key={h} className="absolute top-0 bottom-0 w-px bg-white/10" style={{ left: `${(h / 24) * 100}%` }} />
            ))}
          </div>
          <div className="mt-1 flex justify-between px-1 text-[10px] text-muted-foreground">
            {["00:00", "06:00", "12:00", "18:00", "24:00"].map((t) => <span key={t}>{t}</span>)}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {forexSessions.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-5 rounded-sm" style={{ background: s.color }} />
                {s.name}
              </div>
            ))}
          </div>
        </MotionCard>

        {/* Best pairs */}
        {bestPairs.length > 0 && (
          <MotionCard>
            <p className="text-xs uppercase tracking-wider text-[var(--sage)]">Best Pairs for You Right Now</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {bestPairs.map((pair) => (
                <span key={pair} className="rounded-full border border-[var(--sage)]/30 bg-[var(--sage)]/10 px-3 py-1 text-sm font-medium text-[var(--sage)]">
                  {pair}
                </span>
              ))}
            </div>
          </MotionCard>
        )}

        {/* Session cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {forexSessions.map((s, i) => {
            const active     = isActive(s.utcOpen, s.utcClose, utcH);
            const localOpen  = toLocal(s.utcOpen, country.offset);
            const localClose = toLocal(s.utcClose, country.offset);
            return (
              <motion.div key={s.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <MotionCard className="h-full" style={active ? { outline: `1px solid ${s.color}44` } : {}}>
                  <div className="flex items-start justify-between">
                    <p className="font-display text-base font-semibold">{s.name}</p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px]"
                      style={active ? { background: `${s.color}22`, color: s.color } : { background: "var(--secondary)", color: "var(--muted-foreground)" }}
                    >
                      {active ? "● Active" : "Closed"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{fmt(localOpen)} – {fmt(localClose)} local</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{s.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {s.pairs.map((p) => (
                      <span key={p} className="rounded border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">{p}</span>
                    ))}
                  </div>
                </MotionCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
