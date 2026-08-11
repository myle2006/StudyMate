import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Layers3,
  Sparkles,
  Target,
} from "lucide-react";
import { Alert, Badge, Button, Card, Field, Input, Select, Textarea } from "../../../components/ui";
import { getTemplateEndDate } from "../utils/roadmapTemplatePreview";

const DEFAULT_FORM = {
  learning_goal_id: "",
  subject_id: "",
  duration_months: "1",
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

const weekdayOptions = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 7, label: "CN" },
];

const durationPresets = [
  { value: "1", label: "Lộ trình nhanh - 1 tháng" },
  { value: "3", label: "Lộ trình tiêu chuẩn - 3 tháng" },
  { value: "6", label: "Lộ trình chuyên sâu - 6 tháng" },
];

function findTemplate(templates, subjectId, durationMonths) {
  return (templates || []).find((template) => (
    String(template.subject_id) === String(subjectId)
      && String(template.duration_months) === String(durationMonths)
  )) || null;
}

function getDurationLabel(durationMonths) {
  return durationPresets.find((preset) => String(preset.value) === String(durationMonths))?.label
    || `${durationMonths} tháng`;
}

function buildTemplateFormPatch(template, startDate) {
  if (!template) return {};
  const dailyHours = Math.max(0.5, Number(template.study_hours_per_week || 6) / 5);

  return {
    goal: template.goal || "",
    current_level: template.current_level || "beginner",
    study_time_per_day: String(Number(dailyHours.toFixed(1))),
    max_daily_minutes: String(Math.max(60, Math.round(dailyHours * 60))),
    max_weekly_minutes: String(Math.max(120, Math.round(Number(template.study_hours_per_week || 6) * 60))),
    end_date: startDate ? getTemplateEndDate(startDate, template.duration_months) : "",
  };
}

function parseStudyTime(value) {
  return Number(String(value).replace(",", "."));
}

function validateForm(form) {
  const errors = {};
  const studyTime = parseStudyTime(form.study_time_per_day);

  if (!form.subject_id) errors.subject_id = "Môn học là bắt buộc.";
  if (!form.duration_months) errors.duration_months = "Vui lòng chọn mốc thời lượng.";
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

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
      <div className="min-w-0">
        <p className="text-xs font-extrabold uppercase text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-bold leading-5 text-slate-800">{value || "Chưa chọn"}</p>
      </div>
    </div>
  );
}

