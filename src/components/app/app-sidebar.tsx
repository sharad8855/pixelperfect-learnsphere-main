import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  HelpCircle,
  FileText,
  Users,
  User,
  Settings,
  GraduationCap,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useAuthStore, type RoleType } from "@/lib/auth-store";
import { PERM } from "@/lib/can";

type SidebarItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: RoleType[];
  permission?: string;
};

const learning: SidebarItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "My Courses", icon: BookOpen, permission: PERM.COURSE_VIEW },
  { to: "/classes", label: "My Classes", icon: GraduationCap, permission: PERM.COURSE_VIEW },
  {
    to: "/assignments",
    label: "Assignments",
    icon: ClipboardList,
    permission: PERM.ACTION_ITEM_VIEW,
  },
  { to: "/tests", label: "Tests / Exams", icon: HelpCircle, permission: PERM.TEST_VIEW },
];

const management: SidebarItem[] = [
  { to: "/users", label: "Users", icon: Users, roles: ["admin"], permission: PERM.USER_MANAGE },
];

const careers: SidebarItem[] = [
  { to: "/resume", label: "My Resume", icon: FileText, permission: PERM.RESUME_VIEW },
];

const account: SidebarItem[] = [
  { to: "/profile", label: "Profile", icon: User, permission: PERM.PROFILE_MANAGE },
  { to: "/settings", label: "Settings", icon: Settings, permission: PERM.SETTINGS_MANAGE },
];

function Section({ title }: { title: string }) {
  return (
    <div className="px-6 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-widest text-white/40">
      {title}
    </div>
  );
}

function Item({ to, label, icon: Icon, active }: SidebarItem & { active: boolean }) {
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

function filterItems(
  items: SidebarItem[],
  role: ReturnType<typeof useAuthStore.getState>,
): SidebarItem[] {
  return items.filter((item) => {
    if (item.roles && !item.roles.includes(role.getRole())) return false;
    if (item.permission && !role.hasPermission(item.permission)) return false;
    return true;
  });
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const store = useAuthStore();
  const isActive = (to: string) =>
    to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(to);

  const visibleLearning = filterItems(learning, store);
  const visibleManagement = filterItems(management, store);
  const visibleCareers = filterItems(careers, store);
  const visibleAccount = filterItems(account, store);

  const hasAnyNav =
    visibleLearning.length > 0 ||
    visibleManagement.length > 0 ||
    visibleCareers.length > 0 ||
    visibleAccount.length > 0;

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

      <nav className="flex-1 overflow-y-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {visibleLearning.length > 0 && (
          <>
            <Section title="Learning" />
            <div className="space-y-1">
              {visibleLearning.map((i) => (
                <Item key={i.to} {...i} active={isActive(i.to)} />
              ))}
            </div>
          </>
        )}

        {visibleManagement.length > 0 && (
          <>
            <Section title="Management" />
            <div className="space-y-1">
              {visibleManagement.map((i) => (
                <Item key={i.to} {...i} active={isActive(i.to)} />
              ))}
            </div>
          </>
        )}

        {visibleCareers.length > 0 && (
          <>
            <Section title="Careers" />
            <div className="space-y-1">
              {visibleCareers.map((i) => (
                <Item key={i.to} {...i} active={isActive(i.to)} />
              ))}
            </div>
          </>
        )}

        {visibleAccount.length > 0 && (
          <>
            <Section title="Account" />
            <div className="space-y-1">
              {visibleAccount.map((i) => (
                <Item key={i.to} {...i} active={isActive(i.to)} />
              ))}
            </div>
          </>
        )}

        {!hasAnyNav && (
          <div className="px-6 py-8 text-center text-xs text-white/40">
            No menu items available for your role.
          </div>
        )}
      </nav>
    </aside>
  );
}
