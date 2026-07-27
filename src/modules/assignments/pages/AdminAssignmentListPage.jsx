import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Alert, Button, ConfirmDialog, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { getSubjects } from "../../subjects/services/subjectService";
import { deleteAssignment, getAssignments } from "../services/assignmentService";
import AssignmentFilter from "../components/AssignmentFilter";
import AssignmentTable from "../components/AssignmentTable";

export default function AdminAssignmentListPage() {
  const location = useLocation();
  const toast = useToast();
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", subject_id: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(location.state?.message || "");
  const [error, setError] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadData(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const [assignmentsResponse, subjectsResponse] = await Promise.all([
        getAssignments(nextFilters),
        getSubjects(),
      ]);
      setAssignments(assignmentsResponse.data || []);
      setSubjects(subjectsResponse.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách bài tập.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData(filters);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [filters.keyword, filters.subject_id, filters.status]);

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  async function confirmDelete() {
    if (!selectedAssignment) return;

    setDeleting(true);
    setError("");

    try {
      const response = await deleteAssignment(selectedAssignment.id);
      const successMessage = response.message || "Xóa bài tập thành công.";
      setMessage(successMessage);
      toast.success(successMessage);
      setSelectedAssignment(null);
      await loadData(filters);
    } catch (err) {
      const nextError = err.message || "Không thể xóa bài tập.";
      setError(nextError);
      toast.error(nextError);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Quản lý bài tập"
        description={`${assignments.length} bài tập đang hiển thị. Admin có thể giao deadline theo từng môn học.`}
        actions={
          <Button to="/admin/assignments/create">
            <Plus size={16} /> Tạo bài tập
          </Button>
        }
      />

      <div className="mt-6">
        <AssignmentFilter filters={filters} subjects={subjects} onChange={updateFilter} />
      </div>

      <Alert tone="success" className="mt-4">{message}</Alert>
      <Alert tone="error" className="mt-4">{error}</Alert>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Đang tải danh sách bài tập..." />
        ) : (
          <AssignmentTable assignments={assignments} onDelete={setSelectedAssignment} />
        )}
      </div>

      <ConfirmDialog
        open={Boolean(selectedAssignment)}
        title="Xóa bài tập"
        description={selectedAssignment ? `Bạn có chắc muốn xóa bài tập "${selectedAssignment.title}"? Dữ liệu sẽ được soft delete.` : ""}
        confirmLabel="Xóa bài tập"
        danger
        loading={deleting}
        onCancel={() => setSelectedAssignment(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}
