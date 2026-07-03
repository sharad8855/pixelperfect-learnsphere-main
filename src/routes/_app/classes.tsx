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
  ClipboardList,
  Eye,
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

  const [activeTab, setActiveTab] = useState<"classrooms" | "divisions" | "subjects" | "forms">("classrooms");
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
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
  const [classQuestionnaireType, setClassQuestionnaireType] = useState<"none" | "new" | "existing">("none");
  const [classSelectedFormId, setClassSelectedFormId] = useState("");
  const [classQuestions, setClassQuestions] = useState<Array<{ text: string; isRequired: boolean }>>([]);

  // Division Form States
  const [isDivisionFormOpen, setIsDivisionFormOpen] = useState(false);
  const [divisionName, setDivisionName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [divisionDetailedInfo, setDivisionDetailedInfo] = useState("");
  const [divisionClassTeacher, setDivisionClassTeacher] = useState("");
  const [divisionMaxStudents, setDivisionMaxStudents] = useState("");
  const [divisionIsEnabled, setDivisionIsEnabled] = useState(true);
  const [divQuestionnaireType, setDivQuestionnaireType] = useState<"none" | "new" | "existing">("none");
  const [divSelectedFormId, setDivSelectedFormId] = useState("");
  const [divQuestions, setDivQuestions] = useState<Array<{ text: string; isRequired: boolean }>>([]);

  // Subject Form States
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [subjectClassId, setSubjectClassId] = useState("");
  const [subjectDivisionId, setSubjectDivisionId] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");
  const [subjectIsEnabled, setSubjectIsEnabled] = useState(true);
  const [subjectIsCompulsory, setSubjectIsCompulsory] = useState(false);
  const [subQuestionnaireType, setSubQuestionnaireType] = useState<"none" | "new" | "existing">("none");
  const [subSelectedFormId, setSubSelectedFormId] = useState("");
  const [subQuestions, setSubQuestions] = useState<Array<{ text: string; isRequired: boolean }>>([]);

  // Standalone Questionnaire Creation States
  const [isFormCreateOpen, setIsFormCreateOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formQuestions, setFormQuestions] = useState<Array<{ text: string; isRequired: boolean }>>([]);
  const [localCreatedForms, setLocalCreatedForms] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("local_created_forms");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("local_created_forms", JSON.stringify(localCreatedForms));
  }, [localCreatedForms]);

  // Form Questions Preview Modal State
  const [isViewFormOpen, setIsViewFormOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [loadingFormDetails, setLoadingFormDetails] = useState(false);
  const [previewForm, setPreviewForm] = useState<any>(null);

  const isTutor = storedRoleName?.toLowerCase() === "tutor" || storedRoleName?.toLowerCase() === "teacher" || storedRoleName?.toLowerCase() === "instructor";
  const isAdmin = storedRoleName?.toLowerCase() === "admin" || storedRoleName?.toLowerCase() === "superadmin";
  const isAllowedToManage = isTutor || isAdmin;

  // Fetch classrooms from backend
  const fetchClassrooms = async () => {
    if (!client) return;
    try {
      const response = await authApi.getClassrooms(client.id, 1, 1000);
      if (response.success || response.classrooms) {
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
      const response = await authApi.getDivisions(client.id, 1, 1000);
      if (response.success || response.divisions) {
        setDivisions(response.divisions || []);
      }
    } catch (err: any) {
      console.error("Failed to load divisions", err);
    }
  };

  // Fetch subjects from backend
  const fetchSubjects = async () => {
    if (!client) return;
    try {
      const response = await authApi.getSubjects(client.id, 1, 1000);
      if (response.success || response.subjects) {
        setSubjects(response.subjects || []);
      }
    } catch (err: any) {
      console.error("Failed to load subjects", err);
    }
  };

  // Initial Fetch Setup
  const loadData = async () => {
    if (!client) return;
    setLoading(true);
    await Promise.all([fetchClassrooms(), fetchDivisions(), fetchSubjects()]);
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
    setClassQuestionnaireType("none");
    setClassSelectedFormId("");
    setClassQuestions([]);
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
    setDivQuestionnaireType("none");
    setDivSelectedFormId("");
    setDivQuestions([]);
    setIsDivisionFormOpen(true);
  };

  // Open Subject Form Modal
  const openAddSubjectModal = () => {
    setSubjectName("");
    setSubjectClassId(classrooms[0]?.id || "");
    setSubjectDivisionId("");
    setSubjectDescription("");
    setSubjectIsEnabled(true);
    setSubjectIsCompulsory(false);
    setSubQuestionnaireType("none");
    setSubSelectedFormId("");
    setSubQuestions([]);
    setIsSubjectFormOpen(true);
  };

  // Open Standalone Form Modal
  const openAddFormModal = () => {
    setFormTitle("");
    setFormDesc("");
    setFormQuestions([]);
    setIsFormCreateOpen(true);
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
      let createdFormId: string | null = null;

      if (classQuestionnaireType === "existing" && classSelectedFormId) {
        createdFormId = classSelectedFormId;
      } else if (classQuestionnaireType === "new" && classQuestions.length > 0) {
        const emptyQuestion = classQuestions.some(q => !q.text.trim());
        if (emptyQuestion) {
          toast.error("All questions must have text");
          setLoading(false);
          return;
        }

        const questionsPayload = classQuestions.map((q, idx) => ({
          question_type_id: "fa2f6a39-7682-41cd-bb24-ec7fc6965fbe",
          question_id: "",
          question_text: q.text,
          is_required: q.isRequired,
          question_order: idx + 1
        }));

        const formResponse = await authApi.createForm(client.id, {
          title: `${title} - Classroom Survey`,
          description: `Survey questions for classroom ${title}`,
          client_id: client.id,
          questions: questionsPayload
        });

        if (formResponse.form?.form_id) {
          createdFormId = formResponse.form.form_id;
        } else {
          throw new Error(formResponse.message || "Failed to create questionnaire form");
        }
      }

      const finalDetailedInfo = detailedInfo + (createdFormId ? `\n\nForm ID: ${createdFormId}` : "");

      const payload = {
        title,
        class_name: className,
        detailed_info: finalDetailedInfo,
        class_teacher: classTeacher || "",
        max_students: maxStudents || "",
        is_enabled: isEnabled,
        client_id: client.id,
        substitute_teacher: substituteTeacherInput ? substituteTeacherInput.split(",").map(t => t.trim()).filter(Boolean) : [],
        form_id: createdFormId,
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
      let createdFormId: string | null = null;

      if (divQuestionnaireType === "existing" && divSelectedFormId) {
        createdFormId = divSelectedFormId;
      } else if (divQuestionnaireType === "new" && divQuestions.length > 0) {
        const emptyQuestion = divQuestions.some(q => !q.text.trim());
        if (emptyQuestion) {
          toast.error("All questions must have text");
          setLoading(false);
          return;
        }

        const questionsPayload = divQuestions.map((q, idx) => ({
          question_type_id: "fa2f6a39-7682-41cd-bb24-ec7fc6965fbe",
          question_id: "",
          question_text: q.text,
          is_required: q.isRequired,
          question_order: idx + 1
        }));

        const formResponse = await authApi.createForm(client.id, {
          title: `Division ${divisionName} - Survey`,
          description: `Survey questions for division ${divisionName}`,
          client_id: client.id,
          questions: questionsPayload
        });

        if (formResponse.form?.form_id) {
          createdFormId = formResponse.form.form_id;
        } else {
          throw new Error(formResponse.message || "Failed to create questionnaire form");
        }
      }

      const finalDetailedInfo = divisionDetailedInfo + (createdFormId ? `\n\nForm ID: ${createdFormId}` : "");

      const payload = {
        class: selectedClassId,
        division: divisionName,
        detailed_info: finalDetailedInfo,
        course: null,
        class_teacher: divisionClassTeacher || "",
        max_student: divisionMaxStudents || "",
        enabled: divisionIsEnabled,
        client_id: client.id,
        form_id: createdFormId,
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

  // Submit Subject Form
  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    if (!subjectName || !subjectClassId) {
      toast.error("Subject Name and Classroom are required");
      return;
    }

    setLoading(true);
    try {
      let createdFormId: string | null = null;

      if (subQuestionnaireType === "existing" && subSelectedFormId) {
        createdFormId = subSelectedFormId;
      } else if (subQuestionnaireType === "new" && subQuestions.length > 0) {
        const emptyQuestion = subQuestions.some(q => !q.text.trim());
        if (emptyQuestion) {
          toast.error("All questions must have text");
          setLoading(false);
          return;
        }

        const questionsPayload = subQuestions.map((q, idx) => ({
          question_type_id: "fa2f6a39-7682-41cd-bb24-ec7fc6965fbe",
          question_id: "",
          question_text: q.text,
          is_required: q.isRequired,
          question_order: idx + 1
        }));

        const formResponse = await authApi.createForm(client.id, {
          title: `${subjectName} - Subject Survey`,
          description: `Survey questions for subject ${subjectName}`,
          client_id: client.id,
          questions: questionsPayload
        });

        if (formResponse.form?.form_id) {
          createdFormId = formResponse.form.form_id;
        } else {
          throw new Error(formResponse.message || "Failed to create questionnaire form");
        }
      }

      const finalDescription = subjectDescription + (createdFormId ? `\n\nForm ID: ${createdFormId}` : "");

      const payload = {
        name: subjectName,
        class_id: subjectClassId,
        course: null,
        book: null,
        division: subjectDivisionId === "none_val" ? null : subjectDivisionId || null,
        teacher: user?.id || null,
        client_id: client.id,
        enabled: subjectIsEnabled,
        is_compulsory: subjectIsCompulsory,
        description: finalDescription,
        type: "",
        form_id: createdFormId,
      };

      const response = await authApi.createSubject(client.id, payload);
      if (response.success) {
        toast.success(response.message || "Subject created successfully");
        await fetchSubjects();
        setIsSubjectFormOpen(false);
      } else {
        toast.error("Failed to create subject");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create subject");
    } finally {
      setLoading(false);
    }
  };

  // Submit Standalone Questionnaire Form
  const handleCreateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    if (!formTitle) {
      toast.error("Form Title is required");
      return;
    }

    if (formQuestions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    const emptyQuestion = formQuestions.some(q => !q.text.trim());
    if (emptyQuestion) {
      toast.error("All questions must contain text");
      return;
    }

    setLoading(true);
    try {
      const questionsPayload = formQuestions.map((q, idx) => ({
        question_type_id: "fa2f6a39-7682-41cd-bb24-ec7fc6965fbe",
        question_id: "",
        question_text: q.text,
        is_required: q.isRequired,
        question_order: idx + 1
      }));

      const formResponse = await authApi.createForm(client.id, {
        title: formTitle,
        description: formDesc || "Template survey description",
        client_id: client.id,
        questions: questionsPayload
      });

      if (formResponse.form?.form_id) {
        const newForm = {
          formId: formResponse.form.form_id,
          attachedToType: "Template" as const,
          attachedToName: formTitle,
          attachedToId: "template"
        };
        // Add to local created state to display immediately
        setLocalCreatedForms(prev => [newForm, ...prev]);
        toast.success("Questionnaire Form template created successfully!");
        setIsFormCreateOpen(false);
      } else {
        toast.error(formResponse.message || "Failed to create form template");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create form template");
    } finally {
      setLoading(false);
    }
  };

  // Fetch form questions when clicking Preview Questions button
  const handleViewFormQuestions = async (formId: string) => {
    setSelectedFormId(formId);
    setIsViewFormOpen(true);
    setLoadingFormDetails(true);
    setPreviewForm(null);
    try {
      const response = await authApi.getForm(client!.id, formId);
      if (response.form) {
        setPreviewForm(response.form);
      } else {
        toast.error(response.message || "Failed to load form details");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load form details");
    } finally {
      setLoadingFormDetails(false);
    }
  };

  // Filter divisions to match selected classroom in Subjects Form
  const filteredDivisionsForSubject = divisions.filter(
    (d) => d.class === subjectClassId
  );

  // Compile unique forms from classrooms, divisions, and subjects
  const extractFormId = (text?: string | null) => {
    if (!text) return null;
    const match = text.match(/Form ID:\s*([a-f0-9-]{36})/i);
    return match ? match[1] : null;
  };

  const compiledForms: Array<{
    formId: string;
    attachedToType: "Classroom" | "Division" | "Subject" | "Template";
    attachedToName: string;
    attachedToId: string;
  }> = [];

  // Add manually created template forms first
  localCreatedForms.forEach((f) => {
    compiledForms.push(f);
  });

  classrooms.forEach((cls) => {
    const fid = cls.form_id || extractFormId(cls.detailed_info);
    if (fid) {
      if (!compiledForms.some(f => f.formId === fid)) {
        compiledForms.push({
          formId: fid,
          attachedToType: "Classroom",
          attachedToName: cls.title,
          attachedToId: cls.id
        });
      }
    }
  });

  divisions.forEach((div) => {
    const fid = div.form_id || extractFormId(div.detailed_info);
    if (fid) {
      if (!compiledForms.some(f => f.formId === fid)) {
        const linkedClass = classrooms.find((c) => c.id === div.class);
        const name = linkedClass
          ? `Div ${div.division} - ${linkedClass.title}`
          : `Division ${div.division}`;
        compiledForms.push({
          formId: fid,
          attachedToType: "Division",
          attachedToName: name,
          attachedToId: div.id
        });
      }
    }
  });

  subjects.forEach((sub) => {
    const fid = sub.form_id || extractFormId(sub.description);
    if (fid) {
      if (!compiledForms.some(f => f.formId === fid)) {
        compiledForms.push({
          formId: fid,
          attachedToType: "Subject",
          attachedToName: sub.name,
          attachedToId: sub.id
        });
      }
    }
  });

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
              {activeTab === "classrooms"
                ? "My Classrooms"
                : activeTab === "divisions"
                  ? "My Divisions"
                  : activeTab === "subjects"
                    ? "My Subjects"
                    : "Questionnaires & Forms"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTab === "classrooms"
                ? "Manage and overview your academic class assignments and schedules."
                : activeTab === "divisions"
                  ? "Manage subdivisions, sections, and division teachers."
                  : activeTab === "subjects"
                    ? "Manage academic course subjects, books, and instructors."
                    : "Review survey forms, feedback questionnaires, and custom surveys."}
            </p>
          </div>
        </div>

        {isAllowedToManage && (
          <Button
            onClick={
              activeTab === "classrooms"
                ? openAddModal
                : activeTab === "divisions"
                  ? openAddDivisionModal
                  : activeTab === "subjects"
                    ? openAddSubjectModal
                    : openAddFormModal
            }
            className="rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {activeTab === "classrooms"
              ? "Create Class"
              : activeTab === "divisions"
                ? "Create Division"
                : activeTab === "subjects"
                  ? "Create Subject"
                  : "Create Form"}
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
        <button
          onClick={() => setActiveTab("subjects")}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === "subjects"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          📖 Subjects
        </button>
        <button
          onClick={() => setActiveTab("forms")}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === "forms"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          📋 Forms
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

              const formId = cls.form_id || extractFormId(cls.detailed_info);
              const cleanDescription = cls.detailed_info
                ? cls.detailed_info.replace(/Form ID:\s*[a-f0-9-]{36}/i, "").trim()
                : "No classroom description or details provided.";

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
                      {cleanDescription}
                    </p>

                    {formId && (
                      <div className="mt-3 inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        📋 Questionnaire Attached
                      </div>
                    )}

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
      ) : activeTab === "divisions" ? (
        divisions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-lg font-bold text-foreground">No divisions found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">There are no divisions created for this client organization yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {divisions.map((div) => {
              const linkedClass = classrooms.find((c) => c.id === div.class);
              const classNameDisplay = linkedClass
                ? `${linkedClass.title} (${linkedClass.class_name})`
                : (div.classes ? div.classes.class_name : "Classroom Assigned");

              const isUUID = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
              const teacherName = div.user
                ? `${div.user.first_name} ${div.user.last_name}`
                : (div.class_teacher && !isUUID(div.class_teacher) ? div.class_teacher : (div.class_teacher ? "Assigned" : "Not assigned"));

              const formId = div.form_id || extractFormId(div.detailed_info);
              const cleanDescription = div.detailed_info
                ? div.detailed_info.replace(/Form ID:\s*[a-f0-9-]{36}/i, "").trim()
                : "No division description or details provided.";

              return (
                <div key={div.id} className="bg-card p-5 rounded-2xl ring-1 ring-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between border-t-4 border-t-primary min-h-[220px] relative overflow-hidden group">
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
                      {cleanDescription}
                    </p>

                    {formId && (
                      <div className="mt-3 inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        📋 Questionnaire Attached
                      </div>
                    )}

                    {/* Teacher Info */}
                    <div className="mt-4 pt-3 border-t border-border/50 space-y-2 text-xs font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="h-3.5 w-3.5 text-muted-foreground/75" />
                        Division Teacher: <strong className="text-foreground">{teacherName}</strong>
                      </div>
                    </div>
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
      ) : activeTab === "subjects" ? (
        subjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/60" />
            <h3 className="mt-4 text-lg font-bold text-foreground">No subjects found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">There are no subjects created for this client organization yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((sub) => {
              const linkedClass = classrooms.find((c) => c.id === sub.class_id) || sub.classes;
              const classNameDisplay = linkedClass
                ? `${linkedClass.title || linkedClass.class_name}`
                : "Classroom Assigned";

              const linkedDiv = divisions.find((d) => d.id === sub.division) || sub.divisions;
              const divNameDisplay = linkedDiv ? `Div ${linkedDiv.division}` : "General";

              const isUUID = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
              const teacherName = sub.user
                ? `${sub.user.first_name} ${sub.user.last_name}`
                : (sub.teacher && !isUUID(sub.teacher) ? sub.teacher : (sub.teacher ? "Assigned" : "Not assigned"));

              const formId = sub.form_id || extractFormId(sub.description);
              const cleanDescription = sub.description
                ? sub.description.replace(/Form ID:\s*[a-f0-9-]{36}/i, "").trim()
                : "No subject description or guidelines provided.";

              return (
                <div key={sub.id} className="bg-card p-5 rounded-2xl ring-1 ring-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between border-t-4 border-t-primary min-h-[220px] relative overflow-hidden group">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded bg-primary/15 text-primary uppercase">
                        {classNameDisplay} • {divNameDisplay}
                      </span>
                      <span className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded ${sub.enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {sub.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-foreground leading-tight mt-3 group-hover:text-primary transition-colors line-clamp-2">
                      {sub.name}
                    </h3>

                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3 font-medium">
                      {cleanDescription}
                    </p>

                    {formId && (
                      <div className="mt-3 inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        📋 Questionnaire Attached
                      </div>
                    )}

                    {/* Teacher Info */}
                    <div className="mt-4 pt-3 border-t border-border/50 space-y-2 text-xs font-semibold text-muted-foreground">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="h-3.5 w-3.5 text-muted-foreground/75" />
                        Subject Teacher: <strong className="text-foreground">{teacherName}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" /> Compulsory: {sub.is_compulsory ? "Yes" : "No"}
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
        /* FORMS TAB */
        compiledForms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/60 animate-bounce" />
            <h3 className="mt-4 text-lg font-bold text-foreground">No questionnaire forms found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              There are no questionnaire forms created or attached yet. Click "Create Form" above to start.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {compiledForms.map((item) => (
              <div key={item.formId} className="bg-card p-5 rounded-2xl ring-1 ring-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between border-t-4 border-t-primary min-h-[190px] relative overflow-hidden group">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded bg-primary/15 text-primary uppercase flex items-center gap-1">
                      <ClipboardList className="h-3.5 w-3.5" /> {item.attachedToType === "Template" ? "Template Form" : "Attached Form"}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${item.attachedToType === "Template" ? "text-primary" : "text-muted-foreground"}`}>
                      {item.attachedToType}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-foreground leading-tight mt-3 group-hover:text-primary transition-colors line-clamp-1">
                    {item.attachedToType === "Template" ? item.attachedToName : `Form for ${item.attachedToName}`}
                  </h3>


                  <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground font-semibold">
                    {item.attachedToType === "Template" ? (
                      <span className="italic text-primary/80">Available as a reusable questionnaire template</span>
                    ) : (
                      <span>Attached to {item.attachedToType}: <strong className="text-foreground">{item.attachedToName}</strong></span>
                    )}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewFormQuestions(item.formId)}
                    className="rounded-lg h-8 cursor-pointer flex items-center gap-1.5 text-xs font-bold px-3 hover:bg-primary hover:text-primary-foreground border-primary text-primary transition-all duration-200"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Questions
                  </Button>
                </div>
              </div>
            ))}
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

                {/* Questionnaire Setup selection */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Label className="text-xs font-black uppercase tracking-wider text-primary">Questionnaire Configuration</Label>
                  <Select value={classQuestionnaireType} onValueChange={(val: any) => setClassQuestionnaireType(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No Questionnaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Questionnaire</SelectItem>
                      <SelectItem value="existing">Link Reusable Template Form</SelectItem>
                      <SelectItem value="new">Create Brand New Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Link Reusable Form */}
                {classQuestionnaireType === "existing" && (
                  <div className="space-y-1.5 p-3 bg-secondary/15 rounded-xl border border-border">
                    <Label htmlFor="class-existing-form">Choose Questionnaire Form Template</Label>
                    {compiledForms.length === 0 ? (
                      <p className="text-[10px] text-destructive font-semibold">No template forms found. Go to the "Forms" tab to build a reusable questionnaire template.</p>
                    ) : (
                      <Select value={classSelectedFormId} onValueChange={setClassSelectedFormId}>
                        <SelectTrigger id="class-existing-form" className="w-full bg-background">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {compiledForms.map((item) => (
                            <SelectItem key={item.formId} value={item.formId}>
                              {item.attachedToName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* Create brand new questions */}
                {classQuestionnaireType === "new" && (
                  <div className="space-y-4 pt-2 border-t border-border/50">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-black uppercase tracking-wider text-primary">
                        Survey Questions
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setClassQuestions([...classQuestions, { text: "", isRequired: false }])}
                        className="rounded-lg h-7 cursor-pointer flex items-center gap-1 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Question
                      </Button>
                    </div>

                    {classQuestions.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground italic text-center py-2 bg-secondary/10 rounded-lg border border-dashed border-border">
                        No questions added yet. Click "Add Question" above.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {classQuestions.map((q, idx) => (
                          <div key={idx} className="p-3 bg-secondary/20 border border-border rounded-xl space-y-2 relative">
                            <button
                              type="button"
                              onClick={() => setClassQuestions(classQuestions.filter((_, i) => i !== idx))}
                              className="absolute right-2 top-2 text-destructive hover:bg-destructive/10 p-1 rounded-md cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <div className="space-y-1">
                              <Label className="text-[11px] font-bold">Question {idx + 1}</Label>
                              <Textarea
                                value={q.text}
                                onChange={(e) => {
                                  const next = [...classQuestions];
                                  next[idx].text = e.target.value;
                                  setClassQuestions(next);
                                }}
                                placeholder="e.g. Rate your understanding of Node.js"
                                rows={2}
                                className="text-xs resize-none"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`class-q-required-${idx}`}
                                checked={q.isRequired}
                                onChange={(e) => {
                                  const next = [...classQuestions];
                                  next[idx].isRequired = e.target.checked;
                                  setClassQuestions(next);
                                }}
                                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                              />
                              <Label htmlFor={`class-q-required-${idx}`} className="cursor-pointer font-bold text-[10px]">
                                Required
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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

                {/* Questionnaire Setup selection */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Label className="text-xs font-black uppercase tracking-wider text-primary">Questionnaire Configuration</Label>
                  <Select value={divQuestionnaireType} onValueChange={(val: any) => setDivQuestionnaireType(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No Questionnaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Questionnaire</SelectItem>
                      <SelectItem value="existing">Link Reusable Template Form</SelectItem>
                      <SelectItem value="new">Create Brand New Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Link Reusable Form */}
                {divQuestionnaireType === "existing" && (
                  <div className="space-y-1.5 p-3 bg-secondary/15 rounded-xl border border-border">
                    <Label htmlFor="div-existing-form">Choose Questionnaire Form Template</Label>
                    {compiledForms.length === 0 ? (
                      <p className="text-[10px] text-destructive font-semibold">No template forms found. Go to the "Forms" tab to build a reusable questionnaire template.</p>
                    ) : (
                      <Select value={divSelectedFormId} onValueChange={setDivSelectedFormId}>
                        <SelectTrigger id="div-existing-form" className="w-full bg-background">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {compiledForms.map((item) => (
                            <SelectItem key={item.formId} value={item.formId}>
                              {item.attachedToName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* Create brand new questions */}
                {divQuestionnaireType === "new" && (
                  <div className="space-y-4 pt-2 border-t border-border/50">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-black uppercase tracking-wider text-primary">
                        Survey Questions
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setDivQuestions([...divQuestions, { text: "", isRequired: false }])}
                        className="rounded-lg h-7 cursor-pointer flex items-center gap-1 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Question
                      </Button>
                    </div>

                    {divQuestions.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground italic text-center py-2 bg-secondary/10 rounded-lg border border-dashed border-border">
                        No questions added yet. Click "Add Question" above.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {divQuestions.map((q, idx) => (
                          <div key={idx} className="p-3 bg-secondary/20 border border-border rounded-xl space-y-2 relative">
                            <button
                              type="button"
                              onClick={() => setDivQuestions(divQuestions.filter((_, i) => i !== idx))}
                              className="absolute right-2 top-2 text-destructive hover:bg-destructive/10 p-1 rounded-md cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <div className="space-y-1">
                              <Label className="text-[11px] font-bold">Question {idx + 1}</Label>
                              <Textarea
                                value={q.text}
                                onChange={(e) => {
                                  const next = [...divQuestions];
                                  next[idx].text = e.target.value;
                                  setDivQuestions(next);
                                }}
                                placeholder="e.g. Rate your satisfaction with division schedule"
                                rows={2}
                                className="text-xs resize-none"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`div-q-required-${idx}`}
                                checked={q.isRequired}
                                onChange={(e) => {
                                  const next = [...divQuestions];
                                  next[idx].isRequired = e.target.checked;
                                  setDivQuestions(next);
                                }}
                                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                              />
                              <Label htmlFor={`div-q-required-${idx}`} className="cursor-pointer font-bold text-[10px]">
                                Required
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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

      {/* Sidebar Subject Form Panel */}
      {isSubjectFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsSubjectFormOpen(false)} />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md transform bg-card shadow-2xl transition-transform duration-300 ease-in-out border-l border-border flex flex-col h-full">

              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/20">
                <h2 className="text-lg font-black text-foreground">
                  ✨ Create Subject
                </h2>
                <button
                  onClick={() => setIsSubjectFormOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sidebar Body */}
              <form onSubmit={handleSubjectSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="space-y-1.5">
                  <Label htmlFor="sub-name">Subject Name</Label>
                  <Input
                    id="sub-name"
                    required
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. Nodejs, Advanced Maths"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sub-class">Select Classroom</Label>
                  <Select value={subjectClassId} onValueChange={setSubjectClassId}>
                    <SelectTrigger id="sub-class" className="w-full">
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
                  <Label htmlFor="sub-div">Select Division (Optional)</Label>
                  <Select value={subjectDivisionId} onValueChange={setSubjectDivisionId}>
                    <SelectTrigger id="sub-div" className="w-full">
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none_val">None (General)</SelectItem>
                      {filteredDivisionsForSubject.map((div) => (
                        <SelectItem key={div.id} value={div.id}>
                          Division {div.division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sub-desc">Description</Label>
                  <Textarea
                    id="sub-desc"
                    rows={4}
                    value={subjectDescription}
                    onChange={(e) => setSubjectDescription(e.target.value)}
                    placeholder="Specify subject syllabus, textbooks, or guidelines..."
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      id="sub-enabled"
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      checked={subjectIsEnabled}
                      onChange={(e) => setSubjectIsEnabled(e.target.checked)}
                    />
                    <Label htmlFor="sub-enabled" className="cursor-pointer font-bold text-xs">Enabled</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="sub-compulsory"
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      checked={subjectIsCompulsory}
                      onChange={(e) => setSubjectIsCompulsory(e.target.checked)}
                    />
                    <Label htmlFor="sub-compulsory" className="cursor-pointer font-bold text-xs">Compulsory Subject</Label>
                  </div>
                </div>

                {/* Questionnaire Setup selection */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Label className="text-xs font-black uppercase tracking-wider text-primary">Questionnaire Configuration</Label>
                  <Select value={subQuestionnaireType} onValueChange={(val: any) => setSubQuestionnaireType(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No Questionnaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Questionnaire</SelectItem>
                      <SelectItem value="existing">Link Reusable Template Form</SelectItem>
                      <SelectItem value="new">Create Brand New Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Link Reusable Form */}
                {subQuestionnaireType === "existing" && (
                  <div className="space-y-1.5 p-3 bg-secondary/15 rounded-xl border border-border">
                    <Label htmlFor="sub-existing-form">Choose Questionnaire Form Template</Label>
                    {compiledForms.length === 0 ? (
                      <p className="text-[10px] text-destructive font-semibold">No template forms found. Go to the "Forms" tab to build a reusable questionnaire template.</p>
                    ) : (
                      <Select value={subSelectedFormId} onValueChange={setSubSelectedFormId}>
                        <SelectTrigger id="sub-existing-form" className="w-full bg-background">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {compiledForms.map((item) => (
                            <SelectItem key={item.formId} value={item.formId}>
                              {item.attachedToName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* Create brand new questions */}
                {subQuestionnaireType === "new" && (
                  <div className="space-y-4 pt-2 border-t border-border/50">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-black uppercase tracking-wider text-primary">
                        Survey Questions
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setSubQuestions([...subQuestions, { text: "", isRequired: false }])}
                        className="rounded-lg h-7 cursor-pointer flex items-center gap-1 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Question
                      </Button>
                    </div>

                    {subQuestions.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground italic text-center py-2 bg-secondary/10 rounded-lg border border-dashed border-border">
                        No questions added yet. Click "Add Question" above.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {subQuestions.map((q, idx) => (
                          <div key={idx} className="p-3 bg-secondary/20 border border-border rounded-xl space-y-2 relative">
                            <button
                              type="button"
                              onClick={() => setSubQuestions(subQuestions.filter((_, i) => i !== idx))}
                              className="absolute right-2 top-2 text-destructive hover:bg-destructive/10 p-1 rounded-md cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <div className="space-y-1">
                              <Label className="text-[11px] font-bold">Question {idx + 1}</Label>
                              <Textarea
                                value={q.text}
                                onChange={(e) => {
                                  const next = [...subQuestions];
                                  next[idx].text = e.target.value;
                                  setSubQuestions(next);
                                }}
                                placeholder="e.g. Rate your understanding of this subject"
                                rows={2}
                                className="text-xs resize-none"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`sub-q-required-${idx}`}
                                checked={q.isRequired}
                                onChange={(e) => {
                                  const next = [...subQuestions];
                                  next[idx].isRequired = e.target.checked;
                                  setSubQuestions(next);
                                }}
                                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                              />
                              <Label htmlFor={`sub-q-required-${idx}`} className="cursor-pointer font-bold text-[10px]">
                                Required
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Container */}
                <div className="pt-4 border-t border-border flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsSubjectFormOpen(false)} className="flex-1 rounded-xl cursor-pointer font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 rounded-xl cursor-pointer font-bold">
                    Create Subject
                  </Button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Sidebar Standalone Form Creation Panel */}
      {isFormCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsFormCreateOpen(false)} />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md transform bg-card shadow-2xl transition-transform duration-300 ease-in-out border-l border-border flex flex-col h-full">

              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/20">
                <h2 className="text-lg font-black text-foreground flex items-center gap-1.5">
                  <ClipboardList className="h-5 w-5 text-primary" /> Create Survey Template
                </h2>
                <button
                  onClick={() => setIsFormCreateOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sidebar Body */}
              <form onSubmit={handleCreateFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="space-y-1.5">
                  <Label htmlFor="form-title">Survey Form Title</Label>
                  <Input
                    id="form-title"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Course Feedback Survey"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="form-desc">Form Description</Label>
                  <Textarea
                    id="form-desc"
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Specify the survey intent or instructions for respondents..."
                  />
                </div>

                <div className="space-y-4 pt-3 border-t border-border/50">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-black uppercase tracking-wider text-primary">
                      Questionnaire Questions
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setFormQuestions([...formQuestions, { text: "", isRequired: false }])}
                      className="rounded-lg h-7 cursor-pointer flex items-center gap-1 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Question
                    </Button>
                  </div>

                  {formQuestions.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground italic text-center py-4 bg-secondary/10 rounded-lg border border-dashed border-border">
                      No questions added yet. Click "Add Question" above to build your survey questionnaire.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {formQuestions.map((q, idx) => (
                        <div key={idx} className="p-3 bg-secondary/20 border border-border rounded-xl space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => setFormQuestions(formQuestions.filter((_, i) => i !== idx))}
                            className="absolute right-2 top-2 text-destructive hover:bg-destructive/10 p-1 rounded-md cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-bold">Question {idx + 1}</Label>
                            <Textarea
                              value={q.text}
                              onChange={(e) => {
                                const next = [...formQuestions];
                                next[idx].text = e.target.value;
                                setFormQuestions(next);
                              }}
                              placeholder="e.g. Please rate the clarity of course material."
                              rows={2}
                              className="text-xs resize-none"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`standalone-q-required-${idx}`}
                              checked={q.isRequired}
                              onChange={(e) => {
                                const next = [...formQuestions];
                                next[idx].isRequired = e.target.checked;
                                setFormQuestions(next);
                              }}
                              className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                            />
                            <Label htmlFor={`standalone-q-required-${idx}`} className="cursor-pointer font-bold text-[10px]">
                              Required Question
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Container */}
                <div className="pt-4 border-t border-border flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsFormCreateOpen(false)} className="flex-1 rounded-xl cursor-pointer font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 rounded-xl cursor-pointer font-bold">
                    Create Template
                  </Button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Sidebar Questionnaire Questions View Panel */}
      {isViewFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsViewFormOpen(false)} />

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md transform bg-card shadow-2xl transition-transform duration-300 ease-in-out border-l border-border flex flex-col h-full">

              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/20">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-black text-foreground flex items-center gap-1.5">
                    <ClipboardList className="h-5 w-5 text-primary" /> Survey Details
                  </h2>
                </div>
                <button
                  onClick={() => setIsViewFormOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sidebar Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {loadingFormDetails ? (
                  <div className="flex h-64 flex-col items-center justify-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-xs font-bold text-muted-foreground">Loading questions...</span>
                  </div>
                ) : previewForm ? (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-foreground">
                        {previewForm.title || "Survey Questions Form"}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        {previewForm.description || "No description provided."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/60 space-y-4">
                      <Label className="text-xs font-black uppercase tracking-wider text-primary">
                        Survey Questions ({previewForm.questions?.length || 0})
                      </Label>

                      {!previewForm.questions || previewForm.questions.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic text-center py-4 bg-secondary/10 rounded-lg border border-dashed border-border">
                          No questions found in this form.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {previewForm.questions.map((q: any, idx: number) => (
                            <div key={q.question_id || idx} className="p-3.5 bg-secondary/25 border border-border rounded-xl space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                  Question {q.question_order || idx + 1}
                                </span>
                                {q.is_required && (
                                  <span className="text-[8px] font-extrabold bg-destructive/10 text-destructive px-1.5 py-0.5 rounded uppercase">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-black text-foreground">
                                {q.question_text}
                              </p>
                              <div className="pt-1.5 flex items-center gap-1 text-[9px] font-bold text-muted-foreground/90">
                                <span className="px-1.5 py-0.5 bg-border rounded-md font-mono">
                                  {q.question_type?.type_name || "short_answer"}
                                </span>
                                <span>•</span>
                                <span>{q.question_type?.description || "single line text input"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-sm font-semibold text-destructive">Failed to display form details.</p>
                    <Button size="sm" variant="outline" onClick={() => handleViewFormQuestions(selectedFormId || "")}>
                      Retry
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-border bg-secondary/10">
                <Button type="button" onClick={() => setIsViewFormOpen(false)} className="w-full rounded-xl cursor-pointer font-bold">
                  Close Preview
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
