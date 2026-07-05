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
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Tìm kiếm
          </span>
          <input
            type="search"
            value={filters.keyword}
            onChange={(event) => onChange({ ...filters, keyword: event.target.value })}
            placeholder="Tên hoặc mã môn học"
            className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#414496] focus:ring-4 focus:ring-[#414496]/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Trạng thái
          </span>
          <select
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value })}
            className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-[#414496] focus:ring-4 focus:ring-[#414496]/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
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
          className="inline-flex h-12 items-center justify-center rounded-lg bg-[#414496] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#353878] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Đang lọc..." : "Áp dụng"}
        </button>
      </div>
    </form>
  );
}
