import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Edit3, ExternalLink, FileEdit, Paperclip, Video } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button, Card, IconIndicator, LoadingState, PageHeader } from "../../../components/ui";
import { downloadProtectedFile } from "../../../utils/downloadFile";
import { getAdminLessonById } from "../services/lessonService";

export default function AdminLessonDetailPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLesson() {
      setLoading(true);
      setError("");
      try {
        const response = await getAdminLessonById(id);
        setLesson(response.data);
      } catch (err) {
        setError(err.message || "Không thể tải bài học.");
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [id]);

  if (loading) return <LoadingState label="Đang tải bài học..." />;

  if (error || !lesson) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Không tìm thấy bài học" description={error || "Bài học không tồn tại."} actions={<Button to="/admin/lessons" variant="secondary"><ArrowLeft className="h-4 w-4" />Quay lại</Button>} />
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow={`${lesson.subject_code} - ${lesson.subject_name}`}
          title={lesson.title}
          description="Chi tiết nội dung, tài liệu và liên kết bài học."
          actions={
            <>
              <Button to="/admin/lessons" variant="secondary"><ArrowLeft className="h-4 w-4" />Quay lại</Button>
              <Button to={`/admin/lessons/${lesson.id}/edit`}><Edit3 className="h-4 w-4" />Sửa</Button>
            </>
          }
        />

        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <IconIndicator
              icon={lesson.status === "published" ? CheckCircle2 : FileEdit}
              label={lesson.status === "published" ? "Xuất bản" : "Nháp"}
              tone={lesson.status === "published" ? "green" : "amber"}
            />
            <span className="text-sm font-bold text-slate-500">{lesson.duration_minutes ? `${lesson.duration_minutes} phút` : "Chưa nhập thời lượng"}</span>
            <span className="text-sm font-bold text-slate-500">{lesson.completed_count || 0} sinh viên đã học</span>
          </div>
          <p className="mt-6 whitespace-pre-line text-sm leading-7 text-slate-700">{lesson.content || "Chưa có nội dung."}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {lesson.material_path && <Button type="button" variant="secondary" aria-label="Tải tài liệu bài học" title="Tải tài liệu bài học" className="!h-11 !w-11 !p-0" onClick={() => downloadProtectedFile(lesson.material_path)}><Paperclip className="h-4 w-4" /></Button>}
            {lesson.video_url && <Button as="a" href={lesson.video_url} target="_blank" rel="noreferrer" variant="secondary" aria-label="Mở video bài học" title="Mở video bài học" className="!h-11 !w-11 !p-0"><Video className="h-4 w-4" /></Button>}
            {lesson.external_url && <Button as="a" href={lesson.external_url} target="_blank" rel="noreferrer" variant="secondary" aria-label="Mở link tham khảo" title="Mở link tham khảo" className="!h-11 !w-11 !p-0"><ExternalLink className="h-4 w-4" /></Button>}
          </div>
        </Card>
      </div>
    </main>
  );
}
