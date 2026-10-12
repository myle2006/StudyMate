import React from "react";
import { BookOpen, CheckCircle2, Clock3, Edit3, FileEdit, FileText, Layers3, Trash2, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button, IconIndicator } from "../../../components/ui";

export default function LessonCard({ lesson, to, admin = false, onDelete }) {
  const completed = lesson.progress_status === "completed";

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold uppercase text-blue-600">
            {lesson.subject_code} · {lesson.subject_name}
          </p>
          <h2 className="mt-1 line-clamp-2 text-lg font-black text-slate-950">{lesson.title}</h2>
        </div>
        {admin ? (
          <IconIndicator
            icon={lesson.status === "published" ? CheckCircle2 : FileEdit}
            label={lesson.status === "published" ? "Xuất bản" : "Nháp"}
            tone={lesson.status === "published" ? "green" : "amber"}
          />
        ) : (
          <Badge tone={completed ? "green" : "slate"}>{completed ? "Đã học" : "Chưa học"}</Badge>
        )}
      </div>

      <p className="mt-3 min-h-[4.5rem] line-clamp-3 text-sm font-semibold leading-6 text-slate-500">{lesson.content || "Chưa có mô tả nội dung."}</p>

      <div className="mt-4 flex min-h-8 flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
        {lesson.chapter && (
          <span className="inline-flex items-center gap-1.5"><Layers3 className="h-3.5 w-3.5" />{lesson.chapter}</span>
        )}
        {lesson.duration_minutes && (
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{lesson.duration_minutes} phút</span>
        )}
        {lesson.material_path && (admin ? <IconIndicator icon={FileText} label="Có tài liệu" size={14} /> : <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />Tài liệu</span>)}
        {lesson.video_url && (admin ? <IconIndicator icon={Video} label="Có video" size={14} /> : <span className="inline-flex items-center gap-1.5"><Video className="h-3.5 w-3.5" />Video</span>)}
        {completed && (
          <span className="inline-flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />Đã hoàn thành</span>
        )}
      </div>

      <div className={`mt-5 flex gap-2 border-t border-slate-100 pt-4 ${admin ? "justify-end" : ""}`}>
        <Button to={to} variant="secondary" size="sm" className={admin ? "!h-10 !w-10 !p-0" : "flex-1"} aria-label="Xem bài học" title="Xem bài học">
          <BookOpen className="h-4 w-4" />
          {!admin && <span>Xem</span>}
        </Button>
        {admin && (
          <>
            <Button to={`/admin/lessons/${lesson.id}/edit`} variant="secondary" size="sm" className="!h-10 !w-10 !p-0" aria-label="Sửa bài học" title="Sửa bài học">
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="danger" size="sm" className="!h-10 !w-10 !p-0" aria-label="Xóa bài học" title="Xóa bài học" onClick={() => onDelete?.(lesson)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
