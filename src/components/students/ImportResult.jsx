import React from "react";
import { Card } from "../ui";

export default function ImportResult({ result }) {
  if (!result) return null;

  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-slate-950">Kết quả import</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-500">Tổng dòng</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{result.summary?.total_rows || 0}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4 text-emerald-700">
          <p className="text-sm font-bold">Thành công</p>
          <p className="mt-1 text-2xl font-black">{result.summary?.success_count || 0}</p>
        </div>
        <div className="rounded-xl bg-rose-50 p-4 text-rose-700">
          <p className="text-sm font-bold">Thất bại</p>
          <p className="mt-1 text-2xl font-black">{result.summary?.failed_count || 0}</p>
        </div>
      </div>

      {result.errors?.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Dòng", "Email", "Mã sinh viên", "Lỗi"].map((column) => (
                  <th key={column} className="px-4 py-3 text-left font-black text-slate-600">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {result.errors.map((error, index) => (
                <tr key={`${error.row}-${index}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{error.row}</td>
                  <td className="px-4 py-3">{error.email || "-"}</td>
                  <td className="px-4 py-3">{error.student_code || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-rose-600">{error.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
