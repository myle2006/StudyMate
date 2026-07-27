import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { getMySubjects } from "../../studentSubjects/services/studentSubjectService";
import LearningGoalForm from "../components/LearningGoalForm";
import { getLearningGoalById, updateLearningGoal } from "../services/learningGoalService";

export default function LearningGoalEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [goal, setGoal] = useState(null);
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
        const [goalResponse, subjectsResponse] = await Promise.all([
          getLearningGoalById(id),
          getMySubjects(),
        ]);
        setGoal(goalResponse.data);
        setSubjects(subjectsResponse.data || []);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu mục tiêu học tập.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function handleSubmit(data) {
    setSubmitting(true);
    setApiErrors({});
    setError("");

    try {
      await updateLearningGoal(id, data);
      toast.success("Cập nhật mục tiêu học tập thành công.");
      navigate(`/student/learning-goals/${id}`);
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể cập nhật mục tiêu học tập.");
      toast.error(err.message || "Không thể cập nhật mục tiêu học tập.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState label="Đang tải mục tiêu học tập..." />;
  }

  if (error || !goal) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Mục tiêu học tập"
          title="Không thể chỉnh sửa"
          description={error || "Mục tiêu không tồn tại hoặc không thuộc tài khoản của bạn."}
          actions={
            <Button to="/student/learning-goals" variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          title="Cập nhật mục tiêu học tập"
          description="Điều chỉnh mục tiêu, trạng thái, ngày học và thời gian học mỗi ngày."
        />
        <Alert tone="error">{error}</Alert>
        <LearningGoalForm
          mode="edit"
          subjects={subjects}
          initialValues={goal}
          submitting={submitting}
          apiErrors={apiErrors}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
