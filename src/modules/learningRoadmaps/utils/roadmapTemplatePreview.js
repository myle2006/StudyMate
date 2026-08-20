const DEFAULT_WEEKDAYS = [1, 2, 3, 4, 5];
const DEFAULT_START_MINUTES = 8 * 60;
const DAY_END_MINUTES = 22 * 60;

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(dateValue, months) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setMonth(date.getMonth() + Number(months || 0));
  date.setDate(date.getDate() - 1);
  return toDateString(date);
}

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeWeekdays(value) {
  return Array.isArray(value) && value.length ? value.map(Number).filter(Boolean) : DEFAULT_WEEKDAYS;
}

function timeToMinutes(value) {
  const [hour, minute] = String(value || "").split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return DEFAULT_START_MINUTES;
  return (hour * 60) + minute;
}

function minutesToTime(value) {
  const minutes = Math.max(0, Number(value) || 0);
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function normalizeDuration(value, fallback = 60) {
  return Math.max(15, Number(value) || Number(fallback) || 60);
}

function dailyCapacityMinutes(data, duration) {
  const startMinutes = timeToMinutes(data.preferred_start_time);
  const configuredMax = Number(data.max_daily_minutes);
  const requestedMax = Number.isFinite(configuredMax) && configuredMax >= duration
    ? configuredMax
    : duration * 2;
  const remainingToday = Math.max(duration, DAY_END_MINUTES - startMinutes);
  return Math.max(duration, Math.min(requestedMax, remainingToday));
}

function pickDateForWeek(startDate, weekNumber, dayIndex, weekdays) {
  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return "";

  const weekStart = addDays(start, (Math.max(1, Number(weekNumber) || 1) - 1) * 7);
  const normalizedDayIndex = Math.max(0, Number(dayIndex) || 0);
  const weekOffset = Math.floor(normalizedDayIndex / weekdays.length);
  const weekday = weekdays[normalizedDayIndex % weekdays.length] || 1;
  const jsTargetDay = weekday === 7 ? 0 : weekday;
  const offset = (jsTargetDay - weekStart.getDay() + 7) % 7;
  return toDateString(addDays(weekStart, offset + (weekOffset * 7)));
}

export function getTemplateEndDate(startDate, durationMonths) {
  return addMonths(startDate, durationMonths);
}

export function scheduleRoadmapItems(items, data) {
  const weekdays = normalizeWeekdays(data.available_weekdays);
  const preferredStartMinutes = timeToMinutes(data.preferred_start_time);
  const defaultDuration = normalizeDuration(data.session_duration_minutes);
  const weekState = new Map();

  return (items || []).map((item) => {
    const weekNumber = Number(item.week_number) || 1;
    const duration = normalizeDuration(item.duration_minutes, defaultDuration);
    const capacity = dailyCapacityMinutes(data, duration);
    const state = weekState.get(weekNumber) || { dayIndex: 0, usedMinutes: 0 };

    if (state.usedMinutes > 0 && state.usedMinutes + duration > capacity) {
      state.dayIndex += 1;
      state.usedMinutes = 0;
    }

    const scheduledItem = {
      ...item,
      planned_date: pickDateForWeek(data.start_date, weekNumber, state.dayIndex, weekdays),
      start_time: minutesToTime(preferredStartMinutes + state.usedMinutes),
      duration_minutes: duration,
    };

    state.usedMinutes += duration;
    weekState.set(weekNumber, state);

    return scheduledItem;
  });
}

export function buildRoadmapPreviewFromDbTemplate(data, template) {
  const weekdays = normalizeWeekdays(data.available_weekdays);
  let orderNumber = 1;

  const rawItems = (template?.phases || []).flatMap((phase) => (
    (phase.tasks || []).map((task) => {
      const item = {
        week_number: Number(task.week_number || phase.start_week || 1),
        order_number: orderNumber,
        lesson_id: task.lesson_id || null,
        assignment_id: task.assignment_id || null,
        prerequisite_lesson_ids: task.prerequisite_lesson_ids || [],
        content_type: task.content_type || "lesson",
        branch_label: task.branch_label || "",
        is_required: task.is_required ?? true,
        allow_skip: Boolean(task.allow_skip),
        title: task.title,
        description: [
          phase.title ? `Giai đoạn ${phase.phase_number}: ${phase.title}` : "",
          task.description || "",
          task.reference_materials ? `Tài liệu: ${task.reference_materials}` : "",
          task.completion_criteria ? `Tiêu chí: ${task.completion_criteria}` : "",
        ].filter(Boolean).join("\n"),
        expected_result: task.expected_result || phase.outcome || "",
        suggested_task: task.suggested_task || "",
        duration_minutes: data.session_duration_minutes,
        priority: task.priority || "medium",
        status: "not_started",
        completion_percent: 0,
      };
      orderNumber += 1;
      return item;
    })
  ));

  const items = scheduleRoadmapItems(rawItems, { ...data, available_weekdays: weekdays });

  return {
    subject_id: data.subject_id,
    learning_goal_id: data.learning_goal_id || null,
    subject_code: data.subject_code,
    subject_name: data.subject_name,
    title: template?.title || `Lộ trình học ${data.subject_name}`,
    overview: template?.overview || "",
    goal: data.goal || template?.goal || "",
    current_level: data.current_level || template?.current_level || "beginner",
    study_time_per_day: data.study_time_per_day,
    available_weekdays: weekdays,
    preferred_start_time: data.preferred_start_time,
    session_duration_minutes: data.session_duration_minutes,
    max_daily_minutes: data.max_daily_minutes,
    max_weekly_minutes: data.max_weekly_minutes,
    reminder_minutes_before: data.reminder_minutes_before,
    start_date: data.start_date,
    end_date: data.end_date || getTemplateEndDate(data.start_date, data.duration_months),
    generated_by_ai: false,
    ai_prompt: "",
    ai_raw_response: "",
    status: "active",
    progress_percent: 0,
    items,
  };
}
