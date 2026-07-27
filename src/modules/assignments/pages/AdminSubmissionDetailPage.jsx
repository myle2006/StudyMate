import React, { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button, Card, LoadingState, PageHeader, useToast } from "../../../components/ui";
import GradeForm from "../components/GradeForm";
import SubmissionStatusBadge from "../components/SubmissionStatusBadge";
import { getAdminSubmissionById, gradeSubmission } from "../services/submissionService";

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoItem({ label, value, children }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-extrabold uppercase text-slate-500">{label}</p>
      <div className="mt-2 text-sm font-bold text-slate-950">{children || value || "-"}</div>
    </div>
  );
}

export default function AdminSubmissionDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  async function loadSubmission() {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminSubmissionById(id);
      setSubmission(response.data);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết bài nộp.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmission();
  }, [id]);

  async function handleGrade(payload) {
    setGrading(true);
    setApiErrors({});

    try {
      const response = await gradeSubmission(id, payload);
      setSubmission(response.data);
      toast.success(response.message || "Lưu điểm thành công.");
    } catch (err) {
      setApiErrors(err.errors || {});
      toast.error(err.message || "Không thể lưu điểm.");
    } finally {
      setGrading(false);
    }
  }

  if (loading) {
    return <LoadingState label="Đang tải chi tiết bài nộp..." />;
  }

  if (error || !submission) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Bài nộp"
          title="Không tìm thấy bài nộp"
          description={error || "Bài nộp không tồn tại."}
          actions={
            <Button to="/admin/assignments" variant="secondary">
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
          eyebrow={`${submission.subject_code} - ${submission.subject_name}`}
          title={submission.assignment_title}
          description={`${submission.full_name} - ${submission.email}`}
          actions={
            <>
              <Button to={`/admin/assignments/${submission.assignment_id}/submissions`} variant="secondary">
                <ArrowLeft size={16} /> Danh sách bài nộp
              </Button>
              {submission.file_path && (
                <a
                  href={submission.file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white hover:bg-blue-700"
                >
                  <Download size={16} /> Tải file
                </a>
              )}
            </>
          }
        />

        <Card className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoItem label="Sinh viên" value={submission.full_name} />
            <InfoItem label="Mã sinh viên" value={submission.student_code} />
            <InfoItem label="Trạng thái nộp">
              <SubmissionStatusBadge status={submission.status} />
            </InfoItem>
            <InfoItem label="Thời gian nộp" value={formatDateTime(submission.submitted_at)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoItem label="Deadline" value={formatDateTime(submission.deadline)} />
            <InfoItem label="Trạng thái bài tập" value={submission.assignment_status} />
            <InfoItem label="Điểm" value={submission.score ?? "-"} />
            <InfoItem label="Người chấm" value={submission.graded_by_name || "-"} />
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-extrabold uppercase text-slate-500">Nội dung bài nộp</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
              {submission.content || "Sinh viên không nhập nội dung."}
            </p>
          </div>

          {submission.feedback && (
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-extrabold uppercase text-blue-600">Nhận xét hiện tại</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-blue-900">{submission.feedback}</p>
            </div>
          )}
        </Card>

        <GradeForm submission={submission} submitting={grading} apiErrors={apiErrors} onSubmit={handleGrade} />
      </div>
    </main>
  );
}
