import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { getSubjects } from "../../subjects/services/subjectService";
import { getAssignmentById, updateAssignment } from "../services/assignmentService";
import AssignmentForm from "../components/AssignmentForm";

export default function AdminAssignmentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [assignment, setAssignment] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [assignmentResponse, subjectsResponse] = await Promise.all([
          getAssignmentById(id),
          getSubjects(),
        ]);
        setAssignment(assignmentResponse.data);
        setSubjects(subjectsResponse.data || []);
      } catch (err) {
        setError(err.message || "Không thể tải bài tập.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function handleSubmit(formData) {
    setSubmitting(true);
    setApiErrors({});
    setError("");

    try {
      await updateAssignment(id, formData);
      toast.success("Cập nhật bài tập thành công.");
      navigate("/admin/assignments", { state: { message: "Cập nhật bài tập thành công." } });
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể cập nhật bài tập.");
      toast.error(err.message || "Không thể cập nhật bài tập.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Sửa bài tập" description="Cập nhật nội dung, deadline, file đính kèm hoặc trạng thái bài tập." />
      <div className="mt-6">
        {loading ? (
          <LoadingState label="Đang tải bài tập..." />
        ) : error && !assignment ? (
          <Alert tone="error">{error}</Alert>
        ) : (
          <>
            <Alert tone="error" className="mb-4">{error}</Alert>
            <AssignmentForm
              mode="edit"
              subjects={subjects}
              initialValues={assignment}
              submitting={submitting}
              apiErrors={apiErrors}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </div>
    </main>
  );
}
