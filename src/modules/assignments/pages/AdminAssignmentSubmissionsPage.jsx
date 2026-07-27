import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams } from "react-router-dom";
import { Alert, Button, Card, LoadingState, PageHeader, Select } from "../../../components/ui";
import { getAssignmentById } from "../services/assignmentService";
import { getAdminAssignmentSubmissions } from "../services/submissionService";
import SubmissionTable from "../components/SubmissionTable";

export default function AdminAssignmentSubmissionsPage() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [filters, setFilters] = useState({ status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const [assignmentResponse, submissionsResponse] = await Promise.all([
        getAssignmentById(assignmentId),
        getAdminAssignmentSubmissions(assignmentId, nextFilters),
      ]);
      setAssignment(assignmentResponse.data);
      setSubmissions(submissionsResponse.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách bài nộp.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData({ status: "" });
  }, [assignmentId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData(filters);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [filters.status]);

  const summary = useMemo(() => {
    const counts = submissions.reduce((acc, item) => {
      acc[item.submission_status] = (acc[item.submission_status] || 0) + 1;
      return acc;
    }, {});

    return `${submissions.length} sinh viên đang hiển thị. Chưa nộp: ${counts.not_submitted || 0}, đã nộp: ${counts.submitted || 0}, nộp trễ: ${counts.late || 0}, đã chấm: ${counts.graded || 0}.`;
  }, [submissions]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={assignment ? `${assignment.subject_code} - ${assignment.subject_name}` : "Bài nộp"}
        title="Bài nộp của sinh viên"
        description={assignment ? `${assignment.title}. ${summary}` : summary}
        actions={
          <Button to="/admin/assignments" variant="secondary">
            <ArrowLeft size={16} /> Quay lại
          </Button>
        }
      />

      <Card className="mt-6 max-w-sm p-4">
        <Select value={filters.status} onChange={(event) => setFilters({ status: event.target.value })} className="mt-0">
          <option value="">Tất cả trạng thái</option>
          <option value="not_submitted">Chưa nộp</option>
          <option value="submitted">Đã nộp</option>
          <option value="late">Nộp trễ</option>
          <option value="graded">Đã chấm</option>
        </Select>
      </Card>

      <Alert tone="error" className="mt-4">{error}</Alert>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Đang tải danh sách bài nộp..." />
        ) : (
          <SubmissionTable submissions={submissions} />
        )}
      </div>
    </main>
  );
}
