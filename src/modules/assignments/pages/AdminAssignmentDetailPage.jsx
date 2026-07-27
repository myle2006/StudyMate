import React, { useEffect, useState } from "react";
import { ArrowLeft, Download, Edit3, Inbox } from "lucide-react";
import { useParams } from "react-router-dom";
import { Badge, Button, Card, LoadingState, PageHeader } from "../../../components/ui";
import { getAssignmentById } from "../services/assignmentService";

const statusConfig = {
  open: { label: "Đang mở", tone: "green" },
  closed: { label: "Đã đóng", tone: "slate" },
  draft: { label: "Nháp", tone: "amber" },
};

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-extrabold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-950">{value || "-"}</p>
    </div>
  );
}

export default function AdminAssignmentDetailPage() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAssignment() {
      setLoading(true);
      setError("");

      try {
        const response = await getAssignmentById(id);
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
          eyebrow="Bài tập"
          title="Không tìm thấy dữ liệu"
          description={error || "Bài tập không tồn tại hoặc đã bị xóa."}
          actions={
            <Button to="/admin/assignments" variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
          }
        />
      </main>
    );
  }

  const status = statusConfig[assignment.status] || { label: assignment.status, tone: "slate" };

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow={`${assignment.subject_code} - ${assignment.subject_name}`}
          title={assignment.title}
          description="Chi tiết bài tập và deadline giao cho sinh viên."
          actions={
            <>
              <Button to="/admin/assignments" variant="secondary">
                <ArrowLeft size={16} /> Quay lại
              </Button>
              <Button to={`/admin/assignments/${assignment.id}/submissions`} variant="secondary">
                <Inbox size={16} /> Xem bài nộp
              </Button>
              <Button to={`/admin/assignments/${assignment.id}/edit`}>
                <Edit3 size={16} /> Sửa bài tập
              </Button>
            </>
          }
        />

        <Card className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-500">Trạng thái</p>
              <div className="mt-2">
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
            </div>
            <div className="rounded-xl bg-blue-50 px-4 py-3 text-right">
              <p className="text-xs font-extrabold uppercase text-blue-600">Deadline</p>
              <p className="text-sm font-black text-blue-700">{formatDateTime(assignment.deadline)}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoItem label="Môn học" value={`${assignment.subject_code} - ${assignment.subject_name}`} />
            <InfoItem label="Người tạo" value={assignment.created_by_name} />
            <InfoItem label="Ngày tạo" value={formatDateTime(assignment.created_at)} />
            <InfoItem label="Ngày cập nhật" value={formatDateTime(assignment.updated_at)} />
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
