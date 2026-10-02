import React, { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Alert, Button, Card, Field, Input } from "../../components/ui";
import { changePassword } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function ChangePassword() {
  const { user } = useAuth();
  const [form, setForm] = useState({ new_password: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      const response = await changePassword(form);
      const basePath = window.STUDYMATE_BASE_PATH || "";
      const nextPath = response.data?.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
      window.location.assign(`${basePath}${nextPath}`);
    } catch (err) {
      setError(err.message || "Không thể đổi mật khẩu.");
      setFieldErrors(err.errors || {});
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-88px)] place-items-center px-5 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-amber-500 text-white"><LockKeyhole size={24} /></div>
          <h1 className="mt-4 text-2xl font-black text-slate-950">Đổi mật khẩu bắt buộc</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Tài khoản {user?.student_code || user?.email} đang sử dụng mật khẩu mặc định. Hãy tạo mật khẩu mới để tiếp tục.</p>
        </div>
        <Alert tone="error" className="mt-5">{error}</Alert>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field label="Mật khẩu mới" error={fieldErrors.new_password}>
            <Input type="password" value={form.new_password} onChange={(event) => setForm({ ...form, new_password: event.target.value })} placeholder="Ít nhất 6 ký tự" />
          </Field>
          <Field label="Nhập lại mật khẩu mới" error={fieldErrors.confirm_password}>
            <Input type="password" value={form.confirm_password} onChange={(event) => setForm({ ...form, confirm_password: event.target.value })} placeholder="Nhập lại mật khẩu mới" />
          </Field>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Đang cập nhật..." : "Đổi mật khẩu"}</Button>
        </form>
      </Card>
    </main>
  );
}
