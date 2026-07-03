import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createStudent, getStudentById, updateStudent } from "../../../services/studentService";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  student_code: "",
  password: "",
  status: "active",
};

function validate(form, isEdit) {
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

  if (form.phone && !/^(0|\+84)?[0-9]{8,11}$/.test(form.phone)) {
    errors.phone = "Số điện thoại không hợp lệ.";
  }

  if (!form.student_code.trim()) {
    errors.student_code = "Mã sinh viên là bắt buộc.";
  } else if (form.student_code.trim().length > 50) {
    errors.student_code = "Mã sinh viên không được vượt quá 50 ký tự.";
  }

  if (!isEdit && form.password && form.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  if (!["active", "inactive", "locked"].includes(form.status)) {
    errors.status = "Trạng thái không hợp lệ.";
  }

  return errors;
}

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    async function loadStudent() {
      setLoading(true);
      setMessage("");

      try {
        const response = await getStudentById(id);
        setForm({
          full_name: response.data?.full_name || "",
          email: response.data?.email || "",
          phone: response.data?.phone || "",
          student_code: response.data?.student_code || "",
          password: "",
          status: response.data?.status || "active",
        });
      } catch (err) {
        setMessage(err.message || "Không thể tải thông tin sinh viên.");
      } finally {
        setLoading(false);
      }
    }

    loadStudent();
  }, [id, isEdit]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form, isEdit);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setMessage("");

    try {
      if (isEdit) {
        const { password, ...payload } = form;
        await updateStudent(id, payload);
      } else {
        await createStudent(form);
      }
      navigate("/admin/students");
    } catch (err) {
      setErrors(err.errors || {});
      setMessage(err.message || "Không thể lưu sinh viên.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-6">
          <Link to="/admin/students" className="text-sm font-bold text-blue-600 hover:text-blue-700">
            Quay lại danh sách
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white">
            {isEdit ? "Cập nhật sinh viên" : "Thêm sinh viên"}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
        >
          {message && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {message}
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Họ tên
              </span>
              <input
                value={form.full_name}
                onChange={(event) => updateField("full_name", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
              {errors.full_name && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.full_name}</p>}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Email
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
              {errors.email && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.email}</p>}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Mã sinh viên
              </span>
              <input
                value={form.student_code}
                onChange={(event) => updateField("student_code", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
              {errors.student_code && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.student_code}</p>}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Số điện thoại
              </span>
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
              {errors.phone && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.phone}</p>}
            </label>

            {!isEdit && (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Mật khẩu
                </span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Để trống để dùng mã sinh viên"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
                {errors.password && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.password}</p>}
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Trạng thái
              </span>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Vô hiệu hóa</option>
                <option value="locked">Bị khóa</option>
              </select>
              {errors.status && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.status}</p>}
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/admin/students"
              className="inline-flex justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-white/10 dark:text-slate-200"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm sinh viên"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
