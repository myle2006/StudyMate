import React, { useEffect, useState } from "react";
import StudentFilter from "../../../components/students/StudentFilter";
import StudentTable from "../../../components/students/StudentTable";
import { Button, Card, ConfirmDialog, EmptyState, Field, Input, LoadingState, Modal, PageHeader, useToast } from "../../../components/ui";
import {
  deleteStudent,
  disableStudent,
  enableStudent,
  getStudents,
  lockStudent,
  resetStudentPassword,
} from "../../../services/studentService";

export default function StudentList() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", status: "", page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmState, setConfirmState] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");

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
      const nextMessage = response.message || successMessage;
      setMessage(nextMessage);
      toast.success(nextMessage);
      await loadStudents(filters);
    } catch (err) {
      const nextError = err.message || "Không thể thực hiện thao tác.";
      setError(nextError);
      toast.error(nextError);
    } finally {
      setLoading(false);
      setConfirmState(null);
      setResetTarget(null);
      setNewPassword("");
    }
  }

  function askConfirm({ title, description, action, successMessage, danger = false }) {
    setConfirmState({ title, description, action, successMessage, danger });
  }

  function handleDisable(student) {
    askConfirm({
      title: "Vô hiệu hóa sinh viên",
      description: `Vô hiệu hóa tài khoản "${student.full_name}"? Sinh viên sẽ không thể đăng nhập.`,
      action: () => disableStudent(student.id),
      successMessage: "Tài khoản sinh viên đã được vô hiệu hóa.",
    });
  }

  function handleEnable(student) {
    askConfirm({
      title: "Kích hoạt sinh viên",
      description: `Kích hoạt lại tài khoản "${student.full_name}"?`,
      action: () => enableStudent(student.id),
      successMessage: "Tài khoản sinh viên đã được kích hoạt.",
    });
  }

  function handleLock(student) {
    askConfirm({
      title: "Khóa sinh viên",
      description: `Khóa tài khoản "${student.full_name}"? Tài khoản bị khóa sẽ không thể đăng nhập.`,
      action: () => lockStudent(student.id),
      successMessage: "Tài khoản sinh viên đã bị khóa.",
      danger: true,
    });
  }

  function handleResetPassword(student) {
    setResetTarget(student);
    setNewPassword("");
  }

  function handleDelete(student) {
    askConfirm({
      title: "Xóa sinh viên",
      description: `Xóa sinh viên "${student.full_name}"? Nếu đã có dữ liệu học tập, tài khoản sẽ được chuyển sang inactive.`,
      action: () => deleteStudent(student.id),
      successMessage: "Xóa sinh viên thành công.",
      danger: true,
    });
  }

  function changePage(page) {
    const nextPage = Math.max(1, Math.min(page, pagination.total_pages || 1));
    const nextFilters = { ...filters, page: nextPage };
    setFilters(nextFilters);
    loadStudents(nextFilters);
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Admin"
        title="Quản lý sinh viên"
        description="Tìm kiếm, lọc, khóa/mở khóa và quản lý tài khoản sinh viên trong hệ thống."
        actions={
          <>
            <Button to="/admin/students/import" variant="secondary">Import CSV/Excel</Button>
            <Button to="/admin/students/create">Thêm sinh viên</Button>
          </>
        }
      />

      <div className="mt-6">
        <StudentFilter filters={filters} loading={loading} onChange={setFilters} onSubmit={handleFilterSubmit} />
      </div>

      {message && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>}
      {error && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

      <div className="mt-6">
        {loading && students.length === 0 ? (
          <LoadingState label="Đang tải danh sách sinh viên..." />
        ) : students.length === 0 ? (
          <EmptyState
            title="Chưa có sinh viên"
            description="Thêm từng sinh viên hoặc import danh sách CSV/Excel để bắt đầu quản lý tài khoản học tập."
            actionLabel="Thêm sinh viên"
            actionTo="/admin/students/create"
          />
        ) : (
          <Card className="p-0">
            <StudentTable
              students={students}
              pagination={pagination}
              onDisable={handleDisable}
              onEnable={handleEnable}
              onLock={handleLock}
              onResetPassword={handleResetPassword}
              onDelete={handleDelete}
            />
          </Card>
        )}
      </div>

      {pagination.total_pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button type="button" variant="secondary" onClick={() => changePage((pagination.page || 1) - 1)} disabled={pagination.page <= 1 || loading}>Trước</Button>
          <span className="text-sm font-bold text-slate-600">Trang {pagination.page} / {pagination.total_pages}</span>
          <Button type="button" variant="secondary" onClick={() => changePage((pagination.page || 1) + 1)} disabled={pagination.page >= pagination.total_pages || loading}>Sau</Button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title}
        description={confirmState?.description}
        confirmLabel="Xác nhận"
        danger={confirmState?.danger}
        loading={loading}
        onCancel={() => setConfirmState(null)}
        onConfirm={() => runAction(confirmState.action, confirmState.successMessage)}
      />

      <Modal
        open={Boolean(resetTarget)}
        title="Reset mật khẩu"
        description={resetTarget ? `Nhập mật khẩu mới cho "${resetTarget.full_name}". Để trống để dùng mã sinh viên làm mật khẩu mặc định.` : ""}
        onClose={() => setResetTarget(null)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setResetTarget(null)} disabled={loading}>Hủy</Button>
            <Button
              type="button"
              onClick={() => runAction(
                () => resetStudentPassword(resetTarget.id, newPassword ? { new_password: newPassword } : {}),
                "Reset mật khẩu sinh viên thành công."
              )}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Reset mật khẩu"}
            </Button>
          </>
        }
      >
        <Field label="Mật khẩu mới">
          <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Để trống để dùng mã sinh viên" />
        </Field>
      </Modal>
    </main>
  );
}
