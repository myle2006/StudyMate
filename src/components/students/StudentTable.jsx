import React from "react";
import { Link } from "react-router-dom";

function statusMeta(status) {
  if (status === "inactive") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "locked") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function statusLabel(status) {
  return {
    active: "Đang hoạt động",
    inactive: "Vô hiệu hóa",
    locked: "Bị khóa",
  }[status] || status;
}

export default function StudentTable({
  students,
  pagination,
  onDisable,
  onEnable,
  onLock,
  onResetPassword,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-white/10">
        <thead className="bg-slate-50 dark:bg-slate-950/70">
          <tr>
            {[
              "STT",
              "Họ tên",
              "Email",
              "Mã sinh viên",
              "Số điện thoại",
              "Trạng thái",
              "Lần đăng nhập",
              "Ngày tạo",
              "Thao tác",
            ].map((column) => (
              <th key={column} className="px-4 py-3 text-left font-extrabold text-slate-600 dark:text-slate-300">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/10">
          {students.map((student, index) => (
            <tr key={student.id} className="align-top">
              <td className="px-4 py-4 font-semibold text-slate-500">
                {(pagination.page - 1) * pagination.limit + index + 1}
              </td>
              <td className="px-4 py-4 font-extrabold text-slate-900 dark:text-white">
                {student.full_name}
              </td>
              <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{student.email}</td>
              <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{student.student_code}</td>
              <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{student.phone || "-"}</td>
              <td className="px-4 py-4">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusMeta(student.status)}`}>
                  {statusLabel(student.status)}
                </span>
              </td>
              <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{student.last_login_at || "-"}</td>
              <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{student.created_at || "-"}</td>
              <td className="px-4 py-4">
                <div className="flex min-w-[280px] flex-wrap gap-2">
                  <Link to={`/admin/students/${student.id}`} className="rounded-lg border border-slate-300 px-3 py-2 font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600">
                    Xem
                  </Link>
                  <Link to={`/admin/students/${student.id}/edit`} className="rounded-lg bg-slate-950 px-3 py-2 font-bold text-white hover:bg-blue-600">
                    Sửa
                  </Link>
                  {student.status === "active" ? (
                    <button type="button" onClick={() => onDisable(student)} className="rounded-lg border border-amber-200 px-3 py-2 font-bold text-amber-700 hover:bg-amber-50">
                      Disable
                    </button>
                  ) : (
                    <button type="button" onClick={() => onEnable(student)} className="rounded-lg border border-emerald-200 px-3 py-2 font-bold text-emerald-700 hover:bg-emerald-50">
                      Enable
                    </button>
                  )}
                  <button type="button" onClick={() => onLock(student)} className="rounded-lg border border-rose-200 px-3 py-2 font-bold text-rose-600 hover:bg-rose-50">
                    Lock
                  </button>
                  <button type="button" onClick={() => onResetPassword(student)} className="rounded-lg border border-blue-200 px-3 py-2 font-bold text-blue-600 hover:bg-blue-50">
                    Reset
                  </button>
                  <button type="button" onClick={() => onDelete(student)} className="rounded-lg border border-rose-200 px-3 py-2 font-bold text-rose-600 hover:bg-rose-50">
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
