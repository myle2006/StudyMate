import React from "react";
import { BookOpen, CheckCircle2, Clock3, FileText, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button } from "../../../components/ui";

export default function LessonCard({ lesson, to, admin = false, onDelete }) {
  const completed = lesson.progress_status === "completed";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold uppercase text-blue-600">
            {lesson.subject_code} · {lesson.subject_name}
          </p>
          <h2 className="mt-1 line-clamp-2 text-lg font-black text-slate-950">{lesson.title}</h2>
        </div>
        <Badge tone={admin ? (lesson.status === "published" ? "green" : "amber") : (completed ? "green" : "slate")}>
          {admin ? (lesson.status === "published" ? "Xuất bản" : "Nháp") : (completed ? "Đã học" : "Chưa học")}
        </Badge>
      </div>

      <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-slate-500">{lesson.content || "Chưa có mô tả nội dung."}</p>

      <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
        {lesson.duration_minutes && (
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{lesson.duration_minutes} phút</span>
        )}
        {lesson.material_path && (
          <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />Tài liệu</span>
        )}
        {lesson.video_url && (
          <span className="inline-flex items-center gap-1.5"><Video className="h-3.5 w-3.5" />Video</span>
        )}
        {completed && (
          <span className="inline-flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />Đã hoàn thành</span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button to={to} variant="secondary" size="sm">
          <BookOpen className="h-4 w-4" />
          Xem
        </Button>
        {admin && (
          <>
            <Button to={`/admin/lessons/${lesson.id}/edit`} variant="secondary" size="sm">Sửa</Button>
            <Button type="button" variant="danger" size="sm" onClick={() => onDelete?.(lesson)}>Xóa</Button>
          </>
        )}
      </div>
    </article>
  );
}
