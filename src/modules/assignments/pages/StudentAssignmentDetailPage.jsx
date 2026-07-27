import React, { useEffect, useState } from "react";
import { ArrowLeft, Download, FileCheck, Send } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button, Card, LoadingState, PageHeader } from "../../../components/ui";
import AssignmentStatusBadge from "../components/AssignmentStatusBadge";
import { getStudentAssignmentById } from "../services/assignmentService";

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

export default function StudentAssignmentDetailPage() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAssignment() {
      setLoading(true);
      setError("");

      try {
        const response = await getStudentAssignmentById(id);
        setAssignment(response.data);
      } catch (err) {
        setError(err.message || "Không thể tải chi tiết bài tập.");
      } finally {
        setLoading(false);
      }
    }

    loadAssignment();
  }, [id]);

  if (loading) {
    return <LoadingState label="Đang tải chi tiết bài tập..." />;
  }

  if (error || !assignment) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Bài tập của tôi"
          title="Không thể xem bài tập"
          description={error || "Bài tập không tồn tại hoặc không thuộc môn học bạn được gán."}
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
          eyebrow={`${assignment.subject_code} - ${assignment.subject_name}`}
          title={assignment.title}
          description="Chi tiết bài tập và deadline trong môn học bạn được gán."
          actions={
            <>
              <Button to="/student/assignments" variant="secondary">
                <ArrowLeft size={16} /> Quay lại
              </Button>
              {assignment.submission_id && (
                <Button to={`/student/submissions/${assignment.submission_id}`} variant="secondary">
                  <FileCheck size={16} /> Xem bài nộp
                </Button>
              )}
              <Button to={`/student/assignments/${assignment.id}/submit`} disabled={assignment.status === "closed"}>
                <Send size={16} /> {assignment.submission_id ? "Cập nhật bài nộp" : "Nộp bài"}
              </Button>
            </>
          }
        />

        <Card className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoItem label="Trạng thái bài tập">
              <AssignmentStatusBadge value={assignment.status} />
            </InfoItem>
            <InfoItem label="Trạng thái nộp bài">
              <AssignmentStatusBadge type="submission" value={assignment.submission_status || "not_submitted"} />
            </InfoItem>
            <InfoItem label="Deadline">
              <AssignmentStatusBadge
                type="deadline"
                deadline={assignment.deadline}
                assignmentStatusValue={assignment.status}
                submissionStatusValue={assignment.submission_status || "not_submitted"}
              />
            </InfoItem>
            <InfoItem label="Thời hạn" value={formatDateTime(assignment.deadline)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoItem label="Môn học" value={`${assignment.subject_code} - ${assignment.subject_name}`} />
            <InfoItem label="Cập nhật" value={formatDateTime(assignment.updated_at)} />
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-extrabold uppercase text-slate-500">Mô tả</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
              {assignment.description || "Chưa có mô tả cho bài tập này."}
            </p>
          </div>

          {assignment.attachment_path && (
            <a
              href={assignment.attachment_path}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700"
            >
              <Download size={16} /> Tải file đính kèm
            </a>
          )}
        </Card>
      </div>
    </main>
  );
}
