import React from "react";
import { CalendarDays, Clock3, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge, Button, Card } from "../../../components/ui";

const statusMap = {
  active: { label: "Đang thực hiện", tone: "blue" },
  completed: { label: "Hoàn thành", tone: "green" },
  paused: { label: "Tạm dừng", tone: "amber" },
  cancelled: { label: "Đã hủy", tone: "rose" },
};

const levelMap = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function LearningGoalStatusBadge({ status }) {
  const config = statusMap[status] || { label: status || "Không rõ", tone: "slate" };
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

export function learningGoalLevelLabel(level) {
  return levelMap[level] || "Không rõ";
}

export default function LearningGoalCard({ goal, onDelete }) {
  return (
    <Card className="flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase text-blue-600">
            {goal.subject_code} - {goal.subject_name}
          </p>
          <h2 className="mt-2 line-clamp-2 text-lg font-black text-slate-950">{goal.title}</h2>
        </div>
        <LearningGoalStatusBadge status={goal.status} />
      </div>

      <p className="mt-4 line-clamp-3 min-h-16 text-sm leading-6 text-slate-600">
        {goal.goal_description}
      </p>

      <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <Clock3 size={16} />
          <span>{Number(goal.study_time_per_day).toFixed(1)} giờ/ngày · {learningGoalLevelLabel(goal.current_level)}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={16} />
          <span>{formatDate(goal.start_date)} - {formatDate(goal.end_date)}</span>
        </div>
      </div>

      <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-3">
        <Button to={`/student/learning-goals/${goal.id}`} variant="secondary" className="w-full">
          <Eye size={16} /> Chi tiết
        </Button>
        <Button to={`/student/learning-goals/${goal.id}/edit`} className="w-full">
          <Pencil size={16} /> Sửa
        </Button>
        <Button type="button" variant="danger" className="w-full" onClick={() => onDelete?.(goal)}>
          <Trash2 size={16} /> Xóa
        </Button>
      </div>
    </Card>
  );
}
