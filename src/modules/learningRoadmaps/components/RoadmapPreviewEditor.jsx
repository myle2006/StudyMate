import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, Select, Textarea } from "../../../components/ui";
import RoadmapProgressBar from "./RoadmapProgressBar";

function normalizeInitial(data = {}) {
  return {
    subject_id: data.subject_id || "",
    learning_goal_id: data.learning_goal_id || "",
    subject_code: data.subject_code || "",
    subject_name: data.subject_name || "",
    title: data.title || "",
    overview: data.overview || "",
    goal: data.goal || "",
    current_level: data.current_level || "beginner",
    study_time_per_day: data.study_time_per_day || "1",
    available_weekdays: Array.isArray(data.available_weekdays)
      ? data.available_weekdays.map(Number)
      : String(data.available_weekdays || "1,2,3,4,5").split(",").filter(Boolean).map(Number),
    preferred_start_time: data.preferred_start_time || "19:00",
    session_duration_minutes: data.session_duration_minutes || "60",
    max_daily_minutes: data.max_daily_minutes || "",
    max_weekly_minutes: data.max_weekly_minutes || "",
    reminder_minutes_before: data.reminder_minutes_before ?? "15",
    start_date: data.start_date || "",
    end_date: data.end_date || "",
    generated_by_ai: Boolean(data.generated_by_ai),
    ai_prompt: data.ai_prompt || "",
    ai_raw_response: data.ai_raw_response || "",
    status: data.status || "active",
    progress_percent: data.progress_percent || 0,
    items: Array.isArray(data.items) ? data.items : [],
  };
}

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Tên lộ trình là bắt buộc.";
  if (!form.goal.trim()) errors.goal = "Mục tiêu là bắt buộc.";
  if (!form.study_time_per_day || Number(form.study_time_per_day) <= 0) errors.study_time_per_day = "Thời gian học phải lớn hơn 0.";
  if (!form.available_weekdays.length) errors.available_weekdays = "Chọn ít nhất một ngày có thể học.";
  if (!form.preferred_start_time) errors.preferred_start_time = "Giờ bắt đầu là bắt buộc.";
  if (!form.session_duration_minutes || Number(form.session_duration_minutes) < 15) errors.session_duration_minutes = "Thời lượng mỗi buổi tối thiểu 15 phút.";
  if (!form.start_date) errors.start_date = "Ngày bắt đầu là bắt buộc.";
  if (!form.end_date) errors.end_date = "Ngày kết thúc là bắt buộc.";
  if (form.start_date && form.end_date && form.start_date > form.end_date) errors.end_date = "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.";
  if (!form.items.length) errors.items = "Lộ trình cần có ít nhất một bước học.";

  const itemErrors = {};
  form.items.forEach((item, index) => {
    if (!item.title?.trim()) {
      itemErrors[index] = { ...(itemErrors[index] || {}), title: "Tên bước học là bắt buộc." };
    }
    if (!item.planned_date) {
      itemErrors[index] = { ...(itemErrors[index] || {}), planned_date: "Ngày học là bắt buộc." };
    }
    if (!item.start_time) {
      itemErrors[index] = { ...(itemErrors[index] || {}), start_time: "Giờ bắt đầu là bắt buộc." };
    }
    if (!item.duration_minutes || Number(item.duration_minutes) < 15) {
      itemErrors[index] = { ...(itemErrors[index] || {}), duration_minutes: "Tối thiểu 15 phút." };
    }
  });
  if (Object.keys(itemErrors).length > 0) errors.itemErrors = itemErrors;

  return errors;
}

const weekdayOptions = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 7, label: "CN" },
];

