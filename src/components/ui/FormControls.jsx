import React from "react";
import { cn } from "./utils";

const controlClass =
  "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition duration-200 placeholder:font-medium placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

export function Field({ label, error, hint, children, className = "" }) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="text-sm font-extrabold text-slate-700">{label}</span>}
      {children}
      {hint && !error && <p className="mt-2 text-xs font-semibold text-slate-500">{hint}</p>}
      {error && <p className="mt-2 text-sm font-bold text-rose-600">{error}</p>}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Select({ className = "", children, ...props }) {
  return (
    <select className={cn(controlClass, className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={cn(controlClass, "min-h-32", className)} {...props} />;
}
