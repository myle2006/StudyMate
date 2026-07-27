import React, { useEffect, useState } from "react";
import { AlertCircle, CalendarDays, CheckCircle2, Circle, Clock3, Loader2, RotateCcw } from "lucide-react";
import { Badge, Button, Card, Field, Input, Select, Textarea } from "../../../components/ui";

const statusMap = {
  not_started: { label: "Chưa bắt đầu", tone: "slate", icon: Circle },
  in_progress: { label: "Đang học", tone: "amber", icon: Loader2 },
  completed: { label: "Hoàn thành", tone: "green", icon: CheckCircle2 },
  not_completed: { label: "Chưa hoàn thành", tone: "rose", icon: AlertCircle },
  rescheduled: { label: "Dời lịch", tone: "blue", icon: RotateCcw },
};

const priorityMap = {
  low: { label: "Ưu tiên thấp", tone: "slate" },
  medium: { label: "Ưu tiên vừa", tone: "blue" },
  high: { label: "Ưu tiên cao", tone: "rose" },
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function RoadmapItemStatusBadge({ status }) {
  const config = statusMap[status] || statusMap.not_started;
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

export default function RoadmapItemCard({
  item,
  onStatusChange,
  onResultSubmit,
  onRescheduleSubmit,
  updating = false,
  savingResult = false,
  rescheduling = false,
}) {
  const config = statusMap[item.status] || statusMap.not_started;
  const Icon = config.icon;
  const priority = priorityMap[item.priority] || priorityMap.medium;
  const [resultForm, setResultForm] = useState({
    status: ["completed", "not_completed", "in_progress"].includes(item.status) ? item.status : "in_progress",
    completion_percent: item.completion_percent ?? 0,
    learned_content: item.learned_content || "",
    unfinished_content: item.unfinished_content || "",
    note: item.note || "",
    self_assessment: item.self_assessment || "",
    actual_study_minutes: item.actual_study_minutes || "",
  });
  const [scheduleForm, setScheduleForm] = useState({
    planned_date: item.planned_date || "",
    start_time: item.start_time || "",
    duration_minutes: item.duration_minutes || 60,
  });

  useEffect(() => {
    setResultForm({
      status: ["completed", "not_completed", "in_progress"].includes(item.status) ? item.status : "in_progress",
      completion_percent: item.completion_percent ?? 0,
      learned_content: item.learned_content || "",
      unfinished_content: item.unfinished_content || "",
      note: item.note || "",
      self_assessment: item.self_assessment || "",
      actual_study_minutes: item.actual_study_minutes || "",
    });
    setScheduleForm({
      planned_date: item.planned_date || "",
      start_time: item.start_time || "",
      duration_minutes: item.duration_minutes || 60,
    });
  }, [item]);

  function updateResult(field, value) {
    setResultForm((current) => ({ ...current, [field]: value }));
  }

  function updateSchedule(field, value) {
    setScheduleForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-blue-600">Tuần {item.week_number} · Bước {item.order_number}</p>
          <h3 className="mt-2 text-lg font-black text-slate-950">{item.title}</h3>
        </div>
        <RoadmapItemStatusBadge status={item.status} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-4 text-sm leading-7 text-slate-700">
          {item.description && (
            <div>
              <p className="text-xs font-extrabold uppercase text-slate-500">Nội dung cần học</p>
              <p className="mt-1 whitespace-pre-line">{item.description}</p>
            </div>
          )}
          {item.expected_result && (
            <div>
              <p className="text-xs font-extrabold uppercase text-slate-500">Kết quả cần đạt</p>
              <p className="mt-1 whitespace-pre-line">{item.expected_result}</p>
            </div>
          )}
          {item.suggested_task && (
            <div>
              <p className="text-xs font-extrabold uppercase text-slate-500">Bài tập gợi ý</p>
              <p className="mt-1 whitespace-pre-line">{item.suggested_task}</p>
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <CalendarDays size={16} />
            <span>{formatDate(item.planned_date)} · {item.start_time || "--:--"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <Clock3 size={16} />
            <span>{item.duration_minutes || 0} phút</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <Icon size={16} />
            <span>{config.label}</span>
          </div>
          <Badge tone={priority.tone}>{priority.label}</Badge>
          {onStatusChange && (
            <div>
              <p className="text-xs font-extrabold uppercase text-slate-500">
                {updating ? "Đang lưu..." : "Cập nhật trạng thái"}
              </p>
              <Select
                value={item.status}
                disabled={updating}
                onChange={(event) => onStatusChange(item, event.target.value)}
                className="mt-2"
              >
                <option value="not_started">Chưa bắt đầu</option>
                <option value="in_progress">Đang học</option>
                <option value="completed">Hoàn thành</option>
                <option value="not_completed">Chưa hoàn thành</option>
                <option value="rescheduled">Dời lịch</option>
              </Select>
            </div>
          )}
        </div>
      </div>

      {onResultSubmit && (
        <div className="mt-5 rounded-xl border border-slate-200 p-4">
          <h4 className="text-sm font-black text-slate-950">Kết quả sau buổi học</h4>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <Field label="Trạng thái">
              <Select value={resultForm.status} onChange={(event) => updateResult("status", event.target.value)}>
                <option value="in_progress">Đang thực hiện</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="not_completed">Chưa hoàn thành</option>
              </Select>
            </Field>
            <Field label="Tỷ lệ hoàn thành">
              <Input type="number" min="0" max="100" value={resultForm.completion_percent} onChange={(event) => updateResult("completion_percent", event.target.value)} />
            </Field>
            <Field label="Tự đánh giá">
              <Select value={resultForm.self_assessment} onChange={(event) => updateResult("self_assessment", event.target.value)}>
                <option value="">Chưa chọn</option>
                <option value="1">1 - Chưa hiểu</option>
                <option value="2">2 - Còn mơ hồ</option>
                <option value="3">3 - Tạm ổn</option>
                <option value="4">4 - Hiểu tốt</option>
                <option value="5">5 - Rất chắc</option>
              </Select>
            </Field>
            <Field label="Phút đã học">
              <Input type="number" min="0" value={resultForm.actual_study_minutes} onChange={(event) => updateResult("actual_study_minutes", event.target.value)} />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Nội dung đã học">
              <Textarea rows={3} value={resultForm.learned_content} onChange={(event) => updateResult("learned_content", event.target.value)} />
            </Field>
            <Field label="Chưa hoàn thành">
              <Textarea rows={3} value={resultForm.unfinished_content} onChange={(event) => updateResult("unfinished_content", event.target.value)} />
            </Field>
            <Field label="Ghi chú hoặc khó khăn">
              <Textarea rows={3} value={resultForm.note} onChange={(event) => updateResult("note", event.target.value)} />
            </Field>
          </div>
          <Button type="button" className="mt-4" onClick={() => onResultSubmit(item, resultForm)} disabled={savingResult}>
            {savingResult ? "Đang lưu..." : "Lưu kết quả"}
          </Button>
        </div>
      )}

      {onRescheduleSubmit && (
        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <h4 className="text-sm font-black text-slate-950">Điều chỉnh lịch học</h4>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <Field label="Ngày học mới">
              <Input type="date" value={scheduleForm.planned_date} onChange={(event) => updateSchedule("planned_date", event.target.value)} />
            </Field>
            <Field label="Giờ bắt đầu">
              <Input type="time" value={scheduleForm.start_time} onChange={(event) => updateSchedule("start_time", event.target.value)} />
            </Field>
            <Field label="Thời lượng">
              <Input type="number" min="15" step="15" value={scheduleForm.duration_minutes} onChange={(event) => updateSchedule("duration_minutes", event.target.value)} />
            </Field>
            <Button type="button" variant="secondary" onClick={() => onRescheduleSubmit(item, scheduleForm)} disabled={rescheduling}>
              {rescheduling ? "Đang dời..." : "Dời lịch"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
