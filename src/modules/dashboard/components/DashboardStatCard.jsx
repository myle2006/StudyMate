import React from "react";

const toneClasses = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function DashboardStatCard({ title, value, helper, icon: Icon, tone = "blue" }) {
  return (
    <article className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value ?? 0}</p>
        </div>
        {Icon && (
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ring-1 transition group-hover:scale-105 ${toneClasses[tone] || toneClasses.blue}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      {helper && <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">{helper}</p>}
    </article>
  );
}
