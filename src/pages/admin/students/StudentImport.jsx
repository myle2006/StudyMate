import React, { useState } from "react";
import { Link } from "react-router-dom";
import ImportResult from "../../../components/students/ImportResult";
import { downloadImportTemplate, importStudents } from "../../../services/studentService";

const allowedExtensions = ["csv", "xls", "xlsx"];

export default function StudentImport() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setError("");
    setResult(null);
  }

  async function handleDownloadTemplate() {
    setError("");
    try {
      await downloadImportTemplate();
    } catch (err) {
      setError(err.message || "Không thể tải file mẫu.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setResult(null);

    if (!file) {
      setError("Vui lòng chọn file import.");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      setError("File import chỉ hỗ trợ CSV, XLS hoặc XLSX.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File import không được vượt quá 5MB.");
      return;
    }

    setLoading(true);
    try {
      const response = await importStudents(file);
      setMessage(response.message || "Import danh sách sinh viên hoàn tất.");
      setResult(response);
    } catch (err) {
      setError(err.errors?.file || err.message || "Import thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/admin/students" className="text-sm font-bold text-blue-600 hover:text-blue-700">
            Quay lại danh sách
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white">
            Import sinh viên
          </h1>
        </div>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600"
        >
          Tải file mẫu CSV
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
        >
          <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
            Chọn file import
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Hỗ trợ CSV chắc chắn trên cPanel. XLSX chỉ hoạt động nếu PHP server có ZipArchive;
            XLS cần cài PhpSpreadsheet.
          </p>

          <label className="mt-5 block">
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </label>

          {file && (
            <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Đã chọn: {file.name}
            </p>
          )}
          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang import..." : "Import sinh viên"}
          </button>
        </form>

        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
            Định dạng file
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Dòng đầu tiên phải là header. Các cột bắt buộc gồm:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-white">
full_name,email,phone,student_code,password,status
          </pre>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <li>full_name, email, student_code là bắt buộc.</li>
            <li>password có thể trống, hệ thống sẽ dùng student_code.</li>
            <li>status nhận active, inactive hoặc locked.</li>
            <li>File tối đa 5MB.</li>
          </ul>
        </aside>
      </div>

      <div className="mt-6">
        <ImportResult result={result} />
      </div>
    </main>
  );
}
