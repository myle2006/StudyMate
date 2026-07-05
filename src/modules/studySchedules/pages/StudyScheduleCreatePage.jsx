import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { getSubjects } from "../../subjects/services/subjectService";
import StudyScheduleForm from "../components/StudyScheduleForm";
import { createStudySchedule } from "../services/studyScheduleService";

export default function StudyScheduleCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubjects() {
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
        <StudyScheduleForm subjects={subjects} submitting={submitting} apiErrors={apiErrors} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
