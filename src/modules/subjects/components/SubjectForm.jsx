import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Field, Input, Select, Textarea } from "../../../components/ui";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DEFAULT_FORM = {
  subject_code: "",
  subject_name: "",
  credits: "3",
  status: "studying",
  description: "",
  color: "#2563EB",
  image: "",
};

function validateForm(form, imageFile, mode) {
  const errors = {};
  const credits = String(form.credits ?? "").trim();

  if (!form.subject_name.trim()) {
    errors.subject_name = "Tên môn học là bắt buộc.";
  }

  if (mode === "create" && !form.subject_code.trim()) {
    errors.subject_code = "Mã môn học là bắt buộc.";
  } else if (form.subject_code && !/^[A-Za-z0-9_-]+$/.test(form.subject_code)) {
    errors.subject_code = "Mã môn học chỉ chứa chữ, số, gạch ngang hoặc gạch dưới.";
  }

  if (!credits) {
    errors.credits = "Số tín chỉ là bắt buộc.";
  } else if (!/^[0-9]+$/.test(credits)) {
    errors.credits = "Số tín chỉ phải là số nguyên.";
  } else if (Number(credits) < 1 || Number(credits) > 30) {
    errors.credits = "Số tín chỉ phải từ 1 đến 30.";
  }

  if (!["studying", "paused", "completed"].includes(form.status)) {
    errors.status = "Trạng thái môn học không hợp lệ.";
  }

  if (form.color && !/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(form.color)) {
    errors.color = "Màu đại diện phải là mã hex hợp lệ.";
  }

  if (imageFile) {
    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
      errors.image = "Ảnh chỉ hỗ trợ jpg, jpeg, png, webp hoặc gif.";
    } else if (imageFile.size > MAX_IMAGE_SIZE) {
      errors.image = "Ảnh môn học không được vượt quá 2MB.";
    }
  }

  return errors;
}

export default function SubjectForm({
  mode = "create",
  initialValues = {},
  submitting = false,
  apiErrors = {},
  onSubmit,
}) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...initialValues });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialValues.image || "");
  const [clientErrors, setClientErrors] = useState({});
  const errors = useMemo(() => ({ ...clientErrors, ...apiErrors }), [apiErrors, clientErrors]);

  useEffect(() => {
    setForm({ ...DEFAULT_FORM, ...initialValues, credits: String(initialValues.credits ?? "3") });
    setPreviewUrl(initialValues.image || "");
    setImageFile(null);
  }, [initialValues?.id]);

  useEffect(() => {
    if (!imageFile) return undefined;

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;
    setImageFile(file);

    if (!file) {
      setPreviewUrl(initialValues.image || "");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm(form, imageFile, mode);
    setClientErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const payload = new FormData();
    payload.append("subject_name", form.subject_name.trim());
    payload.append("credits", String(form.credits ?? "3").trim());
    payload.append("status", form.status);
    payload.append("description", form.description.trim());
    payload.append("color", form.color || "#2563EB");

    if (mode === "create") {
      payload.append("subject_code", form.subject_code.trim());
    }

    if (imageFile) {
      payload.append("image", imageFile);
    }

    onSubmit?.(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Tên môn học" error={errors.subject_name}>
            <Input name="subject_name" value={form.subject_name} onChange={handleChange} placeholder="Ví dụ: Lập trình React" />
          </Field>

          <Field label="Mã môn học" error={errors.subject_code}>
            <Input name="subject_code" value={form.subject_code} onChange={handleChange} disabled={mode === "edit"} placeholder="Ví dụ: REACT101" />
          </Field>

          <Field label="Số tín chỉ" error={errors.credits}>
            <Input type="number" min="1" max="30" step="1" name="credits" value={form.credits} onChange={handleChange} />
          </Field>

          <Field label="Trạng thái" error={errors.status}>
            <Select name="status" value={form.status} onChange={handleChange}>
              <option value="studying">Đang học</option>
              <option value="paused">Tạm khóa</option>
              <option value="completed">Hoàn thành</option>
            </Select>
          </Field>

          <Field label="Màu đại diện" error={errors.color} className="md:col-span-2">
            <div className="mt-2 flex gap-2">
              <input type="color" name="color" value={form.color} onChange={handleChange} className="h-12 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1" />
              <Input name="color" value={form.color} onChange={handleChange} placeholder="#2563EB" className="mt-0" />
            </div>
          </Field>
        </div>

        <Field label="Mô tả" className="mt-5">
          <Textarea name="description" value={form.description} onChange={handleChange} rows={7} placeholder="Nhập mô tả ngắn về môn học" />
        </Field>
      </Card>

      <Card className="p-5">
        <div
          className="grid aspect-video place-items-center overflow-hidden rounded-xl border border-slate-200 text-white"
          style={{ backgroundColor: form.color || "#2563EB" }}
        >
          {previewUrl ? (
            <img src={previewUrl} alt={form.subject_name || "Ảnh môn học"} className="h-full w-full object-cover" />
          ) : (
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-white/20 text-3xl font-black">
                {(form.subject_name || "M").trim().charAt(0).toUpperCase() || "M"}
              </div>
              <p className="mt-3 max-w-64 truncate px-4 text-sm font-bold">{form.subject_name || "Tên môn học"}</p>
              <p className="mt-1 text-xs font-semibold text-white/80">{form.credits || 3} tín chỉ</p>
            </div>
          )}
        </div>

        <Field label="Hình ảnh môn học" error={errors.image} hint="Tối đa 2MB. Hỗ trợ jpg, jpeg, png, webp, gif." className="mt-5">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            className="mt-2 w-full rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-blue-700"
          />
        </Field>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row xl:flex-col">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Đang lưu..." : mode === "edit" ? "Cập nhật môn học" : "Thêm môn học"}
          </Button>
          <Button to="/admin/subjects" variant="secondary" size="lg">
            Hủy
          </Button>
        </div>
      </Card>
    </form>
  );
}
