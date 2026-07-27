import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { getSubjects } from "../../subjects/services/subjectService";
import { createAssignment } from "../services/assignmentService";
import AssignmentForm from "../components/AssignmentForm";

export default function AdminAssignmentCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubjects() {
      setLoading(true);
      setError("");

      try {
        const response = await getSubjects();
        setSubjects(response.data || []);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách môn học.");
      } finally {
        setLoading(false);
      }
    }

    loadSubjects();
  }, []);

  async function handleSubmit(formData) {
    setSubmitting(true);
    setApiErrors({});
    setError("");

    try {
      await createAssignment(formData);
      toast.success("Tạo bài tập thành công.");
      navigate("/admin/assignments", { state: { message: "Tạo bài tập thành công." } });
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể tạo bài tập.");
      toast.error(err.message || "Không thể tạo bài tập.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Tạo bài tập" description="Tạo bài tập theo môn học và đặt deadline cho sinh viên." />
      <Alert tone="error" className="mt-6">{error}</Alert>
      <div className="mt-6">
        {loading ? (
          <LoadingState label="Đang tải dữ liệu form..." />
        ) : (
          <AssignmentForm mode="create" subjects={subjects} submitting={submitting} apiErrors={apiErrors} onSubmit={handleSubmit} />
        )}
      </div>
    </main>
  );
}
