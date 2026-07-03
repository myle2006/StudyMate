import React from "react";
import { Link } from "react-router-dom";

function statusLabel(status) {
  return status === "archived" ? "Lưu trữ" : "Đang học";
}

export default function SubjectCard({ subject, onDelete }) {
  const color = subject.color || "#2563EB";

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
      <div
        className="grid h-40 place-items-center text-3xl font-extrabold text-white"
        style={{ backgroundColor: color }}
      >
        {subject.icon ? (
          <img src={subject.icon} alt={subject.name} className="h-full w-full object-cover" />
        ) : (
          subject.name?.charAt(0)?.toUpperCase()
        )}
      </div>

      <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-extrabold text-slate-950 dark:text-white">
              {subject.name}
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {subject.code || "Chưa có mã môn học"}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
          {statusLabel(subject.status)}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600 dark:text-slate-300">
        {subject.description || "Chưa có mô tả cho môn học này."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to={`/subjects/${subject.id}`}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-white/10 dark:text-slate-200"
        >
          Xem chi tiết
        </Link>
        <Link
          to={`/subjects/${subject.id}/edit`}
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-600 dark:bg-white dark:text-slate-950"
        >
          Sửa
        </Link>
        <button
          type="button"
          onClick={() => onDelete(subject)}
          className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
        >
          Xóa
        </button>
      </div>
      </div>
    </article>
  );
}
