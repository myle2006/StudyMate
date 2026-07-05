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

function ScheduleBucket({ date, schedules }) {
  return (
    <div className="min-h-40 rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-extrabold text-slate-900">{dateLabel(date)}</p>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">{schedules.length}</span>
      </div>
      <div className="space-y-3">
        {schedules.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs font-semibold text-slate-400">Trống</p>
        ) : (
          schedules.map((schedule) => <StudyScheduleCard key={schedule.id} schedule={schedule} compact />)
        )}
      </div>
    </div>
  );
}

export default function StudyScheduleCalendar({ view, date, schedules }) {
  if (view === "day") {
    const daySchedules = schedules.filter((schedule) => sameDate(schedule.study_date, date));

    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-950">Lịch ngày {dateLabel(date)}</h2>
        <div className="mt-4 grid gap-3">
          {daySchedules.length === 0 ? (
            <div className="grid min-h-40 place-items-center rounded-lg bg-slate-50 text-sm font-bold text-slate-500">Không có lịch học trong ngày này.</div>
          ) : (
            daySchedules.map((schedule) => <StudyScheduleCard key={schedule.id} schedule={schedule} />)
          )}
        </div>
      </div>
    );
  }

  const dates = view === "month" ? monthDays(date) : weekDays(date);

  return (
    <div className={view === "month" ? "grid gap-3 md:grid-cols-3 xl:grid-cols-7" : "grid gap-3 md:grid-cols-2 xl:grid-cols-7"}>
      {dates.map((currentDate) => (
        <ScheduleBucket
          key={currentDate}
          date={currentDate}
          schedules={schedules.filter((schedule) => sameDate(schedule.study_date, currentDate))}
        />
      ))}
    </div>
  );
}
