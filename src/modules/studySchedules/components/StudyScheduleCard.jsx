import React from "react";
import { Link } from "react-router-dom";

const typeLabels = {
  class: "Học trên lớp",
  self_study: "Tự học",
  review: "Ôn tập",
  assignment: "Làm bài tập",
  exam: "Thi/kiểm tra",
};

const statusLabels = {
  upcoming: "Sắp diễn ra",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
};

const statusClasses = {
  upcoming: "bg-blue-50 text-blue-700 ring-blue-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function StudyScheduleCard({ schedule, compact = false }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold uppercase text-blue-600">
            {schedule.subject_code} · {schedule.subject_name}
          </p>
          <h3 className="mt-1 truncate text-base font-extrabold text-slate-950">{schedule.title}</h3>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${statusClasses[schedule.status] || statusClasses.upcoming}`}>
          {statusLabels[schedule.status] || schedule.status}
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-600">
        {schedule.start_time} - {schedule.end_time}
      </p>
      {!compact && (
        <>
          <p className="mt-1 text-sm text-slate-500">{typeLabels[schedule.schedule_type] || schedule.schedule_type}</p>
          <p className="mt-1 truncate text-sm text-slate-500">{schedule.location || "Chưa có địa điểm/link"}</p>
        </>
      )}
      <Link to={`/student/schedules/${schedule.id}`} className="mt-4 inline-flex text-sm font-extrabold text-blue-600 hover:text-blue-700">
        Xem chi tiết
      </Link>
    </article>
  );
}
