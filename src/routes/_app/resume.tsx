import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect, useState } from "react";

import {
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Plus,
  Trash2,
  Save,
  Edit,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/resume")({
  head: () => ({ meta: [{ title: "My Resume — Baapedu" }] }),
  component: ResumePage,
});

// Mock Initial Fallback Resume
const MOCK_RESUME = {
  name: "Sharad Kumar",
  email: "sharad@example.com",
  phone: "+91 98765 43210",
  label: "Full Stack Engineer",
  summary: "Results-driven Software Engineer with experience in developing responsive web applications, RESTful APIs, and database architecture.",
  location: { address: "123 Main St", city: "Mumbai", region: "Maharashtra", country: "India" },
  education: [
    { institution: "IIT Bombay", area: "Computer Science", study_type: "Bachelor of Technology", start_date: "2021-08-01", end_date: "2025-05-30", score: "9.2 CGPA" }
  ],
  skills: [
    { name: "React / Next.js", level: "Expert" },
    { name: "TypeScript", level: "Advanced" },
    { name: "Node.js / Express", level: "Advanced" },
    { name: "PostgreSQL", level: "Intermediate" }
  ],
  work: [
    { name: "Tech Solutions Pvt Ltd", position: "Software Intern", location: "Pune", start_date: "2024-05-01", end_date: "2024-07-31", summary: "Engineered dashboard components for internal database monitoring." }
  ],
  projects: [
    { name: "Baapedu LMS Platform", entity: "Academic Project", location: "Mumbai", start_date: "2025-01-10", end_date: "2025-04-20", summary: "Collaborated on creating modular course and assessment views." }
  ]
};

