import React from "react";

const statusOptions = [
  { value: "", label: "Tất cả" },
  { value: "active", label: "Đang học" },
  { value: "archived", label: "Lưu trữ" },
];

export default function SubjectFilter({ filters, onChange, onSubmit, loading = false }) {
  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto] dark:border-white/10 dark:bg-white/[0.04]"
    >
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Tìm kiếm
        </span>
        <input
          type="search"
          value={filters.keyword}
          onChange={(event) => onChange({ ...filters, keyword: event.target.value })}
          placeholder="Tên hoặc mã môn học"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Trạng thái
        </span>
        <select
          value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value })}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="self-end rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Đang lọc..." : "Áp dụng"}
      </button>
    </form>
  );
}
