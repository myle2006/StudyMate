import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, PageHeader, useToast } from "../../../components/ui";
import SubjectForm from "../components/SubjectForm";
import { createSubject } from "../services/subjectService";

export default function SubjectCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  async function handleSubmit(formData) {
    setSubmitting(true);
    setApiErrors({});
    setError("");

    try {
      await createSubject(formData);
      toast.success("Thêm môn học thành công.");
      navigate("/admin/subjects", { state: { message: "Thêm môn học thành công." } });
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể thêm môn học.");
      toast.error(err.message || "Không thể thêm môn học.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Thêm môn học" description="Tạo môn học gốc để sinh viên xem và liên kết lịch học sau này." />
      <Alert tone="error" className="mt-6">{error}</Alert>
      <div className="mt-6">
        <SubjectForm mode="create" submitting={submitting} apiErrors={apiErrors} onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
