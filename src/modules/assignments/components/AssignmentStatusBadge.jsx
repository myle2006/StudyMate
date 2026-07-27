import React from "react";
import { Badge } from "../../../components/ui";

const assignmentStatus = {
  open: { label: "Đang mở", tone: "green" },
  closed: { label: "Đã đóng", tone: "slate" },
  draft: { label: "Nháp", tone: "amber" },
};

const submissionStatus = {
  submitted: { label: "Đã nộp", tone: "green" },
  graded: { label: "Đã chấm", tone: "blue" },
  not_submitted: { label: "Chưa nộp", tone: "amber" },
  late: { label: "Nộp muộn", tone: "rose" },
};

export function getDeadlineState(deadline, assignmentStatusValue = "open", submissionStatusValue = "not_submitted") {
  const date = deadline ? new Date(String(deadline).replace(" ", "T")) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return { key: "unknown", label: "Không rõ", tone: "slate", urgent: false, overdue: false };
  }

  if (submissionStatusValue === "submitted" || submissionStatusValue === "graded") {
    return { key: "done", label: "Đã xử lý", tone: "green", urgent: false, overdue: false };
  }

  const now = Date.now();
  const diff = date.getTime() - now;
  const nearLimit = 3 * 24 * 60 * 60 * 1000;

  if (assignmentStatusValue === "open" && diff < 0) {
    return { key: "overdue", label: "Quá hạn", tone: "rose", urgent: false, overdue: true };
  }

  if (assignmentStatusValue === "open" && diff <= nearLimit) {
    return { key: "near", label: "Gần deadline", tone: "amber", urgent: true, overdue: false };
  }

  return { key: "upcoming", label: "Còn hạn", tone: "blue", urgent: false, overdue: false };
}

export default function AssignmentStatusBadge({ type = "assignment", value, deadline, assignmentStatusValue, submissionStatusValue }) {
  if (type === "deadline") {
    const state = getDeadlineState(deadline, assignmentStatusValue, submissionStatusValue);
    return <Badge tone={state.tone}>{state.label}</Badge>;
  }

  const config = type === "submission"
    ? submissionStatus[value] || submissionStatus.not_submitted
    : assignmentStatus[value] || { label: value || "Không rõ", tone: "slate" };

  return <Badge tone={config.tone}>{config.label}</Badge>;
}
