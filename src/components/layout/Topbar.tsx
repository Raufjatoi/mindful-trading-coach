import { Menu, Bell, LogOut, LogIn } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar({ onMenu, title, subtitle }: { onMenu: () => void; title: string; subtitle?: string }) {
  const { user, signOut } = useAuth();

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : null;

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
        <h1 className="truncate font-display text-base font-semibold sm:text-lg">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs text-muted-foreground sm:inline-flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--sage)]" />
          Session active
        </span>

        <button className="rounded-xl border border-border/60 p-2 text-muted-foreground hover:bg-secondary">
          <Bell className="h-4 w-4" />
        </button>

        {user ? (
          /* Logged-in user avatar + dropdown */
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--blush)] text-xs font-semibold text-background transition hover:opacity-90"
                aria-label="User menu"
              >
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="cursor-pointer text-[var(--fear)] focus:text-[var(--fear)]"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* Guest — show sign in button */
          <Link
            to="/auth"
            className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
