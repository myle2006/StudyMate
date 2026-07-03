import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getStudentById } from "../../../services/studentService";

function statusLabel(status) {
  return {
    active: "Đang hoạt động",
    inactive: "Vô hiệu hóa",
    locked: "Bị khóa",
  }[status] || status;
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
    return (
      <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
          Đang tải chi tiết sinh viên...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-8 text-center font-semibold text-rose-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/admin/students" className="text-sm font-bold text-blue-600 hover:text-blue-700">
          Quay lại danh sách
        </Link>
        <Link
          to={`/admin/students/${student.id}/edit`}
          className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          Sửa sinh viên
        </Link>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="grid h-24 w-24 flex-none place-items-center rounded-lg bg-blue-600 text-3xl font-extrabold text-white">
            {student.avatar ? (
              <img src={student.avatar} alt={student.full_name} className="h-full w-full rounded-lg object-cover" />
            ) : (
              student.full_name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">
                {student.full_name}
              </h1>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                {statusLabel(student.status)}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {student.email}
            </p>
          </div>
        </div>

        <dl className="mt-8 grid gap-4 border-t border-slate-200 pt-6 md:grid-cols-2 xl:grid-cols-3 dark:border-white/10">
          {[
            ["Mã sinh viên", student.student_code || "-"],
            ["Số điện thoại", student.phone || "-"],
            ["Lần đăng nhập gần nhất", student.last_login_at || "-"],
            ["Ngày tạo", student.created_at || "-"],
            ["Ngày cập nhật", student.updated_at || "-"],
            ["Trạng thái", statusLabel(student.status)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm font-bold text-slate-500">{label}</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          ["Môn học", "Sẽ bổ sung API thống kê"],
          ["Nhiệm vụ", "Sẽ bổ sung API thống kê"],
          ["Ghi chú", "Sẽ bổ sung API thống kê"],
          ["AI conversation", "Sẽ bổ sung API thống kê"],
        ].map(([title, text]) => (
          <article key={title} className="rounded-lg border border-dashed border-slate-300 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="font-extrabold text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
