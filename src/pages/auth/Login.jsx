import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Alert, Button, Card, Field, Input } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

function validate(form) {
  const errors = {};

  if (!form.email.trim()) {
    errors.email = "Email là bắt buộc.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Email không đúng định dạng.";
  }

  if (!form.password) {
    errors.password = "Mật khẩu là bắt buộc.";
  }

  return errors;
}

function redirectByRole(user, fallback) {
  if (user?.role === "admin") return "/admin";
  if (user?.role === "student") return "/dashboard";

  return fallback || "/login";
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectByRole(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

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
      const response = await login(form);
      navigate(redirectByRole(response.data, response.data.redirect_url), { replace: true });
    } catch (err) {
      setErrors(err.errors || {});
      setMessage(err.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-88px)] place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Đăng nhập StudyMate AI</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">Tiếp tục vào không gian học tập cá nhân hóa của bạn.</p>
        </div>

        <Card className="p-6">
          <Alert tone={message.includes("thất bại") ? "error" : "info"} className="mb-4">
            {message}
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="student@example.com"
              />
            </Field>

            <Field label="Mật khẩu" error={errors.password}>
              <Input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="Nhập mật khẩu"
              />
            </Field>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="font-extrabold text-blue-600 hover:text-blue-700">
              Đăng ký sinh viên
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
