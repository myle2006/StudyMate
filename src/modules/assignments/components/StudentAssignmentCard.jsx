import React from "react";
import { Clock3, Eye, Send } from "lucide-react";
import { Button, Card } from "../../../components/ui";
import AssignmentStatusBadge, { getDeadlineState } from "./AssignmentStatusBadge";

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StudentAssignmentCard({ assignment }) {
  const deadlineState = getDeadlineState(assignment.deadline, assignment.status, assignment.submission_status);
  const toneClass = deadlineState.overdue
    ? "border-rose-300 bg-rose-50/70"
    : deadlineState.urgent
      ? "border-amber-300 bg-amber-50/70"
      : "border-slate-200/80 bg-white";

  return (
    <Card className={`flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase text-blue-600">{assignment.subject_code}</p>
          <h2 className="mt-2 line-clamp-2 text-lg font-black text-slate-950">{assignment.title}</h2>
          <p className="mt-2 line-clamp-1 text-sm font-bold text-slate-600">{assignment.subject_name}</p>
        </div>
        <AssignmentStatusBadge value={assignment.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <div className="flex items-center gap-2 font-semibold text-slate-600">
          <Clock3 size={16} />
          <span>Deadline: {formatDateTime(assignment.deadline)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <AssignmentStatusBadge type="submission" value={assignment.submission_status || "not_submitted"} />
          <AssignmentStatusBadge
            type="deadline"
            deadline={assignment.deadline}
            assignmentStatusValue={assignment.status}
            submissionStatusValue={assignment.submission_status || "not_submitted"}
          />
        </div>
      </div>

      <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
        {assignment.description || "Chưa có mô tả cho bài tập này."}
      </p>

      <div className="mt-auto grid gap-2">
        <Button to={`/student/assignments/${assignment.id}`} variant="secondary" className="w-full">
          <Eye size={16} /> Xem chi tiết
        </Button>
        <Button to={`/student/assignments/${assignment.id}/submit`} className="w-full" disabled={assignment.status === "closed"}>
          <Send size={16} /> {assignment.submission_id ? "Cập nhật bài nộp" : "Nộp bài"}
        </Button>
      </div>
    </Card>
  );
}
