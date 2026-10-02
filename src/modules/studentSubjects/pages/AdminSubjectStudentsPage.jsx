import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { useParams } from "react-router-dom";
import { Alert, Button, Card, ConfirmDialog, Field, Input, LoadingState, Modal, PageHeader, Select, useToast } from "../../../components/ui";
import { getSubjectById } from "../../subjects/services/subjectService";
import {
  assignStudentToSubject,
  createSubjectClass,
  getAssignedStudents,
  getAvailableStudents,
  getSubjectClasses,
  removeStudentFromSubject,
} from "../services/studentSubjectService";
import AssignedStudentTable from "../components/AssignedStudentTable";
import AssignStudentModal from "../components/AssignStudentModal";

export default function AdminSubjectStudentsPage() {
  const { subjectId } = useParams();
  const toast = useToast();
  const [subject, setSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [assignClassId, setAssignClassId] = useState("");
  const [availableStudents, setAvailableStudents] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [availableKeyword, setAvailableKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableError, setAvailableError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [classForm, setClassForm] = useState({ class_code: "", class_name: "" });
  const [classError, setClassError] = useState("");
  const [creatingClass, setCreatingClass] = useState(false);

  async function loadPage(nextKeyword = keyword) {
    setLoading(true);
    setError("");

    try {
      const [subjectResponse, studentsResponse, classesResponse] = await Promise.all([
        getSubjectById(subjectId),
        getAssignedStudents(subjectId, { keyword: nextKeyword, class_id: selectedClassId }),
        getSubjectClasses(subjectId),
      ]);

      setSubject(subjectResponse.data);
      setStudents(studentsResponse.data || []);
      setClasses(classesResponse.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách sinh viên trong môn học.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailable(nextKeyword = availableKeyword) {
    setAvailableLoading(true);
    setAvailableError("");

    try {
      const response = await getAvailableStudents(subjectId, { keyword: nextKeyword });
      setAvailableStudents(response.data || []);
    } catch (err) {
      setAvailableError(err.message || "Không thể tải danh sách sinh viên có thể gán.");
    } finally {
      setAvailableLoading(false);
    }
  }

  useEffect(() => {
    loadPage("");
  }, [subjectId, selectedClassId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadPage(keyword);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    if (!modalOpen) return undefined;

    const timer = window.setTimeout(() => {
      loadAvailable(availableKeyword);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [availableKeyword, modalOpen]);

  function openAssignModal() {
    setAssignClassId(selectedClassId || classes[0]?.id || "");
    setModalOpen(true);
    setAvailableKeyword("");
    loadAvailable("");
  }

  async function handleCreateClass() {
    setCreatingClass(true);
    setClassError("");

    try {
      const response = await createSubjectClass(subjectId, classForm);
      toast.success(response.message || "Tạo lớp thành công.");
      setClassModalOpen(false);
      setClassForm({ class_code: "", class_name: "" });
      await loadPage(keyword);
    } catch (err) {
      setClassError(err.errors?.class_code || err.message || "Không thể tạo lớp.");
      toast.error(err.message || "Không thể tạo lớp.");
    } finally {
      setCreatingClass(false);
    }
  }

  async function handleAssign(student) {
    setAssigningId(student.id);
    setAvailableError("");

    try {
      if (!assignClassId) {
        throw new Error("Vui lòng chọn lớp trước khi gán sinh viên.");
      }

      const response = await assignStudentToSubject(subjectId, student.id, assignClassId);
      const successMessage = response.message || "Gán sinh viên vào môn học thành công.";
      toast.success(successMessage);
      await Promise.all([loadPage(keyword), loadAvailable(availableKeyword)]);
    } catch (err) {
      const nextError = err.message || "Không thể gán sinh viên vào môn học.";
      setAvailableError(nextError);
      toast.error(nextError);
    } finally {
      setAssigningId(null);
    }
  }

  async function confirmRemove() {
    if (!selectedStudent) return;

    setRemoving(true);
    setError("");

    try {
      const response = await removeStudentFromSubject(subjectId, selectedStudent.student_id, selectedStudent.class_id);
      const successMessage = response.message || "Xóa sinh viên khỏi môn học thành công.";
      toast.success(successMessage);
      setSelectedStudent(null);
      await loadPage(keyword);
    } catch (err) {
      const nextError = err.message || "Không thể xóa sinh viên khỏi môn học.";
      setError(nextError);
      toast.error(nextError);
    } finally {
      setRemoving(false);
    }
  }

  const description = useMemo(() => {
    if (!subject) {
      return "Quản lý danh sách sinh viên được gán vào môn học.";
    }

    return `${subject.subject_code} - ${subject.subject_name}`;
  }, [subject]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Quản lý môn học"
        title="Sinh viên trong môn học"
        description={description}
        actions={
          <>
            <Button to="/admin/subjects" variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
            <Button type="button" onClick={openAssignModal}>
              <Plus size={16} /> Thêm sinh viên
            </Button>
            <Button type="button" variant="secondary" onClick={() => setClassModalOpen(true)}>
              <Plus size={16} /> Thêm lớp
            </Button>
          </>
        }
      />

      <Card className="mt-6 p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm sinh viên trong môn học theo tên, email hoặc mã sinh viên"
            className="mt-0 pl-11"
          />
        </div>
        <Select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} className="mt-0">
          <option value="">Tất cả lớp</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.class_code}{item.class_name ? ` - ${item.class_name}` : ""} ({Number(item.active_students_count || 0)} SV)
            </option>
          ))}
        </Select>
        </div>
      </Card>

      <Alert tone="error" className="mt-4">{error}</Alert>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Đang tải sinh viên trong môn học..." />
        ) : (
          <AssignedStudentTable students={students} onRemove={setSelectedStudent} />
        )}
      </div>

      <AssignStudentModal
        open={modalOpen}
        students={availableStudents}
        keyword={availableKeyword}
        loading={availableLoading}
        error={availableError}
        assigningId={assigningId}
        classes={classes}
        selectedClassId={assignClassId}
        onClassChange={setAssignClassId}
        onKeywordChange={setAvailableKeyword}
        onAssign={handleAssign}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(selectedStudent)}
        title="Xóa sinh viên khỏi môn học"
        description={
          selectedStudent
            ? `Bạn có chắc muốn xóa "${selectedStudent.full_name}" khỏi môn học này? Dữ liệu sẽ chuyển sang trạng thái removed, không xóa cứng.`
            : ""
        }
        confirmLabel="Xóa khỏi môn học"
        danger
        loading={removing}
        onCancel={() => setSelectedStudent(null)}
        onConfirm={confirmRemove}
      />

      <Modal
        open={classModalOpen}
        title="Thêm lớp"
        description={subject ? `Tạo lớp mới cho ${subject.subject_code} - ${subject.subject_name}.` : ""}
        onClose={() => setClassModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setClassModalOpen(false)} disabled={creatingClass}>Hủy</Button>
            <Button type="button" onClick={handleCreateClass} disabled={creatingClass}>
              {creatingClass ? "Đang tạo..." : "Tạo lớp"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Alert tone="error">{classError}</Alert>
          <Field label="Mã lớp">
            <Input value={classForm.class_code} onChange={(event) => setClassForm((current) => ({ ...current, class_code: event.target.value }))} placeholder="Ví dụ: 25102" />
          </Field>
          <Field label="Tên lớp">
            <Input value={classForm.class_name} onChange={(event) => setClassForm((current) => ({ ...current, class_name: event.target.value }))} placeholder="Ví dụ: Kiểm thử phần mềm 25102" />
          </Field>
        </div>
      </Modal>
    </main>
  );
}
