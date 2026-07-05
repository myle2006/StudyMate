import React from "react";
import { Eye, LockKeyhole, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui";

const statusConfig = {
  active: { label: "Đang hoạt động", tone: "green" },
  inactive: { label: "Vô hiệu hóa", tone: "amber" },
  locked: { label: "Bị khóa", tone: "rose" },
};

function Tooltip({ label }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
      {label}
    </span>
  );
}

function IconActionLink({ to, label, children, className = "" }) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className={`group relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${className}`}
    >
      {children}
      <Tooltip label={label} />
    </Link>
  );
}

function IconActionButton({ label, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`group relative inline-flex h-9 w-9 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${className}`}
    >
      {children}
      <Tooltip label={label} />
    </button>
  );
}

function StatusSwitch({ student, onEnable, onDisable }) {
  const isActive = student.status === "active";
  const label = isActive ? "Tắt tài khoản" : "Bật tài khoản";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      aria-label={label}
      title={label}
      onClick={() => (isActive ? onDisable(student) : onEnable(student))}
      className={`group relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-0.5 transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${
        isActive ? "border-emerald-300 bg-emerald-500" : "border-slate-300 bg-slate-200"
      }`}
    >
      <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${isActive ? "translate-x-5" : "translate-x-0"}`} />
      <Tooltip label={label} />
    </button>
  );
}

export default function StudentTable({ students, pagination, onDisable, onEnable, onLock, onResetPassword, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {["STT", "Họ tên", "Email", "Mã sinh viên", "Số điện thoại", "Trạng thái", "Lần đăng nhập", "Ngày tạo", "Thao tác"].map(
              (column) => (
                <th key={column} className="px-4 py-3 text-left font-black text-slate-600">
                  {column}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((student, index) => {
            const status = statusConfig[student.status] || { label: student.status, tone: "slate" };

            return (
              <tr key={student.id} className="align-middle transition hover:bg-slate-50/80">
                <td className="px-4 py-4 font-semibold text-slate-500">
                  {(pagination.page - 1) * pagination.limit + index + 1}
                </td>
                <td className="px-4 py-4">
                  <p className="font-black text-slate-900">{student.full_name}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">ID: {student.id}</p>
                </td>
                <td className="px-4 py-4 text-slate-700">{student.email}</td>
                <td className="px-4 py-4 text-slate-700">{student.student_code}</td>
                <td className="px-4 py-4 text-slate-700">{student.phone || "-"}</td>
                <td className="px-4 py-4">
                  <div className="flex min-w-[160px] items-center gap-3">
                    <StatusSwitch student={student} onEnable={onEnable} onDisable={onDisable} />
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-600">{student.last_login_at || "-"}</td>
                <td className="px-4 py-4 text-slate-600">{student.created_at || "-"}</td>
                <td className="px-4 py-4">
                  <div className="flex min-w-[190px] flex-wrap items-center gap-2">
                    <IconActionLink to={`/admin/students/${student.id}`} label="Xem chi tiết" className="border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                      <Eye size={16} strokeWidth={2.4} />
                    </IconActionLink>
                    <IconActionLink to={`/admin/students/${student.id}/edit`} label="Sửa sinh viên" className="border-slate-900 bg-slate-900 text-white hover:border-blue-600 hover:bg-blue-600">
                      <Pencil size={16} strokeWidth={2.4} />
                    </IconActionLink>
                    <IconActionButton label="Reset mật khẩu" onClick={() => onResetPassword(student)} className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                      <RotateCcw size={16} strokeWidth={2.4} />
                    </IconActionButton>
                    <IconActionButton label="Khóa tài khoản" onClick={() => onLock(student)} className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
                      <LockKeyhole size={16} strokeWidth={2.4} />
                    </IconActionButton>
                    <IconActionButton label="Xóa sinh viên" onClick={() => onDelete(student)} className="border-rose-200 bg-white text-rose-600 hover:bg-rose-50">
                      <Trash2 size={16} strokeWidth={2.4} />
                    </IconActionButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
