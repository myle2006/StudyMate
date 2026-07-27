import React, { useEffect, useState } from "react";
import { ArrowLeft, Download, Edit3 } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button, Card, LoadingState, PageHeader } from "../../../components/ui";
import AssignmentStatusBadge from "../components/AssignmentStatusBadge";
import { getSubmissionById } from "../services/submissionService";

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

export default function StudentSubmissionDetailPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubmission() {
      setLoading(true);
      setError("");

      try {
        const response = await getSubmissionById(id);
        setSubmission(response.data);
      } catch (err) {
        setError(err.message || "Không thể tải bài nộp.");
      } finally {
        setLoading(false);
      }
    }

    loadSubmission();
  }, [id]);

  if (loading) {
    return <LoadingState label="Đang tải bài nộp..." />;
  }

  if (error || !submission) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Bài nộp"
          title="Không tìm thấy bài nộp"
          description={error || "Bài nộp không tồn tại hoặc không thuộc tài khoản của bạn."}
          actions={
            <Button to="/student/assignments" variant="secondary">
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
          description="Chi tiết bài nộp của bạn."
          actions={
            <>
              <Button to="/student/assignments" variant="secondary">
                <ArrowLeft size={16} /> Danh sách bài tập
              </Button>
              <Button to={`/student/assignments/${submission.assignment_id}/submit`}>
                <Edit3 size={16} /> Cập nhật bài nộp
              </Button>
            </>
          }
        />

        <Card className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoItem label="Trạng thái nộp">
              <AssignmentStatusBadge type="submission" value={submission.status} />
            </InfoItem>
            <InfoItem label="Trạng thái bài tập">
              <AssignmentStatusBadge value={submission.assignment_status} />
            </InfoItem>
            <InfoItem label="Deadline" value={formatDateTime(submission.deadline)} />
            <InfoItem label="Thời gian nộp" value={formatDateTime(submission.submitted_at)} />
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-extrabold uppercase text-slate-500">Nội dung bài làm</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
              {submission.content || "Bạn chưa nhập nội dung bài làm."}
            </p>
          </div>

          {submission.file_path && (
            <a
              href={submission.file_path}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700"
            >
              <Download size={16} /> Tải file bài nộp
            </a>
          )}

          {(submission.score || submission.feedback) && (
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-extrabold uppercase text-blue-600">Kết quả chấm</p>
              <p className="mt-2 text-sm font-black text-blue-800">Điểm: {submission.score ?? "-"}</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-blue-900">{submission.feedback || "Chưa có nhận xét."}</p>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
