import React from "react";

export default function PageHeader({ eyebrow = "StudyMate AI", title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-sm font-extrabold uppercase tracking-wide text-blue-600">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
