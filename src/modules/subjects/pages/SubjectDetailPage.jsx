import React, { useEffect, useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import { useParams } from "react-router-dom";
import { Badge, Button, Card, LoadingState, PageHeader } from "../../../components/ui";
import { getSubjectById } from "../services/subjectService";

const statusConfig = {
  studying: { label: "Đang học", tone: "blue" },
  paused: { label: "Tạm dừng", tone: "amber" },
  completed: { label: "Hoàn thành", tone: "green" },
};

function SubjectCover({ subject }) {
  const initial = (subject.subject_name || "M").charAt(0).toUpperCase();

  return (
    <Card className="overflow-hidden p-0">
      <div className="aspect-[16/10] w-full" style={{ backgroundColor: subject.color || "#2563EB" }}>
        {subject.image ? (
          <img src={subject.image} alt={subject.subject_name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-white">
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/20 text-4xl font-black ring-1 ring-white/25">
              {initial}
            </div>
            <p className="mt-4 text-sm font-extrabold uppercase tracking-wide text-white/80">{subject.subject_code}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-extrabold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-950">{value || "-"}</p>
    </div>
  );
}

export default function SubjectDetailPage({ studentView = false }) {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const backUrl = studentView ? "/student/subjects" : "/admin/subjects";

  useEffect(() => {
    async function loadSubject() {
      setLoading(true);
      setError("");

      try {
        const response = await getSubjectById(id);
        setSubject(response.data);
      } catch (err) {
        setError(err.message || "Không thể tải chi tiết môn học.");
      } finally {
        setLoading(false);
      }
    }

    loadSubject();
  }, [id]);

  if (loading) {
    return <LoadingState label="Đang tải chi tiết môn học..." />;
  }

  if (error || !subject) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Môn học"
          title="Không tìm thấy dữ liệu"
          description={error || "Môn học không tồn tại hoặc đã bị xóa."}
          actions={
            <Button to={backUrl} variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  const status = statusConfig[subject.status] || { label: subject.status, tone: "slate" };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={subject.subject_code}
        title={subject.subject_name}
        description="Thông tin tổng quan của môn học trong StudyMate AI."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button to={backUrl} variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
            {!studentView && (
              <Button to={`/admin/subjects/${subject.id}/edit`}>
                <Edit3 size={16} /> Sửa môn học
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <SubjectCover subject={subject} />

        <Card className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-500">Trạng thái hiện tại</p>
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
            <InfoItem label="Màu đại diện" value={subject.color || "#2563EB"} />
            <InfoItem label="Ngày tạo" value={subject.created_at} />
            <InfoItem label="Ngày cập nhật" value={subject.updated_at} />
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
  );
}
