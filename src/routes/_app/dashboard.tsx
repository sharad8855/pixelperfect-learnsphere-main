import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect, useState } from "react";
import { lms } from "@/lib/api-client";
import {
  BookOpen,
  Activity,
  Trophy,
  Clock,
  MoreVertical,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Star,
  Zap,
  Loader2,
  Users,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Baapedu" }] }),
  component: Dashboard,
});

// Mock Fallbacks
const MOCK_COURSES = [
  { title: "Data Structures & Algorithms", prof: "Prof. Neeraj Kumar", pct: 75, bg: "from-slate-800 to-slate-950", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80" },
  { title: "Python Programming", prof: "Prof. Ananya Verma", pct: 60, bg: "from-purple-700 to-indigo-900", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
  { title: "Database Management Systems", prof: "Prof. Priya Nair", pct: 80, bg: "from-cyan-800 to-slate-900", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80" },
];

const MOCK_DEADLINES = [
  { title: "Data Structures Assignment", sub: "Due in 2 days", date: "May 26, 2025", tone: "bg-destructive/10 text-destructive", Icon: FileText },
  { title: "DBMS Quiz", sub: "Due in 3 days", date: "May 27, 2025", tone: "bg-warning/15 text-warning", Icon: Trophy },
  { title: "Operating Systems Project", sub: "Due in 5 days", date: "May 29, 2025", tone: "bg-success/15 text-success", Icon: Activity },
];

const MOCK_ACHIEVEMENTS = [
  { title: "Top Performer", sub: "Scored in top 10% in Database Quiz", date: "May 20, 2025", tone: "bg-primary/10 text-primary", Icon: Star },
  { title: "Consistency Star", sub: "7 days of consistent learning", date: "May 18, 2025", tone: "bg-success/15 text-success", Icon: Zap },
  { title: "Quick Learner", sub: "Completed 3 quizzes this week", date: "May 17, 2025", tone: "bg-warning/15 text-warning", Icon: Trophy },
];

const MOCK_LIVE = [
  { day: "24", month: "May", title: "Data Structures & Algorithms", prof: "Live Class with Prof. Neeraj Kumar", time: "10:00 AM", tone: "bg-primary/10 text-primary" },
  { day: "25", month: "May", title: "Python Programming", prof: "Live Class with Prof. Ananya Verma", time: "02:00 PM", tone: "bg-success/15 text-success" },
  { day: "26", month: "May", title: "Database Management Projects", prof: "Live Class with Prof. Priya Nair", time: "04:00 PM", tone: "bg-warning/15 text-warning" },
];

function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const client = useAuthStore((s) => s.client);
  const storedRoleName = useAuthStore((s) => s.roleName);
  
  // Local toggle to allow switching views for testing role-based UI
  const [viewRole, setViewRole] = useState<"student" | "teacher" | "admin">("student");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);

  // Sync state with store role
  useEffect(() => {
    if (storedRoleName) {
      const parsed = storedRoleName.toLowerCase();
      if (parsed === "admin" || parsed === "superadmin" || parsed === "super admin") {
        setViewRole("admin");
      } else if (parsed === "tutor" || parsed === "teacher" || parsed === "instructor") {
        setViewRole("teacher");
      } else {
        setViewRole("student");
      }
    }
  }, [storedRoleName]);

  // Load Dashboard Data from API
  useEffect(() => {
    if (!client || !user) return;
    setLoading(true);
    
    const fetchDashboard = async () => {
      try {
        if (viewRole === "teacher" || viewRole === "admin") {
          const res = await lms.get<any>(`/client/${client.id}/tutor-dashboard/${user.id}`);
          setDashboardData(res?.data || null);
        } else {
          const res = await lms.get<any>(`/client/${client.id}/dashboard/${user.id}`);
          setDashboardData(res?.data || null);
        }
        
        // Fetch timeline updates
        const timelineRes = await lms.get<any>(`/client/${client.id}/assignment/publish-timeline`);
        setTimelineData(timelineRes?.data || []);
      } catch (err: any) {
        console.warn("Backend API not reachable, running in offline/mockup mode.", err.message);
        // Load some mockup defaults to simulate real metrics
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [client, user, viewRole]);

  const name = user?.name?.split(" ")[0] || "there";

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-6 rounded-2xl ring-1 ring-border shadow-sm">
          <div>
            <h1 className="flex items-center gap-2 text-[26px] font-extrabold tracking-tight text-foreground">
              Welcome back, {name}! <span>👋</span>
            </h1>
            <p className="mt-1.5 text-[14px] text-muted-foreground font-medium">
              {viewRole === "admin"
                ? "🛡️ System Administrator Panel - Full system control, global course settings, and review logs."
                : viewRole === "teacher"
                ? "🧑‍🏫 Teacher Portal - Manage courses, evaluate student submissions, and class metrics."
                : "🎓 Student Workspace - Keep learning, keep growing. You're doing great!"}
            </p>
          </div>
          
          {/* View As switch to demonstrate role-based UI */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">View As:</span>
            <Select value={viewRole} onValueChange={(v: "student" | "teacher" | "admin") => setViewRole(v)}>
              <SelectTrigger className="h-9 w-32 font-bold text-xs bg-secondary/80 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">🎓 Student</SelectItem>
                <SelectItem value="teacher">🧑‍🏫 Teacher</SelectItem>
                <SelectItem value="admin">🛡️ Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-card border border-border">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2.5 text-sm font-semibold text-muted-foreground">Loading dashboard data...</span>
          </div>
        ) : (
          <>
            {/* 4 Stat Cards */}
            {viewRole === "admin" ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard 
                  label="🛡️ Total Courses" 
                  value={String(dashboardData?.testProgress?.courses?.created ?? 8)} 
                  sub="System Course Modules" 
                  tone="bg-indigo-500/10 text-indigo-400" 
                  Icon={BookOpen} 
                />
                <StatCard 
                  label="Active Students" 
                  value={String(dashboardData?.testProgress?.courses?.totalStudentsAssigned ?? 42)} 
                  sub="Global Enrolled users" 
                  tone="bg-sky-500/10 text-sky-400" 
                  Icon={Users} 
                />
                <StatCard 
                  label="Exams Configured" 
                  value={String(dashboardData?.testProgress?.tests?.created ?? 5)} 
                  sub="System Assessments" 
                  tone="bg-emerald-500/10 text-emerald-400" 
                  Icon={Activity} 
                />
                <StatCard 
                  label="System Submissions" 
                  value={String((dashboardData?.testProgress?.tests?.submittedByStudents ?? 18) + (dashboardData?.testProgress?.actionItems?.submittedByStudents ?? 10))} 
                  sub="Waiting Review" 
                  tone="bg-amber-500/10 text-amber-400" 
                  Icon={Clock} 
                />
              </div>
            ) : viewRole === "teacher" ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard 
                  label="Courses Created" 
                  value={String(dashboardData?.testProgress?.courses?.created ?? 8)} 
                  sub={`${dashboardData?.testProgress?.courses?.assigned ?? 6} Assigned Courses`} 
                  tone="bg-primary/10 text-primary" 
                  Icon={BookOpen} 
                />
                <StatCard 
                  label="Total Exams" 
                  value={String(dashboardData?.testProgress?.tests?.created ?? 5)} 
                  sub={`${dashboardData?.testProgress?.tests?.totalStudentsAssigned ?? 24} Assigned Students`} 
                  tone="bg-success/15 text-success" 
                  Icon={Activity} 
                />
                <StatCard 
                  label="Action Items" 
                  value={String(dashboardData?.testProgress?.actionItems?.created ?? 12)} 
                  sub="Assigned for Review" 
                  tone="bg-warning/15 text-warning" 
                  Icon={Trophy} 
                />
                <StatCard 
                  label="Student Submissions" 
                  value={String((dashboardData?.testProgress?.tests?.submittedByStudents ?? 18) + (dashboardData?.testProgress?.actionItems?.submittedByStudents ?? 10))} 
                  sub={`${(dashboardData?.testProgress?.tests?.pendingReview ?? 2) + (dashboardData?.testProgress?.actionItems?.pendingReview ?? 3)} Pending Reviews`} 
                  tone="bg-info/10 text-info" 
                  Icon={Clock} 
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard 
                  label="My Courses" 
                  value={String(dashboardData?.recentCompletedActivity?.courses?.length ?? 6)} 
                  sub="Active Enrollments" 
                  tone="bg-primary/10 text-primary" 
                  Icon={BookOpen} 
                />
                <StatCard 
                  label="Overall Progress" 
                  value="68%" 
                  sub="▲ 12% this month" 
                  subTone="text-success" 
                  tone="bg-success/15 text-success" 
                  Icon={Activity} 
                />
                <StatCard 
                  label="Completed" 
                  value={String(dashboardData?.recentCompletedActivity?.courses?.filter((c: any) => c.percentage >= 100).length ?? 12)} 
                  sub="Courses Completed" 
                  tone="bg-warning/15 text-warning" 
                  Icon={Trophy} 
                />
                <StatCard 
                  label="Study Hours" 
                  value="48h 30m" 
                  sub="This Month" 
                  tone="bg-info/10 text-info" 
                  Icon={Clock} 
                />
              </div>
            )}

            {/* Courses / Summary Section */}
            {viewRole === "teacher" || viewRole === "admin" ? (
              <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">
                    {viewRole === "admin" ? "🛡️ System Modules Summary" : "LMS Progress Summary"}
                  </h2>
                  <button className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline cursor-pointer">
                    View Course Details <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <SummaryCard 
                    title="Courses Progress" 
                    metrics={[
                      { label: "Created By You", value: dashboardData?.testProgress?.courses?.created ?? 8 },
                      { label: "Assigned Courses", value: dashboardData?.testProgress?.courses?.assigned ?? 6 },
                      { label: "Total Enrollments", value: dashboardData?.testProgress?.courses?.totalStudentsAssigned ?? 42 },
                      { label: "Completions", value: dashboardData?.testProgress?.courses?.completedByStudents ?? 28 },
                      { label: "Pending", value: dashboardData?.testProgress?.courses?.pendingCompletion ?? 14 },
                    ]}
                    tone="border-t-4 border-t-primary"
                  />
                  <SummaryCard 
                    title="Tests & Exams" 
                    metrics={[
                      { label: "Exams Created", value: dashboardData?.testProgress?.tests?.created ?? 5 },
                      { label: "Total Assigned", value: dashboardData?.testProgress?.tests?.totalStudentsAssigned ?? 24 },
                      { label: "Submissions", value: dashboardData?.testProgress?.tests?.submittedByStudents ?? 18 },
                      { label: "Reviewed Status", value: dashboardData?.testProgress?.tests?.reviewedByTutor ?? 16 },
                      { label: "Pending Grading", value: dashboardData?.testProgress?.tests?.pendingReview ?? 2 },
                    ]}
                    tone="border-t-4 border-t-success"
                  />
                  <SummaryCard 
                    title="Action Items" 
                    metrics={[
                      { label: "Tasks Defined", value: dashboardData?.testProgress?.actionItems?.created ?? 12 },
                      { label: "Student Mappings", value: dashboardData?.testProgress?.actionItems?.totalStudentsAssigned ?? 32 },
                      { label: "Submitted Tasks", value: dashboardData?.testProgress?.actionItems?.submittedByStudents ?? 22 },
                      { label: "Approved Tasks", value: dashboardData?.testProgress?.actionItems?.reviewedByTutor ?? 19 },
                      { label: "Pending Approval", value: dashboardData?.testProgress?.actionItems?.pendingReview ?? 3 },
                    ]}
                    tone="border-t-4 border-t-warning"
                  />
                </div>
              </section>
            ) : (
              <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">My Courses</h2>
                  <Link to="/courses" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline cursor-pointer">
                    View All Courses <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {MOCK_COURSES.map((c) => <CourseCard key={c.title} {...c} />)}
                </div>
              </section>
            )}

            {/* Split Chart & Activities section */}
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Overall Performance</h2>
                  <Select defaultValue="sem">
                    <SelectTrigger className="h-8 w-36 text-xs bg-secondary/80 border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sem">This Semester</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-6">
                  <ProgressRing pct={68} />
                  <div className="flex-1 space-y-2.5 text-xs font-semibold text-muted-foreground min-w-0">
                    {MOCK_COURSES.map((c, i) => (
                      <div key={c.title} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: ["#4f46e5", "#a855f7", "#14b8a6", "#eab308", "#f97316", "#3b82f6"][i] }} />
                          <span className="truncate text-foreground/90 font-medium">{c.title}</span>
                        </div>
                        <span className="font-bold text-foreground shrink-0">{c.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Upcoming Live Classes</h2>
                  <button className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline cursor-pointer">
                    View Calendar <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3.5">
                  {MOCK_LIVE.map((l) => (
                    <div key={l.title} className="flex items-center gap-3">
                      <div className={`flex w-12 flex-col items-center rounded-lg py-1.5 shrink-0 font-bold ${l.tone}`}>
                        <span className="text-lg leading-none">{l.day}</span>
                        <span className="text-[9px] uppercase tracking-wide mt-0.5">{l.month}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-bold text-foreground leading-tight">{l.title}</div>
                        <div className="truncate text-xs text-muted-foreground mt-0.5 font-medium">{l.prof}</div>
                      </div>
                      <div className="hidden text-xs text-muted-foreground font-semibold items-center gap-1 shrink-0 sm:flex">
                        <Clock className="h-3.5 w-3.5" /> {l.time}
                      </div>
                      <Button size="sm" className="rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-3 cursor-pointer">Join</Button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>

      <aside className="space-y-6">
        <CalendarCard />
        
        {viewRole === "teacher" || viewRole === "admin" ? (
          // Tutor Dashboard Timeline Feed showing student submissions
          <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-foreground">Timeline Feed</h2>
              <button className="text-xs font-semibold text-primary hover:underline cursor-pointer">Refresh</button>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {timelineData.length > 0 ? (
                timelineData.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs pb-3.5 border-b border-border/40 last:border-0 last:pb-0">
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                      {item.studentName?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 leading-normal">
                      <p className="font-semibold text-foreground">
                        <span className="text-primary font-bold">{item.studentName}</span> submitted <span className="font-bold">{item.title}</span> ({item.type}).
                      </p>
                      {item.marks && <p className="text-[10px] text-success font-bold mt-0.5">Score/Marks: {item.marks}</p>}
                      <p className="text-[9px] text-muted-foreground font-semibold mt-1">{item.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
                  No public student activities submitted yet.
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            <SideList title="Upcoming Deadlines" items={MOCK_DEADLINES} />
            <SideList title="Recent Achievements" items={MOCK_ACHIEVEMENTS} />
          </>
        )}
      </aside>
    </div>
  );
}

function StatCard({
  label, value, sub, subTone, tone, Icon,
}: { label: string; value: string; sub: string; subTone?: string; tone: string; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="min-w-0 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border flex items-center gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon className="h-[22px] w-[22px]" />
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 truncate text-2xl font-black text-foreground">{value}</div>
        <div className={`mt-1.5 truncate text-[11px] font-semibold flex items-center gap-1 ${subTone || "text-muted-foreground"}`}>{sub}</div>
      </div>
    </div>
  );
}

function CourseCard({ title, prof, pct, bg, image }: { title: string; prof: string; pct: number; bg: string; image?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="relative h-32 overflow-hidden bg-muted">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${bg}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">In Progress</span>
        <button className="absolute right-2 top-2 rounded-md p-1 bg-black/20 text-white hover:bg-black/40 transition-colors cursor-pointer">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <div className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{title}</div>
        <div className="text-[11px] text-muted-foreground mt-1 font-medium">{prof}</div>
        <div className="mt-3.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] font-bold text-muted-foreground shrink-0">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <svg width="112" height="112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} strokeWidth="8" className="fill-none stroke-secondary" />
        <circle cx="56" cy="56" r={r} strokeWidth="8" strokeLinecap="round"
          className="fill-none stroke-primary transition-all"
          strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div className="absolute text-center leading-none">
        <div className="text-xl font-black text-foreground">{pct}%</div>
        <div className="text-[10px] text-muted-foreground font-semibold mt-1">Overall</div>
      </div>
    </div>
  );
}

function CalendarCard() {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const dates: (number | null)[] = [28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1];
  return (
    <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-foreground">Calendar</h2>
        <button className="text-xs font-semibold text-primary hover:underline cursor-pointer">View Full Calendar</button>
      </div>
      <div className="mt-4 flex items-center justify-between px-1">
        <button className="rounded-md p-1 hover:bg-secondary cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
        <span className="text-sm font-bold text-foreground">May 2025</span>
        <button className="rounded-md p-1 hover:bg-secondary cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-y-2.5 text-center text-[10px] font-bold text-muted-foreground/80 tracking-wider">
        {days.map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-y-1.5 text-center text-xs">
        {dates.map((d, i) => {
          const dim = i < 3 || i > 33;
          const active = d === 24 && !dim;
          return (
            <div key={i} className="flex items-center justify-center h-7 w-7 mx-auto">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${active ? "bg-primary font-bold text-primary-foreground shadow-md shadow-primary/20" : dim ? "text-muted-foreground/45" : "text-foreground hover:bg-secondary cursor-pointer"}`}>
                {d}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SideList({
  title,
  items,
}: {
  title: string;
  items: Array<{ title: string; sub: string; date: string; tone: string; Icon: React.ComponentType<{ className?: string }> }>;
}) {
  return (
    <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
        <button className="text-xs font-semibold text-primary hover:underline cursor-pointer">View All</button>
      </div>
      <div className="space-y-3.5">
        {items.map((it) => (
          <div key={it.title} className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${it.tone}`}>
              <it.Icon className="h-[18px] w-[18px]" />
            </div>
            <div className="flex-1 min-w-0 leading-tight">
              <div className="truncate text-xs font-bold text-foreground">{it.title}</div>
              <div className="truncate text-[10px] text-muted-foreground mt-1 font-semibold">{it.sub}</div>
            </div>
            <div className="whitespace-nowrap text-[10px] font-bold text-muted-foreground/80 shrink-0 mt-0.5">{it.date}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryCard({
  title,
  metrics,
  tone = "",
}: {
  title: string;
  metrics: Array<{ label: string; value: string | number }>;
  tone?: string;
}) {
  return (
    <div className={`rounded-xl bg-card p-4 shadow-sm ring-1 ring-border leading-tight ${tone}`}>
      <h3 className="text-sm font-bold text-foreground mb-3">{title}</h3>
      <div className="space-y-2.5 text-xs font-semibold text-muted-foreground">
        {metrics.map((m) => (
          <div key={m.label} className="flex justify-between items-center border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
            <span className="font-medium text-muted-foreground">{m.label}</span>
            <span className="text-foreground font-black">{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
