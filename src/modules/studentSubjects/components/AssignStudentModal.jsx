import React from "react";
import { Search, UserPlus } from "lucide-react";
import { Alert, Button, EmptyState, Field, Input, LoadingState, Modal, Select } from "../../../components/ui";

export default function AssignStudentModal({
  open,
  students,
  keyword,
  loading,
  error,
  assigningId,
  classes = [],
  selectedClassId = "",
  onClassChange,
  onKeywordChange,
  onAssign,
  onClose,
}) {
  const selectedClass = classes.find((item) => String(item.id) === String(selectedClassId));

  return (
    <Modal
      open={open}
      title="Thêm sinh viên"
      description="Chọn lớp đích trước khi gán sinh viên vào môn học."
      onClose={onClose}
    >
      <div className="space-y-4">
        <Field label="Lớp đích">
          <Select value={selectedClassId} onChange={(event) => onClassChange?.(event.target.value)} className="mt-0">
            <option value="">Chọn lớp</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.class_code}{item.class_name ? ` - ${item.class_name}` : ""} ({Number(item.active_students_count || 0)} SV)
              </option>
            ))}
          </Select>
        </Field>

        {selectedClass && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
            {selectedClass.class_code}: {Number(selectedClass.active_students_count || 0)} sinh viên active,
            {" "}{Number(selectedClass.open_assignments_count || 0)} bài tập đang mở
          </div>
        )}

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Tìm theo tên, email hoặc mã sinh viên"
            className="mt-0 pl-11"
          />
        </div>

        <Alert tone="error">{error}</Alert>

        {loading ? (
          <LoadingState label="Đang tải sinh viên có thể gán..." />
        ) : students.length === 0 ? (
          <EmptyState
            title="Không có sinh viên khả dụng"
            description="Tất cả sinh viên active đã được gán, hoặc không có kết quả phù hợp với từ khóa."
          />
        ) : (
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{student.full_name}</p>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">{student.email}</p>
                  <p className="mt-1 text-xs font-bold text-blue-600">{student.student_code || "Chưa có mã sinh viên"}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={!selectedClassId || assigningId === student.id}
                  onClick={() => onAssign(student)}
                >
                  <UserPlus size={15} />
                  {assigningId === student.id ? "Đang gán..." : "Gán vào lớp"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
