import React, { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, ConfirmDialog, LoadingState, PageHeader, useToast } from "../../../components/ui";
import RoadmapItemCard from "../components/RoadmapItemCard";
import RoadmapProgressBar from "../components/RoadmapProgressBar";
import {
  deleteRoadmap,
  getRoadmapById,
  getRoadmapProgress,
  rescheduleRoadmapItem,
  updateRoadmap,
  updateRoadmapItemResult,
  updateRoadmapItemStatus,
} from "../services/learningRoadmapService";

const levelMap = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

const weekdayLabels = {
  1: "T2",
  2: "T3",
  3: "T4",
  4: "T5",
  5: "T6",
  6: "T7",
  7: "CN",
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

function formatMinutes(value) {
  const minutes = Number(value) || 0;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours <= 0) return `${rest} phút`;
  if (rest === 0) return `${hours} giờ`;
  return `${hours} giờ ${rest} phút`;
}

function formatWeekdays(value) {
  const days = Array.isArray(value) ? value : String(value || "").split(",");
  return days.map((day) => weekdayLabels[Number(day)]).filter(Boolean).join(", ") || "-";
}

function InfoItem({ icon: Icon, label, value, children }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-500">
        {Icon && <Icon size={16} />}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-bold text-slate-950">{children || value || "-"}</div>
    </div>
  );
}

function buildRoadmapStatusPayload(roadmap, status) {
  return {
    subject_id: roadmap.subject_id,
    learning_goal_id: roadmap.learning_goal_id || "",
    title: roadmap.title,
    overview: roadmap.overview || "",
    goal: roadmap.goal,
    current_level: roadmap.current_level,
    study_time_per_day: roadmap.study_time_per_day,
    available_weekdays: roadmap.available_weekdays || [1, 2, 3, 4, 5],
    preferred_start_time: roadmap.preferred_start_time || "19:00",
    session_duration_minutes: roadmap.session_duration_minutes || 60,
    max_daily_minutes: roadmap.max_daily_minutes || null,
    max_weekly_minutes: roadmap.max_weekly_minutes || null,
    reminder_minutes_before: roadmap.reminder_minutes_before ?? 15,
    start_date: roadmap.start_date,
    end_date: roadmap.end_date,
    generated_by_ai: roadmap.generated_by_ai,
    ai_prompt: roadmap.ai_prompt || "",
    ai_raw_response: roadmap.ai_raw_response || "",
    status,
  };
}

