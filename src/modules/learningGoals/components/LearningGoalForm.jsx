import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Field, Input, Select, Textarea } from "../../../components/ui";

const DEFAULT_FORM = {
  subject_id: "",
  title: "",
  goal_description: "",
  current_level: "beginner",
  study_time_per_day: "1",
  start_date: "",
  end_date: "",
  status: "active",
};

function validateForm(form) {
  const errors = {};

  if (!form.subject_id) {
    errors.subject_id = "Môn học là bắt buộc.";
  }

  if (!form.title.trim()) {
    errors.title = "Tiêu đề mục tiêu là bắt buộc.";
  }

  if (!form.goal_description.trim()) {
    errors.goal_description = "Mô tả mục tiêu là bắt buộc.";
  }

  if (!["beginner", "intermediate", "advanced"].includes(form.current_level)) {
    errors.current_level = "Trình độ hiện tại không hợp lệ.";
  }

  if (!form.study_time_per_day || Number(form.study_time_per_day) <= 0) {
    errors.study_time_per_day = "Thời gian học mỗi ngày phải lớn hơn 0.";
  }

  if (!form.start_date) {
    errors.start_date = "Ngày bắt đầu là bắt buộc.";
  }

  if (!form.end_date) {
    errors.end_date = "Ngày kết thúc là bắt buộc.";
  }

  if (form.start_date && form.end_date && form.start_date > form.end_date) {
    errors.end_date = "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.";
  }

  if (!["active", "completed", "paused", "cancelled"].includes(form.status)) {
    errors.status = "Trạng thái mục tiêu không hợp lệ.";
  }

  return errors;
}

export default function LearningGoalForm({
  mode = "create",
  subjects = [],
  initialValues = {},
  submitting = false,
  apiErrors = {},
  onSubmit,
}) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...initialValues });
  const [clientErrors, setClientErrors] = useState({});
  const errors = useMemo(() => ({ ...clientErrors, ...apiErrors }), [clientErrors, apiErrors]);

  useEffect(() => {
    setForm({ ...DEFAULT_FORM, ...initialValues });
    setClientErrors({});
  }, [initialValues?.id]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit?.({
      subject_id: Number(form.subject_id),
      title: form.title.trim(),
      goal_description: form.goal_description.trim(),
      current_level: form.current_level,
      study_time_per_day: Number(form.study_time_per_day),
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Môn học" error={errors.subject_id}>
            <Select name="subject_id" value={form.subject_id} onChange={handleChange}>
              <option value="">Chọn môn học được gán</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_code} - {subject.subject_name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Trạng thái" error={errors.status}>
            <Select name="status" value={form.status} onChange={handleChange}>
              <option value="active">Đang thực hiện</option>
              <option value="completed">Hoàn thành</option>
              <option value="paused">Tạm dừng</option>
              <option value="cancelled">Đã hủy</option>
            </Select>
          </Field>

          <Field label="Tiêu đề mục tiêu" error={errors.title} className="md:col-span-2">
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ví dụ: Hoàn thành nền tảng lập trình PHP MVC"
            />
          </Field>

          <Field label="Trình độ hiện tại" error={errors.current_level}>
            <Select name="current_level" value={form.current_level} onChange={handleChange}>
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung cấp</option>
              <option value="advanced">Nâng cao</option>
            </Select>
          </Field>

          <Field label="Thời gian học mỗi ngày" error={errors.study_time_per_day} hint="Đơn vị: giờ/ngày">
            <Input
              type="number"
              min="0.1"
              step="0.1"
              name="study_time_per_day"
              value={form.study_time_per_day}
              onChange={handleChange}
            />
          </Field>

          <Field label="Ngày bắt đầu" error={errors.start_date}>
            <Input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
          </Field>

          <Field label="Ngày kết thúc" error={errors.end_date}>
            <Input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
          </Field>
        </div>

        <Field label="Mô tả mục tiêu" error={errors.goal_description} className="mt-5">
          <Textarea
            name="goal_description"
            value={form.goal_description}
            onChange={handleChange}
            rows={8}
            placeholder="Nhập mục tiêu cụ thể, kết quả mong muốn, phạm vi kiến thức cần đạt..."
          />
        </Field>
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-black text-slate-950">Dữ liệu đầu vào AI</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Mục tiêu này sẽ là dữ liệu nền để AI tạo lộ trình học cá nhân hóa theo môn học, trình độ và quỹ thời gian của bạn.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button type="submit" size="lg" disabled={submitting || subjects.length === 0}>
            {submitting ? "Đang lưu..." : mode === "edit" ? "Cập nhật mục tiêu" : "Tạo mục tiêu"}
          </Button>
          <Button to="/student/learning-goals" variant="secondary" size="lg">
            Hủy
          </Button>
        </div>
      </Card>
    </form>
  );
}
