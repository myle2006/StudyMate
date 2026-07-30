import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Field, Input, Select, Textarea } from "../../../components/ui";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "zip", "rar", "png", "jpg", "jpeg"];
const DEFAULT_FORM = {
  subject_id: "",
  title: "",
  description: "",
  deadline: "",
  status: "draft",
};

function toDatetimeLocal(value) {
  if (!value) return "";
  return String(value).replace(" ", "T").slice(0, 16);
}

function validateForm(form, attachmentFile) {
  const errors = {};

  if (!form.subject_id) {
    errors.subject_id = "Môn học là bắt buộc.";
  }

  if (!form.title.trim()) {
    errors.title = "Tiêu đề bài tập là bắt buộc.";
  }

  if (!form.deadline) {
    errors.deadline = "Deadline là bắt buộc.";
  } else if (form.status === "open" && new Date(form.deadline).getTime() <= Date.now()) {
    errors.deadline = "Deadline phải lớn hơn thời gian hiện tại khi trạng thái là open.";
  }

  if (!["open", "closed", "draft"].includes(form.status)) {
    errors.status = "Trạng thái không hợp lệ.";
  }

  if (attachmentFile) {
    const extension = attachmentFile.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      errors.attachment = "File chỉ hỗ trợ pdf, doc, docx, zip, rar, png, jpg hoặc jpeg.";
    } else if (attachmentFile.size > MAX_FILE_SIZE) {
      errors.attachment = "File đính kèm không được vượt quá 10MB.";
    }
  }

  return errors;
}

export default function AssignmentForm({
  mode = "create",
  subjects = [],
  initialValues = {},
  submitting = false,
  apiErrors = {},
  onSubmit,
}) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...initialValues, deadline: toDatetimeLocal(initialValues.deadline) });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [clientErrors, setClientErrors] = useState({});
  const errors = useMemo(() => ({ ...clientErrors, ...apiErrors }), [clientErrors, apiErrors]);

  useEffect(() => {
    setForm({ ...DEFAULT_FORM, ...initialValues, deadline: toDatetimeLocal(initialValues.deadline) });
    setAttachmentFile(null);
    setClientErrors({});
  }, [initialValues?.id]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleFileChange(event) {
    setAttachmentFile(event.target.files?.[0] || null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(form, attachmentFile);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = new FormData();
    payload.append("subject_id", form.subject_id);
    payload.append("title", form.title.trim());
    payload.append("description", form.description.trim());
    payload.append("deadline", form.deadline);
    payload.append("status", form.status);

    if (attachmentFile) {
      payload.append("attachment", attachmentFile);
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
              <option value="open">Đang mở</option>
              <option value="closed">Đã đóng</option>
            </Select>
          </Field>

          <Field label="Tiêu đề" error={errors.title} className="md:col-span-2">
            <Input name="title" value={form.title} onChange={handleChange} placeholder="Ví dụ: Nộp báo cáo kiểm thử chức năng" />
          </Field>

          <Field label="Deadline" error={errors.deadline} className="md:col-span-2">
            <Input type="datetime-local" name="deadline" value={form.deadline} onChange={handleChange} />
          </Field>
        </div>

        <Field label="Mô tả" className="mt-5">
          <Textarea name="description" value={form.description} onChange={handleChange} rows={8} placeholder="Nhập yêu cầu bài tập, tiêu chí nộp bài hoặc ghi chú cho sinh viên" />
        </Field>
      </Card>

      <Card className="p-5">
        <Field
          label="File đính kèm"
          error={errors.attachment}
          hint="Tối đa 10MB. Hỗ trợ pdf, doc, docx, zip, rar, png, jpg, jpeg."
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,.zip,.rar,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="mt-2 w-full rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-blue-700"
          />
        </Field>

        {initialValues.attachment_path && !attachmentFile && (
          <a
            href={initialValues.attachment_path}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            Xem file hiện tại
          </a>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {submitting && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700" role="status" aria-live="polite">
              Đang xử lý, vui lòng chờ...
            </div>
          )}
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Đang lưu..." : mode === "edit" ? "Cập nhật bài tập" : "Tạo bài tập"}
          </Button>
          <Button to="/admin/assignments" variant="secondary" size="lg">
            Hủy
          </Button>
        </div>
      </Card>
    </form>
  );
}
