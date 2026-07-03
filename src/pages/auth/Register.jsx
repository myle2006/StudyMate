import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  } else if (form.full_name.trim().length > 150) {
    errors.full_name = "Họ tên không được vượt quá 150 ký tự.";
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
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10 dark:bg-slate-950">
      <section className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="mb-6">
          <p className="text-sm font-extrabold uppercase text-blue-600 dark:text-blue-300">
            StudyMate AI
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
            Đăng ký tài khoản sinh viên
          </h1>
        </div>

        {message && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Họ tên
            </span>
            <input
              value={form.full_name}
              onChange={(event) => updateField("full_name", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
            {errors.full_name && (
              <p className="mt-2 text-sm font-semibold text-rose-600">{errors.full_name}</p>
            )}
          </label>

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

          <div className="grid gap-5 md:grid-cols-2">
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

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Nhập lại mật khẩu
              </span>
              <input
                type="password"
                value={form.confirm_password}
                onChange={(event) => updateField("confirm_password", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
              {errors.confirm_password && (
                <p className="mt-2 text-sm font-semibold text-rose-600">
                  {errors.confirm_password}
                </p>
              )}
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Số điện thoại
              </span>
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
              {errors.phone && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.phone}</p>}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Mã sinh viên
              </span>
              <input
                value={form.student_code}
                onChange={(event) => updateField("student_code", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
              {errors.student_code && (
                <p className="mt-2 text-sm font-semibold text-rose-600">{errors.student_code}</p>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
            Đăng nhập
          </Link>
        </p>
      </section>
    </main>
  );
}
