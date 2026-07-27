import React from "react";
import { BookOpen, Eye, MessageSquareText, Star } from "lucide-react";
import { Button, Card } from "../../../components/ui";
import GradeStatusBadge from "./GradeStatusBadge";

function shortFeedback(value) {
  if (!value) return "Chưa có feedback.";
  return value.length > 120 ? `${value.slice(0, 120)}...` : value;
}

function scoreLabel(score) {
  return score !== null && score !== undefined ? `${Number(score).toFixed(1)}/10` : "Chưa có điểm";
}

export default function GradeCard({ submission }) {
  return (
    <Card className="flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase text-blue-600">
            {submission.subject_code} - {submission.subject_name}
          </p>
          <h2 className="mt-2 line-clamp-2 text-lg font-black text-slate-950">{submission.assignment_title}</h2>
        </div>
        <GradeStatusBadge submission={submission} />
      </div>

      <div className="mt-5 grid gap-3 text-sm">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Star size={16} className="text-amber-500" />
          <span>{scoreLabel(submission.score)}</span>
        </div>
        <div className="flex items-start gap-2 text-slate-600">
          <MessageSquareText size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <p className="line-clamp-2 leading-6">{shortFeedback(submission.feedback)}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
          <BookOpen size={15} />
          <span>Bài đã nộp</span>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <Button to={`/student/grades/${submission.id}`} variant="secondary" className="w-full">
          <Eye size={16} /> Xem chi tiết
        </Button>
      </div>
    </Card>
  );
}
