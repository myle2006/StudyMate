import React, { useEffect, useState } from "react";
import { RefreshCw, Trash2, UploadCloud, UserPlus } from "lucide-react";
import StudentFilter from "../../../components/students/StudentFilter";
import StudentTable from "../../../components/students/StudentTable";
import { Alert, Button, Card, ConfirmDialog, EmptyState, Field, Input, LoadingState, Modal, PageHeader, useToast } from "../../../components/ui";
import {
  bulkDeleteStudents,
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
  const [resetPasswordResult, setResetPasswordResult] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

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
    setSelectedIds([]);
    loadStudents(nextFilters);
  }

  async function runAction(action, successMessage) {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await action();
      const temporaryPassword = response.data?.temporary_password;
      const nextMessage = temporaryPassword
        ? `${response.message || successMessage} Mật khẩu tạm: ${temporaryPassword}`
        : response.message || successMessage;
      setMessage(nextMessage);
      toast.success(nextMessage);
      await loadStudents(filters);
      setSelectedIds([]);
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
    setResetPasswordResult("");
  }

  async function handleResetPasswordSubmit() {
    if (!resetTarget?.id) return;

    setLoading(true);
    setMessage("");
    setError("");
    setResetPasswordResult("");

    try {
      const response = await resetStudentPassword(resetTarget.id, newPassword ? { new_password: newPassword } : {});
      const temporaryPassword = response.data?.temporary_password || "";
      if (temporaryPassword) {
        setResetPasswordResult(temporaryPassword);
        toast.success("Reset mật khẩu thành công. Mật khẩu tạm đang hiển thị trong hộp thoại.");
      } else {
        toast.success(response.message || "Reset mật khẩu sinh viên thành công.");
        setResetTarget(null);
      }
      await loadStudents(filters);
      setSelectedIds([]);
      setNewPassword("");
    } catch (err) {
      const nextError = err.message || "Không thể reset mật khẩu.";
      setError(nextError);
      toast.error(nextError);
    } finally {
      setLoading(false);
    }
  }

  async function copyTemporaryPassword() {
    if (!resetPasswordResult) return;
    try {
      await navigator.clipboard.writeText(resetPasswordResult);
      toast.success("Đã copy mật khẩu tạm.");
    } catch {
      toast.error("Không thể copy tự động. Hãy chọn và copy thủ công.");
    }
  }

  function handleDelete(student) {
    askConfirm({
      title: "Vô hiệu hóa sinh viên",
      description: `Vô hiệu hóa sinh viên "${student.full_name}"? Dữ liệu học tập, điểm, bài nộp và log quiz sẽ được giữ lại.`,
      action: () => deleteStudent(student.id),
      successMessage: "Tài khoản sinh viên đã được vô hiệu hóa.",
      danger: true,
    });
  }

  function handleToggleStudent(studentId, checked) {
    setSelectedIds((current) => {
      const id = Number(studentId);
      if (checked) return current.includes(id) ? current : [...current, id];

      return current.filter((selectedId) => selectedId !== id);
    });
  }

  function handleToggleAll(checked) {
    const visibleIds = students.map((student) => Number(student.id));
    setSelectedIds((current) => {
      if (checked) return Array.from(new Set([...current, ...visibleIds]));

      return current.filter((id) => !visibleIds.includes(id));
    });
  }

  function handleBulkDelete() {
    if (selectedIds.length === 0) return;

    askConfirm({
      title: "Vô hiệu hóa đồng loạt sinh viên",
      description: `Vô hiệu hóa ${selectedIds.length} sinh viên đã chọn? Dữ liệu học tập, điểm, bài nộp và log quiz sẽ được giữ lại.`,
      action: () => bulkDeleteStudents(selectedIds),
      successMessage: "Đã vô hiệu hóa các sinh viên đã chọn.",
      danger: true,
    });
  }

  function changePage(page) {
    const nextPage = Math.max(1, Math.min(page, pagination.total_pages || 1));
    const nextFilters = { ...filters, page: nextPage };
    setFilters(nextFilters);
    loadStudents(nextFilters);
  }

  function handleRefresh() {
    setMessage("");
    loadStudents(filters);
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Admin"
        title="Quản lý sinh viên"
        description="Tìm kiếm, lọc, khóa/mở khóa và quản lý tài khoản sinh viên trong hệ thống."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={handleRefresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Làm mới
            </Button>
            <Button to="/admin/students/import" variant="secondary">
              <UploadCloud size={16} /> Import
            </Button>
            <Button to="/admin/students/create">
              <UserPlus size={16} /> Thêm sinh viên
            </Button>
          </>
        }
      />

      <div className="mt-6">
        <StudentFilter filters={filters} loading={loading} onChange={setFilters} onSubmit={handleFilterSubmit} />
      </div>

      <Alert tone="success" className="mt-4">{message}</Alert>
      <Alert tone="error" className="mt-4">{error}</Alert>

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
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-slate-600">
                Đã chọn <span className="font-black text-slate-950">{selectedIds.length}</span> sinh viên
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="secondary" onClick={() => setSelectedIds([])} disabled={selectedIds.length === 0 || loading}>
                  Bỏ chọn
                </Button>
                <Button type="button" variant="danger" onClick={handleBulkDelete} disabled={selectedIds.length === 0 || loading}>
                  <Trash2 size={16} />
                  Vô hiệu hóa đã chọn
                </Button>
              </div>
            </div>
            <StudentTable
              students={students}
              pagination={pagination}
              selectedIds={selectedIds}
              onToggleStudent={handleToggleStudent}
              onToggleAll={handleToggleAll}
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
        description={resetTarget ? `Nhập mật khẩu mới cho "${resetTarget.full_name}". Để trống để hệ thống sinh mật khẩu tạm.` : ""}
        onClose={() => {
          setResetTarget(null);
          setResetPasswordResult("");
        }}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setResetTarget(null);
                setResetPasswordResult("");
              }}
              disabled={loading}
            >
              {resetPasswordResult ? "Đóng" : "Hủy"}
            </Button>
            <Button
              type="button"
              onClick={resetPasswordResult ? copyTemporaryPassword : handleResetPasswordSubmit}
              disabled={loading || !resetTarget}
            >
              {loading ? "Đang xử lý..." : resetPasswordResult ? "Copy mật khẩu" : "Reset mật khẩu"}
            </Button>
          </>
        }
      >
        {resetPasswordResult ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-bold text-emerald-800">
            <p>Mật khẩu tạm chỉ hiển thị tại đây. Hãy copy và gửi cho sinh viên trước khi đóng hộp thoại.</p>
            <p className="mt-3 rounded-lg bg-white px-3 py-2 font-mono text-base text-emerald-900 ring-1 ring-emerald-100">
              {resetPasswordResult}
            </p>
          </div>
        ) : (
          <Field label="Mật khẩu mới">
            <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Để trống để sinh mật khẩu tạm" />
          </Field>
        )}
      </Modal>
    </main>
  );
}
