import React, { useEffect, useState } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import { useParams } from "react-router-dom";
import { Badge, Button, Card, LoadingState, PageHeader } from "../../../components/ui";
import { getStudentById } from "../../../services/studentService";

const statusConfig = {
  active: { label: "Đang hoạt động", tone: "green" },
  inactive: { label: "Vô hiệu hóa", tone: "amber" },
  locked: { label: "Bị khóa", tone: "rose" },
};

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <dt className="text-xs font-extrabold uppercase text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm font-bold text-slate-950">{value || "-"}</dd>
    </div>
  );
}

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudent() {
      setLoading(true);
      setError("");

      try {
        const response = await getStudentById(id);
        setStudent(response.data);
      } catch (err) {
        setError(err.message || "Không thể tải chi tiết sinh viên.");
      } finally {
        setLoading(false);
      }
    }

    loadStudent();
  }, [id]);

  if (loading) {
    return <LoadingState label="Đang tải chi tiết sinh viên..." />;
  }

  if (error || !student) {
    return (
      <PageHeader
        eyebrow="Quản lý sinh viên"
        title="Không tìm thấy sinh viên"
        description={error || "Sinh viên không tồn tại hoặc đã bị xóa."}
        actions={
          <Button to="/admin/students" variant="secondary">
            <ArrowLeft size={16} /> Quay lại
          </Button>
        }
      />
    );
  }

  const status = statusConfig[student.status] || { label: student.status, tone: "slate" };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hồ sơ sinh viên"
        title={student.full_name}
        description={student.email}
        actions={
          <div className="flex flex-wrap gap-3">
            <Button to="/admin/students" variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
            <Button to={`/admin/students/${student.id}/edit`}>
              <Edit3 size={16} /> Sửa sinh viên
            </Button>
          </div>
        }
      />

      <Card className="p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="grid h-24 w-24 flex-none place-items-center overflow-hidden rounded-2xl bg-blue-600 text-3xl font-black text-white shadow-sm shadow-blue-600/20">
            {student.avatar ? (
              <img src={student.avatar} alt={student.full_name} className="h-full w-full object-cover" />
            ) : (
              student.full_name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-black text-slate-950">{student.full_name}</h2>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500">ID: {student.id}</p>
          </div>
        </div>

        <dl className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoItem label="Email" value={student.email} />
          <InfoItem label="Mã sinh viên" value={student.student_code} />
          <InfoItem label="Số điện thoại" value={student.phone} />
          <InfoItem label="Lần đăng nhập gần nhất" value={student.last_login_at} />
          <InfoItem label="Ngày tạo" value={student.created_at} />
          <InfoItem label="Ngày cập nhật" value={student.updated_at} />
        </dl>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Môn học", "Chờ bổ sung API thống kê"],
          ["Nhiệm vụ", "Chờ bổ sung API thống kê"],
          ["Ghi chú", "Chờ bổ sung API thống kê"],
          ["AI conversation", "Chờ bổ sung API thống kê"],
        ].map(([title, text]) => (
          <Card key={title} className="border-dashed p-5">
            <h3 className="font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
