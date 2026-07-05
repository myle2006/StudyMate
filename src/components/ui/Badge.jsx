import React from "react";
import { cn } from "./utils";

const tones = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function Badge({ tone = "slate", className = "", children }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-extrabold ring-1", tones[tone] || tones.slate, className)}>
      {children}
    </span>
  );
}
