import React, { useEffect, useState } from "react";
import { Alert, Card, EmptyState, Input, LoadingState, PageHeader, Select } from "../../../components/ui";
import { getMySubjects } from "../../studentSubjects/services/studentSubjectService";
import { getStudentLessons } from "../services/lessonService";
import LessonCard from "../components/LessonCard";

export default function StudentLessonListPage() {
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", subject_id: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const [lessonResponse, subjectResponse] = await Promise.all([
        getStudentLessons(nextFilters),
        getMySubjects(),
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
  }, [filters.keyword, filters.subject_id]);

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Lessons"
          title="Bài học của tôi"
          description={`${lessons.length} bài học đang hiển thị từ các môn học bạn được gán.`}
        />

        <Card className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_260px]">
          <Input value={filters.keyword} onChange={(event) => updateFilter("keyword", event.target.value)} placeholder="Tìm bài học, môn học..." className="mt-0" />
          <Select value={filters.subject_id} onChange={(event) => updateFilter("subject_id", event.target.value)} className="mt-0">
            <option value="">Tất cả môn học</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.subject_code} - {subject.subject_name}</option>
            ))}
          </Select>
        </Card>

        <Alert tone="error">{error}</Alert>

        {loading ? (
          <LoadingState label="Đang tải bài học..." />
        ) : lessons.length === 0 ? (
          <EmptyState title="Chưa có bài học" description="Bài học đã xuất bản trong các môn của bạn sẽ hiển thị tại đây." />
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} to={`/student/lessons/${lesson.id}`} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
