import React from "react";
import { Link, Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentList from "./pages/admin/students/StudentList";
import StudentForm from "./pages/admin/students/StudentForm";
import StudentDetail from "./pages/admin/students/StudentDetail";
import StudentImport from "./pages/admin/students/StudentImport";
import StudentDashboard from "./pages/student/StudentDashboard";
import SubjectList from "./pages/subjects/SubjectList";
import SubjectForm from "./pages/subjects/SubjectForm";
import SubjectDetail from "./pages/subjects/SubjectDetail";
import AdminRoute from "./routes/AdminRoute";
import PrivateRoute from "./routes/PrivateRoute";
import StudentRoute from "./routes/StudentRoute";
import { useAuth } from "./context/AuthContext";

const adminMenu = [
  { label: "Dashboard", to: "/admin" },
  { label: "Quản lý sinh viên", to: "/admin/students" },
  { label: "Quản lý môn học", to: "/subjects" },
  { label: "Quản lý bài học", to: "/admin/lessons" },
  { label: "Quản lý quiz", to: "/admin/quizzes" },
  { label: "Thống kê", to: "/admin/statistics" },
];

const studentMenu = [
  { label: "Trang cá nhân", to: "/dashboard" },
  { label: "Môn học của tôi", to: "/subjects" },
  { label: "Lộ trình học", to: "/roadmap" },
  { label: "Nhiệm vụ học tập", to: "/tasks" },
  { label: "Ghi chú", to: "/notes" },
  { label: "AI Assistant", to: "/assistant" },
  { label: "Tiến độ học tập", to: "/progress" },
];

function Sidebar({ user, onLogout }) {
  const menu = user?.role === "admin" ? adminMenu : studentMenu;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950 lg:flex lg:flex-col">
      <div className="border-b border-slate-200 px-5 py-5 dark:border-white/10">
        <Link to={user?.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-600 text-lg font-extrabold text-white">
            S
          </span>
          <span>
            <span className="block text-base font-extrabold text-slate-950 dark:text-white">
              StudyMate AI
            </span>
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              {user?.role === "admin" ? "Admin Workspace" : "Student Workspace"}
            </span>
          </span>
        </Link>
      </div>

      <div className="px-5 py-4">
        <p className="text-xs font-bold uppercase text-slate-400">Tài khoản</p>
        <p className="mt-2 truncate text-sm font-extrabold text-slate-800 dark:text-slate-100">
          {user?.full_name}
        </p>
        <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
          {user?.email}
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex rounded-lg px-3 py-3 text-sm font-bold transition",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-white/10",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-white/10">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-lg border border-rose-200 px-3 py-3 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

function MobileNav({ user, onLogout }) {
  const menu = user?.role === "admin" ? adminMenu : studentMenu;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/95 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link
          to={user?.role === "admin" ? "/admin" : "/dashboard"}
          className="text-base font-extrabold text-slate-950 dark:text-white"
        >
          StudyMate AI
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-600"
        >
          Đăng xuất
        </button>
      </div>
      <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex-none rounded-lg px-3 py-2 text-sm font-bold",
                isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
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
      <div className="min-h-screen bg-slate-50 text-slate-950 antialiased dark:bg-slate-950 dark:text-white">
        <Sidebar user={user} onLogout={handleLogout} />
        <MobileNav user={user} onLogout={handleLogout} />
        <div className="min-h-screen w-full lg:pl-72">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 antialiased dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
          <a href={`${basePath}/`} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-base font-extrabold text-white">
              S
            </span>
            <span>
              <span className="block text-base font-extrabold">StudyMate AI</span>
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                Personal Learning
              </span>
            </span>
          </a>

          <nav className="flex items-center gap-2 text-sm font-bold">
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
            >
              Đăng ký
            </Link>
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
      <section className="max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
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
    <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-sm font-extrabold uppercase text-blue-600 dark:text-blue-300">
          StudyMate AI
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
          {title}
        </h1>
        <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={backTo}
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-white/10 dark:text-slate-200"
          >
            Quay lại dashboard
          </Link>
          <Link
            to="/subjects"
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            Mở môn học
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <Navigate to="/admin/students" replace />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <AdminRoute>
              <StudentList />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students/create"
          element={
            <AdminRoute>
              <StudentForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students/import"
          element={
            <AdminRoute>
              <StudentImport />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students/:id"
          element={
            <AdminRoute>
              <StudentDetail />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students/:id/edit"
          element={
            <AdminRoute>
              <StudentForm />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/lessons"
          element={
            <AdminRoute>
              <ModulePlaceholder
                title="Quản lý bài học"
                description="Khu vực này sẽ dùng để quản lý bài học theo từng môn học."
                backTo="/admin"
              />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/quizzes"
          element={
            <AdminRoute>
              <ModulePlaceholder
                title="Quản lý quiz"
                description="Khu vực này sẽ dùng để quản lý câu hỏi, đề quiz và kết quả kiểm tra."
                backTo="/admin"
              />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/statistics"
          element={
            <AdminRoute>
              <ModulePlaceholder
                title="Thống kê hệ thống"
                description="Khu vực này sẽ tổng hợp dữ liệu người dùng, môn học và hoạt động học tập."
                backTo="/admin"
              />
            </AdminRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          }
        />
        <Route
          path="/roadmap"
          element={
            <StudentRoute>
              <ModulePlaceholder
                title="Lộ trình học"
                description="Khu vực này sẽ hiển thị kế hoạch học tập theo tuần, theo môn và theo mục tiêu cá nhân."
              />
            </StudentRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <StudentRoute>
              <ModulePlaceholder
                title="Nhiệm vụ học tập"
                description="Khu vực này sẽ quản lý task, deadline và nhắc nhở học tập."
              />
            </StudentRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <StudentRoute>
              <ModulePlaceholder
                title="Ghi chú"
                description="Khu vực này sẽ lưu ghi chú theo môn học và bài học."
              />
            </StudentRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <StudentRoute>
              <ModulePlaceholder
                title="AI Assistant"
                description="Khu vực này sẽ kết nối trợ lý AI để hỏi đáp, tóm tắt và gợi ý ôn tập."
              />
            </StudentRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <StudentRoute>
              <ModulePlaceholder
                title="Tiến độ học tập"
                description="Khu vực này sẽ hiển thị tiến độ, thời lượng học và các mục tiêu đã hoàn thành."
              />
            </StudentRoute>
          }
        />

        <Route
          path="/subjects"
          element={
            <PrivateRoute>
              <SubjectList />
            </PrivateRoute>
          }
        />
        <Route
          path="/subjects/create"
          element={
            <PrivateRoute>
              <SubjectForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/subjects/:id"
          element={
            <PrivateRoute>
              <SubjectDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/subjects/:id/edit"
          element={
            <PrivateRoute>
              <SubjectForm />
            </PrivateRoute>
          }
        />

        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AppLayout>
  );
}
