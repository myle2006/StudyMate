import React from "react";

const typeLabels = {
  class: "Học trên lớp",
  self_study: "Tự học",
  review: "Ôn tập",
  assignment: "Làm bài tập",
  exam: "Thi/kiểm tra",
};

const levelConfig = {
  overdue: {
    label: "Quá giờ",
    compactLabel: "Quá",
    card: "border-rose-200 bg-rose-50/70 hover:border-rose-300 hover:bg-rose-50",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
    text: "text-rose-700",
  },
  ongoing: {
    label: "Đang học",
    compactLabel: "Đang",
    card: "border-blue-200 bg-blue-50/70 hover:border-blue-300 hover:bg-blue-50",
    bar: "bg-blue-600",
    dot: "bg-blue-600",
    text: "text-blue-700",
  },
  soon: {
    label: "Sắp tới",
    compactLabel: "Sắp",
    card: "border-amber-200 bg-amber-50/80 hover:border-amber-300 hover:bg-amber-50",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  later: {
    label: "Sắp diễn ra",
    compactLabel: "Sắp",
    card: "border-sky-200 bg-sky-50/60 hover:border-sky-300 hover:bg-sky-50",
    bar: "bg-sky-500",
    dot: "bg-sky-500",
    text: "text-sky-700",
  },
  completed: {
    label: "Hoàn thành",
    compactLabel: "Xong",
    card: "border-emerald-200 bg-emerald-50/70 hover:border-emerald-300 hover:bg-emerald-50",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  cancelled: {
    label: "Đã hủy",
    compactLabel: "Hủy",
    card: "border-slate-200 bg-slate-50 hover:border-slate-300",
    bar: "bg-slate-400",
    dot: "bg-slate-400",
    text: "text-slate-600",
  },
};

function scheduleDateTime(date, time) {
  const value = date && time ? new Date(`${date}T${time}`) : null;
  return value && !Number.isNaN(value.getTime()) ? value : null;
}

function getScheduleLevel(schedule) {
  if (schedule.status === "completed") return levelConfig.completed;
  if (schedule.status === "cancelled") return levelConfig.cancelled;

  const start = scheduleDateTime(schedule.study_date, schedule.start_time);
  const end = scheduleDateTime(schedule.study_date, schedule.end_time);
  const now = new Date();

  if (end && end.getTime() < now.getTime()) return levelConfig.overdue;
  if (start && end && start.getTime() <= now.getTime() && end.getTime() >= now.getTime()) return levelConfig.ongoing;

  const minutesUntilStart = start ? (start.getTime() - now.getTime()) / 60000 : 9999;
  if (minutesUntilStart >= 0 && minutesUntilStart <= 180) return levelConfig.soon;

  return levelConfig.later;
}

export default function StudyScheduleCard({ schedule, compact = false, onSelect }) {
  const level = getScheduleLevel(schedule);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(schedule)}
        className={`group relative block w-full overflow-hidden rounded-lg border p-3 pr-2 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 ${level.card}`}
        title={`${schedule.subject_code} - ${schedule.title}`}
      >
        <span className={`absolute inset-y-0 left-0 w-1 ${level.bar}`} aria-hidden="true" />
        <div className="min-w-0 pl-2">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-black ${level.text}`}>{schedule.start_time}</span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-black text-slate-600 ring-1 ring-slate-200">
              <span className={`h-1.5 w-1.5 rounded-full ${level.dot}`} />
              {level.compactLabel}
            </span>
          </div>
          <p className="mt-1 truncate text-[11px] font-black uppercase text-slate-500">{schedule.subject_code}</p>
          <h3 className="mt-0.5 line-clamp-2 min-h-9 text-sm font-black leading-[18px] text-slate-950 group-hover:text-blue-700">
            {schedule.title}
          </h3>
          {schedule.learning_goal_title && (
            <p className="mt-1 truncate text-[11px] font-bold text-blue-700">{schedule.learning_goal_title}</p>
          )}
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-500">
            <span className="truncate">{typeLabels[schedule.schedule_type] || schedule.schedule_type}</span>
            <span className="shrink-0">{schedule.end_time}</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <article className={`rounded-lg border bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${level.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold uppercase text-blue-600">
            {schedule.subject_code} · {schedule.subject_name}
          </p>
          <h3 className="mt-1 truncate text-base font-extrabold text-slate-950">{schedule.title}</h3>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-extrabold ring-1 ring-slate-200 ${level.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${level.dot}`} />
          {level.label}
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-600">
        {schedule.start_time} - {schedule.end_time}
      </p>
      {schedule.learning_goal_title && (
        <p className="mt-1 truncate text-sm font-bold text-blue-700">Mục tiêu: {schedule.learning_goal_title}</p>
      )}
      <p className="mt-1 text-sm text-slate-500">{typeLabels[schedule.schedule_type] || schedule.schedule_type}</p>
      <p className="mt-1 truncate text-sm text-slate-500">{schedule.location || "Chưa có địa điểm/link"}</p>
      <button type="button" onClick={() => onSelect?.(schedule)} className="mt-4 inline-flex text-sm font-extrabold text-blue-600 hover:text-blue-700">
        Xem chi tiết
      </button>
    </article>
  );
}
