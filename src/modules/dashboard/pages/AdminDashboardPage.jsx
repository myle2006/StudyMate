import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  Users,
} from "lucide-react";
import { Alert, LoadingState, PageHeader } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import AdminStatCard from "../components/AdminStatCard";
import RecentStudents from "../components/RecentStudents";
import DeadlineList from "../components/DeadlineList";
import SystemSummary from "../components/SystemSummary";
import { getAdminDashboard } from "../services/dashboardService";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminDashboard();
      setDashboard(response.data || {});
    } catch (err) {
      setError(err.message || "Không thể tải dashboard admin.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const summary = dashboard?.summary || {};

    return [
      {
        title: "Tổng sinh viên",
        value: summary.student_count,
        helper: "Tài khoản role student",
        icon: Users,
        tone: "blue",
      },
      {
        title: "Tổng môn học",
        value: summary.subject_count,
        helper: "Môn học chưa xóa",
        icon: BookOpen,
        tone: "emerald",
      },
      {
        title: "Tổng bài tập",
        value: summary.assignment_count,
        helper: "Tất cả bài tập trong hệ thống",
        icon: ClipboardList,
        tone: "violet",
      },
      {
        title: "Tổng bài nộp",
        value: summary.submission_count,
        helper: "Lượt nộp của sinh viên",
        icon: FileText,
        tone: "slate",
      },
      {
        title: "Bài chưa nộp",
        value: summary.missing_submission_count,
        helper: "Theo bài tập đang mở",
        icon: AlertTriangle,
        tone: "rose",
      },
      {
        title: "Bài đã chấm",
        value: summary.graded_submission_count,
        helper: "Submission trạng thái graded",
        icon: CheckCircle2,
        tone: "emerald",
      },
      {
        title: "Deadline sắp tới",
        value: summary.upcoming_deadline_count,
        helper: "Trong 14 ngày tới",
        icon: BarChart3,
        tone: "amber",
      },
    ];
  }, [dashboard]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin Dashboard"
          title="Dashboard quản trị"
          description={`Xin chào ${user?.full_name || "Admin"}. Tổng quan dữ liệu học tập và hoạt động hệ thống.`}
        />

        <Alert tone="error">{error}</Alert>

        {loading ? (
          <LoadingState label="Đang tải dashboard admin..." />
        ) : !dashboard ? (
          <section className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
            Chưa có dữ liệu dashboard.
          </section>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <AdminStatCard key={stat.title} {...stat} />
              ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <DeadlineList deadlines={dashboard.upcoming_deadlines || []} />
              <RecentStudents students={dashboard.recent_students || []} />
            </section>

            <SystemSummary
              topSubjects={dashboard.top_subjects || []}
              activities={dashboard.recent_activity || []}
            />
          </>
        )}
      </div>
    </main>
  );
}
