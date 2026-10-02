import React from "react";
import { CalendarCheck2 } from "lucide-react";

export default function StudyScheduleFilter({ filters, subjects, onChange, onToday }) {
  return (
    <section className="grid gap-3 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-sm shadow-slate-200/60 md:grid-cols-2 xl:grid-cols-6">
      <label className="block">
        <span className="text-xs font-extrabold uppercase text-slate-500">Chế độ xem</span>
        <select name="view" value={filters.view} onChange={onChange} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-semibold outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
          <option value="day">Ngày</option>
          <option value="week">Tuần</option>
          <option value="month">Tháng</option>
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-extrabold uppercase text-slate-500">Mốc ngày</span>
        <input type="date" name="date" value={filters.date} onChange={onChange} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-semibold outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
      </label>

      <div className="flex items-end">
        <button
          type="button"
          onClick={onToday}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-extrabold text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <CalendarCheck2 className="h-4 w-4" />
          Hôm nay
        </button>
      </div>

      <label className="block">
        <span className="text-xs font-extrabold uppercase text-slate-500">Môn học</span>
        <select name="subject_id" value={filters.subject_id} onChange={onChange} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-semibold outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
          <option value="">Tất cả môn học</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subject_code} - {subject.subject_name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-extrabold uppercase text-slate-500">Loại lịch</span>
        <select name="schedule_type" value={filters.schedule_type} onChange={onChange} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-semibold outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
          <option value="">Tất cả loại lịch</option>
          <option value="class">Học trên lớp</option>
          <option value="self_study">Tự học</option>
          <option value="review">Ôn tập</option>
          <option value="assignment">Làm bài tập</option>
          <option value="exam">Thi/kiểm tra</option>
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-extrabold uppercase text-slate-500">Trạng thái</span>
        <select name="status" value={filters.status} onChange={onChange} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-semibold outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
          <option value="">Tất cả trạng thái</option>
          <option value="upcoming">Sắp diễn ra</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </label>
    </section>
  );
}
