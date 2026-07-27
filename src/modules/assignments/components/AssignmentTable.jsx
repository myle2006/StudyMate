import React from "react";
import { Download, Edit3, Eye, Inbox, Trash2 } from "lucide-react";
import { Badge, Button, Card, EmptyState } from "../../../components/ui";

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

export default function AssignmentTable({ assignments, onDelete }) {
  if (assignments.length === 0) {
    return (
      <EmptyState
        title="Chưa có bài tập"
        description="Tạo bài tập đầu tiên để giao deadline theo từng môn học."
        actionLabel="Tạo bài tập"
        actionTo="/admin/assignments/create"
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-16 px-4 py-3">STT</th>
              <th className="px-4 py-3">Bài tập</th>
              <th className="px-4 py-3">Môn học</th>
              <th className="px-4 py-3">Deadline</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assignments.map((assignment, index) => {
              const status = statusConfig[assignment.status] || { label: assignment.status, tone: "slate" };

              return (
                <tr key={assignment.id} className="transition hover:bg-blue-50/40">
                  <td className="px-4 py-4 font-bold text-slate-500">{index + 1}</td>
                  <td className="px-4 py-4">
                    <p className="font-black text-slate-950">{assignment.title}</p>
                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{assignment.description || "Chưa có mô tả"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-slate-800">{assignment.subject_name}</p>
                    <p className="mt-1 text-xs font-black uppercase text-blue-600">{assignment.subject_code}</p>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-600">{formatDateTime(assignment.deadline)}</td>
                  <td className="px-4 py-4">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    {assignment.attachment_path ? (
                      <a
                        href={assignment.attachment_path}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                      >
                        <Download size={14} /> Tải file
                      </a>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button to={`/admin/assignments/${assignment.id}`} variant="secondary" size="sm">
                        <Eye size={15} /> Xem
                      </Button>
                      <Button to={`/admin/assignments/${assignment.id}/submissions`} variant="secondary" size="sm">
                        <Inbox size={15} /> Bài nộp
                      </Button>
                      <Button to={`/admin/assignments/${assignment.id}/edit`} variant="secondary" size="sm">
                        <Edit3 size={15} /> Sửa
                      </Button>
                      <Button type="button" variant="danger" size="sm" onClick={() => onDelete(assignment)}>
                        <Trash2 size={15} /> Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
