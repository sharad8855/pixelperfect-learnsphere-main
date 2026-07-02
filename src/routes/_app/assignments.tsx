import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect, useState } from "react";

import {
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Award,
  Loader2,
  CheckCircle,
  FileText,
  User,
  X,
  FileUp,
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

export const Route = createFileRoute("/_app/assignments")({
  head: () => ({ meta: [{ title: "Assignments — Baapedu" }] }),
  component: AssignmentsPage,
});

// Mock Fallback Data
const MOCK_ASSIGNMENTS = [
  { id: "1", task_name: "Implement Graph Traversals", description: "Implement BFS and DFS in Java. Attach source code file and short explanation.", level: "ADVANCED", total_score: "100", reviewer: [{ name: "Prof. Neeraj Kumar" }], status: "ASSIGNED", end_date: "2025-06-15" },
  { id: "2", task_name: "Python List Comprehensions Practice", description: "Write list comprehension expressions for filtering, mapping, and matrix manipulation.", level: "BEGINNER", total_score: "50", reviewer: [{ name: "Prof. Ananya Verma" }], status: "SUBMITTED", end_date: "2025-06-10" },
  { id: "3", task_name: "Database Normalization Exercises", description: "Normalize schemas up to BCNF. Provide 3NF vs BCNF comparison chart.", level: "INTERMEDIATE", total_score: "80", reviewer: [{ name: "Prof. Priya Nair" }], status: "APPROVED", end_date: "2025-06-12", score: 75 },
];

function AssignmentsPage() {
  const user = useAuthStore((s) => s.user);
  const client = useAuthStore((s) => s.client);
  const storedRoleName = useAuthStore((s) => s.roleName);
  
  const [assignments, setAssignments] = useState<any[]>(MOCK_ASSIGNMENTS);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form States
  const [editId, setEditId] = useState<string | null>(null);
  const [taskName, setTaskName] = useState("");
  const [totalScore, setTotalScore] = useState("100");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("INTERMEDIATE");
  const [reviewerName, setReviewerName] = useState("");

  const isTutor = storedRoleName?.toLowerCase() === "tutor" || storedRoleName?.toLowerCase() === "teacher" || storedRoleName?.toLowerCase() === "instructor";
  const isAdmin = storedRoleName?.toLowerCase() === "admin" || storedRoleName?.toLowerCase() === "superadmin";
  const isAllowedToManage = isTutor || isAdmin;

  // Open Add Modal
  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setTaskName("");
    setTotalScore("100");
    setDescription("");
    setLevel("INTERMEDIATE");
    setReviewerName("");
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: any) => {
    setIsEditing(true);
    setEditId(item.id);
    setTaskName(item.task_name || "");
    setTotalScore(item.total_score || "100");
    setDescription(item.description || "");
    setLevel(item.level || "INTERMEDIATE");
    setReviewerName(item.reviewer ? item.reviewer.map((r: any) => r.name).join(", ") : "");
    setIsFormOpen(true);
  };

  // Submit Action Item
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !user) return;

    if (!taskName) {
      toast.error("Task Name is required");
      return;
    }

    const payload = {
      task_name: taskName,
      total_score: totalScore,
      description,
      level,
      reviewer: reviewerName 
        ? reviewerName.split(",").map(name => ({ id: user.id, name: name.trim() }))
        : [{ id: user.id, name: user.name || "Tutor" }],
    };

    if (isEditing && editId) {
      setAssignments(prev => prev.map(item => item.id === editId ? { ...item, ...payload } : item));
      toast.success("Assignment updated successfully");
    } else {
      const newAssignment = {
        id: String(Date.now()),
        status: "ASSIGNED",
        ...payload
      };
      setAssignments(prev => [...prev, newAssignment]);
      toast.success("Assignment created successfully");
    }
    setIsFormOpen(false);
  };

  // Delete Action Item
  const handleDelete = async (itemId: string) => {
    if (!client) return;
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    setAssignments(prev => prev.filter(item => item.id !== itemId));
    toast.success("Assignment deleted");
  };

  // Student: Submit Assignment
  const handleStudentSubmit = async (itemId: string) => {
    if (!client || !user) return;
    setAssignments(prev => prev.map(item => item.id === itemId ? { ...item, status: "SUBMITTED" } : item));
    toast.success("Assignment submitted successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-6 rounded-2xl ring-1 ring-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Assignments</h1>
            <p className="text-sm text-muted-foreground">Manage tasks, assignments, and action items.</p>
          </div>
        </div>

        {isAllowedToManage && (
          <Button onClick={openAddModal} className="rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-2">
            <Plus className="h-5 w-5" /> Create Assignment
          </Button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-card border border-border">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2.5 text-sm font-semibold text-muted-foreground">Loading assignments...</span>
        </div>
      ) : assignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="mt-4 text-lg font-bold text-foreground">No assignments</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">Assignments and action items assigned to you will show up here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {assignments.map((item) => {
            const hasScore = item.score != null;
            const reviewerName = item.reviewer ? item.reviewer.map((r: any) => r.name).join(", ") : "Tutor";
            
            return (
              <div key={item.id} className="bg-card p-6 rounded-2xl ring-1 ring-border shadow-sm flex flex-col justify-between md:flex-row md:items-center gap-6 border-l-4 border-l-primary">
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-extrabold text-foreground leading-tight truncate">{item.task_name}</h3>
                    <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[10px] font-bold text-foreground ring-1 ring-border">
                      {item.level || "INTERMEDIATE"}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary ring-1 ring-primary/20">
                      {item.total_score} pts
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-medium">
                    {item.description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Reviewer: {reviewerName}
                    </span>
                    {item.end_date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> Due: {item.end_date}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-end">
                  {/* Status Indicator */}
                  {!isAllowedToManage && (
                    <div className="flex flex-col items-end gap-1 font-semibold text-xs text-right mr-2">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Status</span>
                      <span className={`font-bold ${
                        item.status === "APPROVED" ? "text-success" : 
                        item.status === "SUBMITTED" ? "text-warning" : 
                        "text-destructive"
                      }`}>
                        {item.status || "ASSIGNED"}
                      </span>
                    </div>
                  )}

                  {/* Tutor Controls */}
                  {isAllowedToManage ? (
                    <div className="flex items-center gap-2">
                      <Button onClick={() => openEditModal(item)} variant="outline" size="sm" className="rounded-lg h-9 w-9 p-0 cursor-pointer">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(item.id)} variant="destructive" size="sm" className="rounded-lg h-9 w-9 p-0 cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    /* Student Controls */
                    <div className="flex items-center gap-3">
                      {hasScore && (
                        <div className="flex h-10 items-center justify-center rounded-xl bg-success/10 px-3.5 text-xs font-bold text-success ring-1 ring-success/20">
                          Grade: {item.score} / {item.total_score}
                        </div>
                      )}
                      {item.status === "ASSIGNED" && (
                        <Button 
                          onClick={() => handleStudentSubmit(item.id)} 
                          className="rounded-xl font-bold cursor-pointer flex items-center gap-2 bg-primary hover:bg-primary/95 text-xs shrink-0"
                        >
                          <FileUp className="h-4 w-4" /> Submit Task
                        </Button>
                      )}
                      {item.status === "SUBMITTED" && (
                        <div className="flex h-10 items-center gap-1.5 rounded-xl bg-warning/10 px-3.5 text-xs font-bold text-warning ring-1 ring-warning/20">
                          Pending Grade
                        </div>
                      )}
                      {item.status === "APPROVED" && (
                        <div className="flex h-10 items-center gap-1.5 rounded-xl bg-success/15 px-3.5 text-xs font-bold text-success ring-1 ring-success/20">
                          <CheckCircle className="h-4 w-4" /> Completed
                        </div>
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
                  {isEditing ? "✏️ Edit Assignment" : "✨ Create Assignment"}
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
                  <Label htmlFor="task-name">Task Name</Label>
                  <Input 
                    id="task-name" 
                    required 
                    value={taskName} 
                    onChange={(e) => setTaskName(e.target.value)} 
                    placeholder="e.g. Implement Binary Search Trees"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="total-score">Total Points</Label>
                    <Input 
                      id="total-score" 
                      type="number"
                      value={totalScore} 
                      onChange={(e) => setTotalScore(e.target.value)} 
                      placeholder="100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="task-level">Difficulty Level</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger id="task-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Green (Beginner)</SelectItem>
                        <SelectItem value="INTERMEDIATE">Yellow (Intermediate)</SelectItem>
                        <SelectItem value="ADVANCED">Red (Advanced)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reviewer">Reviewer Name (comma separated)</Label>
                  <Input 
                    id="reviewer" 
                    value={reviewerName} 
                    onChange={(e) => setReviewerName(e.target.value)} 
                    placeholder="e.g. Prof Neeraj Kumar"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="task-desc">Task Description</Label>
                  <Textarea 
                    id="task-desc" 
                    rows={4} 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Describe tasks, constraints, expectations..."
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
