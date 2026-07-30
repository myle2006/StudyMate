import React from "react";
import { Clock3, FileWarning } from "lucide-react";
import { Link } from "react-router-dom";

function formatDeadline(value) {
  if (!value) return "Chưa có hạn";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(String(value).replace(" ", "T")));
}

export default function DeadlineList({ deadlines = [] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-950">Deadline sắp tới</h2>
        <FileWarning className="h-5 w-5 text-amber-600" />
      </div>

      {deadlines.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
          Không có deadline trong 14 ngày tới.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {deadlines.map((deadline) => (
            <Link
              key={deadline.id}
              to={`/admin/assignments/${deadline.id}`}
              className="block rounded-lg border border-slate-200 p-4 transition hover:border-amber-300 hover:bg-amber-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold uppercase text-amber-600">
                    {deadline.subject_code} · {deadline.subject_name}
                  </p>
                  <h3 className="mt-1 truncate text-sm font-black text-slate-950">{deadline.title}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-extrabold text-rose-700 ring-1 ring-rose-100">
                  {deadline.missing_count || 0} chưa nộp
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatDeadline(deadline.deadline)}
                </span>
                <span>
                  {deadline.submitted_count || 0}/{deadline.assigned_student_count || 0} bài đã nộp
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
