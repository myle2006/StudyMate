import React from "react";
import StudyScheduleCard from "./StudyScheduleCard";

function toDate(value) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateLabel(value) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(toDate(value));
}

function sameDate(a, b) {
  return a === b;
}

function today() {
  return formatDate(new Date());
}

function weekDays(dateValue) {
  const date = toDate(dateValue);
  const day = date.getDay() || 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - day + 1);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + index);
    return formatDate(current);
  });
}

function monthDays(dateValue) {
  const date = toDate(dateValue);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const days = [];

  for (let day = 1; day <= end.getDate(); day += 1) {
    days.push(formatDate(new Date(start.getFullYear(), start.getMonth(), day)));
  }

  return days;
}

function ScheduleBucket({ date, schedules, onScheduleSelect }) {
  const isToday = sameDate(date, today());

  return (
    <div className={`min-h-40 rounded-lg border p-3 ${isToday ? "border-blue-300 bg-blue-50/70 shadow-sm shadow-blue-100" : "border-slate-200 bg-white"}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-sm font-extrabold ${isToday ? "text-blue-800" : "text-slate-900"}`}>{dateLabel(date)}</p>
          {isToday && <span className="mt-1 inline-flex rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-black text-white">Hôm nay</span>}
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-bold ${isToday ? "bg-white text-blue-700 ring-1 ring-blue-200" : "bg-slate-100 text-slate-500"}`}>{schedules.length}</span>
      </div>
      <div className="space-y-2">
        {schedules.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs font-semibold text-slate-400">Trống</p>
        ) : (
          schedules.map((schedule) => <StudyScheduleCard key={schedule.id} schedule={schedule} compact onSelect={onScheduleSelect} />)
        )}
      </div>
    </div>
  );
}

const levelLegend = [
  { label: "Quá giờ", className: "bg-rose-500" },
  { label: "Đang học", className: "bg-blue-600" },
  { label: "Sắp tới", className: "bg-amber-500" },
  { label: "Còn hạn", className: "bg-sky-500" },
  { label: "Hoàn thành", className: "bg-emerald-500" },
];

function ScheduleLegend() {
  return (
    <div className="mb-4 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
      {levelLegend.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
          <span className={`h-2 w-2 rounded-full ${item.className}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export default function StudyScheduleCalendar({ view, date, schedules, onScheduleSelect }) {
  if (view === "day") {
    const daySchedules = schedules.filter((schedule) => sameDate(schedule.study_date, date));
    const isToday = sameDate(date, today());

    return (
      <div>
        <ScheduleLegend />
        <div className={`rounded-lg border p-4 shadow-sm ${isToday ? "border-blue-300 bg-blue-50/70 shadow-blue-100" : "border-slate-200 bg-white"}`}>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={`text-lg font-extrabold ${isToday ? "text-blue-900" : "text-slate-950"}`}>Lịch ngày {dateLabel(date)}</h2>
            {isToday && <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-black text-white">Hôm nay</span>}
          </div>
          <div className="mt-4 grid gap-3">
          {daySchedules.length === 0 ? (
            <div className="grid min-h-40 place-items-center rounded-lg bg-slate-50 text-sm font-bold text-slate-500">Không có lịch học trong ngày này.</div>
          ) : (
            daySchedules.map((schedule) => <StudyScheduleCard key={schedule.id} schedule={schedule} onSelect={onScheduleSelect} />)
          )}
          </div>
        </div>
      </div>
    );
  }

  const dates = view === "month" ? monthDays(date) : weekDays(date);

  return (
    <div>
      <ScheduleLegend />
      <div className={view === "month" ? "grid gap-3 md:grid-cols-3 2xl:grid-cols-7" : "grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7"}>
        {dates.map((currentDate) => (
          <ScheduleBucket
            key={currentDate}
            date={currentDate}
            schedules={schedules.filter((schedule) => sameDate(schedule.study_date, currentDate))}
            onScheduleSelect={onScheduleSelect}
          />
        ))}
      </div>
    </div>
  );
}
