import React, { useEffect, useMemo, useState } from "react";
import { Alert, Card, EmptyState, LoadingState, PageHeader, Select } from "../../../components/ui";
import { getMySubjects } from "../../studentSubjects/services/studentSubjectService";
import { getStudentAssignments } from "../services/assignmentService";
import StudentAssignmentCard from "../components/StudentAssignmentCard";

export default function StudentAssignmentListPage() {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ subject_id: "", status: "", deadline: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const [assignmentsResponse, subjectsResponse] = await Promise.all([
        getStudentAssignments(nextFilters),
        getMySubjects(),
      ]);
      setAssignments(assignmentsResponse.data || []);
      setSubjects(subjectsResponse.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách bài tập của tôi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData(filters);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [filters.subject_id, filters.status, filters.deadline]);

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  const summary = useMemo(() => {
    const overdue = assignments.filter((assignment) => {
      const deadline = new Date(String(assignment.deadline).replace(" ", "T"));
      return assignment.status === "open" && (assignment.submission_status || "not_submitted") === "not_submitted" && deadline.getTime() < Date.now();
    }).length;

    return `${assignments.length} bài tập đang hiển thị${overdue ? `, ${overdue} bài quá hạn` : ""}.`;
  }, [assignments]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="StudyMate AI"
          title="Bài tập của tôi"
          description={summary}
        />

        <Card className="grid gap-3 p-4 md:grid-cols-3">
          <Select value={filters.subject_id} onChange={(event) => updateFilter("subject_id", event.target.value)} className="mt-0">
            <option value="">Tất cả môn học</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.subject_code} - {subject.subject_name}
              </option>
            ))}
          </Select>

          <Select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} className="mt-0">
            <option value="">Tất cả trạng thái</option>
            <option value="open">Đang mở</option>
            <option value="closed">Đã đóng</option>
          </Select>

          <Select value={filters.deadline} onChange={(event) => updateFilter("deadline", event.target.value)} className="mt-0">
            <option value="">Tất cả deadline</option>
            <option value="overdue">Quá hạn</option>
            <option value="near">Gần deadline</option>
            <option value="today">Hôm nay</option>
            <option value="upcoming">Còn hạn</option>
          </Select>
        </Card>

        <Alert tone="error">{error}</Alert>

        {loading ? (
          <LoadingState label="Đang tải bài tập của tôi..." />
        ) : assignments.length === 0 ? (
          <EmptyState title="Chưa có bài tập" description="Bài tập thuộc các môn học bạn được gán sẽ hiển thị tại đây." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment) => (
              <StudentAssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
