import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Alert, Button, Card, ConfirmDialog, EmptyState, Input, LoadingState, PageHeader, Select, useToast } from "../../../components/ui";
import { getSubjects } from "../../subjects/services/subjectService";
import { deleteLesson, getAdminLessons } from "../services/lessonService";
import LessonCard from "../components/LessonCard";

export default function AdminLessonListPage() {
  const toast = useToast();
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", subject_id: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingLesson, setDeletingLesson] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const [lessonResponse, subjectResponse] = await Promise.all([
        getAdminLessons(nextFilters),
        getSubjects(),
      ]);
      setLessons(lessonResponse.data || []);
      setSubjects(subjectResponse.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách bài học.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => loadData(filters), 250);
    return () => window.clearTimeout(timer);
  }, [filters.keyword, filters.subject_id, filters.status]);

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  async function confirmDelete() {
    if (!deletingLesson) return;
    setDeleting(true);
    setError("");

    try {
      await deleteLesson(deletingLesson.id);
      toast.success("Xóa bài học thành công.");
      setDeletingLesson(null);
      await loadData(filters);
    } catch (err) {
      setError(err.message || "Không thể xóa bài học.");
      toast.error(err.message || "Không thể xóa bài học.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          title="Quản lý bài học"
          description={`${lessons.length} bài học đang hiển thị. Admin có thể upload tài liệu, thêm video/link và xuất bản theo môn học.`}
          actions={<Button to="/admin/lessons/create"><Plus className="h-4 w-4" />Tạo bài học</Button>}
        />

        <Card className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_240px_180px]">
          <Input value={filters.keyword} onChange={(event) => updateFilter("keyword", event.target.value)} placeholder="Tìm bài học, môn học..." className="mt-0" />
          <Select value={filters.subject_id} onChange={(event) => updateFilter("subject_id", event.target.value)} className="mt-0">
            <option value="">Tất cả môn học</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.subject_code} - {subject.subject_name}</option>
            ))}
          </Select>
          <Select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} className="mt-0">
            <option value="">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="published">Xuất bản</option>
          </Select>
        </Card>

        <Alert tone="error">{error}</Alert>

        {loading ? (
          <LoadingState label="Đang tải bài học..." />
        ) : lessons.length === 0 ? (
          <EmptyState title="Chưa có bài học" description="Tạo bài học đầu tiên để sinh viên có tài liệu học theo môn." actionLabel="Tạo bài học" actionTo="/admin/lessons/create" />
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} to={`/admin/lessons/${lesson.id}`} admin onDelete={setDeletingLesson} />
            ))}
          </section>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deletingLesson)}
        title="Xóa bài học"
        description={deletingLesson ? `Bạn có chắc muốn xóa bài học "${deletingLesson.title}"?` : ""}
        confirmLabel="Xóa bài học"
        danger
        loading={deleting}
        onCancel={() => setDeletingLesson(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}
