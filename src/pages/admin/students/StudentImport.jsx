import React, { useState } from "react";
import { ArrowLeft, Download, UploadCloud } from "lucide-react";
import ImportResult from "../../../components/students/ImportResult";
import { Alert, Button, Card, PageHeader, useToast } from "../../../components/ui";
import { downloadImportTemplate, importStudents } from "../../../services/studentService";

const allowedExtensions = ["csv", "xls", "xlsx"];

export default function StudentImport() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
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
      toast.success("Đã tải file mẫu import.");
    } catch (err) {
      setError(err.message || "Không thể tải file mẫu.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
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
      setResult(response);
      toast.success(response.message || "Import danh sách sinh viên hoàn tất.");
    } catch (err) {
      setError(err.errors?.file || err.message || "Import thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quản lý sinh viên"
        title="Import sinh viên"
        description="Tải lên CSV hoặc Excel để tạo nhiều tài khoản sinh viên cùng lúc."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button to="/admin/students" variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
            <Button type="button" variant="secondary" onClick={handleDownloadTemplate}>
              <Download size={16} /> File mẫu
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-slate-950">Chọn file import</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                CSV chạy ổn định nhất trên cPanel. XLSX cần PHP có ZipArchive; XLS cần PhpSpreadsheet.
              </p>
            </div>

            <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50">
              <UploadCloud className="text-blue-600" size={34} />
              <span className="mt-3 text-sm font-black text-slate-950">
                {file ? file.name : "Bấm để chọn file CSV, XLS hoặc XLSX"}
              </span>
              <span className="mt-1 text-xs font-semibold text-slate-500">Dung lượng tối đa 5MB</span>
              <input type="file" accept=".csv,.xls,.xlsx" onChange={handleFileChange} className="sr-only" />
            </label>

            <Alert tone="error">{error}</Alert>

            <Button type="submit" disabled={loading}>
              <UploadCloud size={16} /> {loading ? "Đang import..." : "Import sinh viên"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-black text-slate-950">Định dạng file</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Dòng đầu tiên phải là header với các cột sau:</p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs font-semibold text-white">
full_name,email,phone,student_code,password,status
          </pre>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
            <li>full_name, email, student_code là bắt buộc.</li>
            <li>password có thể trống, hệ thống sẽ dùng student_code.</li>
            <li>status nhận active, inactive hoặc locked.</li>
            <li>File tối đa 5MB và không thực thi nội dung upload.</li>
          </ul>
        </Card>
      </div>

      <ImportResult result={result} />
    </div>
  );
}
