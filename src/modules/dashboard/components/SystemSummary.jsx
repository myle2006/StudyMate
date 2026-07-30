import React from "react";
import { Activity, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

function formatDateTime(value) {
  if (!value) return "Chưa có thời gian";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(String(value).replace(" ", "T")));
}

export default function SystemSummary({ topSubjects = [], activities = [] }) {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-950">Môn học nhiều sinh viên nhất</h2>
          <BookOpen className="h-5 w-5 text-emerald-600" />
        </div>

        {topSubjects.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
            Chưa có dữ liệu phân công môn học.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {topSubjects.map((subject) => (
              <Link key={subject.id} to={`/admin/subjects/${subject.id}`} className="block rounded-lg border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold uppercase text-emerald-600">{subject.subject_code}</p>
                    <h3 className="mt-1 truncate text-sm font-black text-slate-950">{subject.subject_name}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-100">
                    {subject.student_count || 0} sinh viên
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-950">Hoạt động gần đây</h2>
          <Activity className="h-5 w-5 text-violet-600" />
        </div>

        {activities.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
            Chưa có hoạt động gần đây.
          </div>
        ) : (
          <div className="mt-5 divide-y divide-slate-100">
            {activities.map((activity, index) => (
              <article key={`${activity.type}-${activity.occurred_at || index}`} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{activity.title}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">{activity.description}</p>
                    {activity.meta && <p className="mt-1 truncate text-xs font-bold text-slate-400">{activity.meta}</p>}
                  </div>
                  <span className="shrink-0 text-xs font-bold text-slate-400">{formatDateTime(activity.occurred_at)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
