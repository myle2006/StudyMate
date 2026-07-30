import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Download, ExternalLink, Video } from "lucide-react";
import { useParams } from "react-router-dom";
import { Alert, Badge, Button, Card, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { completeLesson, getStudentLessonById } from "../services/lessonService";

export default function StudentLessonDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  async function loadLesson() {
    setLoading(true);
    setError("");

    try {
      const response = await getStudentLessonById(id);
      setLesson(response.data);
    } catch (err) {
      setError(err.message || "Không thể tải bài học.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLesson();
  }, [id]);

  async function handleComplete() {
    setCompleting(true);
    setError("");

    try {
      const response = await completeLesson(id);
      setLesson(response.data);
      toast.success("Đã đánh dấu bài học là đã học.");
    } catch (err) {
      setError(err.message || "Không thể cập nhật tiến độ bài học.");
      toast.error(err.message || "Không thể cập nhật tiến độ bài học.");
    } finally {
      setCompleting(false);
    }
  }

  if (loading) return <LoadingState label="Đang tải bài học..." />;

  if (error || !lesson) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Không tìm thấy bài học" description={error || "Bài học không tồn tại."} actions={<Button to="/student/lessons" variant="secondary"><ArrowLeft className="h-4 w-4" />Quay lại</Button>} />
      </main>
    );
  }

  const completed = lesson.progress_status === "completed";

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow={`${lesson.subject_code} - ${lesson.subject_name}`}
          title={lesson.title}
          description="Xem tài liệu, video/link và đánh dấu hoàn thành khi đã học xong."
          actions={
            <>
              <Button to="/student/lessons" variant="secondary"><ArrowLeft className="h-4 w-4" />Quay lại</Button>
              <Button type="button" onClick={handleComplete} disabled={completed || completing}>
                <CheckCircle2 className="h-4 w-4" />
                {completed ? "Đã học" : completing ? "Đang lưu..." : "Đánh dấu đã học"}
              </Button>
            </>
          }
        />

        <Alert tone="error">{error}</Alert>

        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={completed ? "green" : "slate"}>{completed ? "Đã học" : "Chưa học"}</Badge>
            <span className="text-sm font-bold text-slate-500">{lesson.duration_minutes ? `${lesson.duration_minutes} phút` : "Chưa nhập thời lượng"}</span>
            {lesson.completed_at && <span className="text-sm font-bold text-slate-500">Hoàn thành: {lesson.completed_at}</span>}
          </div>

          <p className="mt-6 whitespace-pre-line text-sm leading-7 text-slate-700">{lesson.content || "Chưa có nội dung."}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {lesson.material_path && <Button as="a" href={lesson.material_path} target="_blank" rel="noreferrer" variant="secondary"><Download className="h-4 w-4" />Tải tài liệu</Button>}
            {lesson.video_url && <Button as="a" href={lesson.video_url} target="_blank" rel="noreferrer" variant="secondary"><Video className="h-4 w-4" />Mở video</Button>}
            {lesson.external_url && <Button as="a" href={lesson.external_url} target="_blank" rel="noreferrer" variant="secondary"><ExternalLink className="h-4 w-4" />Link tham khảo</Button>}
          </div>
        </Card>
      </div>
    </main>
  );
}
