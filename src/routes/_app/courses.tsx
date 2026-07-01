import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/auth-store";
import { useEffect, useState } from "react";
import { lms } from "@/lib/api-client";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Award,
  Loader2,
  ArrowRight,
  MoreVertical,
  X,
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

export const Route = createFileRoute("/_app/courses")({
  head: () => ({ meta: [{ title: "My Courses — Baapedu" }] }),
  component: CoursesPage,
});

// Mock Fallback Data
const MOCK_COURSES = [
  { id: "1", title: "Data Structures & Algorithms", level: "ADVANCED", language: "ENGLISH", description: "Comprehensive study of trees, graphs, sorting, searching, and dynamic programming.", thumbnail_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80", tags: ["dsa", "algorithms"] },
  { id: "2", title: "Python Programming", level: "BEGINNER", language: "ENGLISH", description: "Learn Python from scratch. Cover loops, functions, lists, dictionaries, and OOP.", thumbnail_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80", tags: ["python", "coding"] },
  { id: "3", title: "Database Management Systems", level: "INTERMEDIATE", language: "ENGLISH", description: "Learn SQL, relational schema, normalization, transactions, and indexing.", thumbnail_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80", tags: ["sql", "databases"] },
];

function CoursesPage() {
  const user = useAuthStore((s) => s.user);
  const client = useAuthStore((s) => s.client);
  const storedRoleName = useAuthStore((s) => s.roleName);
  
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form States
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [language, setLanguage] = useState("ENGLISH");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const isTutor = storedRoleName?.toLowerCase() === "tutor" || storedRoleName?.toLowerCase() === "teacher" || storedRoleName?.toLowerCase() === "instructor";
  const isAdmin = storedRoleName?.toLowerCase() === "admin" || storedRoleName?.toLowerCase() === "superadmin";
  const isAllowedToManage = isTutor || isAdmin;

  // Fetch Courses
  const fetchCourses = async () => {
    if (!client) return;
    setLoading(true);
    try {
      // In fastify backend: courseRoutes is registered with prefix '/client/:client_id'
      // The endpoint to get all is GET /all-courses
      const res = await lms.get<{ items?: any[]; data?: { courses?: any[] } }>(`/client/${client.id}/all-courses`);
      // Read arrays based on backend response shape
      const list = (res as any)?.items || res?.data?.courses || [];
      if (list.length > 0) {
        setCourses(list);
      } else {
        setCourses(MOCK_COURSES);
      }
    } catch (err: any) {
      console.warn("Backend API not reachable. Using fallback courses.", err.message);
      setCourses(MOCK_COURSES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [client]);

  // Open Add Modal
  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle("");
    setLevel("BEGINNER");
    setLanguage("ENGLISH");
    setDescription("");
    setThumbnailUrl("");
    setTagsInput("");
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (course: any) => {
    setIsEditing(true);
    setEditId(course.id);
    setTitle(course.title || "");
    setLevel(course.level || "BEGINNER");
    setLanguage(course.language || "ENGLISH");
    setDescription(course.description || "");
    setThumbnailUrl(course.thumbnail_url || "");
    setTagsInput(course.tags ? course.tags.join(", ") : "");
    setIsFormOpen(true);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    
    if (title.length < 3) {
      toast.error("Title must be at least 3 characters long");
      return;
    }

    const payload = {
      title,
      level,
      language,
      description,
      thumbnail_url: thumbnailUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
      tags: tagsInput ? tagsInput.split(",").map(t => t.trim()).filter(Boolean) : [],
    };

    try {
      if (isEditing && editId) {
        // PUT /client/:client_id/course/:id
        await lms.put(`/client/${client.id}/course/${editId}`, payload);
        toast.success("Course updated successfully");
      } else {
        // POST /client/:client_id/course
        await lms.post(`/client/${client.id}/course`, payload);
        toast.success("Course created successfully");
      }
      setIsFormOpen(false);
      fetchCourses();
    } catch (err: any) {
      toast.error(err.message || "Failed to save course");
    }
  };

  // Delete Course
  const handleDelete = async (courseId: string) => {
    if (!client) return;
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      // DELETE /client/:client_id/courses/:id
      await lms.del(`/client/${client.id}/courses/${courseId}`);
      toast.success("Course deleted");
      fetchCourses();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete course");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-6 rounded-2xl ring-1 ring-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Courses</h1>
            <p className="text-sm text-muted-foreground">Manage and explore all enrolled or created courses.</p>
          </div>
        </div>

        {isAllowedToManage && (
          <Button onClick={openAddModal} className="rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add Course
          </Button>
        )}
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-card border border-border">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2.5 text-sm font-semibold text-muted-foreground">Loading courses...</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="mt-4 text-lg font-bold text-foreground">No courses found</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">Get started by creating your first training module.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
              <div>
                {/* Thumbnail Cover */}
                <div className="relative h-44 overflow-hidden bg-muted">
                  <img 
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600"} 
                    alt={course.title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  
                  {/* Action Badges */}
                  <span className="absolute bottom-3 left-3 rounded-lg bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                    {course.level || "BEGINNER"}
                  </span>
                  
                  {isAllowedToManage && (
                    <div className="absolute right-2 top-2 flex items-center gap-1.5 bg-black/40 p-1.5 rounded-lg backdrop-blur-sm">
                      <button 
                        onClick={() => openEditModal(course)} 
                        className="rounded p-1 text-white hover:bg-white/20 transition cursor-pointer"
                        title="Edit course"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)} 
                        className="rounded p-1 text-red-400 hover:bg-white/20 transition cursor-pointer"
                        title="Delete course"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Details Content */}
                <div className="p-5">
                  <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
                    {course.title}
                  </h3>
                  
                  {/* Info Tags */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" /> {course.language || "English"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" /> {course.level ? course.level.toLowerCase() : "beginner"}
                    </span>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground line-clamp-3 font-medium">
                    {course.description || "No description provided for this training module."}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5 pt-0">
                <Button className="w-full rounded-xl font-bold cursor-pointer flex items-center justify-center gap-2">
                  View Content <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sidebar Form Panel (Slide-Over sheet) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsFormOpen(false)} />
          
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md transform bg-card shadow-2xl transition-transform duration-300 ease-in-out border-l border-border flex flex-col h-full">
              
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/20">
                <h2 className="text-lg font-black text-foreground">
                  {isEditing ? "✏️ Edit Course" : "✨ Create Course"}
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
                  <Label htmlFor="course-title">Course Title</Label>
                  <Input 
                    id="course-title" 
                    required 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Intro to Advanced SQL"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="course-level">Difficulty Level</Label>
                  <Select value={level} onValueChange={(v: "BEGINNER" | "INTERMEDIATE" | "ADVANCED") => setLevel(v)}>
                    <SelectTrigger id="course-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">🟢 Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">🟡 Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">🔴 Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="course-lang">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="course-lang">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENGLISH">English</SelectItem>
                      <SelectItem value="HINDI">Hindi</SelectItem>
                      <SelectItem value="MARATHI">Marathi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="course-image">Cover Image URL</Label>
                  <Input 
                    id="course-image" 
                    value={thumbnailUrl} 
                    onChange={(e) => setThumbnailUrl(e.target.value)} 
                    placeholder="https://images.unsplash.com/photo..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="course-tags">Tags (comma separated)</Label>
                  <Input 
                    id="course-tags" 
                    value={tagsInput} 
                    onChange={(e) => setTagsInput(e.target.value)} 
                    placeholder="coding, sql, database"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="course-desc">Course Description</Label>
                  <Textarea 
                    id="course-desc" 
                    rows={4} 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Summarize course content and goals..."
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
