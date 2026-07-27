import React from "react";
import { Trash2 } from "lucide-react";
import { Badge, Button, Card, EmptyState } from "../../../components/ui";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AssignedStudentTable({ students, onRemove }) {
  if (students.length === 0) {
    return (
      <EmptyState
        title="Chưa có sinh viên trong môn học"
        description="Dùng nút Thêm sinh viên để gán sinh viên active vào môn học này."
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
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mã sinh viên</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ngày được gán</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student, index) => (
              <tr key={student.student_id || student.id} className="transition hover:bg-blue-50/40">
                <td className="px-4 py-4 font-bold text-slate-500">{index + 1}</td>
                <td className="px-4 py-4 font-black text-slate-900">{student.full_name}</td>
                <td className="px-4 py-4 font-semibold text-slate-600">{student.email}</td>
                <td className="px-4 py-4 font-bold text-slate-700">{student.student_code || "-"}</td>
                <td className="px-4 py-4">
                  <Badge tone="green">{student.status === "active" ? "Đang học" : student.status}</Badge>
                </td>
                <td className="px-4 py-4 text-slate-500">{formatDate(student.assigned_at)}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end">
                    <Button type="button" variant="danger" size="sm" onClick={() => onRemove(student)}>
                      <Trash2 size={15} /> Xóa khỏi môn học
                    </Button>
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
