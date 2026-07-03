import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SubjectCard from "../../components/subjects/SubjectCard";
import SubjectFilter from "../../components/subjects/SubjectFilter";
import { deleteSubject, getSubjects } from "../../services/subjectService";

export default function SubjectList() {
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", status: "", page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSubjects(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const response = await getSubjects(nextFilters);
      setSubjects(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách môn học.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  function handleFilterSubmit(event) {
    event.preventDefault();
    const nextFilters = { ...filters, page: 1 };
    setFilters(nextFilters);
    loadSubjects(nextFilters);
  }

  async function handleDelete(subject) {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa môn học "${subject.name}"?`);
    if (!confirmed) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await deleteSubject(subject.id);
      setMessage(response.message || "Xóa môn học thành công.");
      await loadSubjects(filters);
    } catch (err) {
      setError(err.message || "Không thể xóa môn học.");
    } finally {
      setLoading(false);
    }
  }

  function changePage(page) {
    const nextPage = Math.max(1, Math.min(page, pagination.total_pages || 1));
    const nextFilters = { ...filters, page: nextPage };
    setFilters(nextFilters);
    loadSubjects(nextFilters);
  }

  return (
    <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase text-blue-600 dark:text-blue-300">
              StudyMate AI
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
              Quản lý môn học
            </h1>
          </div>
          <Link
            to="/subjects/create"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Thêm môn học
          </Link>
        </div>

        <SubjectFilter
          filters={filters}
          loading={loading}
          onChange={setFilters}
          onSubmit={handleFilterSubmit}
        />

        {message && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {loading && subjects.length === 0 ? (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
            Đang tải danh sách môn học...
          </div>
        ) : subjects.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">
              Chưa có môn học nào
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
              Tạo môn học đầu tiên để bắt đầu gom bài học, ghi chú, quiz và tiến độ học tập.
            </p>
            <Link
              to="/subjects/create"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Thêm môn học
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {pagination.total_pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => changePage((pagination.page || 1) - 1)}
              disabled={pagination.page <= 1 || loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Trang {pagination.page} / {pagination.total_pages}
            </span>
            <button
              type="button"
              onClick={() => changePage((pagination.page || 1) + 1)}
              disabled={pagination.page >= pagination.total_pages || loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
