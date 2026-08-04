import React, { useEffect, useMemo, useState } from "react";
import { Bot, CalendarDays, Clock3, CreditCard, RefreshCw, Sparkles, Target, WandSparkles } from "lucide-react";
import { Alert, Badge, Button, Card, Field, Input, Select, Textarea } from "../../../components/ui";

const DEFAULT_FORM = {
  learning_goal_id: "",
  subject_id: "",
  goal: "",
  current_level: "beginner",
  study_time_per_day: "1",
  available_weekdays: [1, 2, 3, 4, 5],
  preferred_start_time: "19:00",
  session_duration_minutes: "60",
  max_daily_minutes: "120",
  max_weekly_minutes: "600",
  reminder_minutes_before: "15",
  start_date: "",
  end_date: "",
};

const levelLabels = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

function parseStudyTime(value) {
  return Number(String(value).replace(",", "."));
}

function validateForm(form) {
  const errors = {};
  const studyTime = parseStudyTime(form.study_time_per_day);

  if (!form.subject_id) errors.subject_id = "Môn học là bắt buộc.";
  if (!form.goal.trim()) errors.goal = "Mục tiêu học tập là bắt buộc.";
  if (!["beginner", "intermediate", "advanced"].includes(form.current_level)) errors.current_level = "Trình độ không hợp lệ.";
  if (!form.study_time_per_day || Number.isNaN(studyTime) || studyTime <= 0) errors.study_time_per_day = "Thời gian học phải lớn hơn 0.";
  if (!form.available_weekdays.length) errors.available_weekdays = "Chọn ít nhất một ngày có thể học.";
  if (!form.preferred_start_time) errors.preferred_start_time = "Khung giờ bắt đầu là bắt buộc.";
  if (!form.session_duration_minutes || Number(form.session_duration_minutes) < 15) errors.session_duration_minutes = "Thời lượng mỗi buổi tối thiểu 15 phút.";
  if (form.max_daily_minutes && Number(form.max_daily_minutes) < 15) errors.max_daily_minutes = "Tổng thời gian mỗi ngày tối thiểu 15 phút.";
  if (form.max_weekly_minutes && Number(form.max_weekly_minutes) < 15) errors.max_weekly_minutes = "Tổng thời gian mỗi tuần tối thiểu 15 phút.";
  if (form.reminder_minutes_before && Number(form.reminder_minutes_before) < 0) errors.reminder_minutes_before = "Thời gian nhắc lịch không hợp lệ.";
  if (!form.start_date) errors.start_date = "Ngày bắt đầu là bắt buộc.";
  if (!form.end_date) errors.end_date = "Ngày kết thúc là bắt buộc.";
  if (form.start_date && form.end_date && form.start_date > form.end_date) errors.end_date = "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.";

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

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
      <div className="min-w-0">
        <p className="text-xs font-extrabold uppercase text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-bold text-slate-800">{value || "Chưa chọn"}</p>
      </div>
    </div>
  );
}

