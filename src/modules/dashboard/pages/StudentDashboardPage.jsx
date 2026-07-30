import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { Alert, LoadingState, PageHeader } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import DashboardStatCard from "../components/DashboardStatCard";
import UpcomingScheduleList from "../components/UpcomingScheduleList";
import UpcomingAssignmentList from "../components/UpcomingAssignmentList";
import RoadmapProgressWidget from "../components/RoadmapProgressWidget";
import { getStudentDashboard } from "../services/dashboardService";

function formatDateTime(value) {
  if (!value) return "Chưa có thời gian";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(String(value).replace(" ", "T")));
}

function LatestGrade({ grade }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-950">Điểm/feedback gần nhất</h2>
        <BarChart3 className="h-5 w-5 text-violet-600" />
      </div>

      {!grade ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
          Chưa có điểm hoặc feedback mới.
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-violet-100 bg-violet-50/50 p-4">
          <p className="text-xs font-extrabold uppercase text-violet-700">
            {grade.subject_code} · {grade.subject_name}
          </p>
          <h3 className="mt-1 text-base font-black text-slate-950">{grade.assignment_title}</h3>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-white px-3 py-2 text-sm font-black text-violet-700 ring-1 ring-violet-100">
              {grade.score !== null && grade.score !== undefined ? `${Number(grade.score).toFixed(2)} điểm` : "Chưa nhập điểm"}
            </span>
            <span className="text-xs font-bold text-slate-500">{formatDateTime(grade.graded_at || grade.submitted_at)}</span>
          </div>
          {grade.feedback && <p className="mt-4 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">{grade.feedback}</p>}
        </div>
      )}
    </section>
  );
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await getStudentDashboard();
      setDashboard(response.data || {});
    } catch (err) {
      setError(err.message || "Không thể tải dashboard sinh viên.");
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
        title: "Môn học được gán",
        value: summary.assigned_subject_count,
        helper: "Tổng số môn đang học",
        icon: BookOpen,
        tone: "blue",
      },
      {
        title: "Lịch học hôm nay",
        value: summary.today_schedule_count,
        helper: "Buổi học trong ngày",
        icon: CalendarDays,
        tone: "emerald",
      },
      {
        title: "Bài sắp hạn",
        value: summary.upcoming_assignment_count,
        helper: "Bài tập còn hạn nộp",
        icon: ClipboardList,
        tone: "amber",
      },
      {
        title: "Bài chưa nộp",
        value: summary.missing_submission_count,
        helper: `${dashboard?.assignment_overview?.overdue_missing_count || 0} bài quá hạn`,
        icon: AlertTriangle,
        tone: "rose",
      },
      {
        title: "Bài đã nộp",
        value: summary.submitted_assignment_count,
        helper: "Bao gồm bài đã chấm",
        icon: CheckCircle2,
        tone: "emerald",
      },
      {
        title: "Tiến độ lộ trình",
        value: `${Number(summary.roadmap_progress_percent || 0).toFixed(0)}%`,
        helper: `${summary.active_roadmap_count || 0} lộ trình đang hoạt động`,
        icon: BarChart3,
        tone: "violet",
      },
    ];
  }, [dashboard]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Student Dashboard"
          title="Trang cá nhân"
          description={`Xin chào ${user?.full_name || "bạn"}. Tổng quan học tập cá nhân của bạn hôm nay.`}
        />

        <Alert tone="error">{error}</Alert>

        {loading ? (
          <LoadingState label="Đang tải dashboard sinh viên..." />
        ) : !dashboard ? (
          <section className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
            Chưa có dữ liệu dashboard.
          </section>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stats.map((stat) => (
                <DashboardStatCard key={stat.title} {...stat} />
              ))}
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <UpcomingScheduleList
                title="Lịch học hôm nay"
                schedules={dashboard.today_schedules || []}
                emptyText="Hôm nay chưa có lịch học."
                showDate={false}
              />
              <UpcomingScheduleList
                title="Lịch học sắp tới"
                schedules={dashboard.upcoming_schedules || []}
                emptyText="Chưa có lịch học sắp tới trong 14 ngày."
              />
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <UpcomingAssignmentList assignments={dashboard.upcoming_assignments || []} />
              <LatestGrade grade={dashboard.latest_grade} />
            </section>

            <RoadmapProgressWidget progress={dashboard.roadmap_progress} />
          </>
        )}
      </div>
    </main>
  );
}
