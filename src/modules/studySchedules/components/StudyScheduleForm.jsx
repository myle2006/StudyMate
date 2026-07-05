import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Field, Input, Select, Textarea } from "../../../components/ui";

const DEFAULT_FORM = {
  subject_id: "",
  title: "",
  description: "",
  study_date: localToday(),
  start_time: "08:00",
  end_time: "09:30",
  location: "",
  schedule_type: "self_study",
  status: "upcoming",
};

function localToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function validateForm(form) {
  const errors = {};

  if (!form.subject_id) errors.subject_id = "Vui lòng chọn môn học.";
  if (!form.title.trim()) errors.title = "Tiêu đề lịch học là bắt buộc.";
  if (!form.study_date) errors.study_date = "Ngày học là bắt buộc.";
  if (!form.start_time) errors.start_time = "Giờ bắt đầu là bắt buộc.";
  if (!form.end_time) errors.end_time = "Giờ kết thúc là bắt buộc.";
  if (form.start_time && form.end_time && form.end_time <= form.start_time) {
    errors.end_time = "Giờ kết thúc phải lớn hơn giờ bắt đầu.";
  }

  if (form.status === "upcoming" && form.study_date && form.start_time) {
    const scheduledAt = new Date(`${form.study_date}T${form.start_time}`);
    if (scheduledAt.getTime() < Date.now()) {
      errors.study_date = "Không thể tạo lịch sắp diễn ra ở thời điểm quá khứ.";
    }
  }

  return errors;
}

export default function StudyScheduleForm({
  mode = "create",
  subjects = [],
  initialValues = {},
  submitting = false,
  apiErrors = {},
  onSubmit,
}) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...initialValues });
  const [clientErrors, setClientErrors] = useState({});
  const errors = useMemo(() => ({ ...clientErrors, ...apiErrors }), [apiErrors, clientErrors]);

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
      description: form.description.trim(),
      study_date: form.study_date,
      start_time: form.start_time,
      end_time: form.end_time,
      location: form.location.trim(),
      schedule_type: form.schedule_type,
      status: form.status,
    });
  }

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit}>
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

          <Field label="Tiêu đề lịch học" error={errors.title}>
            <Input name="title" value={form.title} onChange={handleChange} placeholder="Ví dụ: Ôn tập chương 1" />
          </Field>

          <Field label="Ngày học" error={errors.study_date}>
            <Input type="date" name="study_date" value={form.study_date} onChange={handleChange} />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Giờ bắt đầu" error={errors.start_time}>
              <Input type="time" name="start_time" value={form.start_time} onChange={handleChange} />
            </Field>
            <Field label="Giờ kết thúc" error={errors.end_time}>
              <Input type="time" name="end_time" value={form.end_time} onChange={handleChange} />
            </Field>
          </div>

          <Field label="Địa điểm hoặc link học online">
            <Input name="location" value={form.location} onChange={handleChange} placeholder="Phòng B203 hoặc https://..." />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Loại lịch">
              <Select name="schedule_type" value={form.schedule_type} onChange={handleChange}>
                <option value="class">Học trên lớp</option>
                <option value="self_study">Tự học</option>
                <option value="review">Ôn tập</option>
                <option value="assignment">Làm bài tập</option>
                <option value="exam">Thi/kiểm tra</option>
              </Select>
            </Field>
            <Field label="Trạng thái">
              <Select name="status" value={form.status} onChange={handleChange}>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </Select>
            </Field>
          </div>
        </div>

        <Field label="Mô tả" className="mt-5">
          <Textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Ghi chú nội dung cần học" />
        </Field>

        {errors.time && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errors.time}</div>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Đang lưu..." : mode === "edit" ? "Cập nhật lịch học" : "Thêm lịch học"}
          </Button>
          <Button to="/student/schedules" variant="secondary" size="lg">
            Hủy
          </Button>
        </div>
      </form>
    </Card>
  );
}
