import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Field, Input } from "../../components/ui";
import { register } from "../../services/authService";

const initialForm = {
  full_name: "",
  email: "",
  password: "",
  confirm_password: "",
  phone: "",
  student_code: "",
};

function validate(form) {
  const errors = {};

  if (!form.full_name.trim()) {
    errors.full_name = "Họ tên là bắt buộc.";
  } else if (form.full_name.trim().length < 3) {
    errors.full_name = "Họ tên phải có ít nhất 3 ký tự.";
  }

  if (!form.email.trim()) {
    errors.email = "Email là bắt buộc.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Email không đúng định dạng.";
  }

  if (!form.password) {
    errors.password = "Mật khẩu là bắt buộc.";
  } else if (form.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  if (!form.confirm_password) {
    errors.confirm_password = "Vui lòng nhập lại mật khẩu.";
  } else if (form.confirm_password !== form.password) {
    errors.confirm_password = "Mật khẩu nhập lại không khớp.";
  }

  if (form.phone && !/^(0|\+84)[0-9]{8,10}$/.test(form.phone)) {
    errors.phone = "Số điện thoại không hợp lệ.";
  }

  if (form.student_code.length > 50) {
    errors.student_code = "Mã sinh viên không được vượt quá 50 ký tự.";
  }

  return errors;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setMessage("");

    try {
      await register(form);
      navigate("/login", {
        replace: true,
        state: { message: "Đăng ký tài khoản thành công. Vui lòng đăng nhập." },
      });
    } catch (err) {
      setErrors(err.errors || {});
      setMessage(err.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-88px)] place-items-center px-5 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <p className="text-sm font-extrabold uppercase tracking-wide text-blue-600">StudyMate AI</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Đăng ký tài khoản sinh viên</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Tạo tài khoản để quản lý môn học, lịch học và tiến độ cá nhân.</p>
        </div>

        <Card className="p-6">
          <Alert tone="error" className="mb-4">{message}</Alert>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <Field label="Họ tên" error={errors.full_name}>
              <Input value={form.full_name} onChange={(event) => updateField("full_name", event.target.value)} placeholder="Trần Thị Mỹ Lệ" />
            </Field>

            <Field label="Email" error={errors.email}>
              <Input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="student@example.com" />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Mật khẩu" error={errors.password}>
                <Input type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} placeholder="Tối thiểu 6 ký tự" />
              </Field>

              <Field label="Nhập lại mật khẩu" error={errors.confirm_password}>
                <Input type="password" value={form.confirm_password} onChange={(event) => updateField("confirm_password", event.target.value)} placeholder="Nhập lại mật khẩu" />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Số điện thoại" error={errors.phone}>
                <Input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="0336655409" />
              </Field>

              <Field label="Mã sinh viên" error={errors.student_code}>
                <Input value={form.student_code} onChange={(event) => updateField("student_code", event.target.value)} placeholder="24211TT3192" />
              </Field>
            </div>

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-extrabold text-blue-600 hover:text-blue-700">
              Đăng nhập
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
