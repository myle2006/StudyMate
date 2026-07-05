import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, LoadingState, PageHeader, useToast } from "../../../components/ui";
import SubjectForm from "../components/SubjectForm";
import { getSubjectById, updateSubject } from "../services/subjectService";

export default function SubjectEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubject() {
      setLoading(true);
      setError("");

      try {
        const response = await getSubjectById(id);
        setSubject(response.data);
      } catch (err) {
        setError(err.message || "Không thể tải môn học.");
      } finally {
        setLoading(false);
      }
    }

    loadSubject();
  }, [id]);

  async function handleSubmit(formData) {
    setSubmitting(true);
    setApiErrors({});
    setError("");

    try {
      await updateSubject(id, formData);
      toast.success("Cập nhật môn học thành công.");
      navigate("/admin/subjects", { state: { message: "Cập nhật môn học thành công." } });
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể cập nhật môn học.");
      toast.error(err.message || "Không thể cập nhật môn học.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Sửa môn học" description="Mã môn học được khóa để tránh ảnh hưởng dữ liệu liên kết." />
      <div className="mt-6">
        {loading ? (
          <LoadingState label="Đang tải môn học..." />
        ) : error && !subject ? (
          <Alert tone="error">{error}</Alert>
        ) : (
          <>
            <Alert tone="error" className="mb-4">{error}</Alert>
            <SubjectForm mode="edit" initialValues={subject} submitting={submitting} apiErrors={apiErrors} onSubmit={handleSubmit} />
          </>
        )}
      </div>
    </main>
  );
}
