import React from "react";
import { Link } from "react-router-dom";

function statusConfig(status) {
  if (status === "archived") {
    return {
      label: "Lưu trữ",
      className: "bg-amber-50 text-amber-700 ring-amber-200",
    };
  }

  return {
    label: "Đang học",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };
}

export default function SubjectCard({ subject, onDelete }) {
  const color = subject.color || "#414496";
  const status = statusConfig(subject.status);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#414496]/40 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]">
      <div
        className="subject-cover relative grid h-40 shrink-0 place-items-center overflow-hidden text-3xl font-extrabold text-white"
        style={{ backgroundColor: color }}
      >
        {subject.icon ? (
          <img src={subject.icon} alt={subject.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-lg bg-white/20 text-4xl backdrop-blur">
            {subject.name?.charAt(0)?.toUpperCase()}
          </span>
        )}
        <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ring-1 ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-5">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-extrabold text-slate-950 dark:text-white">
            {subject.name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            {subject.code || "Chưa có mã môn học"}
          </p>
        </div>

        <p className="mt-4 line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600 dark:text-slate-300">
          {subject.description || "Chưa có mô tả cho môn học này."}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Link
            to={`/subjects/${subject.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-[#414496] hover:text-[#414496] dark:border-white/10 dark:text-slate-200"
          >
            Xem chi tiết
          </Link>
          <Link
            to={`/subjects/${subject.id}/edit`}
            className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-[#414496] dark:bg-white dark:text-slate-950"
          >
            Sửa
          </Link>
          <button
            type="button"
            onClick={() => onDelete(subject)}
            className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
          >
            Xóa
          </button>
        </div>
      </div>
    </article>
  );
}
