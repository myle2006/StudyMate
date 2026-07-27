import React from "react";
import { Download, Eye } from "lucide-react";
import { Button, Card, EmptyState } from "../../../components/ui";
import SubmissionStatusBadge from "./SubmissionStatusBadge";

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

export default function SubmissionTable({ submissions }) {
  if (submissions.length === 0) {
    return (
      <EmptyState
        title="Không có dữ liệu bài nộp"
        description="Không có sinh viên nào phù hợp với bộ lọc hiện tại."
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
              <th className="px-4 py-3">Họ tên sinh viên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mã sinh viên</th>
              <th className="px-4 py-3">Trạng thái nộp</th>
              <th className="px-4 py-3">Thời gian nộp</th>
              <th className="px-4 py-3">Điểm</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.map((item, index) => (
              <tr key={`${item.student_id}-${item.submission_id || "none"}`} className="transition hover:bg-blue-50/40">
                <td className="px-4 py-4 font-bold text-slate-500">{index + 1}</td>
                <td className="px-4 py-4 font-black text-slate-950">{item.full_name}</td>
                <td className="px-4 py-4 font-semibold text-slate-600">{item.email}</td>
                <td className="px-4 py-4 font-bold text-slate-700">{item.student_code || "-"}</td>
                <td className="px-4 py-4">
                  <SubmissionStatusBadge status={item.submission_status} />
                </td>
                <td className="px-4 py-4 font-semibold text-slate-600">{formatDateTime(item.submitted_at)}</td>
                <td className="px-4 py-4 font-bold text-slate-700">{item.score ?? "-"}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    {item.file_path && (
                      <a
                        href={item.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Download size={14} /> File
                      </a>
                    )}
                    {item.submission_id ? (
                      <Button to={`/admin/submissions/${item.submission_id}`} variant="secondary" size="sm">
                        <Eye size={15} /> Xem chi tiết
                      </Button>
                    ) : (
                      <span className="inline-flex h-9 items-center rounded-lg bg-slate-100 px-3 text-xs font-bold text-slate-500">
                        Chưa có bài nộp
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