export default function RoadmapGenerateForm({
  subjects = [],
  learningGoals = [],
  aiStatus,
  submitting = false,
  apiErrors = {},
  onRefreshStatus,
  onSubmit,
}) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [clientErrors, setClientErrors] = useState({});
  const errors = useMemo(() => ({ ...clientErrors, ...apiErrors }), [clientErrors, apiErrors]);
  const selectedSubject = subjects.find((subject) => String(subject.id) === String(form.subject_id));
  const selectedGoal = learningGoals.find((goal) => String(goal.id) === String(form.learning_goal_id));
  const aiUnavailable = Boolean(aiStatus && !aiStatus.available);
  const disabledReason = subjects.length === 0
    ? "Bạn chưa có môn học được gán."
    : aiUnavailable
      ? aiStatus?.message || "AI đang tạm ngưng."
      : "";

  useEffect(() => {
    if (!form.subject_id && subjects.length === 1) {
      setForm((current) => ({ ...current, subject_id: String(subjects[0].id) }));
    }
  }, [subjects]);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "learning_goal_id") {
      const nextGoal = learningGoals.find((goal) => String(goal.id) === value);
      setForm((current) => ({
        ...current,
        learning_goal_id: value,
        subject_id: nextGoal ? String(nextGoal.subject_id) : current.subject_id,
        goal: nextGoal ? nextGoal.goal_description : current.goal,
        current_level: nextGoal ? nextGoal.current_level : current.current_level,
        study_time_per_day: nextGoal ? String(nextGoal.study_time_per_day) : current.study_time_per_day,
        start_date: nextGoal ? nextGoal.start_date : current.start_date,
        end_date: nextGoal ? nextGoal.end_date : current.end_date,
      }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
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

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || aiUnavailable || subjects.length === 0) return;

    onSubmit?.({
      learning_goal_id: form.learning_goal_id || null,
      subject_id: Number(form.subject_id),
      goal: form.goal.trim(),
      current_level: form.current_level,
      study_time_per_day: parseStudyTime(form.study_time_per_day),
      available_weekdays: form.available_weekdays,
      preferred_start_time: form.preferred_start_time,
      session_duration_minutes: Number(form.session_duration_minutes),
      max_daily_minutes: form.max_daily_minutes ? Number(form.max_daily_minutes) : null,
      max_weekly_minutes: form.max_weekly_minutes ? Number(form.max_weekly_minutes) : null,
      reminder_minutes_before: Number(form.reminder_minutes_before || 0),
      start_date: form.start_date,
      end_date: form.end_date,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="p-5">
        <div className="border-b border-slate-100 pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-blue-600">Thông tin đầu vào</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Bạn muốn học gì?</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                Chọn mục tiêu đã lưu hoặc nhập mục tiêu mới cho môn học được admin gán.
              </p>
            </div>
            <Badge tone={selectedGoal ? "blue" : "slate"}>{selectedGoal ? "Dùng mục tiêu đã lưu" : "Mục tiêu mới"}</Badge>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Mục tiêu đã lưu" error={errors.learning_goal_id} className="md:col-span-2">
            <Select name="learning_goal_id" value={form.learning_goal_id} onChange={handleChange}>
              <option value="">Nhập mục tiêu mới</option>
              {learningGoals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title} · {goal.subject_code}
                </option>
              ))}
            </Select>
          </Field>

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

          <Field label="Trình độ hiện tại" error={errors.current_level}>
            <Select name="current_level" value={form.current_level} onChange={handleChange}>
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung cấp</option>
              <option value="advanced">Nâng cao</option>
            </Select>
          </Field>

          <Field label="Thời gian học mỗi ngày" error={errors.study_time_per_day} hint="Đơn vị: giờ/ngày">
            <Input type="text" inputMode="decimal" name="study_time_per_day" value={form.study_time_per_day} onChange={handleChange} placeholder="Ví dụ: 1.5" />
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

          <Field label="Giờ bắt đầu học" error={errors.preferred_start_time}>
            <Input type="time" name="preferred_start_time" value={form.preferred_start_time} onChange={handleChange} />
          </Field>

          <Field label="Thời lượng mỗi buổi" error={errors.session_duration_minutes} hint="Đơn vị: phút">
            <Input type="number" min="15" step="15" name="session_duration_minutes" value={form.session_duration_minutes} onChange={handleChange} />
          </Field>

          <Field label="Tối đa mỗi ngày" error={errors.max_daily_minutes} hint="Đơn vị: phút">
            <Input type="number" min="15" step="15" name="max_daily_minutes" value={form.max_daily_minutes} onChange={handleChange} />
          </Field>

          <Field label="Tối đa mỗi tuần" error={errors.max_weekly_minutes} hint="Đơn vị: phút">
            <Input type="number" min="15" step="15" name="max_weekly_minutes" value={form.max_weekly_minutes} onChange={handleChange} />
          </Field>

          <Field label="Nhắc trước giờ học" error={errors.reminder_minutes_before} hint="Đơn vị: phút">
            <Input type="number" min="0" step="5" name="reminder_minutes_before" value={form.reminder_minutes_before} onChange={handleChange} />
          </Field>

          <Field label="Ngày bắt đầu" error={errors.start_date}>
            <Input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
          </Field>

          <Field label="Ngày kết thúc" error={errors.end_date} className="md:col-span-2">
            <Input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
          </Field>
        </div>

        <Field label="Mục tiêu học tập" error={errors.goal} className="mt-5">
          <Textarea
            name="goal"
            value={form.goal}
            onChange={handleChange}
            rows={7}
            placeholder="Ví dụ: Đạt 10 điểm môn kiểm thử phần mềm, hiểu bản chất kiểm thử, biết viết test case, test design và bug report."
          />
        </Field>
      </Card>

      <div className="space-y-5">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-950">Tạo bằng AI</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Backend PHP sẽ gọi {aiStatus?.provider_label || "AI"} và trả về bản nháp để bạn xem lại.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <SummaryItem icon={Target} label="Môn học" value={selectedSubject ? `${selectedSubject.subject_code} - ${selectedSubject.subject_name}` : ""} />
            <SummaryItem icon={Sparkles} label="Trình độ" value={levelLabels[form.current_level]} />
            <SummaryItem icon={Clock3} label="Thời lượng" value={form.study_time_per_day ? `${form.study_time_per_day} giờ/ngày` : ""} />
            <SummaryItem icon={Clock3} label="Khung giờ" value={`${form.preferred_start_time} · ${form.session_duration_minutes} phút/buổi`} />
            <SummaryItem icon={CalendarDays} label="Khoảng ngày" value={form.start_date && form.end_date ? `${form.start_date} → ${form.end_date}` : ""} />
          </div>

          <div className={`mt-5 rounded-lg border p-4 ${aiUnavailable ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
            <div className="flex items-start gap-3">
              <CreditCard className={`mt-0.5 h-4 w-4 shrink-0 ${aiUnavailable ? "text-rose-600" : "text-emerald-600"}`} />
              <p className={`text-sm font-bold leading-6 ${aiUnavailable ? "text-rose-700" : "text-emerald-700"}`}>
                {aiStatus?.message || "AI sẵn sàng tạo lộ trình học."}
              </p>
            </div>
          </div>

          {disabledReason && <Alert tone={aiUnavailable ? "error" : "warning"} className="mt-4">{disabledReason}</Alert>}

          {aiUnavailable && (
            <Button type="button" variant="secondary" className="mt-4 w-full" onClick={onRefreshStatus}>
              <RefreshCw size={16} />
              Cập nhật trạng thái AI
            </Button>
          )}

          <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting || subjects.length === 0 || aiUnavailable}>
            <WandSparkles size={18} />
            {submitting ? "Đang tạo lộ trình..." : aiUnavailable ? "AI đang tạm ngưng" : "Tạo lộ trình bằng AI"}
          </Button>
        </Card>
      </div>
    </form>
  );
}
