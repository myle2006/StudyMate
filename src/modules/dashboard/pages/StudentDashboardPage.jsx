import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  PlayCircle,
  Route as RouteIcon,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, Button, LoadingState, PageHeader } from "../../../components/ui";
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

function formatStudyDate(step) {
  if (!step?.planned_date) return "Chưa xếp lịch";
  const date = new Date(String(step.planned_date));
  const dateText = Number.isNaN(date.getTime()) ? step.planned_date : date.toLocaleDateString("vi-VN");
  return step.start_time ? `${dateText} · ${step.start_time}` : dateText;
}

function ContinueLearningCard({ step, progress }) {
  const fallbackRoadmap = progress?.roadmaps?.[0];
  const roadmapId = step?.roadmap_id || fallbackRoadmap?.id;

  return (
    <section className="overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-emerald-600 p-6 text-white">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase text-blue-100">
            <PlayCircle className="h-4 w-4" />
            Học tiếp ngay
          </p>
          <h2 className="mt-3 text-2xl font-black">
            {step ? (step.lesson_title || step.title || "Bài học tiếp theo") : "Bạn chưa có bài học tiếp theo"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-blue-50">
            {step
              ? `${step.subject_code} · ${step.subject_name}. StudyMate đã chọn bài phù hợp nhất để bạn tiếp tục lộ trình.`
              : "Khi có lộ trình đang học, StudyMate sẽ đưa bài cần học tiếp theo lên đây để bạn không phải tự tìm trong mindmap."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {roadmapId ? (
              <Button to={`/student/roadmaps/${roadmapId}`} variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50">
                <RouteIcon className="h-4 w-4" />
                {step ? "Tiếp tục học" : "Mở lộ trình"}
              </Button>
            ) : (
              <Button to="/student/roadmaps/generate" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50">
                Tạo lộ trình
              </Button>
            )}
          </div>
        </div>
        <div className="grid gap-3 p-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-500">Lộ trình</p>
            <h3 className="mt-2 line-clamp-2 text-base font-black text-slate-950">
              {step?.roadmap_title || fallbackRoadmap?.title || "Chưa có lộ trình đang học"}
            </h3>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              {Number(step?.progress_percent ?? fallbackRoadmap?.progress_percent ?? progress?.overall_percent ?? 0).toFixed(0)}% tiến độ
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-500">Việc cần làm</p>
            <h3 className="mt-2 line-clamp-2 text-base font-black text-slate-950">
              {step?.assignment_id ? "Học nội dung và làm quiz xác nhận" : "Học nội dung và đánh dấu hoàn thành"}
            </h3>
            <p className="mt-2 text-sm font-semibold text-slate-600">{formatStudyDate(step)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LearningGoalOverviewCard({ overview }) {
  const goals = overview?.goals || [];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-blue-600">Mục tiêu đang theo đuổi</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">
            {overview?.active_count || 0} mục tiêu active
          </h2>
        </div>
        <Target className="h-5 w-5 text-blue-600" />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-black uppercase text-slate-500">Gần deadline</p>
          <p className="mt-1 text-lg font-black text-amber-700">{overview?.near_deadline_count || 0}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-black uppercase text-slate-500">Chưa có lộ trình</p>
          <p className="mt-1 text-lg font-black text-rose-700">{overview?.without_roadmap_count || 0}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-black uppercase text-slate-500">Hoàn thành TB</p>
          <p className="mt-1 text-lg font-black text-emerald-700">
            {Number(overview?.average_progress_percent || 0).toFixed(0)}%
          </p>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
          Bạn chưa có mục tiêu học tập nào.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {goals.slice(0, 3).map((goal) => (
            <div key={goal.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold uppercase text-blue-600">
                    {goal.subject_code} · {goal.subject_name}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-black text-slate-950">{goal.title}</h3>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Deadline: {goal.end_date || "Chưa đặt"} · {Number(goal.average_progress_percent || 0).toFixed(0)}%
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${goal.is_overdue ? "bg-rose-100 text-rose-700" : goal.is_near_deadline ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                  {goal.is_overdue ? "Trễ" : goal.is_near_deadline ? "Sắp hạn" : goal.has_roadmap ? "Có lộ trình" : "Thiếu lộ trình"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {goal.primary_roadmap_id ? (
                  <Button to={`/student/roadmaps/${goal.primary_roadmap_id}`} variant="secondary" size="sm">
                    <RouteIcon className="h-4 w-4" />
                    Mở lộ trình
                  </Button>
                ) : (
                  <Button to={`/student/roadmaps/generate?goal_id=${goal.id}`} size="sm">
                    <RouteIcon className="h-4 w-4" />
                    Tạo lộ trình
                  </Button>
                )}
                <Button to={`/student/learning-goals/${goal.id}`} variant="secondary" size="sm">
                  Chi tiết
                </Button>
              </div>
            </div>
          ))}
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
      {
        title: "Mục tiêu active",
        value: summary.active_learning_goal_count,
        helper: `${summary.near_deadline_learning_goal_count || 0} mục tiêu gần deadline`,
        icon: Target,
        tone: "blue",
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
            {!isGuestPreview && (
              <ContinueLearningCard step={dashboard.next_learning_step} progress={dashboard.roadmap_progress} />
            )}

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
                  <LearningGoalOverviewCard overview={dashboard.learning_goal_overview} />
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
