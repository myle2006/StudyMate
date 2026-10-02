import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Button, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { getLearningGoals } from "../../learningGoals/services/learningGoalService";
import { getMySubjects } from "../../studentSubjects/services/studentSubjectService";
import StudyScheduleForm from "../components/StudyScheduleForm";
import { createStudySchedule } from "../services/studyScheduleService";

function localToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildGoalInitialValues(goal) {
  if (!goal) return {};

  const today = localToday();
  const startDate = goal.start_date && goal.start_date >= today ? goal.start_date : today;

  return {
    subject_id: String(goal.subject_id || ""),
    title: `Học cho mục tiêu: ${goal.title}`,
    description: goal.goal_description || "",
    study_date: startDate,
    start_time: "19:00",
    end_time: "20:00",
    schedule_type: "self_study",
    status: "upcoming",
  };
}

export default function StudyScheduleCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const goalId = searchParams.get("goal_id") || "";
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [subjectResponse, goalResponse] = await Promise.all([
          getMySubjects(),
          goalId ? getLearningGoals() : Promise.resolve({ data: [] }),
        ]);
        const goals = goalResponse.data || [];
        const selectedGoal = goals.find((goal) => String(goal.id) === String(goalId));

        setSubjects(subjectResponse.data || []);
        setInitialValues(buildGoalInitialValues(selectedGoal));
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu tạo lịch học.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [goalId]);

  async function handleSubmit(data) {
    setSubmitting(true);
    setApiErrors({});
    setError("");

    try {
      await createStudySchedule(data);
      toast.success("Đã thêm lịch học.");
      navigate("/student/schedules");
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể thêm lịch học.");
      toast.error(err.message || "Không thể thêm lịch học.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Lịch học cá nhân"
        title="Thêm lịch học"
        description="Tạo một khung thời gian học tập mới và gắn với môn học tương ứng."
        actions={
          <Button to="/student/schedules" variant="secondary">
            <ArrowLeft size={16} /> Quay lại
          </Button>
        }
      />
      <Alert tone="error">{error}</Alert>
      {loading ? (
        <LoadingState label="Đang tải dữ liệu..." />
      ) : (
        <StudyScheduleForm
          subjects={subjects}
          initialValues={initialValues}
          submitting={submitting}
          apiErrors={apiErrors}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
