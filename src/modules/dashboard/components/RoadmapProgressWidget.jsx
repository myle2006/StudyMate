import React from "react";
import { Link } from "react-router-dom";
import { Route } from "lucide-react";

function ProgressBar({ value }) {
  const percent = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs font-extrabold text-slate-500">{percent.toFixed(0)}%</p>
    </div>
  );
}

export default function RoadmapProgressWidget({ progress }) {
  const roadmaps = progress?.roadmaps || [];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950">Tiến độ lộ trình</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {progress?.completed_items || 0}/{progress?.total_items || 0} bước đã hoàn thành
          </p>
        </div>
        <Route className="h-5 w-5 text-emerald-600" />
      </div>

      <div className="mt-5">
        <ProgressBar value={progress?.overall_percent || 0} />
      </div>

      {roadmaps.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
          Chưa có lộ trình học để theo dõi.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {roadmaps.map((roadmap) => (
            <Link
              key={roadmap.id}
              to={`/student/roadmaps/${roadmap.id}`}
              className="block rounded-lg border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold uppercase text-emerald-600">
                    {roadmap.subject_code} · {roadmap.subject_name}
                  </p>
                  <h3 className="mt-1 truncate text-sm font-black text-slate-950">{roadmap.title}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600">
                  {roadmap.status}
                </span>
              </div>
              <div className="mt-4">
                <ProgressBar value={roadmap.progress_percent} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
