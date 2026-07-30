import React from "react";
import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";

function formatDate(value) {
  if (!value) return "Chưa có thời gian";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(String(value).replace(" ", "T")));
}

const statusClasses = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  inactive: "bg-slate-100 text-slate-700 ring-slate-200",
  locked: "bg-rose-50 text-rose-700 ring-rose-100",
};

export default function RecentStudents({ students = [] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-950">Sinh viên mới gần đây</h2>
        <UserRound className="h-5 w-5 text-blue-600" />
      </div>

      {students.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
          Chưa có sinh viên mới.
        </div>
      ) : (
        <div className="mt-5 divide-y divide-slate-100">
          {students.map((student) => (
            <Link key={student.id} to={`/admin/students/${student.id}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-sm font-black text-blue-700">
                {(student.full_name || "SV").slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-slate-950">{student.full_name}</span>
                <span className="block truncate text-xs font-semibold text-slate-500">
                  {student.student_code || student.email} · {student.assigned_subject_count || 0} môn
                </span>
              </span>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${statusClasses[student.status] || statusClasses.inactive}`}>
                {student.status}
              </span>
              <span className="hidden shrink-0 text-xs font-bold text-slate-400 sm:inline">{formatDate(student.created_at)}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
