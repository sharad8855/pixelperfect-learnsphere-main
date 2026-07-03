import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect, useState } from "react";
import { authApi } from "@/lib/auth-api";
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Award,
  Loader2,
  Play,
  CheckCircle,
  X,
  Layers,
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  BookOpen,
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

export const Route = createFileRoute("/_app/tests")({
  head: () => ({ meta: [{ title: "Tests & Exams — Baapedu" }] }),
  component: TestsPage,
});

function TestsPage() {
  const user = useAuthStore((s) => s.user);
  const client = useAuthStore((s) => s.client);
  const storedRoleName = useAuthStore((s) => s.roleName);

  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Metadata dropdown state
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [compiledForms, setCompiledForms] = useState<any[]>([]);
  const [localCreatedForms, setLocalCreatedForms] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("local_created_forms");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Accordion Toggle state inside form
  const [isTargetSettingsOpen, setIsTargetSettingsOpen] = useState(true);

  // Form States matching API fields
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [examMode, setExamMode] = useState<"online" | "offline">("online");
  const [examType, setExamType] = useState<"end_term" | "mid_term" | "unit_test" | "assignment">("end_term");

  // exam_details Form States
  const [classId, setClassId] = useState("");
  const [courseId, setCourseId] = useState("e375c26e-5ca1-417c-bf44-48cd245033c0"); // CBSE default
  const [divisionId, setDivisionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [academicSessionId, setAcademicSessionId] = useState("662bf848-bb42-4a6b-ab58-dd007a487fa6"); // Default active session
  const [examDuration, setExamDuration] = useState("30");
  const [totalMarks, setTotalMarks] = useState("100");
  const [allowMultipleSlots, setAllowMultipleSlots] = useState(false);
  const [resultDeclarationDate, setResultDeclarationDate] = useState("2026-07-25");

  // exam_slots Form States (for first slot entry)
  const [examSlotDate, setExamSlotDate] = useState("2026-07-03");
  const [examStartTime, setExamStartTime] = useState("15:55");
  const [examEndTime, setExamEndTime] = useState("16:25");
  const [supervisorId, setSupervisorId] = useState("");
  const [selectedFormId, setSelectedFormId] = useState("");

  const isTutor = storedRoleName?.toLowerCase() === "tutor" || storedRoleName?.toLowerCase() === "teacher" || storedRoleName?.toLowerCase() === "instructor";
  const isAdmin = storedRoleName?.toLowerCase() === "admin" || storedRoleName?.toLowerCase() === "superadmin";
  const isAllowedToManage = isTutor || isAdmin;

  // Fetch Exams list
  const fetchExams = async () => {
    if (!client) return;
    setLoading(true);
    try {
      const response = await authApi.getExams(client.id);
      if (response.success && response.data) {
        setExams(response.data);
      } else {
        setExams([]);
      }
    } catch (err: any) {
      console.error("Failed to load exams", err);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes, subjects, divisions, forms metadata
  const fetchMetadata = async () => {
    if (!client) return;
    try {
      const [classRes, divRes, subRes] = await Promise.all([
        authApi.getClassrooms(client.id, 1, 1000),
        authApi.getDivisions(client.id, 1, 1000),
        authApi.getSubjects(client.id, 1, 1000),
      ]);

      const fetchedClasses = classRes.classrooms || [];
      const fetchedDivisions = divRes.divisions || [];
      const fetchedSubjects = subRes.subjects || [];

      setClassrooms(fetchedClasses);
      setDivisions(fetchedDivisions);
      setSubjects(fetchedSubjects);

      // Compile questionnaire forms from entities
      const extractFormId = (text?: string | null) => {
        if (!text) return null;
        const match = text.match(/Form ID:\s*([a-f0-9-]{36})/i);
        return match ? match[1] : null;
      };

      const compiled: Array<{ formId: string; name: string }> = [];

      localCreatedForms.forEach((lf: any) => {
        compiled.push({ formId: lf.formId, name: `${lf.attachedToName} (Template)` });
      });

      fetchedClasses.forEach((cls: any) => {
        const fid = cls.form_id || extractFormId(cls.detailed_info);
        if (fid && !compiled.some(f => f.formId === fid)) {
          compiled.push({ formId: fid, name: `${cls.title} (Class Survey)` });
        }
      });

      fetchedDivisions.forEach((div: any) => {
        const fid = div.form_id || extractFormId(div.detailed_info);
        if (fid && !compiled.some(f => f.formId === fid)) {
          const cls = fetchedClasses.find((c: any) => c.id === div.class);
          const name = cls ? `Div ${div.division} - ${cls.title}` : `Division ${div.division}`;
          compiled.push({ formId: fid, name: `${name} (Division Survey)` });
        }
      });

      fetchedSubjects.forEach((sub: any) => {
        const fid = sub.form_id || extractFormId(sub.description);
        if (fid && !compiled.some(f => f.formId === fid)) {
          compiled.push({ formId: fid, name: `${sub.name} (Subject Survey)` });
        }
      });

      setCompiledForms(compiled);
    } catch (err) {
      console.error("Failed to load metadata for exam creator", err);
    }
  };

  useEffect(() => {
    if (client) {
      fetchMetadata();
      fetchExams();
    }
  }, [client]);

  // Open Add Modal
  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle("");
    setExamMode("online");
    setExamType("end_term");
    setClassId(classrooms[0]?.id || "");
    setCourseId("e375c26e-5ca1-417c-bf44-48cd245033c0");
    setDivisionId("");
    setSubjectId("");
    setAcademicSessionId("662bf848-bb42-4a6b-ab58-dd007a487fa6");
    setExamDuration("30");
    setTotalMarks("100");
    setAllowMultipleSlots(false);
    setResultDeclarationDate("2026-07-25");
    setExamSlotDate("2026-07-03");
    setExamStartTime("15:55");
    setExamEndTime("16:25");
    setSupervisorId(user?.id || "");
    setSelectedFormId("");
    setIsTargetSettingsOpen(true);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: any) => {
    setIsEditing(true);
    setEditId(item.exam_id || item.id);
    setTitle(item.title || "");
    setExamMode(item.exam_mode || "online");
    setExamType(item.exam_type || "end_term");

    const dArray = item.exam_details;
    const d = (dArray && Array.isArray(dArray)) ? dArray[0] : (item.exam_details || {});

    setClassId(d.classes?.id || d.class_id || "");
    setCourseId(d.courses?.id || d.course_id || "e375c26e-5ca1-417c-bf44-48cd245033c0");
    setDivisionId(d.division?.id || d.division_id || "");
    setSubjectId(d.subject?.id || d.subject_id || "");
    setAcademicSessionId(d.academic_session?.id || d.academic_session_id || "662bf848-bb42-4a6b-ab58-dd007a487fa6");
    setExamDuration(d.exam_duration ? String(d.exam_duration) : "30");
    setTotalMarks(d.total_marks ? String(d.total_marks) : "100");
    setAllowMultipleSlots(!!d.allow_multiple_slots);
    setResultDeclarationDate(d.result_declaration_date || "2026-07-25");

    const slotObj = d.exam_slots?.[0] || {};
    setExamSlotDate(slotObj.exam_slot_date || "2026-07-03");

    const nestedSlot = slotObj.slots?.[0] || {};
    setExamStartTime(nestedSlot.exam_start_time?.substring(0, 5) || "15:55");
    setExamEndTime(nestedSlot.exam_end_time?.substring(0, 5) || "16:25");
    setSupervisorId(nestedSlot.supervisor_id || "");
    setSelectedFormId(nestedSlot.questionnaire_ids?.[0] || "");

    setIsTargetSettingsOpen(true);
    setIsFormOpen(true);
  };

  // Submit Exam
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    if (!title) {
      toast.error("Exam Title is required");
      return;
    }

    if (!classId) {
      toast.error("Classroom selection is required");
      return;
    }

    if (!subjectId) {
      toast.error("Subject selection is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        exam_mode: examMode,
        exam_type: examType,
        exam_details: {
          class_id: classId,
          course_id: courseId || "e375c26e-5ca1-417c-bf44-48cd245033c0",
          division_id: divisionId === "none_val" ? "" : divisionId || "",
          subject_id: subjectId,
          academic_session_id: academicSessionId || "662bf848-bb42-4a6b-ab58-dd007a487fa6",
          exam_duration: Number(examDuration) || 30,
          total_marks: Number(totalMarks) || 100,
          allow_multiple_slots: allowMultipleSlots,
          result_declaration_date: resultDeclarationDate,
          exam_slots: [
            {
              exam_date_id: "",
              exam_slot_date: examSlotDate,
              slots: [
                {
                  exam_slot_id: "",
                  exam_start_time: examStartTime.length === 5 ? `${examStartTime}:00` : examStartTime,
                  exam_end_time: examEndTime.length === 5 ? `${examEndTime}:00` : examEndTime,
                  supervisor_id: supervisorId || user?.id || "",
                  questionnaire_ids: (selectedFormId && selectedFormId !== "none_survey") ? [selectedFormId] : []
                }
              ]
            }
          ]
        }
      };

      let response;
      if (isEditing && editId) {
        response = await authApi.updateExam(client.id, editId, payload);
      } else {
        response = await authApi.createExam(client.id, payload);
      }

      if (response.success) {
        toast.success(response.message || (isEditing ? "Exam updated successfully" : "Exam created successfully"));
        await fetchExams();
        setIsFormOpen(false);
      } else {
        toast.error(response.message || "Failed to save exam schedule");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save exam schedule");
    } finally {
      setLoading(false);
    }
  };

  // Delete Exam
  const handleDelete = async (examId: string) => {
    if (!client) return;
    if (!confirm("Are you sure you want to delete this exam schedule?")) return;

    setLoading(true);
    try {
      const response = await authApi.deleteExam(client.id, examId);
      if (response.success) {
        toast.success(response.message || "Exam deleted successfully");
        await fetchExams();
      } else {
        toast.error("Failed to delete exam");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete exam");
    } finally {
      setLoading(false);
    }
  };

  // Student Start Exam Simulation
  const handleStartExam = (exam: any) => {
    const dArray = exam.exam_details;
    const d = (dArray && Array.isArray(dArray)) ? dArray[0] : (exam.exam_details || {});
    const duration = d.exam_duration || 30;
    toast.success(`Starting exam: ${exam.title}. Timer initialized to ${duration} minutes.`);
  };

  // Filter subjects and divisions by selected Classroom
  const filteredSubjects = subjects.filter((s) => s.class_id === classId);
  const filteredDivisions = divisions.filter((d) => d.class === classId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-6 rounded-2xl ring-1 ring-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Tests & Exams</h1>
            <p className="text-sm text-muted-foreground">Manage and complete skill assessments and term exams.</p>
          </div>
        </div>

        {isAllowedToManage && (
          <Button onClick={openAddModal} className="rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-2">
            <Plus className="h-5 w-5" /> Create Exam
          </Button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-card border border-border">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2.5 text-sm font-semibold text-muted-foreground">Loading exams...</span>
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="mt-4 text-lg font-bold text-foreground">No exams scheduled</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">Tests and exams assigned to client organization will show up here.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
            const dArray = exam.exam_details;
            const details = (dArray && Array.isArray(dArray)) ? dArray[0] : (exam.exam_details || {});
            const duration = details.exam_duration || 30;
            const marks = details.total_marks || 100;
            const typeLabel = exam.exam_type ? exam.exam_type.replace("_", " ").toUpperCase() : "END TERM";
            const modeLabel = exam.exam_mode ? exam.exam_mode.toUpperCase() : "ONLINE";

            const slot = details.exam_slots?.[0] || {};
            const innerSlot = slot.slots?.[0] || {};
            const examDate = slot.exam_slot_date || "2026-07-03";
            const startTime = innerSlot.exam_start_time || "15:55";

            const classNameDisplay = details.classes?.class_name || "General Class";
            const subjectNameDisplay = details.subject?.name || "Subject Material";
            const divisionNameDisplay = details.division ? `Div ${details.division.division}` : "General";

            return (
              <div key={exam.exam_id || exam.id} className="bg-card p-5 rounded-2xl ring-1 ring-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between border-t-4 border-t-primary min-h-[260px] relative overflow-hidden group">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded bg-primary/15 text-primary">
                      {typeLabel}
                    </span>
                    <span className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded ${exam.exam_mode === "offline" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                      {modeLabel}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-foreground leading-tight mt-3 group-hover:text-primary transition-colors line-clamp-1">
                    {exam.title}
                  </h3>

                  <p className="mt-1.5 text-[11px] text-muted-foreground/90 font-bold flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {classNameDisplay} • {divisionNameDisplay} • {subjectNameDisplay}
                  </p>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-[11px] font-semibold text-muted-foreground border-y border-border/50 py-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/75" /> Date: <strong className="text-foreground">{examDate}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground/75" /> Time: <strong className="text-foreground">{startTime.substring(0, 5)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {duration} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" /> {marks} marks
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                  {isAllowedToManage ? (
                    /* Tutor Controls */
                    <div className="flex gap-2 w-full justify-end">
                      <Button onClick={() => openEditModal(exam)} variant="outline" size="sm" className="rounded-lg h-9 w-9 p-0 cursor-pointer">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(exam.exam_id || exam.id)} variant="destructive" size="sm" className="rounded-lg h-9 w-9 p-0 cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    /* Student Controls */
                    <div className="flex items-center justify-between w-full">
                      {exam.status === "COMPLETED" ? (
                        <>
                          <span className="text-xs font-bold text-success flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Completed</span>
                          <span className="text-xs font-black text-foreground">Score: {exam.score} / {marks}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-semibold text-muted-foreground">Status: Assigned</span>
                          <Button
                            onClick={() => handleStartExam(exam)}
                            className="rounded-lg font-bold text-xs h-8 px-3 cursor-pointer flex items-center gap-1"
                          >
                            <Play className="h-3.5 w-3.5" /> Start
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sidebar Form Panel */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsFormOpen(false)} />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md transform bg-card shadow-2xl transition-transform duration-300 ease-in-out border-l border-border flex flex-col h-full">

              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/20">
                <h2 className="text-lg font-black text-foreground">
                  {isEditing ? "✏️ Edit Exam Settings" : "✨ Create Exam Schedule"}
                </h2>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sidebar Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* 1. General Settings */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-border pb-1">
                    📁 General Info
                  </h3>

                  <div className="space-y-1.5">
                    <Label htmlFor="exam-title">Exam Title</Label>
                    <Input
                      id="exam-title"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. BCA 6 sem exam"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="exam-mode">Exam Mode</Label>
                      <Select value={examMode} onValueChange={(v: "online" | "offline") => setExamMode(v)}>
                        <SelectTrigger id="exam-mode" className="w-full">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">🌐 Online</SelectItem>
                          <SelectItem value="offline">🏢 Offline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="exam-type">Exam Type</Label>
                      <Select value={examType} onValueChange={(v: any) => setExamType(v)}>
                        <SelectTrigger id="exam-type" className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="end_term">End Term</SelectItem>
                          <SelectItem value="mid_term">Mid Term</SelectItem>
                          <SelectItem value="unit_test">Unit Test</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 2. Collapsible Toggle Target Audience Details */}
                <div className="border border-border rounded-xl overflow-hidden bg-secondary/15">
                  <button
                    type="button"
                    onClick={() => setIsTargetSettingsOpen(!isTargetSettingsOpen)}
                    className="w-full flex items-center justify-between p-3.5 font-black text-xs uppercase tracking-wider text-primary bg-secondary/35 border-b border-border cursor-pointer select-none"
                  >
                    <span>🏫 Subject, Division & Survey Setup</span>
                    {isTargetSettingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {isTargetSettingsOpen && (
                    <div className="p-4 space-y-4 text-left">
                      <div className="space-y-1.5">
                        <Label htmlFor="exam-class">Select Classroom</Label>
                        <Select value={classId} onValueChange={setClassId}>
                          <SelectTrigger id="exam-class" className="w-full bg-background">
                            <SelectValue placeholder="Choose classroom" />
                          </SelectTrigger>
                          <SelectContent>
                            {classrooms.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="exam-subject">Select Subject</Label>
                        <Select value={subjectId} onValueChange={setSubjectId}>
                          <SelectTrigger id="exam-subject" className="w-full bg-background">
                            <SelectValue placeholder="Choose subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredSubjects.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="exam-division">Select Division (Optional)</Label>
                        <Select value={divisionId} onValueChange={setDivisionId}>
                          <SelectTrigger id="exam-division" className="w-full bg-background">
                            <SelectValue placeholder="Choose division" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none_val">None (General)</SelectItem>
                            {filteredDivisions.map((div) => (
                              <SelectItem key={div.id} value={div.id}>
                                Division {div.division}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="exam-survey">Attach Questionnaire Form (Optional)</Label>
                        <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                          <SelectTrigger id="exam-survey" className="w-full bg-background">
                            <SelectValue placeholder="Choose survey form" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none_survey">No Questionnaire</SelectItem>
                            {compiledForms.map((f) => (
                              <SelectItem key={f.formId} value={f.formId}>
                                {f.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>


                    </div>
                  )}
                </div>

                {/* 3. Evaluation Settings */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-border pb-1">
                    📊 Marks & Duration
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="exam-marks">Total Marks</Label>
                      <Input
                        id="exam-marks"
                        type="number"
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(e.target.value)}
                        placeholder="100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="exam-duration">Duration (mins)</Label>
                      <Input
                        id="exam-duration"
                        type="number"
                        value={examDuration}
                        onChange={(e) => setExamDuration(e.target.value)}
                        placeholder="30"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="result-date">Result Release Date</Label>
                    <Input
                      id="result-date"
                      type="date"
                      value={resultDeclarationDate}
                      onChange={(e) => setResultDeclarationDate(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id="multiple-slots"
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      checked={allowMultipleSlots}
                      onChange={(e) => setAllowMultipleSlots(e.target.checked)}
                    />
                    <Label htmlFor="multiple-slots" className="cursor-pointer font-bold text-xs">Allow Multiple slots</Label>
                  </div>
                </div>

                {/* 4. Slot Schedule */}
                <div className="space-y-4 pt-2 pb-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-border pb-1">
                    📆 Date & Time Slot
                  </h3>

                  <div className="space-y-1.5">
                    <Label htmlFor="slot-date">Exam Slot Date</Label>
                    <Input
                      id="slot-date"
                      type="date"
                      value={examSlotDate}
                      onChange={(e) => setExamSlotDate(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={examStartTime}
                        onChange={(e) => setExamStartTime(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={examEndTime}
                        onChange={(e) => setExamEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Container */}
                <div className="pt-4 border-t border-border flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1 rounded-xl cursor-pointer font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 rounded-xl cursor-pointer font-bold">
                    {isEditing ? "Save Changes" : "Schedule Exam"}
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
