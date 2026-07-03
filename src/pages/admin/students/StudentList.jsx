import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentFilter from "../../../components/students/StudentFilter";
import StudentTable from "../../../components/students/StudentTable";
import {
  deleteStudent,
  disableStudent,
  enableStudent,
  getStudents,
  lockStudent,
  resetStudentPassword,
} from "../../../services/studentService";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", status: "", page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadStudents(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const response = await getStudents(nextFilters);
      setStudents(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách sinh viên.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleFilterSubmit(event) {
    event.preventDefault();
    const nextFilters = { ...filters, page: 1 };
    setFilters(nextFilters);
    loadStudents(nextFilters);
  }

  async function runAction(action, successMessage) {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await action();
      setMessage(response.message || successMessage);
      await loadStudents(filters);
    } catch (err) {
      setError(err.message || "Không thể thực hiện thao tác.");
    } finally {
      setLoading(false);
    }
  }

  function handleDisable(student) {
    if (!window.confirm(`Vô hiệu hóa tài khoản "${student.full_name}"?`)) return;
    runAction(() => disableStudent(student.id), "Tài khoản sinh viên đã được vô hiệu hóa.");
  }

  function handleEnable(student) {
    if (!window.confirm(`Kích hoạt tài khoản "${student.full_name}"?`)) return;
    runAction(() => enableStudent(student.id), "Tài khoản sinh viên đã được kích hoạt.");
  }

  function handleLock(student) {
    if (!window.confirm(`Khóa tài khoản "${student.full_name}"?`)) return;
    runAction(() => lockStudent(student.id), "Tài khoản sinh viên đã bị khóa.");
  }

  function handleResetPassword(student) {
    if (!window.confirm(`Reset mật khẩu cho "${student.full_name}"?`)) return;
    const newPassword = window.prompt(
      "Nhập mật khẩu mới. Để trống để dùng mã sinh viên làm mật khẩu mặc định.",
      ""
    );

    if (newPassword === null) return;

    runAction(
      () => resetStudentPassword(student.id, newPassword ? { new_password: newPassword } : {}),
      "Reset mật khẩu sinh viên thành công."
    );
  }

  function handleDelete(student) {
    if (!window.confirm(`Xóa sinh viên "${student.full_name}"? Nếu đã có dữ liệu học tập, tài khoản sẽ được chuyển sang inactive.`)) return;
    runAction(() => deleteStudent(student.id), "Xóa sinh viên thành công.");
  }

  function changePage(page) {
    const nextPage = Math.max(1, Math.min(page, pagination.total_pages || 1));
    const nextFilters = { ...filters, page: nextPage };
    setFilters(nextFilters);
    loadStudents(nextFilters);
  }

  return (
    <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase text-blue-600 dark:text-blue-300">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
              Quản lý sinh viên
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/students/import"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
            >
              Import CSV/Excel
            </Link>
            <Link
              to="/admin/students/create"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Thêm sinh viên
            </Link>
          </div>
        </div>

        <StudentFilter
          filters={filters}
          loading={loading}
          onChange={setFilters}
          onSubmit={handleFilterSubmit}
        />

        {message && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {loading && students.length === 0 ? (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
            Đang tải danh sách sinh viên...
          </div>
        ) : students.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
              Chưa có sinh viên nào
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
              Thêm từng sinh viên hoặc import danh sách bằng CSV để bắt đầu quản lý tài khoản học tập.
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <StudentTable
              students={students}
              pagination={pagination}
              onDisable={handleDisable}
              onEnable={handleEnable}
              onLock={handleLock}
              onResetPassword={handleResetPassword}
              onDelete={handleDelete}
            />
          </div>
        )}

        {pagination.total_pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => changePage((pagination.page || 1) - 1)}
              disabled={pagination.page <= 1 || loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Trang {pagination.page} / {pagination.total_pages}
            </span>
            <button
              type="button"
              onClick={() => changePage((pagination.page || 1) + 1)}
              disabled={pagination.page >= pagination.total_pages || loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
