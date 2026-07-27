import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { getStudentAssignmentById } from "../services/assignmentService";
import { getSubmissionForAssignment, submitAssignment, updateSubmission } from "../services/submissionService";
import SubmissionForm from "../components/SubmissionForm";

export default function StudentSubmissionFormPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [assignmentResponse, submissionResponse] = await Promise.all([
          getStudentAssignmentById(assignmentId),
          getSubmissionForAssignment(assignmentId),
        ]);
        setAssignment(assignmentResponse.data);
        setSubmission(submissionResponse.data || null);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu nộp bài.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [assignmentId]);

  async function handleSubmit(formData) {
    setSubmitting(true);
    setApiErrors({});
    setError("");

    try {
      const response = submission
        ? await updateSubmission(submission.id, formData)
        : await submitAssignment(assignmentId, formData);
      toast.success(response.message || "Nộp bài thành công.");
      navigate(`/student/submissions/${response.data.id}`);
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể nộp bài.");
      toast.error(err.message || "Không thể nộp bài.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Bài tập của tôi"
        title={submission ? "Cập nhật bài nộp" : "Nộp bài"}
        description={assignment ? `${assignment.subject_code} - ${assignment.title}` : "Gửi nội dung hoặc file bài làm của bạn."}
      />
      <Alert tone="error" className="mt-6">{error}</Alert>
      <div className="mt-6">
        {loading ? (
          <LoadingState label="Đang tải form nộp bài..." />
        ) : assignment ? (
          <SubmissionForm
            assignment={assignment}
            submission={submission}
            apiErrors={apiErrors}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    </main>
  );
}
