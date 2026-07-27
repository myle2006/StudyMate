import React from "react";
import { Badge } from "../../../components/ui";

const config = {
  not_submitted: { label: "Chưa nộp", tone: "amber" },
  submitted: { label: "Đã nộp", tone: "green" },
  late: { label: "Nộp trễ", tone: "rose" },
  graded: { label: "Đã chấm", tone: "blue" },
};

export default function SubmissionStatusBadge({ status }) {
  const item = config[status] || { label: status || "Không rõ", tone: "slate" };

  return <Badge tone={item.tone}>{item.label}</Badge>;
}
