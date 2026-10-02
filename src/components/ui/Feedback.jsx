import React from "react";
import { AlertCircle, CheckCircle2, Inbox, Info, Loader2, Plus, TriangleAlert } from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import { cn } from "./utils";

const alertTones = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

const alertIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: TriangleAlert,
};

export function Alert({ tone = "info", children, className = "" }) {
  if (!children) return null;
  const Icon = alertIcons[tone] || Info;

  return (
    <div className={cn("flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-bold shadow-sm", alertTones[tone] || alertTones.info, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 leading-6">{children}</div>
    </div>
  );
}

export function LoadingState({ label = "Đang tải dữ liệu..." }) {
  return (
    <Card className="grid min-h-64 place-items-center border-dashed p-8">
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <p className="mt-4 text-sm font-extrabold text-slate-700">{label}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">Dữ liệu sẽ sẵn sàng trong giây lát.</p>
      </div>
    </Card>
  );
}

export function EmptyState({ title, description, actionLabel, actionTo }) {
  return (
    <Card className="grid min-h-64 place-items-center border-dashed bg-slate-50/80 p-8 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-white text-blue-600 ring-1 ring-blue-100">
          {actionLabel && actionTo ? <Plus className="h-7 w-7" /> : <Inbox className="h-7 w-7" />}
        </div>
        <h2 className="mt-4 text-xl font-extrabold text-slate-950">{title}</h2>
        {description && <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">{description}</p>}
        {actionLabel && actionTo && (
          <Button to={actionTo} className="mt-5">
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
