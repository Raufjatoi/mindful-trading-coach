import { Menu, Bell } from "lucide-react";

export function Topbar({ onMenu, title, subtitle }: { onMenu: () => void; title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/60 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-10">
      <button
        onClick={onMenu}
        className="rounded-xl p-2 text-muted-foreground hover:bg-secondary lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-base font-semibold sm:text-lg truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--sage)] animate-pulse" />
          Session active
        </span>
        <button className="rounded-xl border border-border/60 p-2 text-muted-foreground hover:bg-secondary">
          <Bell className="h-4 w-4" />
        </button>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--blush)] text-xs font-semibold text-background">
          M
        </div>
      </div>
    </header>
  );
}
