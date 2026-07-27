import React from "react";
import { Badge } from "../../../components/ui";

export default function GradeStatusBadge({ submission }) {
  const isGraded = submission?.status === "graded" || (submission?.score !== null && submission?.score !== undefined);

  if (isGraded) {
    return <Badge tone="green">Đã chấm</Badge>;
  }

  return <Badge tone="amber">Chưa được chấm</Badge>;
}