function TemplatePhaseList({ phases = [] }) {
  return (
    <div className="space-y-3">
      {phases.map((phase, index) => (
        <div key={`${phase.title}-${index}`} className="grid min-w-0 gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[34px_minmax(0,1fr)]">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-xs font-black text-white">
            {index + 1}
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="min-w-0 break-words text-sm font-black text-slate-900">{phase.title}</p>
              <Badge tone="slate">{phase.duration_weeks || 1} tuần</Badge>
            </div>
            <p className="mt-1 break-words text-xs font-semibold leading-5 text-slate-500">{phase.outcome}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RoadmapGenerateForm({
  subjects = [],
  learningGoals = [],
  roadmapTemplates = [],
  submitting = false,
  apiErrors = {},
  onSubmit,
}) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [clientErrors, setClientErrors] = useState({});
  const errors = useMemo(() => ({ ...clientErrors, ...apiErrors }), [clientErrors, apiErrors]);
  const selectedSubject = subjects.find((subject) => String(subject.id) === String(form.subject_id));
  const selectedGoal = learningGoals.find((goal) => String(goal.id) === String(form.learning_goal_id));
  const selectedTemplate = useMemo(
    () => findTemplate(roadmapTemplates, selectedSubject?.id, form.duration_months),
    [roadmapTemplates, selectedSubject?.id, form.duration_months]
  );
  const noSubjectsReason = subjects.length === 0 ? "Bạn chưa có môn học được gán." : "";

  useEffect(() => {
    if (!form.subject_id && subjects.length === 1) {
      const subject = subjects[0];
      setForm((current) => ({
        ...current,
        subject_id: String(subject.id),
        ...buildTemplateFormPatch(findTemplate(roadmapTemplates, subject.id, current.duration_months), current.start_date),
      }));
    }
  }, [subjects, roadmapTemplates, form.subject_id]);

  function applyTemplate(subject, durationMonths, startDate, extra = {}) {
    const template = findTemplate(roadmapTemplates, subject?.id, durationMonths);
    return {
      ...buildTemplateFormPatch(template, startDate),
      ...extra,
    };
  }

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "learning_goal_id") {
      const nextGoal = learningGoals.find((goal) => String(goal.id) === value);
      const nextSubject = subjects.find((subject) => String(subject.id) === String(nextGoal?.subject_id || form.subject_id));
      const goalPatch = nextGoal
        ? {
            subject_id: String(nextGoal.subject_id),
            goal: nextGoal.goal_description,
            current_level: nextGoal.current_level,
            study_time_per_day: String(nextGoal.study_time_per_day),
            start_date: nextGoal.start_date,
            end_date: nextGoal.end_date,
          }
        : {};

      setForm((current) => ({
        ...current,
        learning_goal_id: value,
        ...(nextGoal ? {} : applyTemplate(selectedSubject, current.duration_months, current.start_date)),
        ...(nextGoal ? applyTemplate(nextSubject, current.duration_months, nextGoal.start_date, goalPatch) : {}),
      }));
      return;
    }

    if (name === "subject_id") {
      const nextSubject = subjects.find((subject) => String(subject.id) === value);
      setForm((current) => ({
        ...current,
        subject_id: value,
        learning_goal_id: "",
        ...applyTemplate(nextSubject, current.duration_months, current.start_date),
      }));
      return;
    }

    if (name === "duration_months") {
      setForm((current) => ({
        ...current,
        duration_months: value,
        ...applyTemplate(selectedSubject, value, current.start_date),
      }));
      return;
    }

    if (name === "start_date") {
      const templatePatch = buildTemplateFormPatch(selectedTemplate, value);
      setForm((current) => ({
        ...current,
        start_date: value,
        end_date: templatePatch.end_date,
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
    if (!selectedTemplate) {
      nextErrors.duration_months = "Chưa có lộ trình mẫu trong database cho môn học và thời lượng này.";
    }
    setClientErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || subjects.length === 0) return;

    onSubmit?.({
      generation_mode: "template",
      template_key: selectedTemplate.template_code,
      template_id: selectedTemplate.id,
      roadmap_template: selectedTemplate,
      duration_months: form.duration_months,
      learning_goal_id: form.learning_goal_id || null,
      subject_id: Number(form.subject_id),
      subject_code: selectedSubject?.subject_code || "",
      subject_name: selectedSubject?.subject_name || "",
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
    <form onSubmit={handleSubmit} className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="min-w-0 p-5">
        <div className="border-b border-slate-100 pb-5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase text-blue-600">Chọn mẫu lộ trình</p>
              <h2 className="mt-2 break-words text-2xl font-black text-slate-950">Bắt đầu từ môn học và thời lượng</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                StudyMate tự gợi ý lộ trình 1, 3 hoặc 6 tháng trước. Sau đó bạn mới chỉnh mục tiêu, lịch học và từng nhiệm vụ theo cá nhân.
              </p>
            </div>
            <Badge tone={selectedGoal ? "blue" : "green"}>
              {selectedGoal ? "Có mục tiêu đã lưu" : "Template trước"}
            </Badge>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
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

          <Field label="Thời lượng mẫu" error={errors.duration_months}>
            <Select name="duration_months" value={form.duration_months} onChange={handleChange}>
              {durationPresets.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </Field>

          <div className="md:col-span-2 min-w-0 overflow-hidden rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Layers3 className="h-4 w-4 text-blue-700" />
                  <h3 className="min-w-0 break-words text-sm font-black text-blue-950">{selectedTemplate?.title || "Chưa có lộ trình mẫu"}</h3>
                  <Badge tone="blue">{getDurationLabel(form.duration_months)}</Badge>
                </div>
                <p className="mt-2 break-words text-sm font-semibold leading-6 text-blue-800">
                  {selectedTemplate?.goal || "Vui lòng chọn môn học có lộ trình mẫu trong database."}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <TemplatePhaseList phases={selectedTemplate?.phases || []} />
            </div>
          </div>

          <div className="md:col-span-2 border-t border-slate-100 pt-5">
            <p className="text-sm font-black uppercase text-slate-500">Cá nhân hóa sau khi chọn mẫu</p>
          </div>

          <Field label="Mục tiêu đã lưu" error={errors.learning_goal_id} className="md:col-span-2">
            <Select name="learning_goal_id" value={form.learning_goal_id} onChange={handleChange}>
              <option value="">Không dùng mục tiêu đã lưu</option>
              {learningGoals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title} · {goal.subject_code}
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

      <div className="min-w-0 space-y-5">
        <Card className="min-w-0 p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <Layers3 size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="break-words text-lg font-black text-slate-950">Preview từ template</h2>
              <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                Tạo ngay bản nháp theo mẫu môn học, chia theo giai đoạn và cho phép chỉnh từng nhiệm vụ trước khi lưu.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <SummaryItem icon={Target} label="Môn học" value={selectedSubject ? `${selectedSubject.subject_code} - ${selectedSubject.subject_name}` : ""} />
            <SummaryItem icon={Sparkles} label="Mẫu" value={selectedTemplate ? `${selectedTemplate.title} · ${getDurationLabel(selectedTemplate.duration_months)}` : ""} />
            <SummaryItem icon={Clock3} label="Thời lượng" value={form.study_time_per_day ? `${form.study_time_per_day} giờ/ngày` : ""} />
            <SummaryItem icon={CalendarDays} label="Khoảng ngày" value={form.start_date && form.end_date ? `${form.start_date} → ${form.end_date}` : ""} />
          </div>

          {noSubjectsReason && <Alert tone="warning" className="mt-4">{noSubjectsReason}</Alert>}

          <Button type="submit" size="lg" className="mt-5 w-full min-w-0" disabled={submitting || subjects.length === 0 || !selectedTemplate}>
            <Layers3 size={18} />
            {submitting ? "Đang tạo preview..." : "Xem và chỉnh lộ trình mẫu"}
          </Button>
        </Card>
      </div>
    </form>
  );
}
