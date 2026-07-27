import React, { useEffect, useState } from "react";
import { ArrowLeft, CalendarCheck2, Clock3, Download, FileText, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import { Alert, Button, Card, LoadingState, PageHeader } from "../../../components/ui";
import AssignmentStatusBadge from "../components/AssignmentStatusBadge";
import GradeStatusBadge from "../components/GradeStatusBadge";
import { getStudentGradeBySubmissionId } from "../services/submissionService";

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

function scoreLabel(score) {
  return score !== null && score !== undefined ? `${Number(score).toFixed(1)}/10` : "Chưa được chấm";
}

function InfoItem({ label, value, children }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-extrabold uppercase text-slate-500">{label}</p>
      <div className="mt-2 text-sm font-bold text-slate-950">{children || value || "-"}</div>
    </div>
  );
}

export default function StudentGradeDetailPage() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGrade() {
      setLoading(true);
      setError("");

      try {
        const response = await getStudentGradeBySubmissionId(submissionId);
        setSubmission(response.data);
      } catch (err) {
        setError(err.message || "Không thể tải chi tiết điểm và feedback.");
      } finally {
        setLoading(false);
      }
    }

    loadGrade();
  }, [submissionId]);

  if (loading) {
    return <LoadingState label="Đang tải chi tiết điểm..." />;
  }

  if (error || !submission) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Điểm và feedback"
          title="Không tìm thấy kết quả"
          description={error || "Kết quả này không tồn tại hoặc không thuộc tài khoản của bạn."}
          actions={
            <Button to="/student/grades" variant="secondary">
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
          description="Chi tiết điểm, feedback và bài nộp của bạn."
          actions={
            <Button to="/student/grades" variant="secondary">
              <ArrowLeft size={16} /> Danh sách điểm
            </Button>
          }
        />

        <Alert tone={submission.status === "graded" ? "success" : "warning"}>
          {submission.status === "graded" ? "Bài nộp của bạn đã được chấm." : "Chưa được chấm. Điểm và feedback sẽ hiển thị sau khi admin lưu kết quả."}
        </Alert>

        <Card className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoItem label="Trạng thái chấm">
              <GradeStatusBadge submission={submission} />
            </InfoItem>
            <InfoItem label="Trạng thái nộp">
              <AssignmentStatusBadge type="submission" value={submission.status} />
            </InfoItem>
            <InfoItem label="Thời gian nộp" value={formatDateTime(submission.submitted_at)} />
            <InfoItem label="Thời gian chấm" value={formatDateTime(submission.graded_at)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-xl bg-blue-50 p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Star size={20} />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-blue-600">Điểm</p>
                  <p className="text-3xl font-black text-blue-950">{scoreLabel(submission.score)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-blue-800">
                Người chấm: {submission.graded_by_name || "-"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-500">
                <CalendarCheck2 size={16} />
                <span>Feedback</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                {submission.feedback || "Chưa được chấm"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-500">
                <FileText size={16} />
                <span>Nội dung bài làm</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                {submission.content || "Bạn chưa nhập nội dung bài làm."}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-500">
                <Clock3 size={16} />
                <span>Thông tin bài tập</span>
              </div>
              <div className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
                <p>Deadline: {formatDateTime(submission.deadline)}</p>
                <p>Trạng thái bài tập: <AssignmentStatusBadge value={submission.assignment_status} /></p>
              </div>
              {submission.file_path && (
                <a
                  href={submission.file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                >
                  <Download size={16} /> Tải file bài nộp
                </a>
              )}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