export default function RoadmapPreviewEditor({
  initialData,
  submitting = false,
  apiErrors = {},
  submitLabel = "Chấp nhận lộ trình",
  onSubmit,
}) {
  const [form, setForm] = useState(normalizeInitial(initialData));
  const [clientErrors, setClientErrors] = useState({});
  const errors = useMemo(() => ({ ...clientErrors, ...apiErrors }), [clientErrors, apiErrors]);

  useEffect(() => {
    setForm(normalizeInitial(initialData));
    setClientErrors({});
  }, [initialData?.id]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleWeekday(day) {
    setForm((current) => {
      const exists = current.available_weekdays.includes(day);
      const nextDays = exists
        ? current.available_weekdays.filter((value) => value !== day)
        : [...current.available_weekdays, day];

      return { ...current, available_weekdays: nextDays.sort((a, b) => a - b) };
    });
  }

  function updateItem(index, field, value) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  }

  function addItem() {
    setForm((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          week_number: current.items.length + 1,
          order_number: current.items.length + 1,
          title: "",
          description: "",
          expected_result: "",
          suggested_task: "",
          planned_date: "",
          start_time: current.preferred_start_time,
          duration_minutes: current.session_duration_minutes,
          priority: "medium",
          status: "not_started",
        },
      ],
    }));
  }

  function removeItem(index) {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({
        ...item,
        order_number: itemIndex + 1,
      })),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit?.({
      ...form,
      subject_id: Number(form.subject_id),
      learning_goal_id: form.learning_goal_id || null,
      study_time_per_day: Number(form.study_time_per_day),
      available_weekdays: form.available_weekdays,
      preferred_start_time: form.preferred_start_time,
      session_duration_minutes: Number(form.session_duration_minutes),
      max_daily_minutes: form.max_daily_minutes ? Number(form.max_daily_minutes) : null,
      max_weekly_minutes: form.max_weekly_minutes ? Number(form.max_weekly_minutes) : null,
      reminder_minutes_before: Number(form.reminder_minutes_before || 0),
      generated_by_ai: Boolean(form.generated_by_ai),
      items: form.items.map((item, index) => ({
        ...item,
        week_number: Number(item.week_number) || 1,
        order_number: Number(item.order_number) || index + 1,
        duration_minutes: Number(item.duration_minutes) || Number(form.session_duration_minutes) || 60,
      })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="grid gap-5 p-5 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Môn học">
            <Input value={`${form.subject_code} - ${form.subject_name}`} disabled />
          </Field>
          <Field label="Trạng thái" error={errors.status}>
            <Select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
              <option value="draft">Nháp</option>
              <option value="active">Đang học</option>
              <option value="paused">Tạm dừng</option>
              <option value="completed">Hoàn thành</option>
            </Select>
          </Field>
          <Field label="Tên lộ trình" error={errors.title} className="md:col-span-2">
            <Input value={form.title} onChange={(event) => updateField("title", event.target.value)} />
          </Field>
          <Field label="Ngày bắt đầu" error={errors.start_date}>
            <Input type="date" value={form.start_date} onChange={(event) => updateField("start_date", event.target.value)} />
          </Field>
          <Field label="Ngày kết thúc" error={errors.end_date}>
            <Input type="date" value={form.end_date} onChange={(event) => updateField("end_date", event.target.value)} />
          </Field>
          <Field label="Trình độ hiện tại">
            <Select value={form.current_level} onChange={(event) => updateField("current_level", event.target.value)}>
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung cấp</option>
              <option value="advanced">Nâng cao</option>
            </Select>
          </Field>
          <Field label="Giờ học mỗi ngày" error={errors.study_time_per_day}>
            <Input type="number" min="0.1" step="0.1" value={form.study_time_per_day} onChange={(event) => updateField("study_time_per_day", event.target.value)} />
          </Field>
          <Field label="Các ngày có thể học" error={errors.available_weekdays} className="md:col-span-2">
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {weekdayOptions.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleWeekday(day.value)}
                  className={`h-10 rounded-lg border text-sm font-extrabold transition ${
                    form.available_weekdays.includes(day.value)
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Giờ bắt đầu" error={errors.preferred_start_time}>
            <Input type="time" value={form.preferred_start_time} onChange={(event) => updateField("preferred_start_time", event.target.value)} />
          </Field>
          <Field label="Thời lượng mỗi buổi" error={errors.session_duration_minutes}>
            <Input type="number" min="15" step="15" value={form.session_duration_minutes} onChange={(event) => updateField("session_duration_minutes", event.target.value)} />
          </Field>
          <Field label="Tối đa mỗi ngày">
            <Input type="number" min="15" step="15" value={form.max_daily_minutes || ""} onChange={(event) => updateField("max_daily_minutes", event.target.value)} />
          </Field>
          <Field label="Tối đa mỗi tuần">
            <Input type="number" min="15" step="15" value={form.max_weekly_minutes || ""} onChange={(event) => updateField("max_weekly_minutes", event.target.value)} />
          </Field>
          <Field label="Nhắc trước giờ học">
            <Input type="number" min="0" step="5" value={form.reminder_minutes_before || 0} onChange={(event) => updateField("reminder_minutes_before", event.target.value)} />
          </Field>
        </div>
        <div className="space-y-4 rounded-xl bg-slate-50 p-4">
          <RoadmapProgressBar value={form.progress_percent} />
          <p className="text-sm leading-6 text-slate-600">
            Bạn có thể chỉnh sửa lộ trình AI gợi ý trước khi lưu. Sau khi lưu, tiến độ sẽ được tính theo trạng thái từng bước học.
          </p>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Đang lưu..." : submitLabel}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <Field label="Mục tiêu" error={errors.goal}>
          <Textarea value={form.goal} onChange={(event) => updateField("goal", event.target.value)} rows={4} />
        </Field>
        <Field label="Tổng quan lộ trình" className="mt-5">
          <Textarea value={form.overview} onChange={(event) => updateField("overview", event.target.value)} rows={4} />
        </Field>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-slate-950">Các bước học</h2>
        <Button type="button" variant="secondary" onClick={addItem}>
          <Plus size={16} /> Thêm bước
        </Button>
      </div>
      {typeof errors.items === "string" && <p className="text-sm font-bold text-rose-600">{errors.items}</p>}

      <div className="space-y-4">
        {form.items.map((item, index) => {
          const itemErrors = errors.itemErrors?.[index] || {};
          return (
            <Card key={index} className="p-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[90px_90px_minmax(220px,1fr)_150px_120px_120px_120px_auto] xl:items-end">
                <Field label="Tuần" error={itemErrors.week_number}>
                  <Input type="number" min="1" value={item.week_number} onChange={(event) => updateItem(index, "week_number", event.target.value)} />
                </Field>
                <Field label="Thứ tự">
                  <Input type="number" min="1" value={item.order_number} onChange={(event) => updateItem(index, "order_number", event.target.value)} />
                </Field>
                <Field label="Tên bước học" error={itemErrors.title}>
                  <Input value={item.title} onChange={(event) => updateItem(index, "title", event.target.value)} />
                </Field>
                <Field label="Ngày học" error={itemErrors.planned_date}>
                  <Input type="date" value={item.planned_date || ""} onChange={(event) => updateItem(index, "planned_date", event.target.value)} />
                </Field>
                <Field label="Giờ bắt đầu" error={itemErrors.start_time}>
                  <Input type="time" value={item.start_time || ""} onChange={(event) => updateItem(index, "start_time", event.target.value)} />
                </Field>
                <Field label="Thời lượng" error={itemErrors.duration_minutes}>
                  <Input type="number" min="15" step="15" value={item.duration_minutes || ""} onChange={(event) => updateItem(index, "duration_minutes", event.target.value)} />
                </Field>
                <Field label="Ưu tiên">
                  <Select value={item.priority || "medium"} onChange={(event) => updateItem(index, "priority", event.target.value)}>
                    <option value="low">Thấp</option>
                    <option value="medium">Vừa</option>
                    <option value="high">Cao</option>
                  </Select>
                </Field>
                <Button type="button" variant="danger" onClick={() => removeItem(index)}>
                  <Trash2 size={16} /> Xóa
                </Button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Field label="Nội dung cần học">
                  <Textarea value={item.description || ""} onChange={(event) => updateItem(index, "description", event.target.value)} rows={4} />
                </Field>
                <Field label="Kết quả cần đạt">
                  <Textarea value={item.expected_result || ""} onChange={(event) => updateItem(index, "expected_result", event.target.value)} rows={4} />
                </Field>
                <Field label="Bài tập gợi ý">
                  <Textarea value={item.suggested_task || ""} onChange={(event) => updateItem(index, "suggested_task", event.target.value)} rows={4} />
                </Field>
              </div>
            </Card>
          );
        })}
      </div>
    </form>
  );
}
