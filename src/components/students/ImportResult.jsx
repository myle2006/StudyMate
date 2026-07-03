import React from "react";

export default function ImportResult({ result }) {
  if (!result) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
        Kết quả import
      </h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950/70">
          <p className="text-sm font-bold text-slate-500">Tổng dòng</p>
          <p className="mt-1 text-2xl font-extrabold">{result.summary?.total_rows || 0}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-4 text-emerald-700">
          <p className="text-sm font-bold">Thành công</p>
          <p className="mt-1 text-2xl font-extrabold">{result.summary?.success_count || 0}</p>
        </div>
        <div className="rounded-lg bg-rose-50 p-4 text-rose-700">
          <p className="text-sm font-bold">Thất bại</p>
          <p className="mt-1 text-2xl font-extrabold">{result.summary?.failed_count || 0}</p>
        </div>
      </div>

      {result.errors?.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Dòng", "Email", "Mã sinh viên", "Lỗi"].map((column) => (
                  <th key={column} className="px-4 py-3 text-left font-extrabold text-slate-600">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {result.errors.map((error, index) => (
                <tr key={`${error.row}-${index}`}>
                  <td className="px-4 py-3 font-semibold">{error.row}</td>
                  <td className="px-4 py-3">{error.email || "-"}</td>
                  <td className="px-4 py-3">{error.student_code || "-"}</td>
                  <td className="px-4 py-3 text-rose-600">{error.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
