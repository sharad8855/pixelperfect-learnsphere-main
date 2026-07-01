import { Bell, MessageSquare, Search, ChevronDown, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const user = useAuthStore((s) => s.user);
  const client = useAuthStore((s) => s.client);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const initials = (user?.name || user?.email || "User")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
      <div className="relative mx-auto flex w-full max-w-xl items-center">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search for courses, assignments, and more…"
          className="h-10 w-full rounded-full border border-border bg-secondary/60 pl-10 pr-12 text-sm text-foreground outline-none transition focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
        />
        <kbd className="pointer-events-none absolute right-3 hidden h-6 select-none items-center gap-1 rounded-md border border-border bg-muted/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">3</span>
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-secondary">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {initials}
            </div>
            <div className="hidden text-left leading-tight md:block">
              <div className="text-sm font-semibold">{user?.name || "User"}</div>
              <div className="text-xs text-muted-foreground">
                {user?.designation || client?.name || "Learner"}
              </div>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-2 text-xs text-muted-foreground">
              {client?.name || "No organization"}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/profile" })}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/organizations" })}>
              Switch organization
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
