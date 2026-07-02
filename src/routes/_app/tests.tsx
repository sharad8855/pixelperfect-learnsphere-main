import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect, useState } from "react";

import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Award,
  Loader2,
  FileText,
  Play,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/tests")({
  head: () => ({ meta: [{ title: "Tests & Exams — Baapedu" }] }),
  component: TestsPage,
});

// Mock Fallback Data
const MOCK_EXAMS = [
  { id: "1", test_name: "Data Structures Diagnostic", description: "Standard evaluation of arrays, linked lists, and basic trees.", total_marks: 100, time_limit: 45, status: "ASSIGNED" },
  { id: "2", test_name: "Python Coding Quiz", description: "10 MCQ questions on syntax, scope, and loops.", total_marks: 50, time_limit: 20, status: "COMPLETED", score: 45 },
  { id: "3", test_name: "DBMS Normalization Test", description: "Evaluate BCNF and 3NF functional dependencies.", total_marks: 75, time_limit: 30, status: "ASSIGNED" },
];

function TestsPage() {
  const user = useAuthStore((s) => s.user);
  const client = useAuthStore((s) => s.client);
  const storedRoleName = useAuthStore((s) => s.roleName);
  
  const [exams, setExams] = useState<any[]>(MOCK_EXAMS);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form States
  const [editId, setEditId] = useState<string | null>(null);
  const [testName, setTestName] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [timeLimit, setTimeLimit] = useState("30");
  const [description, setDescription] = useState("");

  const isTutor = storedRoleName?.toLowerCase() === "tutor" || storedRoleName?.toLowerCase() === "teacher" || storedRoleName?.toLowerCase() === "instructor";
  const isAdmin = storedRoleName?.toLowerCase() === "admin" || storedRoleName?.toLowerCase() === "superadmin";
  const isAllowedToManage = isTutor || isAdmin;

  // Open Add Modal
  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setTestName("");
    setTotalMarks("100");
    setTimeLimit("30");
    setDescription("");
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: any) => {
    setIsEditing(true);
    setEditId(item.id);
    setTestName(item.test_name || "");
    setTotalMarks(item.total_marks ? String(item.total_marks) : "100");
    setTimeLimit(item.time_limit ? String(item.time_limit) : "30");
    setDescription(item.description || "");
    setIsFormOpen(true);
  };

  // Submit Exam
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    if (!testName) {
      toast.error("Test Name is required");
      return;
    }

    const payload = {
      test_name: testName,
      total_marks: Number(totalMarks) || 100,
      time_limit: Number(timeLimit) || 30,
      description,
    };

    if (isEditing && editId) {
      setExams(prev => prev.map(exam => exam.id === editId ? { ...exam, ...payload } : exam));
      toast.success("Exam updated successfully");
    } else {
      const newExam = {
        id: String(Date.now()),
        status: "ASSIGNED",
        ...payload
      };
      setExams(prev => [...prev, newExam]);
      toast.success("Exam created successfully");
    }
    setIsFormOpen(false);
  };

  // Delete Exam
  const handleDelete = async (examId: string) => {
    if (!client) return;
    if (!confirm("Are you sure you want to delete this exam?")) return;

    setExams(prev => prev.filter(exam => exam.id !== examId));
    toast.success("Exam deleted");
  };

  // Student Start Exam Simulation
  const handleStartExam = (exam: any) => {
    toast.success(`Starting exam: ${exam.test_name}. Timer initialized to ${exam.time_limit} minutes.`);
  };

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
            <p className="text-sm text-muted-foreground">Manage and complete skill assessments and tests.</p>
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
          <span className="ml-2.5 text-sm font-semibold text-muted-foreground">Loading tests...</span>
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="mt-4 text-lg font-bold text-foreground">No tests</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">Tests and exams assigned to you will show up here.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-card p-5 rounded-2xl ring-1 ring-border shadow-sm flex flex-col justify-between border-t-4 border-t-primary min-h-[220px]">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-extrabold text-foreground leading-tight line-clamp-2">{exam.test_name}</h3>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3 font-medium">
                  {exam.description || "Evaluate your performance on standard coursework topic questions."}
                </p>

                <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {exam.time_limit} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" /> {exam.total_marks} marks
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
                    <Button onClick={() => handleDelete(exam.id)} variant="destructive" size="sm" className="rounded-lg h-9 w-9 p-0 cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  /* Student Controls */
                  <div className="flex items-center justify-between w-full">
                    {exam.status === "COMPLETED" ? (
                      <>
                        <span className="text-xs font-bold text-success flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Completed</span>
                        <span className="text-xs font-black text-foreground">Score: {exam.score} / {exam.total_marks}</span>
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
          ))}
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
                  {isEditing ? "✏️ Edit Exam" : "✨ Create Exam"}
                </h2>
                <button 
                  onClick={() => setIsFormOpen(false)} 
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sidebar Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
                <div className="space-y-1.5">
                  <Label htmlFor="exam-name">Exam / Test Name</Label>
                  <Input 
                    id="exam-name" 
                    required 
                    value={testName} 
                    onChange={(e) => setTestName(e.target.value)} 
                    placeholder="e.g. DSA midterm assessment"
                  />
                </div>

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
                    <Label htmlFor="exam-time">Time Limit (mins)</Label>
                    <Input 
                      id="exam-time" 
                      type="number"
                      value={timeLimit} 
                      onChange={(e) => setTimeLimit(e.target.value)} 
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="exam-desc">Exam Description</Label>
                  <Textarea 
                    id="exam-desc" 
                    rows={4} 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Specify exam instructions, topics, rules..."
                  />
                </div>

                {/* Submit Container */}
                <div className="pt-4 border-t border-border flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1 rounded-xl cursor-pointer font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 rounded-xl cursor-pointer font-bold">
                    {isEditing ? "Save Changes" : "Create"}
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
