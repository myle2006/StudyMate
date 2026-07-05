import React from "react";
import Button from "./Button";
import Card from "./Card";
import { cn } from "./utils";

const alertTones = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

export function Alert({ tone = "info", children, className = "" }) {
  if (!children) return null;

  return (
    <div className={cn("rounded-lg border px-4 py-3 text-sm font-bold", alertTones[tone] || alertTones.info, className)}>
      {children}
    </div>
  );
}

export function LoadingState({ label = "Đang tải dữ liệu..." }) {
  return (
    <Card className="grid min-h-64 place-items-center p-8">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

export function EmptyState({ title, description, actionLabel, actionTo }) {
  return (
    <Card className="grid min-h-64 place-items-center border-dashed p-8 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-blue-50 text-xl font-black text-blue-600">+</div>
        <h2 className="mt-4 text-xl font-extrabold text-slate-950">{title}</h2>
        {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>}
        {actionLabel && actionTo && (
          <Button to={actionTo} className="mt-5">
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
