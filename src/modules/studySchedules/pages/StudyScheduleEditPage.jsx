import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { getSubjects } from "../../subjects/services/subjectService";
import StudyScheduleForm from "../components/StudyScheduleForm";
import { getStudyScheduleById, updateStudySchedule } from "../services/studyScheduleService";

export default function StudyScheduleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [subjectResponse, scheduleResponse] = await Promise.all([getSubjects(), getStudyScheduleById(id)]);
        setSubjects(subjectResponse.data || []);
        setSchedule(scheduleResponse.data);
      } catch (err) {
        setError(err.message || "Không thể tải lịch học.");
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
      await updateStudySchedule(id, data);
      toast.success("Đã cập nhật lịch học.");
      navigate(`/student/schedules/${id}`);
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể cập nhật lịch học.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Lịch học cá nhân"
        title="Sửa lịch học"
        description="Cập nhật thời gian, môn học, địa điểm và trạng thái lịch học."
        actions={
          <Button to={`/student/schedules/${id}`} variant="secondary">
            <ArrowLeft size={16} /> Quay lại
          </Button>
        }
      />
      {loading ? (
        <LoadingState label="Đang tải dữ liệu..." />
      ) : error && !schedule ? (
        <Alert tone="error">{error}</Alert>
      ) : (
        <>
          <Alert tone="error">{error}</Alert>
          <StudyScheduleForm
            mode="edit"
            subjects={subjects}
            initialValues={schedule}
            submitting={submitting}
            apiErrors={apiErrors}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}
