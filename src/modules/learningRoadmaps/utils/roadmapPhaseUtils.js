import { AlertCircle, CheckCircle2, Circle, Loader2, RotateCcw } from "lucide-react";

export const roadmapPhaseStatusConfig = {
  not_started: { label: "Chưa bắt đầu", tone: "slate", color: "slate", icon: Circle },
  in_progress: { label: "Đang học", tone: "blue", color: "blue", icon: Loader2 },
  completed: { label: "Hoàn thành", tone: "green", color: "green", icon: CheckCircle2 },
  not_completed: { label: "Cần xử lý", tone: "rose", color: "rose", icon: AlertCircle },
  rescheduled: { label: "Dời lịch", tone: "blue", color: "blue", icon: RotateCcw },
};

const stageLabels = ["Nền tảng", "Hiểu sâu", "Luyện tập", "Ứng dụng", "Tối ưu", "Hoàn thiện"];

function normalizeWeek(value, fallback) {
  const week = Number(value);
  return Number.isFinite(week) && week > 0 ? Math.floor(week) : fallback;
}

function getPhaseSize(maxWeek) {
  if (maxWeek <= 4) return 1;
  if (maxWeek <= 8) return 2;
  return 4;
}

export function getRoadmapItemProgress(item) {
  if (item.status === "completed") return 100;
  if (item.status === "not_completed") return Number(item.completion_percent || 0);
  if (item.status === "in_progress") return Number(item.completion_percent || 50);
  if (item.status === "rescheduled") return Number(item.completion_percent || 25);
  return Number(item.completion_percent || 0);
}

function getPhaseStatus(items) {
  if (!items.length) return "not_started";
  if (items.every((item) => item.status === "completed")) return "completed";
  if (items.some((item) => item.status === "in_progress")) return "in_progress";
  if (items.some((item) => item.status === "rescheduled")) return "rescheduled";
  if (items.some((item) => item.status === "not_completed")) return "not_completed";
  return "not_started";
}

function summarizeResults(items) {
  const results = items
    .map((item) => item.expected_result || item.suggested_task || item.description || "")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (results.length === 0) return "Hoàn thành các nhiệm vụ trong giai đoạn này.";
  return results.slice(0, 2).join(" | ");
}

function getPhaseTitle(phase, index) {
  const firstTitle = String(phase.items[0]?.title || "").trim();
  if (!firstTitle) return `Giai đoạn ${index + 1}`;
  return firstTitle.length > 46 ? `${firstTitle.slice(0, 43).trim()}...` : firstTitle;
}

function getStageLabel(index, total) {
  if (total <= 3) {
    return ["Khởi động", "Tăng tốc", "Về đích"][index] || "Giai đoạn";
  }

  return stageLabels[index] || `Giai đoạn ${index + 1}`;
}

export function getRoadmapPhaseDomId(key) {
  return `roadmap-stage-${String(key).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function buildRoadmapPhases(items) {
  const orderedItems = (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      ...item,
      _index: index,
      _week: normalizeWeek(item.week_number, index + 1),
      _order: Number(item.order_number) || index + 1,
    }))
    .sort((a, b) => a._week - b._week || a._order - b._order || a._index - b._index);

  if (!orderedItems.length) return [];

  const maxWeek = Math.max(...orderedItems.map((item) => item._week));
  const phaseSize = getPhaseSize(maxWeek);
  const groups = new Map();

  orderedItems.forEach((item) => {
    const phaseIndex = Math.floor((item._week - 1) / phaseSize);
    const startWeek = phaseIndex * phaseSize + 1;
    const endWeek = startWeek + phaseSize - 1;
    const key = `${startWeek}-${endWeek}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        domId: getRoadmapPhaseDomId(key),
        startWeek,
        endWeek,
        items: [],
      });
    }

    groups.get(key).items.push(item);
  });

  const phases = Array.from(groups.values()).map((phase, index) => {
    const completedCount = phase.items.filter((item) => item.status === "completed").length;
    const progress = phase.items.length
      ? Math.round(phase.items.reduce((sum, item) => sum + getRoadmapItemProgress(item), 0) / phase.items.length)
      : 0;
    const activeWeekNumbers = [...new Set(phase.items.map((item) => item._week))].sort((a, b) => a - b);
    const weekLabel = activeWeekNumbers.length === 1
      ? `Tuần ${activeWeekNumbers[0]}`
      : `Tuần ${activeWeekNumbers[0]}-${activeWeekNumbers[activeWeekNumbers.length - 1]}`;

    return {
      ...phase,
      index: index + 1,
      completedCount,
      progress,
      status: getPhaseStatus(phase.items),
      weekLabel,
      outcome: summarizeResults(phase.items),
      title: getPhaseTitle(phase, index),
    };
  });

  return phases.map((phase, index) => ({
    ...phase,
    stageLabel: getStageLabel(index, phases.length),
  }));
}

export function getCurrentRoadmapPhaseKey(phases) {
  const activePhase = phases.find((phase) => phase.status === "in_progress")
    || phases.find((phase) => phase.status === "rescheduled")
    || phases.find((phase) => phase.status === "not_completed")
    || phases.find((phase) => phase.status !== "completed")
    || phases[0];

  return activePhase?.key || "";
}
