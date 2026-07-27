import React, { useEffect, useMemo, useState } from "react";
import { Alert, EmptyState, LoadingState, PageHeader } from "../../../components/ui";
import GradeCard from "../components/GradeCard";
import { getStudentGrades } from "../services/submissionService";

export default function StudentGradesPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGrades() {
      setLoading(true);
      setError("");

      try {
        const response = await getStudentGrades();
        setSubmissions(response.data || []);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách điểm và feedback.");
      } finally {
        setLoading(false);
      }
    }

    loadGrades();
  }, []);

  const summary = useMemo(() => {
    const gradedCount = submissions.filter((submission) => submission.status === "graded" || submission.score != null).length;
    return `${submissions.length} bài đã nộp, ${gradedCount} bài đã được chấm.`;
  }, [submissions]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="StudyMate AI"
          title="Điểm và feedback"
          description={submissions.length ? summary : "Theo dõi điểm, nhận xét và trạng thái chấm bài của bạn."}
        />

        <Alert tone="error">{error}</Alert>

        {loading ? (
          <LoadingState label="Đang tải điểm và feedback..." />
        ) : submissions.length === 0 ? (
          <EmptyState title="Chưa có bài nộp" description="Các bài đã nộp và kết quả chấm sẽ hiển thị tại đây." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {submissions.map((submission) => (
              <GradeCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
