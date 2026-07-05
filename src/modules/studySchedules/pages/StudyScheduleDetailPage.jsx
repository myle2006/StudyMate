import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Badge, Button, Card, ConfirmDialog, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { deleteStudySchedule, getStudyScheduleById } from "../services/studyScheduleService";

const typeLabels = {
  class: "Học trên lớp",
  self_study: "Tự học",
  review: "Ôn tập",
  assignment: "Làm bài tập",
  exam: "Thi/kiểm tra",
};

const statusLabels = {
  upcoming: "Sắp diễn ra",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
};

const statusTones = {
  upcoming: "blue",
  completed: "green",
  cancelled: "rose",
};

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-extrabold uppercase text-slate-500">{label}</p>
      <p className="mt-2 font-bold text-slate-900">{value || "-"}</p>
    </div>
  );
}

export default function StudyScheduleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSchedule() {
      setLoading(true);
      setError("");

      try {
        const response = await getStudyScheduleById(id);
        setSchedule(response.data);
      } catch (err) {
        setError(err.message || "Không thể tải chi tiết lịch học.");
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    setError("");

    try {
      await deleteStudySchedule(id);
      toast.success("Xóa lịch học thành công.");
      navigate("/student/schedules");
    } catch (err) {
      const nextError = err.message || "Không thể xóa lịch học.";
      setError(nextError);
      toast.error(nextError);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  if (loading) {
    return <main className="px-4 py-6 sm:px-6 lg:px-8"><LoadingState label="Đang tải chi tiết lịch học..." /></main>;
  }

  if (error && !schedule) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <Alert tone="error">{error}</Alert>
        <Button to="/student/schedules" variant="secondary" className="mt-4">Quay lại</Button>
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow={`${schedule.subject_code} · ${schedule.subject_name}`}
        title={schedule.title}
        description={`${schedule.study_date} · ${schedule.start_time} - ${schedule.end_time}`}
        actions={
          <>
            <Button to={`/student/schedules/${schedule.id}/edit`}>Sửa</Button>
            <Button type="button" variant="danger" onClick={() => setConfirmOpen(true)}>Xóa</Button>
          </>
        }
      />

      <Alert tone="error" className="mt-4">{error}</Alert>

      <Card className="mt-6 p-6">
        <div className="flex flex-wrap gap-2">
          <Badge tone="blue">{typeLabels[schedule.schedule_type] || schedule.schedule_type}</Badge>
          <Badge tone={statusTones[schedule.status] || "slate"}>{statusLabels[schedule.status] || schedule.status}</Badge>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoItem label="Môn học" value={schedule.subject_name} />
          <InfoItem label="Địa điểm/link" value={schedule.location} />
          <InfoItem label="Ngày tạo" value={schedule.created_at} />
          <InfoItem label="Ngày cập nhật" value={schedule.updated_at} />
        </div>

        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-extrabold uppercase text-slate-500">Mô tả</p>
          <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">{schedule.description || "Chưa có mô tả."}</p>
        </div>

        <Link to="/student/schedules" className="mt-6 inline-flex text-sm font-extrabold text-blue-600 hover:text-blue-700">
          Quay lại lịch học
        </Link>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa lịch học"
        description="Bạn có chắc muốn xóa lịch học này? Lịch sẽ được soft delete để tránh mất dữ liệu lịch sử."
        confirmLabel="Xóa lịch học"
        danger
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </main>
  );
}
