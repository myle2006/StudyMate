import React from "react";
import { CheckCircle2, Clock3, FileCheck2, Send } from "lucide-react";
import { IconIndicator } from "../../../components/ui";

const config = {
  not_submitted: { label: "Chưa nộp", tone: "amber", icon: Clock3 },
  submitted: { label: "Đã nộp", tone: "green", icon: Send },
  late: { label: "Nộp trễ", tone: "rose", icon: Clock3 },
  graded: { label: "Đã chấm", tone: "blue", icon: FileCheck2 },
};

export default function SubmissionStatusBadge({ status }) {
  const item = config[status] || { label: status || "Không rõ", tone: "slate", icon: CheckCircle2 };

  return <IconIndicator icon={item.icon} label={item.label} tone={item.tone} />;
}
