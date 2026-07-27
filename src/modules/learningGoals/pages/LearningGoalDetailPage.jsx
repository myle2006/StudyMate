import React, { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CalendarDays, Clock3, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, ConfirmDialog, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { LearningGoalStatusBadge, learningGoalLevelLabel } from "../components/LearningGoalCard";
import { deleteLearningGoal, getLearningGoalById } from "../services/learningGoalService";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function InfoItem({ icon: Icon, label, value, children }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-500">
        {Icon && <Icon size={16} />}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-bold text-slate-950">{children || value || "-"}</div>
    </div>
  );
}

export default function LearningGoalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadGoal() {
      setLoading(true);
      setError("");

      try {
        const response = await getLearningGoalById(id);
        setGoal(response.data);
      } catch (err) {
        setError(err.message || "Không thể tải chi tiết mục tiêu học tập.");
      } finally {
        setLoading(false);
      }
    }

    loadGoal();
  }, [id]);

  async function handleDelete() {
    setDeleting(true);

    try {
      await deleteLearningGoal(id);
      toast.success("Xóa mục tiêu học tập thành công.");
      navigate("/student/learning-goals");
    } catch (err) {
      toast.error(err.message || "Không thể xóa mục tiêu học tập.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  if (loading) {
    return <LoadingState label="Đang tải mục tiêu học tập..." />;
  }

  if (error || !goal) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Mục tiêu học tập"
          title="Không tìm thấy mục tiêu"
          description={error || "Mục tiêu không tồn tại hoặc không thuộc tài khoản của bạn."}
          actions={
            <Button to="/student/learning-goals" variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow={`${goal.subject_code} - ${goal.subject_name}`}
          title={goal.title}
          description="Chi tiết mục tiêu cá nhân dùng làm dữ liệu đầu vào cho lộ trình học AI."
          actions={
            <>
              <Button to="/student/learning-goals" variant="secondary">
                <ArrowLeft size={16} /> Danh sách
              </Button>
              <Button to={`/student/learning-goals/${goal.id}/edit`}>
                <Pencil size={16} /> Sửa
              </Button>
              <Button type="button" variant="danger" onClick={() => setConfirmOpen(true)}>
                <Trash2 size={16} /> Xóa
              </Button>
            </>
          }
        />

        <Card className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoItem icon={BookOpen} label="Môn học" value={`${goal.subject_code} - ${goal.subject_name}`} />
            <InfoItem icon={Clock3} label="Thời gian học" value={`${Number(goal.study_time_per_day).toFixed(1)} giờ/ngày`} />
            <InfoItem icon={CalendarDays} label="Bắt đầu" value={formatDate(goal.start_date)} />
            <InfoItem icon={CalendarDays} label="Kết thúc" value={formatDate(goal.end_date)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoItem label="Trình độ hiện tại" value={learningGoalLevelLabel(goal.current_level)} />
            <InfoItem label="Trạng thái">
              <LearningGoalStatusBadge status={goal.status} />
            </InfoItem>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-extrabold uppercase text-slate-500">Mục tiêu chi tiết</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{goal.goal_description}</p>
          </div>

          {goal.subject_description && (
            <div className="rounded-xl bg-blue-50 p-5">
              <p className="text-xs font-extrabold uppercase text-blue-600">Ngữ cảnh môn học</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-blue-900">{goal.subject_description}</p>
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa mục tiêu học tập?"
        description={`Mục tiêu "${goal.title}" sẽ được xóa khỏi danh sách của bạn.`}
        confirmLabel="Xóa mục tiêu"
        danger
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </main>
  );
}
