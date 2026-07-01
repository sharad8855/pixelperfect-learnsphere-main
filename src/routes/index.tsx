import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenText,
  LineChart,
  Users,
  ShieldCheck,
  Play,
  GraduationCap,
  Bell,
  MessageSquare,
  BookOpen,
  Award,
  Search,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Baapedu — Learn Smarter. Achieve More." },
      {
        name: "description",
        content:
          "Baapedu is your all-in-one learning platform to explore courses, track progress, and achieve your academic goals with ease.",
      },
      { property: "og:title", content: "Baapedu — Learn Smarter. Achieve More." },
      {
        property: "og:description",
        content: "All-in-one LMS for students and educators.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-hero-gradient font-sans selection:bg-primary/10 selection:text-primary">
      <SiteNav />
      <Hero />
      <FeatureStrip />
      <StatsBand />
      <Universities />
      <SiteFooter />
    </div>
  );
}

function SiteNav() {
  return (
    <header className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6">
      <Logo />
      <nav className="hidden items-center gap-8 text-sm font-semibold text-foreground/80 md:flex">
        <a className="relative text-primary after:absolute after:-bottom-2 after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-primary transition-colors" href="#">Home</a>
        <a href="#courses" className="hover:text-primary transition-colors">Courses</a>
        <a href="#features" className="hover:text-primary transition-colors">Features</a>
        <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
        <a href="#about" className="hover:text-primary transition-colors">About Us</a>
        <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
      </nav>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <input
            className="h-10 w-64 rounded-full border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Search courses..."
          />
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Link to="/login">
          <Button variant="outline" className="rounded-lg border-primary text-primary hover:bg-primary/5 font-semibold cursor-pointer">Log In</Button>
        </Link>
        <Link to="/login">
          <Button className="rounded-lg font-semibold cursor-pointer shadow-md shadow-primary/15 hover:shadow-lg">Get Started</Button>
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-[1400px] items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-2">
      <div className="space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">
          <GraduationCap className="h-3.5 w-3.5" /> Smart Learning, Better Future
        </span>
        <h1 className="text-[54px] font-black leading-[1.05] tracking-tight text-foreground sm:text-[62px]">
          Learn Smarter.
          <br />
          <span className="text-primary">Achieve More.</span>
        </h1>
        <div className="h-[5px] w-20 rounded-full bg-primary" />
        <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground font-medium">
          Baapedu is your all-in-one learning platform to explore courses, track
          progress, and achieve your academic goals with ease.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/login">
            <Button size="lg" className="rounded-xl font-bold shadow-lg shadow-primary/20 cursor-pointer">
              Get Started for Free <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="rounded-xl font-bold border-border hover:bg-secondary cursor-pointer">
            <Play className="mr-1.5 h-4 w-4 text-primary fill-primary/20" /> Explore Courses
          </Button>
        </div>
        <div className="flex items-center gap-4 pt-4">
          <div className="flex -space-x-2">
            {[
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80",
            ].map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Student ${i + 1}`}
                className="h-9 w-9 rounded-full border-2 border-background object-cover shadow-sm"
              />
            ))}
          </div>
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">2K+</span>
          <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
            Trusted by 2,000+ students
            <br /> and educators worldwide
          </p>
        </div>
      </div>

      <DashboardPreview />
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl bg-card shadow-2xl shadow-primary/10 ring-1 ring-border">
        <div className="flex">
          {/* mini sidebar */}
          <div className="w-[180px] shrink-0 bg-sidebar p-4 text-sidebar-foreground flex flex-col justify-between h-[450px]">
            <div>
              <div className="flex items-center gap-2 pb-5 text-white">
                <span className="text-base">🎓</span>
                <span className="text-sm font-black tracking-tight">Baapedu</span>
              </div>
              <div className="space-y-1 text-[11px] font-semibold">
                <div className="rounded-lg bg-primary px-3 py-2 text-white shadow-sm flex items-center gap-2">
                  <span className="text-[12px]">🏠</span> Dashboard
                </div>
                <div className="px-3 py-2 text-white/60 hover:text-white flex items-center gap-2">
                  <span className="text-[12px]">📖</span> My Courses
                </div>
                <div className="px-3 py-2 text-white/60 hover:text-white flex items-center gap-2">
                  <span className="text-[12px]">🎥</span> Live Classes
                </div>
                <div className="px-3 py-2 text-white/60 hover:text-white flex items-center gap-2">
                  <span className="text-[12px]">📋</span> Assignments
                </div>
                <div className="px-3 py-2 text-white/60 hover:text-white flex items-center gap-2">
                  <span className="text-[12px]">❓</span> Quizzes
                </div>
                <div className="px-3 py-2 text-white/60 hover:text-white flex items-center gap-2">
                  <span className="text-[12px]">🏆</span> Grades
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white/5 p-2.5 text-[9px] text-white/60 leading-normal border border-white/5">
              <span className="font-bold text-white block mb-0.5">Go Premium</span>
              Unlock exclusive certificates.
            </div>
          </div>

          {/* main panel mockup */}
          <div className="flex-1 p-5 bg-background/50 flex flex-col justify-between min-w-0">
            <div>
              {/* Header inside mockup */}
              <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3">
                <div className="relative w-44">
                  <input
                    readOnly
                    className="h-7 w-full rounded-full border border-border/50 bg-card pl-7 text-[9px] outline-none"
                    placeholder="Search courses..."
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Bell className="h-3.5 w-3.5" />
                  <div className="flex items-center gap-1.5 border-l border-border/50 pl-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                      alt="Aarav Sharma"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <div className="text-[8px] leading-none text-left hidden sm:block">
                      <div className="font-bold text-foreground">Aarav Sharma</div>
                      <div className="text-muted-foreground mt-0.5">B.Tech CSE</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[16px] font-black text-foreground">Welcome back, Aarav! 👋</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Keep learning, keep growing. You're doing great!</div>
              </div>

              {/* Stats cards inside mockup */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  { l: "My Courses", v: "6", c: "bg-primary/10 text-primary", icon: "📖" },
                  { l: "Progress", v: "68%", c: "bg-success/15 text-success", icon: "📈" },
                  { l: "Completed", v: "12", c: "bg-warning/15 text-warning", icon: "🏆" },
                  { l: "Hours", v: "48h", c: "bg-info/10 text-info", icon: "🕐" },
                ].map((s, i) => (
                  <div key={i} className="rounded-lg border border-border/50 bg-card p-2 flex items-center gap-2">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.c}`}>
                      {s.icon}
                    </div>
                    <div className="min-w-0 text-left leading-none">
                      <div className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider">{s.l}</div>
                      <div className="text-xs font-extrabold text-foreground mt-0.5">{s.v}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Course cards inside mockup */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground">My Courses</span>
                  <span className="text-[9px] font-bold text-primary">View All →</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { t: "DSA", p: "Prof. Neeraj Kumar", pct: 75, img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&auto=format&fit=crop&q=80" },
                    { t: "Python", p: "Prof. Ananya Verma", pct: 60, img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80" },
                    { t: "DBMS", p: "Prof. Priya Nair", pct: 80, img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80" },
                  ].map((c, i) => (
                    <div key={i} className="rounded-lg border border-border/50 bg-card overflow-hidden">
                      <img src={c.img} alt={c.t} className="h-10 w-full object-cover" />
                      <div className="p-1.5 text-left leading-tight">
                        <div className="truncate text-[9px] font-extrabold text-foreground">{c.t}</div>
                        <div className="truncate text-[7px] text-muted-foreground font-medium mt-0.5">{c.p}</div>
                        <div className="mt-1.5 flex items-center gap-1">
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${c.pct}%` }} />
                          </div>
                          <span className="text-[7px] font-bold text-muted-foreground">{c.pct}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureStrip() {
  const items = [
    { t: "Wide Range of Courses", d: "Explore top-quality courses across various domains curated by experts.", Icon: BookOpenText, tone: "bg-primary/10 text-primary" },
    { t: "Track Your Progress", d: "Monitor your learning journey and achievements in real-time.", Icon: LineChart, tone: "bg-success/15 text-success" },
    { t: "Learn Anywhere", d: "Access your courses and study materials anytime, anywhere.", Icon: Users, tone: "bg-warning/15 text-warning" },
    { t: "Secure & Reliable", d: "Your data and progress are safe with enterprise-grade security.", Icon: ShieldCheck, tone: "bg-info/10 text-info" },
  ];
  return (
    <section id="features" className="mx-auto max-w-[1400px] px-6">
      <div className="grid gap-8 rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border md:grid-cols-2 lg:grid-cols-4">
        {items.map(({ t, d, Icon, tone }) => (
          <div key={t} className="flex gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-left leading-tight">
              <div className="font-bold text-foreground text-sm tracking-tight">{t}</div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground font-medium">{d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatsBand() {
  const stats = [
    { v: "10,000+", l: "Active Students", Icon: GraduationCap },
    { v: "500+", l: "Courses Available", Icon: BookOpen },
    { v: "200+", l: "Expert Instructors", Icon: Users },
    { v: "98%", l: "Success Rate", Icon: Award },
  ];
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-14">
      <div className="grid grid-cols-2 gap-8 rounded-3xl bg-stats-gradient p-10 text-white shadow-xl md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl shrink-0">
              <s.Icon className="h-7 w-7 text-white" strokeWidth={2.2} />
            </div>
            <div className="text-left leading-none">
              <div className="text-3xl font-black tracking-tight text-white">{s.v}</div>
              <div className="mt-2 text-xs font-bold text-white/80 uppercase tracking-wide">{s.l}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Universities() {
  return (
    <section id="about" className="mx-auto max-w-[1400px] px-6 pb-20">
      <p className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
        Trusted by students from top universities
      </p>
      <div className="mt-10 grid grid-cols-2 items-center justify-center gap-12 opacity-65 md:grid-cols-3 lg:grid-cols-6 max-w-5xl mx-auto">
        {/* MIT Logo */}
        <div className="flex items-center justify-center gap-2">
          <svg className="h-8 text-foreground fill-current" viewBox="0 0 100 40">
            <path d="M12 5h10v30H12zm18 0h10v18H30zm18 0h10v30H48zm18 0h10v30H66zm18 0h10v18H84z" />
          </svg>
          <span className="font-extrabold text-[15px] font-sans tracking-tight">MIT</span>
        </div>

        {/* Stanford */}
        <div className="flex items-center justify-center">
          <span className="font-serif font-extrabold text-[19px] tracking-tight italic text-foreground">Stanford</span>
        </div>

        {/* Harvard */}
        <div className="flex items-center justify-center gap-1.5">
          <svg className="h-6 w-6 text-foreground fill-current" viewBox="0 0 100 100">
            <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" className="fill-none stroke-current" strokeWidth="8" />
            <path d="M30 35h40v10H30zm0 20h40v10H30z" />
          </svg>
          <span className="font-serif font-black text-[18px] tracking-tight">Harvard</span>
        </div>

        {/* Berkeley */}
        <div className="flex items-center justify-center">
          <span className="font-serif font-black text-[18px] tracking-wide text-foreground">Berkeley</span>
        </div>

        {/* Chicago */}
        <div className="flex items-center justify-center">
          <span className="font-serif font-black text-[17px] tracking-tight uppercase">UChicago</span>
        </div>

        {/* NUS */}
        <div className="flex items-center justify-center gap-1">
          <svg className="h-6 w-6 text-foreground fill-current" viewBox="0 0 100 100">
            <path d="M50 15 L80 35 L80 65 L50 85 L20 65 L20 35 Z" className="fill-none stroke-current" strokeWidth="8" />
            <circle cx="50" cy="50" r="12" />
          </svg>
          <span className="font-sans font-black text-[18px] tracking-tighter">NUS</span>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-border bg-card">
      <div className="mx-auto max-w-[1400px] px-6 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Logo />
          <div className="font-semibold text-xs">© {new Date().getFullYear()} Baapedu. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
