import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createSubject, getSubjectById, updateSubject } from "../../services/subjectService";

const initialForm = {
  name: "",
  code: "",
  description: "",
  color: "#2563EB",
  icon: "",
  status: "active",
};

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function validate(form, imageFile) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "Tên môn học là bắt buộc.";
  } else if (form.name.trim().length < 3) {
    errors.name = "Tên môn học phải có ít nhất 3 ký tự.";
  } else if (form.name.trim().length > 150) {
    errors.name = "Tên môn học không được vượt quá 150 ký tự.";
  }

  if (form.code.trim().length > 50) {
    errors.code = "Mã môn học không được vượt quá 50 ký tự.";
  }

  if (form.color && !/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(form.color)) {
    errors.color = "Màu môn học không đúng định dạng.";
  }

  if (!["active", "archived"].includes(form.status)) {
    errors.status = "Trạng thái không hợp lệ.";
  }

  if (imageFile) {
    if (!allowedImageTypes.includes(imageFile.type)) {
      errors.image = "Ảnh môn học chỉ hỗ trợ JPG, PNG, WEBP hoặc GIF.";
    } else if (imageFile.size > 2 * 1024 * 1024) {
      errors.image = "Ảnh môn học không được vượt quá 2MB.";
    }
  }

  return errors;
}

function toSubjectFormData(form, imageFile) {
  const formData = new FormData();
  formData.append("name", form.name.trim());
  formData.append("code", form.code.trim());
  formData.append("description", form.description.trim());
  formData.append("color", form.color.trim());
  formData.append("icon", form.icon || "");
  formData.append("status", form.status);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return formData;
}

export default function SubjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const imagePreview = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }

    return form.icon || "";
  }, [imageFile, form.icon]);

  useEffect(() => {
    return () => {
      if (imageFile && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imageFile, imagePreview]);

  useEffect(() => {
    if (!isEdit) return;

    async function loadSubject() {
      setLoading(true);
      setMessage("");

      try {
        const response = await getSubjectById(id);
        setForm({
          name: response.data?.name || "",
          code: response.data?.code || "",
          description: response.data?.description || "",
          color: response.data?.color || "#2563EB",
          icon: response.data?.icon || "",
          status: response.data?.status || "active",
        });
      } catch (err) {
        setMessage(err.message || "Không thể tải môn học.");
      } finally {
        setLoading(false);
      }
    }

    loadSubject();
  }, [id, isEdit]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setErrors((current) => ({ ...current, image: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form, imageFile);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setMessage("");

    try {
      const payload = toSubjectFormData(form, imageFile);
      if (isEdit) {
        await updateSubject(id, payload);
      } else {
        await createSubject(payload);
      }
      navigate("/subjects");
    } catch (err) {
      setErrors(err.errors || {});
      setMessage(err.message || "Không thể lưu môn học.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/subjects" className="text-sm font-bold text-blue-600 hover:text-blue-700">
              Quay lại danh sách
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-950 dark:text-white">
              {isEdit ? "Cập nhật môn học" : "Thêm môn học"}
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] xl:grid-cols-[1fr_360px]"
        >
          <div>
            {message && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {message}
              </div>
            )}

            <div className="grid gap-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Tên môn học
                </span>
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
                {errors.name && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.name}</p>}
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Mã môn học
                  </span>
                  <input
                    value={form.code}
                    onChange={(event) => updateField("code", event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  />
                  {errors.code && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.code}</p>}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Trạng thái
                  </span>
                  <select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="active">Đang học</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                  {errors.status && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.status}</p>}
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Mô tả
                </span>
                <textarea
                  rows={6}
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Màu đại diện
                </span>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={form.color || "#2563EB"}
                    onChange={(event) => updateField("color", event.target.value)}
                    className="h-12 w-14 rounded-lg border border-slate-300 bg-white p-1"
                  />
                  <input
                    value={form.color}
                    onChange={(event) => updateField("color", event.target.value)}
                    placeholder="#2563EB"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                {errors.color && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.color}</p>}
              </label>
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/70">
            <span className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Hình ảnh môn học
            </span>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
              {imagePreview ? (
                <img src={imagePreview} alt="Ảnh môn học" className="h-56 w-full object-cover" />
              ) : (
                <div
                  className="grid h-56 place-items-center text-4xl font-extrabold text-white"
                  style={{ backgroundColor: form.color || "#2563EB" }}
                >
                  {form.name?.charAt(0)?.toUpperCase() || "S"}
                </div>
              )}
            </div>
            <label className="mt-4 block">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
            </label>
            {errors.image && <p className="mt-2 text-sm font-semibold text-rose-600">{errors.image}</p>}
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Chỉ nhận JPG, PNG, WEBP hoặc GIF. Dung lượng tối đa 2MB.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm môn học"}
              </button>
              <Link
                to="/subjects"
                className="inline-flex justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-white/10 dark:text-slate-200"
              >
                Hủy
              </Link>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
