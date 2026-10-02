import React from "react";

export default function PageHeader({ eyebrow = "StudyMate AI", title, description, actions }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white/90 shadow-sm shadow-slate-200/60 backdrop-blur">
      <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-black uppercase text-blue-700 ring-1 ring-blue-100">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">{description}</p>}
        </div>
        {actions && (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end [&>*]:w-full sm:[&>*]:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
