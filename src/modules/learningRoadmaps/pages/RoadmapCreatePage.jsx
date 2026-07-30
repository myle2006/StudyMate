import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { getLearningGoals } from "../../learningGoals/services/learningGoalService";
import { getMySubjects } from "../../studentSubjects/services/studentSubjectService";
import RoadmapPreviewEditor from "../components/RoadmapPreviewEditor";
import { createRoadmap } from "../services/learningRoadmapService";

function toDateInput(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildInitialData(subjects) {
  const today = new Date();
  const firstSubject = subjects[0] || {};
  const startDate = toDateInput(today);
  const secondDate = toDateInput(addDays(today, 2));

  return {
    subject_id: firstSubject.id ? String(firstSubject.id) : "",
    subject_code: firstSubject.subject_code || "",
    subject_name: firstSubject.subject_name || "",
    title: "",
    overview: "",
    goal: "",
    current_level: "beginner",
    study_time_per_day: "1",
    available_weekdays: [1, 2, 3, 4, 5],
    preferred_start_time: "19:00",
    session_duration_minutes: "60",
    max_daily_minutes: "120",
    max_weekly_minutes: "600",
    reminder_minutes_before: "15",
    start_date: startDate,
    end_date: toDateInput(addDays(today, 30)),
    generated_by_ai: false,
    status: "active",
    progress_percent: 0,
    items: [
      {
        week_number: 1,
        order_number: 1,
        title: "",
        description: "",
        expected_result: "",
        suggested_task: "",
        planned_date: startDate,
        start_time: "19:00",
        duration_minutes: 60,
        priority: "medium",
        status: "not_started",
      },
      {
        week_number: 1,
        order_number: 2,
        title: "",
        description: "",
        expected_result: "",
        suggested_task: "",
        planned_date: secondDate,
        start_time: "19:00",
        duration_minutes: 60,
        priority: "medium",
        status: "not_started",
      },
    ],
  };
}

export default function RoadmapCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [learningGoals, setLearningGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [subjectsResponse, goalsResponse] = await Promise.all([
          getMySubjects(),
          getLearningGoals(),
        ]);
        setSubjects(subjectsResponse.data || []);
        setLearningGoals(goalsResponse.data || []);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu tạo lộ trình.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const initialData = useMemo(() => buildInitialData(subjects), [subjects]);

  async function handleSubmit(data) {
    setSubmitting(true);
    setApiErrors({});
    setError("");

    try {
      const response = await createRoadmap({
        ...data,
        generated_by_ai: false,
        ai_prompt: "",
        ai_raw_response: "",
      });
      toast.success("Tạo lộ trình học thủ công thành công.");
      navigate(`/student/roadmaps/${response.data.id}`);
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể tạo lộ trình học.");
      toast.error(err.message || "Không thể tạo lộ trình học.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Lộ trình học"
          title="Tự tạo lộ trình"
          description="Tự nhập mục tiêu, thời gian học và từng bước học cho môn học bạn được gán."
          actions={
            <Button to="/student/roadmaps" variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
          }
        />

        <Card className="p-4">
          <div className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <ClipboardList size={18} />
            </div>
            <p className="text-sm font-semibold leading-6 text-slate-600">
              Lộ trình thủ công sẽ được lưu trực tiếp vào tài khoản của bạn. Mỗi bước có ngày và giờ học sẽ tự tạo lịch tự học tương ứng.
            </p>
          </div>
        </Card>

        <Alert tone="error">{error}</Alert>
        {!loading && subjects.length === 0 && (
          <Alert tone="warning">Bạn cần được admin gán vào ít nhất một môn học trước khi tự tạo lộ trình.</Alert>
        )}

        {loading ? (
          <LoadingState label="Đang tải dữ liệu tạo lộ trình..." />
        ) : (
          <RoadmapPreviewEditor
            initialData={initialData}
            subjects={subjects}
            learningGoals={learningGoals}
            allowSubjectSelect
            submitting={submitting}
            apiErrors={apiErrors}
            submitLabel="Tạo lộ trình"
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </main>
  );
}
