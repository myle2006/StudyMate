const DEFAULT_WEEKDAYS = [1, 2, 3, 4, 5];

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
  return date.toISOString().slice(0, 10);
}

function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function normalizeWeekdays(value) {
  return Array.isArray(value) && value.length ? value.map(Number).filter(Boolean) : DEFAULT_WEEKDAYS;
}

function pickDateForWeek(startDate, weekNumber, itemIndex, weekdays) {
  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return "";

  const weekStart = addDays(start, (Math.max(1, Number(weekNumber) || 1) - 1) * 7);
  const weekday = weekdays[itemIndex % weekdays.length] || 1;
  const jsTargetDay = weekday === 7 ? 0 : weekday;
  const offset = (jsTargetDay - weekStart.getDay() + 7) % 7;
  return toDateString(addDays(weekStart, offset));
}

export function getTemplateEndDate(startDate, durationMonths) {
  return addMonths(startDate, durationMonths);
}

export function buildRoadmapPreviewFromDbTemplate(data, template) {
  const weekdays = normalizeWeekdays(data.available_weekdays);
  let orderNumber = 1;

  const items = (template?.phases || []).flatMap((phase) => (
    (phase.tasks || []).map((task, taskIndex) => {
      const item = {
        week_number: Number(task.week_number || phase.start_week || 1),
        order_number: orderNumber,
        title: task.title,
        description: [
          phase.title ? `Giai đoạn ${phase.phase_number}: ${phase.title}` : "",
          task.description || "",
          task.reference_materials ? `Tài liệu: ${task.reference_materials}` : "",
          task.completion_criteria ? `Tiêu chí: ${task.completion_criteria}` : "",
        ].filter(Boolean).join("\n"),
        expected_result: task.expected_result || phase.outcome || "",
        suggested_task: task.suggested_task || "",
        planned_date: pickDateForWeek(data.start_date, task.week_number || phase.start_week, taskIndex, weekdays),
        start_time: data.preferred_start_time,
        duration_minutes: data.session_duration_minutes,
        priority: task.priority || "medium",
        status: "not_started",
        completion_percent: 0,
      };
      orderNumber += 1;
      return item;
    })
  ));

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
