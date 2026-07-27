import React, { useEffect, useState } from "react";
import { Alert, EmptyState, LoadingState, PageHeader } from "../../../components/ui";
import StudentSubjectCard from "../components/StudentSubjectCard";
import StudentSubjectFilter from "../components/StudentSubjectFilter";
import { getMySubjects } from "../services/studentSubjectService";

export default function MySubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSubjects(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const response = await getMySubjects(nextFilters);
      setSubjects(response.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách môn học của tôi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSubjects(filters);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [filters.keyword, filters.status]);

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="StudyMate AI"
          title="Môn học của tôi"
          description="Danh sách môn học bạn đã được Admin gán để theo dõi nội dung học tập cá nhân."
        />

        <StudentSubjectFilter filters={filters} onChange={updateFilter} />
        <Alert tone="error">{error}</Alert>

        {loading ? (
          <LoadingState label="Đang tải môn học của tôi..." />
        ) : subjects.length === 0 ? (
          <EmptyState title="Bạn chưa được gán vào môn học nào." description="Khi Admin gán môn học, danh sách của bạn sẽ hiển thị tại đây." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <StudentSubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
