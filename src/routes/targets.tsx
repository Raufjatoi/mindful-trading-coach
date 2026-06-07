import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle2, Circle, Trash2, Plus, FileText, Check, AlertCircle, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MotionCard } from "@/components/ui/motion-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase, type DbTarget } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";

export const Route = createFileRoute("/targets")({
  head: () => ({
    meta: [{ title: "Targets & Notes — MindCandle" }],
  }),
  component: TargetsPage,
});

type NoteSavingStatus = "idle" | "saving" | "saved" | "error";

function TargetsPage() {
  const { user } = useAuth();
  
  // Targets state
  const [targets, setTargets] = useState<DbTarget[]>([]);
  const [newTargetTitle, setNewTargetTitle] = useState("");
  const [loadingTargets, setLoadingTargets] = useState(true);
  const [submittingTarget, setSubmittingTarget] = useState(false);

  // Notes state
  const [notesContent, setNotesContent] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [savingStatus, setSavingStatus] = useState<NoteSavingStatus>("idle");
  const [isFirstLoadNotes, setIsFirstLoadNotes] = useState(true);

  // Load Targets
  useEffect(() => {
    if (user) {
      if (!supabase) {
        setLoadingTargets(false);
        return;
      }
      supabase
        .from("targets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .then(({ data, error }) => {
          if (error) console.error("Failed to load targets:", error);
          setTargets((data as DbTarget[]) ?? []);
          setLoadingTargets(false);
        });
    } else {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("mtc_guest_targets");
        setTargets(saved ? JSON.parse(saved) : []);
      }
      setLoadingTargets(false);
    }
  }, [user]);

  // Sync Guest Targets to localStorage
  useEffect(() => {
    if (user || typeof window === "undefined") return;
    localStorage.setItem("mtc_guest_targets", JSON.stringify(targets));
  }, [targets, user]);

  // Load Notes
  useEffect(() => {
    if (user) {
      if (!supabase) {
        setLoadingNotes(false);
        return;
      }
      supabase
        .from("trading_notes")
        .select("content")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) console.error("Failed to load notes:", error);
          setNotesContent(data?.content ?? "");
          setLoadingNotes(false);
          setIsFirstLoadNotes(true);
        });
    } else {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("mtc_guest_notes");
        setNotesContent(saved ?? "");
      }
      setLoadingNotes(false);
      setIsFirstLoadNotes(true);
    }
  }, [user]);

  // Autosave Notes (Debounced)
  useEffect(() => {
    if (loadingNotes) return;
    
    // Skip saving on the very first render block after loading completes
    if (isFirstLoadNotes) {
      setIsFirstLoadNotes(false);
      return;
    }

    setSavingStatus("saving");
    const timer = setTimeout(async () => {
      try {
        if (user && supabase) {
          const { error } = await supabase
            .from("trading_notes")
            .upsert({ 
              user_id: user.id, 
              content: notesContent,
              updated_at: new Date().toISOString() 
            });
          if (error) throw error;
        } else if (!user) {
          if (typeof window !== "undefined") {
            localStorage.setItem("mtc_guest_notes", notesContent);
          }
        }
        setSavingStatus("saved");
      } catch (err) {
        console.error("Notes autosave failed:", err);
        setSavingStatus("error");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [notesContent, loadingNotes, user]);

  // Add Target Action
  async function handleAddTarget(e: React.FormEvent) {
    e.preventDefault();
    const title = newTargetTitle.trim();
    if (!title || submittingTarget) return;

    setSubmittingTarget(true);

    if (user && supabase) {
      try {
        const { data, error } = await supabase
          .from("targets")
          .insert({ user_id: user.id, title, completed: false })
          .select();
        
        if (error) throw error;
        if (data) {
          setTargets((prev) => [...prev, data[0] as DbTarget]);
          setNewTargetTitle("");
        }
      } catch (err) {
        console.error("Failed to add target:", err);
      } finally {
        setSubmittingTarget(false);
      }
    } else {
      const newLocalTarget: DbTarget = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        title,
        completed: false,
      };
      setTargets((prev) => [...prev, newLocalTarget]);
      setNewTargetTitle("");
      setSubmittingTarget(false);
    }
  }

  // Toggle Target Completion
  async function handleToggleTarget(targetId: number, currentCompleted: boolean) {
    const nextCompleted = !currentCompleted;
    
    // Optimistic Update
    setTargets((prev) =>
      prev.map((t) => (t.id === targetId ? { ...t, completed: nextCompleted } : t))
    );

    if (user && supabase) {
      try {
        const { error } = await supabase
          .from("targets")
          .update({ completed: nextCompleted })
          .eq("id", targetId)
          .eq("user_id", user.id);
        
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update target:", err);
        // Rollback on failure
        setTargets((prev) =>
          prev.map((t) => (t.id === targetId ? { ...t, completed: currentCompleted } : t))
        );
      }
    }
  }

  // Delete Target Action
  async function handleDeleteTarget(targetId: number) {
    const originalTargets = [...targets];
    setTargets((prev) => prev.filter((t) => t.id !== targetId));

    if (user && supabase) {
      try {
        const { error } = await supabase
          .from("targets")
          .delete()
          .eq("id", targetId)
          .eq("user_id", user.id);
        
        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete target:", err);
        setTargets(originalTargets); // Rollback
      }
    }
  }

  // Statistics
  const totalCount = targets.length;
  const completedCount = targets.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <AppShell title="Targets & Notes" subtitle="Set daily trading rules, keep checklist objectives, and scratchpad your journal.">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Targets checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <MotionCard className="relative overflow-hidden">
            {/* Background gradient pill */}
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-500">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Trading Targets</h2>
                <p className="text-xs text-muted-foreground">Enforce rules. Real money is locked until all targets are done.</p>
              </div>
            </div>

            {/* Progress Bar */}
            {totalCount > 0 && (
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">{completedCount} of {totalCount} completed</span>
                  <span className="text-emerald-500">{completionPercentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Target Input form */}
            <form onSubmit={handleAddTarget} className="mt-5 flex gap-2">
              <Input
                placeholder="e.g. Max 3 losses today, No revenge trading..."
                value={newTargetTitle}
                onChange={(e) => setNewTargetTitle(e.target.value)}
                disabled={submittingTarget}
                className="flex-1 bg-secondary/20 border-border/60 focus-visible:ring-1 focus-visible:ring-emerald-500/50"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={submittingTarget || !newTargetTitle.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-soft"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            {/* Target List */}
            <div className="mt-5 space-y-2.5">
              {loadingTargets ? (
                <div className="flex flex-col gap-2 py-4">
                  <div className="h-10 w-full animate-pulse rounded-xl bg-secondary/30" />
                  <div className="h-10 w-full animate-pulse rounded-xl bg-secondary/30" />
                </div>
              ) : totalCount === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 p-6 text-center">
                  <Target className="mx-auto h-8 w-8 text-muted-foreground/40 stroke-[1.5]" />
                  <p className="mt-2 text-sm font-medium text-muted-foreground">No targets active</p>
                  <p className="text-xs text-muted-foreground/70">Add a target to enforce trading discipline today.</p>
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                  <AnimatePresence initial={false}>
                    {targets.map((target) => (
                      <motion.div
                        key={target.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "group flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-all duration-300",
                          target.completed
                            ? "bg-emerald-500/5 border-emerald-500/10 text-muted-foreground"
                            : "bg-secondary/10 border-border/60 text-foreground hover:border-border"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleTarget(target.id, target.completed)}
                          className="flex items-center gap-3 text-left flex-1"
                        >
                          <span className="flex-shrink-0 cursor-pointer text-emerald-500 transition-transform active:scale-90 duration-150">
                            {target.completed ? (
                              <CheckCircle2 className="h-5 w-5 fill-emerald-500 text-white dark:text-background" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground/60 hover:text-emerald-500" />
                            )}
                          </span>
                          <span
                            className={cn(
                              "text-sm font-medium transition-all",
                              target.completed && "line-through text-muted-foreground/60"
                            )}
                          >
                            {target.title}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTarget(target.id)}
                          className="text-muted-foreground/0 group-hover:text-muted-foreground hover:text-red-400 p-1 rounded transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Discipline Note */}
            {activeCount > 0 && (
              <div className="mt-5 flex gap-2 rounded-xl bg-amber-500/5 border border-amber-500/10 p-3.5 text-xs text-amber-500">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Discipline Lock Active</span>: You have {activeCount} uncompleted target{activeCount > 1 ? "s" : ""}. switching to **LIVE** trade mode is locked.
                </div>
              </div>
            )}
          </MotionCard>
        </div>

        {/* Right Column: Scratchpad Notes (7 cols) */}
        <div className="lg:col-span-7">
          <MotionCard className="relative overflow-hidden min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Notes Scratchpad</h2>
                  <p className="text-xs text-muted-foreground">Keep your notes, triggers, and analysis in one place.</p>
                </div>
              </div>

              {/* Autosave Indicators */}
              <div className="flex items-center gap-1.5 text-xs">
                {savingStatus === "saving" && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
                    Autosaving...
                  </span>
                )}
                {savingStatus === "saved" && (
                  <span className="flex items-center gap-1 text-emerald-500 font-medium">
                    <Check className="h-3.5 w-3.5" />
                    Saved
                  </span>
                )}
                {savingStatus === "error" && (
                  <span className="flex items-center gap-1 text-red-500 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Save Error
                  </span>
                )}
                {savingStatus === "idle" && (
                  <span className="text-muted-foreground/60">Ready</span>
                )}
              </div>
            </div>

            {loadingNotes ? (
              <div className="flex-1 flex flex-col gap-3 pt-4">
                <div className="h-6 w-1/4 animate-pulse rounded bg-secondary/30" />
                <div className="flex-1 animate-pulse rounded-2xl bg-secondary/20" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col pt-4">
                <textarea
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  placeholder="Start typing your notes here... They will save automatically as you write. Record your emotional triggers, strategy errors, key observations, or custom reminders."
                  className="flex-1 w-full min-h-[350px] bg-transparent border-none text-foreground placeholder:text-muted-foreground/50 focus:ring-0 focus:outline-none resize-none font-sans text-sm leading-relaxed"
                />
                
                <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground/60 flex items-center justify-between">
                  <span>Pressing notes down builds trade intuition.</span>
                  <span>Character count: {notesContent.length}</span>
                </div>
              </div>
            )}
          </MotionCard>
        </div>

      </div>
    </AppShell>
  );
}
