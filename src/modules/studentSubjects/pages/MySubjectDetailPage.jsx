import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams } from "react-router-dom";
import { Badge, Button, Card, LoadingState, PageHeader } from "../../../components/ui";
import { getMySubjectById } from "../services/studentSubjectService";

const statusConfig = {
  studying: { label: "Đang học", tone: "blue" },
  paused: { label: "Tạm dừng", tone: "amber" },
  completed: { label: "Hoàn thành", tone: "green" },
};

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-extrabold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-950">{value || "-"}</p>
    </div>
  );
}

function SubjectCover({ subject }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="aspect-[16/10] w-full" style={{ backgroundColor: subject.color || "#2563EB" }}>
        {subject.image ? (
          <img src={subject.image} alt={subject.subject_name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-white">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/20 text-4xl font-black ring-1 ring-white/25">
              {(subject.subject_name || "M").charAt(0).toUpperCase()}
            </div>
            <p className="mt-4 text-sm font-extrabold uppercase text-white/80">{subject.subject_code}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function MySubjectDetailPage() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubject() {
      setLoading(true);
      setError("");

      try {
        const response = await getMySubjectById(subjectId);
        setSubject(response.data);
      } catch (err) {
        setError(err.message || "Không thể tải chi tiết môn học.");
      } finally {
        setLoading(false);
      }
    }

    loadSubject();
  }, [subjectId]);

  if (loading) {
    return <LoadingState label="Đang tải chi tiết môn học..." />;
  }

  if (error || !subject) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Môn học của tôi"
          title="Không thể xem môn học"
          description={error || "Môn học không tồn tại hoặc bạn chưa được gán vào môn học này."}
          actions={
            <Button to="/student/my-subjects" variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
          }
        />
      </main>
    );
  }

  const status = statusConfig[subject.status] || { label: subject.status, tone: "slate" };

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow={subject.subject_code}
          title={subject.subject_name}
          description="Chi tiết môn học bạn đang được gán trong StudyMate AI."
          actions={
            <Button to="/student/my-subjects" variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <SubjectCover subject={subject} />

          <Card className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-500">Trạng thái môn học</p>
                <div className="mt-2">
                  <Badge tone={status.tone}>{status.label}</Badge>
                </div>
              </div>
              <div className="rounded-xl bg-blue-50 px-4 py-3 text-right">
                <p className="text-xs font-extrabold uppercase text-blue-600">Số tín chỉ</p>
                <p className="text-2xl font-black text-blue-700">{subject.credits ?? 3}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem label="Mã môn học" value={subject.subject_code} />
              <InfoItem label="Ngày được gán" value={formatDate(subject.assigned_at)} />
              <InfoItem label="Ngày tạo môn" value={formatDate(subject.created_at)} />
              <InfoItem label="Ngày cập nhật" value={formatDate(subject.updated_at)} />
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-extrabold uppercase text-slate-500">Mô tả</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                {subject.description || "Chưa có mô tả cho môn học này."}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
