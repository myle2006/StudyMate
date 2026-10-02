import React, { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Download } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button, Card, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { downloadProtectedFile } from "../../../utils/downloadFile";
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

function scoreLabel(score) {
  return score !== null && score !== undefined ? `${Number(score).toFixed(1)}/10` : "-";
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
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

  function exportSecurityEvents() {
    const rows = [
      ["Thời gian", "Loại sự kiện", "Thông báo", "IP", "User agent"],
      ...(submission.security_events || []).map((event) => [
        formatDateTime(event.created_at),
        event.event_type,
        event.message,
        event.ip_address || "",
        event.user_agent || "",
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quiz_security_events_submission_${submission.id}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
                <button
                  type="button"
                  onClick={() => downloadProtectedFile(submission.file_path)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-extrabold text-white hover:bg-blue-700"
                >
                  <Download size={16} /> Tải file
                </button>
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
            <InfoItem label="Điểm" value={scoreLabel(submission.score)} />
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

        {Array.isArray(submission.security_events) && submission.security_events.length > 0 && (
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase text-amber-600">Sự kiện bảo mật quiz</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">{submission.security_events.length} cảnh báo được ghi nhận</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={exportSecurityEvents}>
                  <Download size={14} />
                  Export CSV
                </Button>
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="divide-y divide-slate-100">
                {submission.security_events.map((event) => (
                  <div key={event.id} className="grid gap-2 bg-white p-4 text-sm md:grid-cols-[180px_minmax(0,1fr)]">
                    <div className="font-bold text-slate-500">{formatDateTime(event.created_at)}</div>
                    <div>
                      <p className="font-black text-slate-950">{event.event_type}</p>
                      <p className="mt-1 font-semibold leading-6 text-slate-600">{event.message}</p>
                      {event.ip_address && <p className="mt-1 text-xs font-bold text-slate-400">IP: {event.ip_address}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        <GradeForm submission={submission} submitting={grading} apiErrors={apiErrors} onSubmit={handleGrade} />
      </div>
    </main>
  );
}
