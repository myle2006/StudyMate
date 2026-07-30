import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Field, Input, Select, Textarea } from "../../../components/ui";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "zip", "rar", "png", "jpg", "jpeg"];

const DEFAULT_FORM = {
  subject_id: "",
  title: "",
  content: "",
  video_url: "",
  external_url: "",
  duration_minutes: "",
  status: "draft",
};

function validateForm(form, materialFile) {
  const errors = {};

  if (!form.subject_id) {
    errors.subject_id = "Môn học là bắt buộc.";
  }

  if (!form.title.trim()) {
    errors.title = "Tiêu đề bài học là bắt buộc.";
  }

  ["video_url", "external_url"].forEach((field) => {
    if (form[field] && !/^https?:\/\/.+/i.test(form[field])) {
      errors[field] = "Đường dẫn phải bắt đầu bằng http:// hoặc https://.";
    }
  });

  if (materialFile) {
    const extension = materialFile.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      errors.material = "Tài liệu không đúng định dạng hỗ trợ.";
    } else if (materialFile.size > MAX_FILE_SIZE) {
      errors.material = "Tài liệu không được vượt quá 20MB.";
    }
  }

  return errors;
}

export default function LessonForm({ mode = "create", subjects = [], initialValues = {}, submitting = false, apiErrors = {}, onSubmit }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...initialValues });
  const [materialFile, setMaterialFile] = useState(null);
  const [clientErrors, setClientErrors] = useState({});
  const errors = useMemo(() => ({ ...clientErrors, ...apiErrors }), [apiErrors, clientErrors]);

  useEffect(() => {
    setForm({ ...DEFAULT_FORM, ...initialValues, duration_minutes: String(initialValues.duration_minutes ?? "") });
    setMaterialFile(null);
    setClientErrors({});
  }, [initialValues?.id]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm(form, materialFile);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = new FormData();
    payload.append("subject_id", form.subject_id);
    payload.append("title", form.title.trim());
    payload.append("content", form.content.trim());
    payload.append("video_url", form.video_url.trim());
    payload.append("external_url", form.external_url.trim());
    payload.append("duration_minutes", String(form.duration_minutes || "").trim());
    payload.append("status", form.status);

    if (materialFile) {
      payload.append("material", materialFile);
    }

    onSubmit?.(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Môn học" error={errors.subject_id}>
            <Select name="subject_id" value={form.subject_id} onChange={handleChange}>
              <option value="">Chọn môn học</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_code} - {subject.subject_name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Trạng thái" error={errors.status}>
            <Select name="status" value={form.status} onChange={handleChange}>
              <option value="draft">Nháp</option>
              <option value="published">Xuất bản</option>
            </Select>
          </Field>

          <Field label="Tiêu đề" error={errors.title} className="md:col-span-2">
            <Input name="title" value={form.title} onChange={handleChange} placeholder="Ví dụ: Tổng quan kiểm thử chức năng" />
          </Field>

          <Field label="Video URL" error={errors.video_url}>
            <Input name="video_url" value={form.video_url || ""} onChange={handleChange} placeholder="https://..." />
          </Field>

          <Field label="Link tham khảo" error={errors.external_url}>
            <Input name="external_url" value={form.external_url || ""} onChange={handleChange} placeholder="https://..." />
          </Field>

          <Field label="Thời lượng phút" error={errors.duration_minutes} className="md:col-span-2">
            <Input type="number" min="0" name="duration_minutes" value={form.duration_minutes || ""} onChange={handleChange} placeholder="45" />
          </Field>
        </div>

        <Field label="Nội dung bài học" className="mt-5">
          <Textarea name="content" value={form.content || ""} onChange={handleChange} rows={10} placeholder="Nhập nội dung, mục tiêu học tập hoặc hướng dẫn đọc tài liệu." />
        </Field>
      </Card>

      <Card className="p-5">
        <Field
          label="Tài liệu đính kèm"
          error={errors.material}
          hint="Tối đa 20MB. Hỗ trợ pdf, doc, docx, ppt, pptx, xls, xlsx, zip, rar, png, jpg, jpeg."
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg"
            onChange={(event) => setMaterialFile(event.target.files?.[0] || null)}
            className="mt-2 w-full rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-blue-700"
          />
        </Field>

        {initialValues.material_path && !materialFile && (
          <a href={initialValues.material_path} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-bold text-blue-600 hover:text-blue-700">
            Xem tài liệu hiện tại
          </a>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Đang lưu..." : mode === "edit" ? "Cập nhật bài học" : "Tạo bài học"}
          </Button>
          <Button to="/admin/lessons" variant="secondary" size="lg">
            Hủy
          </Button>
        </div>
      </Card>
    </form>
  );
}