export default function RoadmapDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressSummary, setProgressSummary] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [savingResultItemId, setSavingResultItemId] = useState(null);
  const [reschedulingItemId, setReschedulingItemId] = useState(null);
  const [completingRoadmap, setCompletingRoadmap] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadRoadmap() {
    setLoading(true);
    setError("");

    try {
      const [roadmapResponse, progressResponse] = await Promise.all([
        getRoadmapById(id),
        getRoadmapProgress(id),
      ]);
      setRoadmap(roadmapResponse.data);
      setProgressSummary(progressResponse.data);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết lộ trình học.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoadmap();
  }, [id]);

  async function handleStatusChange(item, status) {
    setUpdatingItemId(item.id);

    try {
      const response = await updateRoadmapItemStatus(item.id, status);
      setRoadmap((current) => {
        if (!current) return current;

        return {
          ...current,
          progress_percent: response.data.progress_percent,
          items: current.items.map((currentItem) => (
            currentItem.id === item.id ? response.data.item : currentItem
          )),
        };
      });
      setProgressSummary(response.data.summary || response.data);
      toast.success(
        response.data.is_completed
          ? "Tất cả bước học đã hoàn thành. Bạn có thể chuyển lộ trình sang hoàn thành."
          : "Cập nhật trạng thái bước học thành công."
      );
    } catch (err) {
      toast.error(err.message || "Không thể cập nhật trạng thái bước học.");
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleResultSubmit(item, data) {
    setSavingResultItemId(item.id);

    try {
      const response = await updateRoadmapItemResult(item.id, {
        ...data,
        completion_percent: Number(data.completion_percent || 0),
        actual_study_minutes: data.actual_study_minutes === "" ? null : Number(data.actual_study_minutes),
        self_assessment: data.self_assessment === "" ? null : Number(data.self_assessment),
      });
      setRoadmap((current) => current ? ({
        ...current,
        progress_percent: response.data.progress_percent,
        items: current.items.map((currentItem) => (
          currentItem.id === item.id ? response.data.item : currentItem
        )),
      }) : current);
      setProgressSummary(response.data.summary);
      toast.success("Cập nhật kết quả học tập thành công.");
    } catch (err) {
      toast.error(err.message || "Không thể cập nhật kết quả học tập.");
    } finally {
      setSavingResultItemId(null);
    }
  }

  async function handleRescheduleSubmit(item, data) {
    setReschedulingItemId(item.id);

    try {
      const response = await rescheduleRoadmapItem(item.id, {
        ...data,
        duration_minutes: Number(data.duration_minutes || item.duration_minutes || 60),
      });
      setRoadmap((current) => current ? ({
        ...current,
        items: current.items.map((currentItem) => (
          currentItem.id === item.id ? response.data.item : currentItem
        )),
      }) : current);
      setProgressSummary(response.data.summary);
      toast.success("Dời lịch nhiệm vụ học thành công.");
    } catch (err) {
      const conflicts = err.errors?.schedule_conflicts;
      const suggestion = Array.isArray(conflicts) && conflicts[0]?.suggestions?.[0]
        ? ` Gợi ý: ${conflicts[0].suggestions[0].start_time}-${conflicts[0].suggestions[0].end_time}.`
        : "";
      toast.error((err.message || "Không thể dời lịch nhiệm vụ học.") + suggestion);
    } finally {
      setReschedulingItemId(null);
    }
  }

  async function handleCompleteRoadmap() {
    if (!roadmap) return;
    setCompletingRoadmap(true);

    try {
      const response = await updateRoadmap(roadmap.id, buildRoadmapStatusPayload(roadmap, "completed"));
      setRoadmap(response.data);
      toast.success("Đã chuyển lộ trình sang hoàn thành.");
    } catch (err) {
      toast.error(err.message || "Không thể chuyển lộ trình sang hoàn thành.");
    } finally {
      setCompletingRoadmap(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);

    try {
      await deleteRoadmap(id);
      toast.success("Xóa lộ trình học thành công.");
      navigate("/student/roadmaps");
    } catch (err) {
      toast.error(err.message || "Không thể xóa lộ trình học.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  if (loading) {
    return <LoadingState label="Đang tải lộ trình học..." />;
  }

  if (error || !roadmap) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Lộ trình học"
          title="Không tìm thấy lộ trình"
          description={error || "Lộ trình không tồn tại hoặc không thuộc tài khoản của bạn."}
          actions={
            <Button to="/student/roadmaps" variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
          }
        />
      </main>
    );
  }

  const totalItems = roadmap.items?.length || 0;
  const completedItems = roadmap.items?.filter((item) => item.status === "completed").length || 0;
  const missedItems = (roadmap.items || []).filter((item) => {
    if (["completed", "not_completed"].includes(item.status)) return false;
    if (!item.planned_date || !item.start_time) return false;
    return new Date(`${item.planned_date}T${item.start_time}`) < new Date();
  });
  const shouldSuggestCompletion = totalItems > 0 && completedItems === totalItems && roadmap.status !== "completed";

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow={`${roadmap.subject_code} - ${roadmap.subject_name}`}
          title={roadmap.title}
          description={roadmap.overview}
          actions={
            <>
              <Button to="/student/roadmaps" variant="secondary">
                <ArrowLeft size={16} /> Danh sách
              </Button>
              <Button to={`/student/roadmaps/${roadmap.id}/edit`}>
                <Pencil size={16} /> Sửa
              </Button>
              <Button type="button" variant="danger" onClick={() => setConfirmOpen(true)}>
                <Trash2 size={16} /> Xóa
              </Button>
            </>
          }
        />

        <Card className="space-y-5 p-6">
          <RoadmapProgressBar value={roadmap.progress_percent} completed={completedItems} total={totalItems} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoItem icon={Clock3} label="Thời gian học" value={`${Number(roadmap.study_time_per_day).toFixed(1)} giờ/ngày`} />
            <InfoItem icon={CalendarDays} label="Bắt đầu" value={formatDate(roadmap.start_date)} />
            <InfoItem icon={CalendarDays} label="Kết thúc" value={formatDate(roadmap.end_date)} />
            <InfoItem label="Trình độ" value={levelMap[roadmap.current_level] || roadmap.current_level} />
            <InfoItem label="Ngày học" value={formatWeekdays(roadmap.available_weekdays)} />
            <InfoItem label="Giờ bắt đầu" value={roadmap.preferred_start_time || "-"} />
            <InfoItem label="Mỗi buổi" value={formatMinutes(roadmap.session_duration_minutes)} />
            <InfoItem label="Nhắc lịch" value={`${roadmap.reminder_minutes_before ?? 0} phút trước`} />
          </div>
          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-extrabold uppercase text-slate-500">Mục tiêu</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{roadmap.goal}</p>
          </div>
        </Card>

        {progressSummary && (
          <Card className="space-y-5 p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <InfoItem label="Đã hoàn thành" value={`${progressSummary.completed_items || 0}/${progressSummary.total_items || 0} nhiệm vụ`} />
              <InfoItem label="Chưa hoàn thành" value={`${progressSummary.not_completed_items || 0} nhiệm vụ`} />
              <InfoItem label="Đã học" value={formatMinutes(progressSummary.actual_study_minutes)} />
              <InfoItem label="Còn lại" value={formatMinutes(progressSummary.remaining_minutes)} />
              <InfoItem label="Đạt mục tiêu" value={`${Number(progressSummary.goal_achievement_percent || 0).toFixed(0)}%`} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <h3 className="text-sm font-black text-slate-950">Tiến độ theo ngày</h3>
                <div className="mt-3 space-y-2">
                  {(progressSummary.daily || []).slice(0, 5).map((day) => (
                    <div key={day.planned_date} className="flex items-center justify-between gap-3 text-sm font-bold text-slate-600">
                      <span>{formatDate(day.planned_date)}</span>
                      <span>{day.completed_items}/{day.total_items} · {Number(day.progress_percent || 0).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <h3 className="text-sm font-black text-slate-950">Tiến độ theo tuần</h3>
                <div className="mt-3 space-y-2">
                  {(progressSummary.weekly || []).slice(0, 5).map((week) => (
                    <div key={week.week_key} className="flex items-center justify-between gap-3 text-sm font-bold text-slate-600">
                      <span>{formatDate(week.week_start)} - {formatDate(week.week_end)}</span>
                      <span>{week.completed_items}/{week.total_items} · {Number(week.progress_percent || 0).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {shouldSuggestCompletion && (
          <Alert tone="success" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Tất cả bước học đã hoàn thành. Hãy chuyển trạng thái lộ trình sang hoàn thành.</span>
            <Button type="button" size="sm" onClick={handleCompleteRoadmap} disabled={completingRoadmap}>
              <CheckCircle2 size={16} />
              {completingRoadmap ? "Đang cập nhật..." : "Chuyển hoàn thành"}
            </Button>
          </Alert>
        )}

        {missedItems.length > 0 && (
          <Alert tone="warning">
            Có {missedItems.length} nhiệm vụ đã qua giờ học. Hãy cập nhật trạng thái hoặc dời lịch để lộ trình tiếp tục chính xác.
          </Alert>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-950">Các bước học</h2>
          {roadmap.items.map((item) => (
            <RoadmapItemCard
              key={item.id}
              item={item}
              updating={updatingItemId === item.id}
              savingResult={savingResultItemId === item.id}
              rescheduling={reschedulingItemId === item.id}
              onStatusChange={handleStatusChange}
              onResultSubmit={handleResultSubmit}
              onRescheduleSubmit={handleRescheduleSubmit}
            />
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa lộ trình học?"
        description={`Lộ trình "${roadmap.title}" sẽ bị xóa khỏi danh sách của bạn.`}
        confirmLabel="Xóa lộ trình"
        danger
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </main>
  );
}
