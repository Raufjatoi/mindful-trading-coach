import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Sparkles, BookHeart, LineChart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/coach", label: "AI Coach", icon: Sparkles },
  { to: "/journal", label: "Journal", icon: BookHeart },
  { to: "/analytics", label: "Analytics", icon: LineChart },
] as const;

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const content = (
    <div className="flex h-full flex-col gap-8 p-6">
      <Link to="/" className="flex items-center gap-2.5 group">
        <img src="/logo.png" alt="MindCandle" className="h-12 w-12 rounded-xl object-cover shadow-soft" />
        <span className="font-display text-lg font-semibold tracking-tight">MindCandle</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--sage)]"
                />
              )}
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-border/60 bg-card/50 p-4">
        <p className="font-display text-sm font-medium">Daily intention</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          "I trade the plan, not the feeling."
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-30 h-screen w-64 flex-col border-r border-border/60 bg-sidebar/40 backdrop-blur-xl">
        {content}
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
              className="fixed left-0 top-0 z-50 h-screen w-72 border-r border-border/60 bg-sidebar lg:hidden"
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 rounded-full p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
