import React from "react";

export default function RoadmapProgressBar({ value = 0, completed, total }) {
  const percent = Math.min(100, Math.max(0, Number(value) || 0));
  const hasItemCount = Number.isFinite(Number(completed)) && Number.isFinite(Number(total));

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-extrabold uppercase text-slate-500">
        <span>Tiến độ</span>
        <span>{percent.toFixed(0)}%</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
      {hasItemCount && (
        <p className="mt-2 text-xs font-bold text-slate-500">
          {Number(completed)} / {Number(total)} bước hoàn thành
        </p>
      )}
    </div>
  );
}
