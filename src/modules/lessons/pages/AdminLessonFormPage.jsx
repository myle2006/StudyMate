import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { getSubjects } from "../../subjects/services/subjectService";
import { createLesson, getAdminLessonById, updateLesson } from "../services/lessonService";
import LessonForm from "../components/LessonForm";

export default function AdminLessonFormPage({ mode = "create" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [lesson, setLesson] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const subjectPromise = getSubjects();
        const lessonPromise = mode === "edit" ? getAdminLessonById(id) : Promise.resolve({ data: {} });
        const [subjectResponse, lessonResponse] = await Promise.all([subjectPromise, lessonPromise]);
        setSubjects(subjectResponse.data || []);
        setLesson(lessonResponse.data || {});
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu form bài học.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, mode]);

  async function handleSubmit(formData) {
    setSubmitting(true);
    setApiErrors({});
    setError("");

    try {
      if (mode === "edit") {
        await updateLesson(id, formData);
        toast.success("Cập nhật bài học thành công.");
      } else {
        await createLesson(formData);
        toast.success("Tạo bài học thành công.");
      }
      navigate("/admin/lessons");
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể lưu bài học.");
      toast.error(err.message || "Không thể lưu bài học.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title={mode === "edit" ? "Cập nhật bài học" : "Tạo bài học"}
        description="Thêm nội dung, tài liệu, video hoặc link tham khảo theo môn học."
      />
      <Alert tone="error" className="mt-6">{error}</Alert>
      <div className="mt-6">
        {loading ? (
          <LoadingState label="Đang tải dữ liệu form bài học..." />
        ) : (
          <LessonForm mode={mode} subjects={subjects} initialValues={lesson} submitting={submitting} apiErrors={apiErrors} onSubmit={handleSubmit} />
        )}
      </div>
    </main>
  );
}
