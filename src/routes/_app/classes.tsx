import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect, useState } from "react";
import { authApi } from "@/lib/auth-api";
import {
  GraduationCap,
  Plus,
  Loader2,
  X,
  Users,
  User,
  Info,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/classes")({
  head: () => ({ meta: [{ title: "My Classes & Divisions — Baapedu" }] }),
  component: ClassesPage,
});

function ClassesPage() {
  const user = useAuthStore((s) => s.user);
  const client = useAuthStore((s) => s.client);
  const storedRoleName = useAuthStore((s) => s.roleName);

  const [activeTab, setActiveTab] = useState<"classrooms" | "divisions">("classrooms");
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Classroom Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [detailedInfo, setDetailedInfo] = useState("");
  const [classTeacher, setClassTeacher] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [substituteTeacherInput, setSubstituteTeacherInput] = useState("");

  // Division Form States
  const [isDivisionFormOpen, setIsDivisionFormOpen] = useState(false);
  const [divisionName, setDivisionName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [divisionDetailedInfo, setDivisionDetailedInfo] = useState("");
  const [divisionClassTeacher, setDivisionClassTeacher] = useState("");
  const [divisionMaxStudents, setDivisionMaxStudents] = useState("");
  const [divisionIsEnabled, setDivisionIsEnabled] = useState(true);

  const isTutor = storedRoleName?.toLowerCase() === "tutor" || storedRoleName?.toLowerCase() === "teacher" || storedRoleName?.toLowerCase() === "instructor";
  const isAdmin = storedRoleName?.toLowerCase() === "admin" || storedRoleName?.toLowerCase() === "superadmin";
  const isAllowedToManage = isTutor || isAdmin;

  // Fetch classrooms from backend
  const fetchClassrooms = async () => {
    if (!client) return;
    try {
      const response = await authApi.getClassrooms(client.id);
      if (response.success) {
        setClassrooms(response.classrooms || []);
      }
    } catch (err: any) {
      console.error("Failed to load classes", err);
    }
  };

  // Fetch divisions from backend
  const fetchDivisions = async () => {
    if (!client) return;
    try {
      const response = await authApi.getDivisions(client.id);
      if (response.success) {
        setDivisions(response.divisions || []);
      }
    } catch (err: any) {
      console.error("Failed to load divisions", err);
    }
  };

  // Initial Fetch Setup
  const loadData = async () => {
    if (!client) return;
    setLoading(true);
    await Promise.all([fetchClassrooms(), fetchDivisions()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [client]);

  // Open Classroom Form Modal
  const openAddModal = () => {
    setTitle("");
    setClassName("");
    setDetailedInfo("");
    setClassTeacher(user?.id || "");
    setMaxStudents("");
    setIsEnabled(true);
    setSubstituteTeacherInput("");
    setIsFormOpen(true);
  };

  // Open Division Form Modal
  const openAddDivisionModal = () => {
    setDivisionName("");
    setSelectedClassId(classrooms[0]?.id || "");
    setDivisionDetailedInfo("");
    setDivisionClassTeacher(user?.id || "");
    setDivisionMaxStudents("");
    setDivisionIsEnabled(true);
    setIsDivisionFormOpen(true);
  };

  // Submit Classroom Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    if (!title || !className) {
      toast.error("Title and Class Name are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        class_name: className,
        detailed_info: detailedInfo || "",
        class_teacher: classTeacher || "",
        max_students: maxStudents || "",
        is_enabled: isEnabled,
        client_id: client.id,
        substitute_teacher: substituteTeacherInput ? substituteTeacherInput.split(",").map(t => t.trim()).filter(Boolean) : [],
      };

      const response = await authApi.createClassroom(client.id, payload);
      if (response.success) {
        toast.success(response.message || "Classroom created successfully");
        await fetchClassrooms();
        setIsFormOpen(false);
      } else {
        toast.error("Failed to create classroom");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create classroom");
    } finally {
      setLoading(false);
    }
  };

  // Submit Division Form
  const handleDivisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    if (!selectedClassId || !divisionName) {
      toast.error("Classroom and Division Name are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        class: selectedClassId,
        division: divisionName,
        detailed_info: divisionDetailedInfo || "",
        course: null,
        class_teacher: divisionClassTeacher || "",
        max_student: divisionMaxStudents || "",
        enabled: divisionIsEnabled,
        client_id: client.id,
      };

      const response = await authApi.createDivision(client.id, payload);
      if (response.success) {
        toast.success(response.message || "Division created successfully");
        await fetchDivisions();
        setIsDivisionFormOpen(false);
      } else {
        toast.error("Failed to create division");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create division");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-6 rounded-2xl ring-1 ring-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {activeTab === "classrooms" ? "My Classrooms" : "My Divisions"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTab === "classrooms"
                ? "Manage and overview your academic class assignments and schedules."
                : "Manage subdivisions, sections, and division teachers."}
            </p>
          </div>
        </div>

        {isAllowedToManage && (
          <Button
            onClick={activeTab === "classrooms" ? openAddModal : openAddDivisionModal}
            className="rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> {activeTab === "classrooms" ? "Create Class" : "Create Division"}
          </Button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("classrooms")}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === "classrooms"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          🏫 Classrooms
        </button>
        <button
          onClick={() => setActiveTab("divisions")}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === "divisions"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          📂 Divisions
        </button>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-card border border-border">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2.5 text-sm font-semibold text-muted-foreground">Loading data...</span>
        </div>
      ) : activeTab === "classrooms" ? (
        classrooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-lg font-bold text-foreground">No classes found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">There are no classrooms created for this client organization yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classrooms.map((cls) => {
              const isUUID = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
              const teacherName = cls.users 
                ? `${cls.users.first_name} ${cls.users.last_name}` 
                : (cls.class_teacher && !isUUID(cls.class_teacher) ? cls.class_teacher : (cls.class_teacher ? "Assigned" : "Not assigned"));

              return (
                <div key={cls.id} className="bg-card p-5 rounded-2xl ring-1 ring-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between border-t-4 border-t-primary min-h-[220px] relative overflow-hidden group">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded bg-primary/15 text-primary uppercase">
                        {cls.class_name || "General Class"}
                      </span>
                      <span className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded ${cls.is_enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {cls.is_enabled ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-foreground leading-tight mt-3 group-hover:text-primary transition-colors line-clamp-2">
                      {cls.title}
                    </h3>

                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3 font-medium">
                      {cls.detailed_info || "No classroom description or details provided."}
                    </p>

                    {/* Teacher Info */}
                    <div className="mt-4 pt-3 border-t border-border/50 space-y-2 text-xs font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="h-3.5 w-3.5 text-muted-foreground/75" />
                        Class Teacher: <strong className="text-foreground">{teacherName}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" /> Max Students: {cls.max_students || "Unlimited"}
                    </span>
                    
                    <span className="text-primary flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Ready
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        divisions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-lg font-bold text-foreground">No divisions found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">There are no divisions created for this client organization yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {divisions.map((div) => {
              const linkedClass = classrooms.find((c) => c.id === div.class) || div.classes;
              const classNameDisplay = linkedClass ? `${linkedClass.title} (${linkedClass.class_name})` : "Classroom Assigned";

              return (
                <div key={div.id} className="bg-card p-5 rounded-2xl ring-1 ring-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between border-t-4 border-t-primary min-h-[200px] relative overflow-hidden group">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded bg-primary/15 text-primary uppercase">
                        Division {div.division || "N/A"}
                      </span>
                      <span className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded ${div.enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {div.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-foreground leading-tight mt-3 group-hover:text-primary transition-colors line-clamp-2">
                      {classNameDisplay}
                    </h3>

                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3 font-medium">
                      {div.detailed_info || "No division description or details provided."}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" /> Max Students: {div.max_student || "Unlimited"}
                    </span>
                    
                    <span className="text-primary flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Ready
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Sidebar Classroom Form Panel */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsFormOpen(false)} />
          
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md transform bg-card shadow-2xl transition-transform duration-300 ease-in-out border-l border-border flex flex-col h-full">
              
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/20">
                <h2 className="text-lg font-black text-foreground">
                  ✨ Create Classroom
                </h2>
                <button 
                  onClick={() => setIsFormOpen(false)} 
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sidebar Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="space-y-1.5">
                  <Label htmlFor="class-title">Classroom Title</Label>
                  <Input 
                    id="class-title" 
                    required 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Science Classroom A"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="class-name">Class Name / Code</Label>
                  <Input 
                    id="class-name" 
                    required 
                    value={className} 
                    onChange={(e) => setClassName(e.target.value)} 
                    placeholder="e.g. 1st class, BSC Agri"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="max-students">Max Students Capacity</Label>
                  <Input 
                    id="max-students" 
                    type="number"
                    value={maxStudents} 
                    onChange={(e) => setMaxStudents(e.target.value)} 
                    placeholder="e.g. 100"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="class-desc">Detailed Info</Label>
                  <Textarea 
                    id="class-desc" 
                    rows={4} 
                    value={detailedInfo} 
                    onChange={(e) => setDetailedInfo(e.target.value)} 
                    placeholder="Specify classroom summary, room location, subject guidelines..."
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input 
                    id="class-enabled" 
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    checked={isEnabled} 
                    onChange={(e) => setIsEnabled(e.target.checked)} 
                  />
                  <Label htmlFor="class-enabled" className="cursor-pointer font-bold text-xs">Enable Classroom</Label>
                </div>

                {/* Submit Container */}
                <div className="pt-4 border-t border-border flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1 rounded-xl cursor-pointer font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 rounded-xl cursor-pointer font-bold">
                    Create Classroom
                  </Button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Sidebar Division Form Panel */}
      {isDivisionFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsDivisionFormOpen(false)} />
          
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md transform bg-card shadow-2xl transition-transform duration-300 ease-in-out border-l border-border flex flex-col h-full">
              
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/20">
                <h2 className="text-lg font-black text-foreground">
                  ✨ Create Division
                </h2>
                <button 
                  onClick={() => setIsDivisionFormOpen(false)} 
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sidebar Body */}
              <form onSubmit={handleDivisionSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="space-y-1.5">
                  <Label htmlFor="div-class">Select Classroom</Label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger id="div-class" className="w-full">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.title} ({cls.class_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="div-name">Division Name (e.g. A, B, C)</Label>
                  <Input 
                    id="div-name" 
                    required 
                    value={divisionName} 
                    onChange={(e) => setDivisionName(e.target.value)} 
                    placeholder="e.g. A"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="div-max-students">Max Students Capacity</Label>
                  <Input 
                    id="div-max-students" 
                    type="number"
                    value={divisionMaxStudents} 
                    onChange={(e) => setDivisionMaxStudents(e.target.value)} 
                    placeholder="e.g. 100"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="div-desc">Detailed Info</Label>
                  <Textarea 
                    id="div-desc" 
                    rows={4} 
                    value={divisionDetailedInfo} 
                    onChange={(e) => setDivisionDetailedInfo(e.target.value)} 
                    placeholder="Specify division summary or guidelines..."
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input 
                    id="div-enabled" 
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    checked={divisionIsEnabled} 
                    onChange={(e) => setDivisionIsEnabled(e.target.checked)} 
                  />
                  <Label htmlFor="div-enabled" className="cursor-pointer font-bold text-xs">Enable Division</Label>
                </div>

                {/* Submit Container */}
                <div className="pt-4 border-t border-border flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDivisionFormOpen(false)} className="flex-1 rounded-xl cursor-pointer font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 rounded-xl cursor-pointer font-bold">
                    Create Division
                  </Button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
