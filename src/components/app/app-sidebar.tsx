import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  ClipboardList,
  HelpCircle,
  Award,
  FileText,
  MessagesSquare,
  Users,
  UserCog,
  Calendar,
  User,
  Settings,
  LifeBuoy,
  Sparkles,
  Crown,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const learning = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "My Courses", icon: BookOpen },
  { to: "/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/tests", label: "Tests / Exams", icon: HelpCircle },
] as const;

const careers = [
  { to: "/resume", label: "My Resume", icon: FileText },
] as const;

const account = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function Section({ title }: { title: string }) {
  return (
    <div className="px-6 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-widest text-white/40">
      {title}
    </div>
  );
}

function Item({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-black/20"
          : "text-white/70 hover:bg-sidebar-accent hover:text-white"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span>{label}</span>
    </Link>
  );
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) =>
    to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(to);

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center px-6 pb-5 pt-6">
        <div className="flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
            <span className="text-lg">🎓</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight">Baapedu</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto pb-4">
        <Section title="Learning" />
        <div className="space-y-1">
          {learning.map((i) => (
            <Item key={i.to} {...i} active={isActive(i.to)} />
          ))}
        </div>

        <Section title="Careers" />
        <div className="space-y-1">
          {careers.map((i) => (
            <Item key={i.to} {...i} active={isActive(i.to)} />
          ))}
        </div>

        <Section title="Account" />
        <div className="space-y-1">
          {account.map((i) => (
            <Item key={i.to} {...i} active={isActive(i.to)} />
          ))}
        </div>
      </nav>

      <div className="m-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 p-4 border border-indigo-500/20 relative overflow-hidden shadow-lg shadow-black/25">
        <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-primary/10 blur-xl"></div>
        <div className="flex items-center gap-2 text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
            <Crown className="h-[18px] w-[18px] fill-amber-400/20" />
          </div>
          <span className="text-sm font-bold tracking-wide">Go Premium</span>
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-white/60">
          Unlock exclusive courses, certificates and premium resources.
        </p>
        <Button size="sm" className="mt-3.5 w-full bg-primary text-primary-foreground hover:bg-primary/95 transition-all font-semibold shadow-md active:scale-[0.98] cursor-pointer">
          Upgrade Now
        </Button>
      </div>
    </aside>
  );
}
