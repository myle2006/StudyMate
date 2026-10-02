import React, { useEffect, useState } from "react";
import { CalendarDays, Clock3, ExternalLink, MapPin, NotebookText, Pencil, Target, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button, LoadingState } from "../../../components/ui";
import StudyScheduleForm from "./StudyScheduleForm";

const typeLabels = {
  class: "Học trên lớp",
  self_study: "Tự học",
  review: "Ôn tập",
  assignment: "Làm bài tập",
  exam: "Thi/kiểm tra",
};

const statusLabels = {
  upcoming: "Sắp diễn ra",
  scheduled: "Đã lên lịch",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
};

const statusTones = {
  upcoming: "blue",
  scheduled: "blue",
  completed: "green",
  cancelled: "slate",
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function InfoRow({ icon: Icon, label, value, children, className = "" }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-500">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </div>
      <div className="mt-1 text-sm font-bold leading-6 text-slate-900">{children || value || "-"}</div>
    </div>
  );
}

export default function StudyScheduleDetailPanel({
  open,
  schedule,
  subjects,
  loading = false,
  submitting = false,
  apiErrors = {},
  onClose,
  onSubmit,
}) {
  const [editing, setEditing] = useState(false);

  async function handleEditSubmit(data) {
    const saved = await onSubmit?.(data);
    if (saved) setEditing(false);
  }

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setEditing(false);
  }, [open, schedule?.id]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/40 px-4 py-4 backdrop-blur-sm sm:px-6" onMouseDown={onClose}>
      <section
        className="mx-auto w-full max-w-3xl animate-schedule-panel rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-blue-600">
              {schedule?.subject_code && schedule?.subject_name
                ? `${schedule.subject_code} · ${schedule.subject_name}`
                : "Chi tiết lịch học"}
            </p>
            <h2 id="schedule-detail-title" className="mt-1 truncate text-xl font-black text-slate-950">
              {schedule?.title || "Lịch học"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
            aria-label="Đóng chi tiết lịch học"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-5 py-5">
          {loading ? (
            <LoadingState label="Đang tải chi tiết lịch học..." />
          ) : editing ? (
            <StudyScheduleForm
              mode="edit"
              subjects={subjects}
              initialValues={schedule}
              submitting={submitting}
              apiErrors={apiErrors}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditing(false)}
              cancelLabel="Quay lại chi tiết"
            />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">{typeLabels[schedule?.schedule_type] || schedule?.schedule_type || "Lịch học"}</Badge>
                <Badge tone={statusTones[schedule?.status] || "slate"}>
                  {statusLabels[schedule?.status] || schedule?.status || "-"}
                </Badge>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <InfoRow icon={CalendarDays} label="Ngày học" value={formatDate(schedule?.study_date)} />
                <InfoRow icon={Clock3} label="Thời gian" value={`${schedule?.start_time || "-"} - ${schedule?.end_time || "-"}`} />
                <InfoRow icon={MapPin} label="Địa điểm" value={schedule?.location || "Chưa có địa điểm/link"} />
                <InfoRow icon={NotebookText} label="Môn học" value={schedule?.subject_name} />
                <InfoRow icon={Target} label="Mục tiêu" value={schedule?.learning_goal_title || "Chưa gắn mục tiêu"} />
              </div>

              <InfoRow label="Nội dung" value={schedule?.description || "Chưa có nội dung."} className="mt-3">
                <p className="whitespace-pre-line">{schedule?.description || "Chưa có nội dung."}</p>
              </InfoRow>

              {schedule?.related_lesson_id && schedule?.related_lesson_title && (
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                  <p className="text-xs font-extrabold uppercase text-blue-700">Bài học liên quan</p>
                  <Link
                    to={`/student/lessons/${schedule.related_lesson_id}`}
                    className="mt-1 inline-flex items-center gap-2 text-sm font-black text-blue-700 hover:text-blue-900"
                  >
                    {schedule.related_lesson_title}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button type="button" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Đóng
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
