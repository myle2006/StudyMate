import React from "react";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" }).format(new Date(`${value}T00:00:00`));
}

export default function UpcomingScheduleList({ title, schedules = [], emptyText, showDate = true }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        <CalendarDays className="h-5 w-5 text-blue-600" />
      </div>

      {schedules.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
          {emptyText}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {schedules.map((schedule) => (
            <Link
              key={schedule.id}
              to={`/student/schedules/${schedule.id}`}
              className="block rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold uppercase text-blue-600">
                    {schedule.subject_code} · {schedule.subject_name}
                  </p>
                  <h3 className="mt-1 truncate text-sm font-black text-slate-950">{schedule.title}</h3>
                </div>
                {showDate && <span className="shrink-0 text-xs font-bold text-slate-500">{formatDate(schedule.study_date)}</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {schedule.start_time} - {schedule.end_time}
                </span>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{schedule.location || "Chưa có địa điểm/link"}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
