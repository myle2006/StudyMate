import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSubjectById } from "../../services/subjectService";

function formatStatus(status) {
  return status === "archived" ? "Lưu trữ" : "Đang học";
}

export default function SubjectDetail() {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    return (
      <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="w-full rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
          Đang tải chi tiết môn học...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="w-full rounded-lg border border-rose-200 bg-rose-50 p-8 text-center font-semibold text-rose-700">
          {error}
        </div>
      </main>
    );
  }

  const color = subject?.color || "#2563EB";

  return (
    <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/subjects" className="text-sm font-bold text-blue-600 hover:text-blue-700">
            Quay lại danh sách
          </Link>
          <Link
            to={`/subjects/${subject.id}/edit`}
            className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            Sửa môn học
          </Link>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div
              className="grid min-h-[240px] overflow-hidden rounded-lg text-3xl font-extrabold text-white"
              style={{ backgroundColor: color }}
            >
              {subject.icon ? (
                <img src={subject.icon} alt={subject.name} className="h-full w-full object-cover" />
              ) : (
                <span className="place-self-center">{subject.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">
                  {subject.name}
                </h1>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  {formatStatus(subject.status)}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {subject.code || "Chưa có mã môn học"}
              </p>
              <p className="mt-5 leading-7 text-slate-700 dark:text-slate-300">
                {subject.description || "Chưa có mô tả cho môn học này."}
              </p>
            </div>
          </div>

          <dl className="mt-8 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2 dark:border-white/10">
            <div>
              <dt className="text-sm font-bold text-slate-500">Màu đại diện</dt>
              <dd className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                <span className="h-5 w-5 rounded" style={{ backgroundColor: color }} />
                {color}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-slate-500">Icon</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {subject.icon || "Chưa có icon"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-slate-500">Ngày tạo</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {subject.created_at}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-slate-500">Ngày cập nhật</dt>
              <dd className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {subject.updated_at}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="font-extrabold text-slate-950 dark:text-white">Bài học</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Khu vực này có thể nối với API bài học khi module lessons đã sẵn sàng.
            </p>
          </div>
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="font-extrabold text-slate-950 dark:text-white">Tiến độ học tập</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Khu vực này có thể nối với API progress để hiển thị tiến độ theo môn học.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
