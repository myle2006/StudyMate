import React from "react";
import { Link, Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { BarChart3, BookOpen, CalendarDays, ClipboardList, Home, LogOut, MessageCircle, Route as RouteIcon, Sparkles, Target, Users } from "lucide-react";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentList from "./pages/admin/students/StudentList";
import StudentForm from "./pages/admin/students/StudentForm";
import StudentDetail from "./pages/admin/students/StudentDetail";
import StudentImport from "./pages/admin/students/StudentImport";
import StudentDashboard from "./pages/student/StudentDashboard";
import SubjectListPage from "./modules/subjects/pages/SubjectListPage";
import SubjectCreatePage from "./modules/subjects/pages/SubjectCreatePage";
import SubjectEditPage from "./modules/subjects/pages/SubjectEditPage";
import SubjectDetailPage from "./modules/subjects/pages/SubjectDetailPage";
import AdminSubjectStudentsPage from "./modules/studentSubjects/pages/AdminSubjectStudentsPage";
import MySubjectsPage from "./modules/studentSubjects/pages/MySubjectsPage";
import MySubjectDetailPage from "./modules/studentSubjects/pages/MySubjectDetailPage";
import AdminAssignmentListPage from "./modules/assignments/pages/AdminAssignmentListPage";
import AdminAssignmentCreatePage from "./modules/assignments/pages/AdminAssignmentCreatePage";
import AdminAssignmentEditPage from "./modules/assignments/pages/AdminAssignmentEditPage";
import AdminAssignmentDetailPage from "./modules/assignments/pages/AdminAssignmentDetailPage";
import AdminAssignmentSubmissionsPage from "./modules/assignments/pages/AdminAssignmentSubmissionsPage";
import AdminSubmissionDetailPage from "./modules/assignments/pages/AdminSubmissionDetailPage";
import StudentAssignmentListPage from "./modules/assignments/pages/StudentAssignmentListPage";
import StudentAssignmentDetailPage from "./modules/assignments/pages/StudentAssignmentDetailPage";
import StudentSubmissionFormPage from "./modules/assignments/pages/StudentSubmissionFormPage";
import StudentSubmissionDetailPage from "./modules/assignments/pages/StudentSubmissionDetailPage";
import StudentGradesPage from "./modules/assignments/pages/StudentGradesPage";
import StudentGradeDetailPage from "./modules/assignments/pages/StudentGradeDetailPage";
import LearningGoalListPage from "./modules/learningGoals/pages/LearningGoalListPage";
import LearningGoalCreatePage from "./modules/learningGoals/pages/LearningGoalCreatePage";
import LearningGoalEditPage from "./modules/learningGoals/pages/LearningGoalEditPage";
import LearningGoalDetailPage from "./modules/learningGoals/pages/LearningGoalDetailPage";
import RoadmapGeneratePage from "./modules/learningRoadmaps/pages/RoadmapGeneratePage";
import RoadmapPreviewPage from "./modules/learningRoadmaps/pages/RoadmapPreviewPage";
import RoadmapListPage from "./modules/learningRoadmaps/pages/RoadmapListPage";
import RoadmapDetailPage from "./modules/learningRoadmaps/pages/RoadmapDetailPage";
import RoadmapEditPage from "./modules/learningRoadmaps/pages/RoadmapEditPage";
import StudyScheduleCalendarPage from "./modules/studySchedules/pages/StudyScheduleCalendarPage";
import StudyScheduleCreatePage from "./modules/studySchedules/pages/StudyScheduleCreatePage";
import StudyScheduleEditPage from "./modules/studySchedules/pages/StudyScheduleEditPage";
import StudyScheduleDetailPage from "./modules/studySchedules/pages/StudyScheduleDetailPage";
import AdminRoute from "./routes/AdminRoute";
import StudentRoute from "./routes/StudentRoute";
import { useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/ui";

const adminMenu = [
  { label: "Dashboard", to: "/admin", icon: Home },
  { label: "Sinh viên", to: "/admin/students", icon: Users },
  { label: "Môn học", to: "/admin/subjects", icon: BookOpen },
  { label: "Bài tập", to: "/admin/assignments", icon: ClipboardList },
  { label: "Bài học", to: "/admin/lessons", icon: ClipboardList },
  { label: "Quiz", to: "/admin/quizzes", icon: Sparkles },
  { label: "Thống kê", to: "/admin/statistics", icon: BarChart3 },
];

const studentMenu = [
  { label: "Trang cá nhân", to: "/dashboard", icon: Home },
  { label: "Môn học của tôi", to: "/student/my-subjects", icon: BookOpen },
  { label: "Bài tập", to: "/student/assignments", icon: ClipboardList },
  { label: "Điểm & Feedback", to: "/student/grades", icon: BarChart3 },
  { label: "Mục tiêu học tập", to: "/student/learning-goals", icon: Target },
  { label: "Lịch học", to: "/student/schedules", icon: CalendarDays },
  { label: "Lộ trình học", to: "/student/roadmaps", icon: RouteIcon },
  { label: "Nhiệm vụ", to: "/tasks", icon: ClipboardList },
  { label: "Ghi chú", to: "/notes", icon: MessageCircle },
  { label: "AI Assistant", to: "/assistant", icon: Sparkles },
  { label: "Tiến độ", to: "/progress", icon: BarChart3 },
];

function BrandLogo({ compact = false, subtitle = "StudyMate AI" }) {
  return (
    <>
      <span
        className="grid h-9 w-11 shrink-0 place-items-center rounded-lg bg-white"
      >
        <span className="text-lg font-black leading-none tracking-normal text-[#444496]">PLT</span>
      </span>
      {!compact && (
        <span>
          <span className="block text-base font-extrabold leading-5 text-slate-950">PLT Solutions</span>
          <span className="block text-xs font-semibold leading-5 text-slate-500">{subtitle}</span>
        </span>
      )}
    </>
  );
}

function Sidebar({ user, onLogout }) {
  const menu = user?.role === "admin" ? adminMenu : studentMenu;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-slate-200/80 bg-white/95 backdrop-blur lg:flex lg:flex-col">
      <div className="border-b border-slate-200/80 px-5 py-5">
        <Link to={user?.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-3">
          <BrandLogo subtitle={user?.role === "admin" ? "Trang quản trị" : "Không gian học tập"} />
        </Link>
      </div>

      <div className="mx-3 mt-3 rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-4">
        <p className="text-xs font-bold uppercase text-slate-400">Tài khoản</p>
        <p className="mt-2 truncate text-sm font-extrabold text-slate-800">{user?.full_name}</p>
        <p className="truncate text-xs font-semibold text-slate-500">{user?.email}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin" || item.to === "/dashboard"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-blue-700",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/80 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-rose-200 bg-white px-3 py-3 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

function MobileNav({ user, onLogout }) {
  const menu = user?.role === "admin" ? adminMenu : studentMenu;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link to={user?.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-2">
          <BrandLogo compact />
          <span className="text-sm font-extrabold text-slate-950">StudyMate AI</span>
        </Link>
        <button type="button" onClick={onLogout} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-600">
          Đăng xuất
        </button>
      </div>
      <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin" || item.to === "/dashboard"}
              className={({ isActive }) =>
                [
                  "flex flex-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold",
                  isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}

function AppLayout({ children }) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const basePath = window.STUDYMATE_BASE_PATH || "";

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 antialiased">
        <Sidebar user={user} onLogout={handleLogout} />
        <MobileNav user={user} onLogout={handleLogout} />
        <div className="min-h-screen w-full lg:pl-72">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 antialiased">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
          <a href={`${basePath}/`} className="flex items-center gap-3">
            <BrandLogo />
          </a>
          <nav className="flex items-center gap-2 text-sm font-bold">
            <Link to="/login" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">Đăng nhập</Link>
            <Link to="/register" className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Đăng ký</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

function Forbidden() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-5">
      <section className="max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-extrabold uppercase text-rose-600">403</p>
        <h1 className="mt-2 text-2xl font-extrabold">Bạn không có quyền truy cập</h1>
        <Link to="/login" className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white">
          Quay lại đăng nhập
        </Link>
      </section>
    </main>
  );
}

function ModulePlaceholder({ title, description, backTo = "/dashboard" }) {
  return (
    <main className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-extrabold uppercase text-blue-600">StudyMate AI</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950">{title}</h1>
        <p className="mt-3 leading-7 text-slate-600">{description}</p>
        <Link to={backTo} className="mt-6 inline-flex rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600">
          Quay lại dashboard
        </Link>
      </section>
    </main>
  );
}

function SubjectLegacyRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === "admin" ? "/admin/subjects" : "/student/subjects"} replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AppLayout>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><Navigate to="/admin/students" replace /></AdminRoute>} />
        <Route path="/admin/students" element={<AdminRoute><StudentList /></AdminRoute>} />
        <Route path="/admin/students/create" element={<AdminRoute><StudentForm /></AdminRoute>} />
        <Route path="/admin/students/import" element={<AdminRoute><StudentImport /></AdminRoute>} />
        <Route path="/admin/students/:id" element={<AdminRoute><StudentDetail /></AdminRoute>} />
        <Route path="/admin/students/:id/edit" element={<AdminRoute><StudentForm /></AdminRoute>} />
        <Route path="/admin/subjects" element={<AdminRoute><SubjectListPage /></AdminRoute>} />
        <Route path="/admin/subjects/create" element={<AdminRoute><SubjectCreatePage /></AdminRoute>} />
        <Route path="/admin/subjects/:id" element={<AdminRoute><SubjectDetailPage /></AdminRoute>} />
        <Route path="/admin/subjects/:id/edit" element={<AdminRoute><SubjectEditPage /></AdminRoute>} />
        <Route path="/admin/subjects/:subjectId/students" element={<AdminRoute><AdminSubjectStudentsPage /></AdminRoute>} />
        <Route path="/admin/assignments" element={<AdminRoute><AdminAssignmentListPage /></AdminRoute>} />
        <Route path="/admin/assignments/create" element={<AdminRoute><AdminAssignmentCreatePage /></AdminRoute>} />
        <Route path="/admin/assignments/:id" element={<AdminRoute><AdminAssignmentDetailPage /></AdminRoute>} />
        <Route path="/admin/assignments/:id/edit" element={<AdminRoute><AdminAssignmentEditPage /></AdminRoute>} />
        <Route path="/admin/assignments/:assignmentId/submissions" element={<AdminRoute><AdminAssignmentSubmissionsPage /></AdminRoute>} />
        <Route path="/admin/submissions/:id" element={<AdminRoute><AdminSubmissionDetailPage /></AdminRoute>} />
        <Route path="/admin/lessons" element={<AdminRoute><ModulePlaceholder title="Quản lý bài học" description="Khu vực này sẽ dùng để quản lý bài học theo từng môn học." backTo="/admin" /></AdminRoute>} />
        <Route path="/admin/quizzes" element={<AdminRoute><ModulePlaceholder title="Quản lý quiz" description="Khu vực này sẽ dùng để quản lý câu hỏi, đề quiz và kết quả kiểm tra." backTo="/admin" /></AdminRoute>} />
        <Route path="/admin/statistics" element={<AdminRoute><ModulePlaceholder title="Thống kê hệ thống" description="Khu vực này sẽ tổng hợp dữ liệu người dùng, môn học và hoạt động học tập." backTo="/admin" /></AdminRoute>} />

        <Route path="/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="/student/my-subjects" element={<StudentRoute><MySubjectsPage /></StudentRoute>} />
        <Route path="/student/my-subjects/:subjectId" element={<StudentRoute><MySubjectDetailPage /></StudentRoute>} />
        <Route path="/student/subjects" element={<StudentRoute><Navigate to="/student/my-subjects" replace /></StudentRoute>} />
        <Route path="/student/subjects/:id" element={<StudentRoute><Navigate to="/student/my-subjects" replace /></StudentRoute>} />
        <Route path="/student/assignments" element={<StudentRoute><StudentAssignmentListPage /></StudentRoute>} />
        <Route path="/student/assignments/:id" element={<StudentRoute><StudentAssignmentDetailPage /></StudentRoute>} />
        <Route path="/student/assignments/:assignmentId/submit" element={<StudentRoute><StudentSubmissionFormPage /></StudentRoute>} />
        <Route path="/student/submissions/:id" element={<StudentRoute><StudentSubmissionDetailPage /></StudentRoute>} />
        <Route path="/student/grades" element={<StudentRoute><StudentGradesPage /></StudentRoute>} />
        <Route path="/student/grades/:submissionId" element={<StudentRoute><StudentGradeDetailPage /></StudentRoute>} />
        <Route path="/student/learning-goals" element={<StudentRoute><LearningGoalListPage /></StudentRoute>} />
        <Route path="/student/learning-goals/create" element={<StudentRoute><LearningGoalCreatePage /></StudentRoute>} />
        <Route path="/student/learning-goals/:id" element={<StudentRoute><LearningGoalDetailPage /></StudentRoute>} />
        <Route path="/student/learning-goals/:id/edit" element={<StudentRoute><LearningGoalEditPage /></StudentRoute>} />
        <Route path="/student/roadmaps" element={<StudentRoute><RoadmapListPage /></StudentRoute>} />
        <Route path="/student/roadmaps/generate" element={<StudentRoute><RoadmapGeneratePage /></StudentRoute>} />
        <Route path="/student/roadmaps/preview" element={<StudentRoute><RoadmapPreviewPage /></StudentRoute>} />
        <Route path="/student/roadmaps/:id" element={<StudentRoute><RoadmapDetailPage /></StudentRoute>} />
        <Route path="/student/roadmaps/:id/edit" element={<StudentRoute><RoadmapEditPage /></StudentRoute>} />
        <Route path="/student/schedules" element={<StudentRoute><StudyScheduleCalendarPage /></StudentRoute>} />
        <Route path="/student/schedules/create" element={<StudentRoute><StudyScheduleCreatePage /></StudentRoute>} />
        <Route path="/student/schedules/:id" element={<StudentRoute><StudyScheduleDetailPage /></StudentRoute>} />
        <Route path="/student/schedules/:id/edit" element={<StudentRoute><StudyScheduleEditPage /></StudentRoute>} />
        <Route path="/roadmap" element={<StudentRoute><Navigate to="/student/roadmaps" replace /></StudentRoute>} />
        <Route path="/tasks" element={<StudentRoute><ModulePlaceholder title="Nhiệm vụ học tập" description="Khu vực này sẽ quản lý task, deadline và nhắc nhở học tập." /></StudentRoute>} />
        <Route path="/notes" element={<StudentRoute><ModulePlaceholder title="Ghi chú" description="Khu vực này sẽ lưu ghi chú theo môn học và bài học." /></StudentRoute>} />
        <Route path="/assistant" element={<StudentRoute><ModulePlaceholder title="AI Assistant" description="Khu vực này sẽ kết nối trợ lý AI để hỏi đáp, tóm tắt và gợi ý ôn tập." /></StudentRoute>} />
        <Route path="/progress" element={<StudentRoute><ModulePlaceholder title="Tiến độ học tập" description="Khu vực này sẽ hiển thị tiến độ, thời lượng học và các mục tiêu đã hoàn thành." /></StudentRoute>} />

        <Route path="/subjects" element={<SubjectLegacyRedirect />} />
        <Route path="/subjects/create" element={<AdminRoute><Navigate to="/admin/subjects/create" replace /></AdminRoute>} />
        <Route path="/subjects/:id" element={<SubjectLegacyRedirect />} />
        <Route path="/subjects/:id/edit" element={<SubjectLegacyRedirect />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppLayout>
    </ToastProvider>
  );
}