function ResumePage() {
  const user = useAuthStore((s) => s.user);
  const client = useAuthStore((s) => s.client);
  
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [label, setLabel] = useState("");
  const [summary, setSummary] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  
  // Education List State
  const [education, setEducation] = useState<any[]>([]);
  // Skills List State
  const [skills, setSkills] = useState<any[]>([]);
  // Work List State
  const [work, setWork] = useState<any[]>([]);
  // Projects List State
  const [projects, setProjects] = useState<any[]>([]);

  // Fetch Resume
  const fetchResume = () => {
    if (!client || !user) return;
    setLoading(true);
    try {
      const localKey = `baapedu-resume-${user.id}`;
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setResume(parsed);
        populateForm(parsed);
      } else {
        setResume(MOCK_RESUME);
        populateForm(MOCK_RESUME);
      }
    } catch (err: any) {
      console.warn("Failed to load resume from localStorage, using mock data", err.message);
      setResume(MOCK_RESUME);
      populateForm(MOCK_RESUME);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, [client, user]);

  const populateForm = (data: any) => {
    setName(data.name || "");
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setLabel(data.label || "");
    setSummary(data.summary || "");
    setAddress(data.location?.address || "");
    setCity(data.location?.city || "");
    setRegion(data.location?.region || "");
    setCountry(data.location?.country || "");
    setEducation(data.education || []);
    setSkills(data.skills || []);
    setWork(data.work || []);
    setProjects(data.projects || []);
  };

  // Submit / Update Resume
  const handleSave = async () => {
    if (!client || !user) return;

    if (!name || !email) {
      toast.error("Name and Email are required");
      return;
    }

    const payload = {
      user_id: user.id,
      name,
      email,
      phone,
      label,
      summary,
      location: { address, city, region, country },
      education,
      skills,
      work,
      projects,
    };

    try {
      const localKey = `baapedu-resume-${user.id}`;
      localStorage.setItem(localKey, JSON.stringify(payload));
      toast.success("Resume saved successfully!");
      setResume(payload);
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save resume");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-6 rounded-2xl ring-1 ring-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Resume</h1>
            <p className="text-sm text-muted-foreground">Build, view, and update your professional profile.</p>
          </div>
        </div>

        <Button 
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }} 
          className="rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-2"
        >
          {isEditing ? <Save className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
          {isEditing ? "Save Resume" : "Edit Resume"}
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-card border border-border">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2.5 text-sm font-semibold text-muted-foreground">Loading Resume...</span>
        </div>
      ) : isEditing ? (
        /* Resume Form Builder */
        <div className="grid gap-6 lg:grid-cols-2 text-left">
          {/* Basic & Location Info */}
          <div className="bg-card p-6 rounded-2xl ring-1 ring-border space-y-4">
            <h2 className="text-lg font-black text-foreground border-b border-border pb-2 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="res-name">Full Name</Label>
                <Input id="res-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="res-label">Professional Label</Label>
                <Input id="res-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Full Stack Developer" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="res-email">Email Address</Label>
                <Input id="res-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="res-phone">Phone Number</Label>
                <Input id="res-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-summary">Professional Summary</Label>
              <Textarea id="res-summary" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
            </div>

            <h2 className="text-lg font-black text-foreground border-b border-border pb-2 pt-2 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Location details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="res-addr">Street Address</Label>
                <Input id="res-addr" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="res-city">City</Label>
                <Input id="res-city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="res-region">Region / State</Label>
                <Input id="res-region" value={region} onChange={(e) => setRegion(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="res-country">Country</Label>
                <Input id="res-country" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Education, Work, and Skills Builders */}
          <div className="space-y-6">
            {/* Education Builder */}
            <div className="bg-card p-6 rounded-2xl ring-1 ring-border space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Education
                </h2>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => setEducation([...education, { institution: "", area: "", study_type: "", start_date: "", end_date: "", score: "" }])}
                  className="rounded-lg h-8 cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
              
              {education.map((edu, idx) => (
                <div key={idx} className="p-4 bg-secondary/25 border border-border rounded-xl space-y-3 relative">
                  <button 
                    type="button"
                    onClick={() => setEducation(education.filter((_, i) => i !== idx))} 
                    className="absolute right-3 top-3 text-destructive hover:bg-destructive/10 p-1 rounded-md"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Institution</Label>
                      <Input value={edu.institution} onChange={(e) => {
                        const next = [...education];
                        next[idx].institution = e.target.value;
                        setEducation(next);
                      }} placeholder="IIT Bombay" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Field of Study</Label>
                      <Input value={edu.area} onChange={(e) => {
                        const next = [...education];
                        next[idx].area = e.target.value;
                        setEducation(next);
                      }} placeholder="Computer Science" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Degree Type</Label>
                      <Input value={edu.study_type} onChange={(e) => {
                        const next = [...education];
                        next[idx].study_type = e.target.value;
                        setEducation(next);
                      }} placeholder="B.Tech" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Grad Date</Label>
                      <Input type="date" value={edu.end_date} onChange={(e) => {
                        const next = [...education];
                        next[idx].end_date = e.target.value;
                        setEducation(next);
                      }} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">CGPA / Score</Label>
                      <Input value={edu.score} onChange={(e) => {
                        const next = [...education];
                        next[idx].score = e.target.value;
                        setEducation(next);
                      }} placeholder="9.0" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills Builder */}
            <div className="bg-card p-6 rounded-2xl ring-1 ring-border space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" /> Core Skills
                </h2>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => setSkills([...skills, { name: "", level: "Intermediate" }])}
                  className="rounded-lg h-8 cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {skills.map((skill, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-secondary/15 p-2 rounded-xl border border-border">
                    <Input 
                      value={skill.name} 
                      onChange={(e) => {
                        const next = [...skills];
                        next[idx].name = e.target.value;
                        setSkills(next);
                      }} 
                      placeholder="e.g. React" 
                      className="h-8 text-xs flex-1"
                    />
                    <Input 
                      value={skill.level} 
                      onChange={(e) => {
                        const next = [...skills];
                        next[idx].level = e.target.value;
                        setSkills(next);
                      }} 
                      placeholder="Expert" 
                      className="h-8 text-xs w-20"
                    />
                    <button 
                      type="button" 
                      onClick={() => setSkills(skills.filter((_, i) => i !== idx))} 
                      className="text-destructive hover:bg-destructive/10 p-1 rounded-md"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Resume View (Premium A4 Preview style) */
        <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border shadow-md overflow-hidden text-left font-sans ring-1 ring-black/5">
          {/* Header banner */}
          <div className="bg-slate-900 text-white p-8 space-y-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight">{resume?.name}</h1>
                <p className="text-sm font-bold tracking-wide text-primary mt-1 uppercase">{resume?.label}</p>
              </div>
              <div className="space-y-1 text-xs font-semibold text-slate-300">
                <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 shrink-0" /> {resume?.email}</p>
                {resume?.phone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" /> {resume?.phone}</p>}
                {resume?.location && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> {resume.location.city}, {resume.location.region}, {resume.location.country}
                  </p>
                )}
              </div>
            </div>
            {resume?.summary && (
              <p className="text-xs leading-relaxed text-slate-300 border-t border-slate-700/60 pt-3 mt-4 max-w-2xl font-medium">
                {resume.summary}
              </p>
            )}
          </div>

          <div className="p-8 space-y-6">
            {/* Skills */}
            {resume?.skills && resume.skills.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary shrink-0" /> Key Skills
                </h2>
                <div className="flex flex-wrap gap-2 pt-1">
                  {resume.skills.map((s: any, i: number) => (
                    <span key={i} className="rounded bg-secondary/80 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200 shadow-sm">
                      {s.name} <span className="text-[10px] text-muted-foreground font-normal">({s.level})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resume?.education && resume.education.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary shrink-0" /> Education
                </h2>
                <div className="space-y-3">
                  {resume.education.map((edu: any, i: number) => (
                    <div key={i} className="flex justify-between items-start gap-4">
                      <div className="leading-tight">
                        <p className="text-sm font-extrabold text-slate-900">{edu.study_type} in {edu.area}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-semibold">{edu.institution}</p>
                      </div>
                      <div className="text-right text-xs font-bold text-slate-500 leading-tight">
                        <p>{edu.end_date}</p>
                        {edu.score && <p className="text-primary mt-0.5">{edu.score}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {resume?.work && resume.work.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary shrink-0" /> Work Experience
                </h2>
                <div className="space-y-4">
                  {resume.work.map((w: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-start gap-4 leading-tight">
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">{w.position}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-semibold">{w.name}</p>
                        </div>
                        <p className="text-right text-xs font-bold text-slate-500 shrink-0">
                          {w.start_date} - {w.end_date || "Present"}
                        </p>
                      </div>
                      {w.summary && <p className="text-xs leading-relaxed text-muted-foreground pt-1.5 font-medium">{w.summary}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resume?.projects && resume.projects.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-primary shrink-0" /> Key Projects
                </h2>
                <div className="space-y-4">
                  {resume.projects.map((proj: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-start gap-4 leading-tight">
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">{proj.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-semibold">{proj.entity}</p>
                        </div>
                        <p className="text-right text-xs font-bold text-slate-500 shrink-0">
                          {proj.start_date} - {proj.end_date || "Present"}
                        </p>
                      </div>
                      {proj.summary && <p className="text-xs leading-relaxed text-muted-foreground pt-1.5 font-medium">{proj.summary}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
