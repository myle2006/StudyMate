import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

  return fallback || "/subjects";
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
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="mb-6">
          <p className="text-sm font-extrabold uppercase text-blue-600 dark:text-blue-300">
            StudyMate AI
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
            Đăng nhập
          </h1>
        </div>

        {message && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Email
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
            {errors.email && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.email}</p>}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Mật khẩu
            </span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
            {errors.password && (
              <p className="mt-2 text-sm font-semibold text-rose-600">{errors.password}</p>
            )}
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
            Đăng ký
          </Link>
        </p>
      </section>
    </main>
  );
}
