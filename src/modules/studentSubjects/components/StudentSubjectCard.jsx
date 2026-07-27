import React from "react";
import { Eye } from "lucide-react";
import { Badge, Button, Card } from "../../../components/ui";

const statusConfig = {
  studying: { label: "Đang học", tone: "blue" },
  paused: { label: "Tạm dừng", tone: "amber" },
  completed: { label: "Hoàn thành", tone: "green" },
};

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function StudentSubjectCard({ subject }) {
  const status = statusConfig[subject.status] || { label: subject.status || "Không rõ", tone: "slate" };

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-video overflow-hidden" style={{ backgroundColor: subject.color || "#2563EB" }}>
        {subject.image ? (
          <img src={subject.image} alt={subject.subject_name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-white">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 text-3xl font-black ring-1 ring-white/25">
              {(subject.subject_name || "M").charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-black uppercase text-blue-600">{subject.subject_code}</p>
            <h2 className="mt-2 line-clamp-2 text-lg font-black text-slate-950">{subject.subject_name}</h2>
          </div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>

        <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-500">
          <p>{subject.credits ?? 3} tín chỉ</p>
          <p>Ngày được gán: {formatDate(subject.assigned_at)}</p>
        </div>

        <Button to={`/student/my-subjects/${subject.id}`} variant="secondary" className="mt-auto w-full">
          <Eye size={16} /> Xem chi tiết
        </Button>
      </div>
    </Card>
  );
}
