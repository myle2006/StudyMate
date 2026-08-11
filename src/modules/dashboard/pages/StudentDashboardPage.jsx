import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Route as RouteIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
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

function GuestDemoSpotlight({ dashboard }) {
  const roadmap = dashboard?.roadmap_progress?.roadmaps?.[0];
  const schedule = dashboard?.today_schedules?.[0] || dashboard?.upcoming_schedules?.[0];

  return (
    <section className="overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-6 text-white">
          <p className="text-xs font-black uppercase tracking-wide text-blue-100">Demo cô đọng</p>
          <h2 className="mt-3 text-2xl font-black">Xem nhanh cách StudyMate dẫn sinh viên qua một lộ trình học mẫu.</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-blue-50">
            Phiên dùng thử chỉ giữ dashboard, môn học mẫu và lộ trình mẫu. Đăng ký tài khoản để tạo, chỉnh sửa và lưu dữ liệu học tập thật.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to={roadmap ? `/student/roadmaps/${roadmap.id}` : "/student/roadmaps"} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-black text-blue-700 hover:bg-blue-50">
              <RouteIcon className="h-4 w-4" />
              Mở lộ trình mẫu
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-lg border border-white/50 px-4 py-2 text-sm font-black text-white hover:bg-white/10">
              Đăng ký để cá nhân hóa
            </Link>
          </div>
        </div>
        <div className="grid gap-3 p-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-500">Lộ trình nổi bật</p>
            <h3 className="mt-2 line-clamp-2 text-base font-black text-slate-950">{roadmap?.title || "Lộ trình học mẫu"}</h3>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              {Number(roadmap?.progress_percent || dashboard?.summary?.roadmap_progress_percent || 0).toFixed(0)}% tiến độ mẫu
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-500">Việc học gần nhất</p>
            <h3 className="mt-2 line-clamp-2 text-base font-black text-slate-950">{schedule?.title || "Chưa có lịch học hôm nay"}</h3>
            {schedule && (
              <p className="mt-2 text-sm font-semibold text-slate-600">
                {schedule.start_time} - {schedule.end_time} · {schedule.subject_code}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StudentDashboardPage() {
  const { user, isGuestPreview } = useAuth();
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

    const allStats = [
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

    return isGuestPreview ? [allStats[0], allStats[1], allStats[5]] : allStats;
  }, [dashboard, isGuestPreview]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow={isGuestPreview ? "StudyMate Preview" : "Student Dashboard"}
          title={isGuestPreview ? "Dùng thử StudyMate" : "Trang cá nhân"}
          description={
            isGuestPreview
              ? "Một phiên demo ngắn, tập trung vào dashboard và lộ trình học mẫu để bạn thấy giá trị chính trước khi đăng ký."
              : `Xin chào ${user?.full_name || "bạn"}. Tổng quan học tập cá nhân của bạn hôm nay.`
          }
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
            {isGuestPreview && <GuestDemoSpotlight dashboard={dashboard} />}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stats.map((stat) => (
                <DashboardStatCard key={stat.title} {...stat} />
              ))}
            </section>

            {isGuestPreview ? (
              <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <RoadmapProgressWidget progress={dashboard.roadmap_progress} />
                <UpcomingScheduleList
                  title="Lịch học mẫu hôm nay"
                  schedules={dashboard.today_schedules || []}
                  emptyText="Hôm nay chưa có lịch học mẫu."
                  showDate={false}
                />
              </section>
            ) : (
              <>
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
          </>
        )}
      </div>
    </main>
  );
}
