import React from "react";
import { cn } from "./utils";

const toneClasses = {
  slate: "border-slate-200 bg-slate-50 text-slate-600",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

export default function IconIndicator({ icon: Icon, label, tone = "slate", className = "", size = 16 }) {
  if (!Icon) return null;

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "group relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
        toneClasses[tone] || toneClasses.slate,
        className,
      )}
    >
      <Icon size={size} aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[11px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </span>
  );
}
