import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Input, LoadingState, PageHeader, Select, useToast } from "../../../components/ui";
import { deleteSubject, getSubjects } from "../services/subjectService";

const statusLabels = {
  studying: "Đang học",
  paused: "Tạm khóa",
  completed: "Hoàn thành",
};

const statusTones = {
  studying: "blue",
  paused: "amber",
  completed: "green",
};

function SubjectVisual({ subject }) {
  if (subject.image) {
    return <img src={subject.image} alt={subject.subject_name} className="h-12 w-16 rounded-lg object-cover" />;
  }

  return (
    <div
      className="grid h-12 w-16 place-items-center rounded-lg text-lg font-black text-white"
      style={{ backgroundColor: subject.color || "#2563EB" }}
    >
      {(subject.subject_name || "M").charAt(0).toUpperCase()}
    </div>
  );
}

export default function SubjectListPage() {
  const location = useLocation();
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(location.state?.message || "");
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadSubjects(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const response = await getSubjects(nextFilters);
      setSubjects(response.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách môn học.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    loadSubjects(nextFilters);
  }

  async function confirmDelete() {
    if (!selectedSubject) return;

    setDeleting(true);
    setError("");

    try {
      const response = await deleteSubject(selectedSubject.id);
      const successMessage = response.message || "Xóa môn học thành công.";
      setMessage(successMessage);
      toast.success(successMessage);
      setSelectedSubject(null);
      await loadSubjects(filters);
    } catch (err) {
      const nextError = err.message || "Không thể xóa môn học.";
      setError(nextError);
      toast.error(nextError);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Quản lý môn học"
        description={`${subjects.length} môn học đang hiển thị. Môn học là dữ liệu gốc để liên kết lịch học và các module sau.`}
        actions={<Button to="/admin/subjects/create">Thêm môn học</Button>}
      />

      <Card className="mt-6 grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <Input
          name="keyword"
          value={filters.keyword}
          onChange={handleFilterChange}
          placeholder="Tìm theo tên hoặc mã môn học"
          className="mt-0"
        />
        <Select name="status" value={filters.status} onChange={handleFilterChange} className="mt-0">
          <option value="">Tất cả trạng thái</option>
          <option value="studying">Đang học</option>
          <option value="paused">Tạm khóa</option>
          <option value="completed">Hoàn thành</option>
        </Select>
      </Card>

      <Alert tone="success" className="mt-4">{message}</Alert>
      <Alert tone="error" className="mt-4">{error}</Alert>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Đang tải danh sách môn học..." />
        ) : subjects.length === 0 ? (
          <EmptyState
            title="Chưa có môn học"
            description="Thêm môn học đầu tiên để sinh viên có thể xem và chọn trong lịch học."
            actionLabel="Thêm môn học"
            actionTo="/admin/subjects/create"
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">STT</th>
                    <th className="px-4 py-3">Ảnh/Màu</th>
                    <th className="px-4 py-3">Mã</th>
                    <th className="px-4 py-3">Tên môn học</th>
                    <th className="px-4 py-3">Tín chỉ</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((subject, index) => (
                    <tr key={subject.id} className="transition hover:bg-blue-50/40">
                      <td className="px-4 py-4 font-bold text-slate-500">{index + 1}</td>
                      <td className="px-4 py-4"><SubjectVisual subject={subject} /></td>
                      <td className="px-4 py-4 font-black text-slate-900">{subject.subject_code}</td>
                      <td className="px-4 py-4 font-bold text-slate-800">{subject.subject_name}</td>
                      <td className="px-4 py-4 font-bold text-slate-700">{subject.credits ?? 3}</td>
                      <td className="px-4 py-4">
                        <Badge tone={statusTones[subject.status] || "slate"}>
                          {statusLabels[subject.status] || subject.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-slate-500">{subject.created_at || "-"}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button to={`/admin/subjects/${subject.id}`} variant="secondary" size="sm">Xem</Button>
                          <Button to={`/admin/subjects/${subject.id}/edit`} variant="secondary" size="sm">Sửa</Button>
                          <Button type="button" variant="danger" size="sm" onClick={() => setSelectedSubject(subject)}>Xóa</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(selectedSubject)}
        title="Xóa môn học"
        description={selectedSubject ? `Bạn có chắc muốn xóa môn học "${selectedSubject.subject_name}"? Dữ liệu sẽ được soft delete để tránh mất lịch sử.` : ""}
        confirmLabel="Xóa môn học"
        danger
        loading={deleting}
        onCancel={() => setSelectedSubject(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}
