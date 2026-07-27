import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { getMySubjects } from "../../studentSubjects/services/studentSubjectService";
import LearningGoalForm from "../components/LearningGoalForm";
import { createLearningGoal } from "../services/learningGoalService";

export default function LearningGoalCreatePage() {
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
        const response = await getMySubjects();
        setSubjects(response.data || []);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách môn học của tôi.");
      } finally {
        setLoading(false);
      }
    }

    loadSubjects();
  }, []);

  async function handleSubmit(data) {
    setSubmitting(true);
    setApiErrors({});
    setError("");

    try {
      const response = await createLearningGoal(data);
      toast.success("Tạo mục tiêu học tập thành công.");
      navigate(`/student/learning-goals/${response.data.id}`);
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể tạo mục tiêu học tập.");
      toast.error(err.message || "Không thể tạo mục tiêu học tập.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          title="Tạo mục tiêu học tập"
          description="Khai báo mục tiêu, trình độ và quỹ thời gian để StudyMate AI có dữ liệu tạo lộ trình học."
        />
        <Alert tone="error">{error}</Alert>
        {!loading && subjects.length === 0 && (
          <Alert tone="warning">Bạn cần được admin gán vào ít nhất một môn học trước khi tạo mục tiêu.</Alert>
        )}
        {loading ? (
          <LoadingState label="Đang tải dữ liệu form..." />
        ) : (
          <LearningGoalForm
            mode="create"
            subjects={subjects}
            submitting={submitting}
            apiErrors={apiErrors}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </main>
  );
}
