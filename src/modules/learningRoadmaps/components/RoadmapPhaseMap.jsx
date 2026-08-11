import React, { useMemo, useState } from "react";
import { MousePointerClick, Route } from "lucide-react";
import { Badge, Card } from "../../../components/ui";
import {
  buildRoadmapPhases,
  getCurrentRoadmapPhaseKey,
  roadmapPhaseStatusConfig,
} from "../utils/roadmapPhaseUtils";

const nodeToneClasses = {
  slate: {
    marker: "border-slate-300 bg-slate-100 text-slate-700",
    rail: "bg-slate-200",
    active: "border-slate-400 ring-slate-200",
  },
  blue: {
    marker: "border-blue-500 bg-blue-600 text-white",
    rail: "bg-blue-200",
    active: "border-blue-500 ring-blue-100",
  },
  green: {
    marker: "border-emerald-500 bg-emerald-600 text-white",
    rail: "bg-emerald-200",
    active: "border-emerald-500 ring-emerald-100",
  },
  rose: {
    marker: "border-rose-500 bg-rose-600 text-white",
    rail: "bg-rose-200",
    active: "border-rose-500 ring-rose-100",
  },
};

function RoadmapNode({ phase, active, onSelect }) {
  const config = roadmapPhaseStatusConfig[phase.status] || roadmapPhaseStatusConfig.not_started;
  const tone = nodeToneClasses[config.color] || nodeToneClasses.slate;
  const Icon = config.icon;

  return (
    <button
      type="button"
      aria-pressed={active}
      data-roadmap-phase-key={phase.key}
      data-testid="roadmap-node"
      onClick={() => onSelect(phase)}
      className={`group flex h-full min-h-44 w-full flex-col rounded-lg border bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${
        active ? `${tone.active} shadow-md ring-4` : "border-slate-200 shadow-sm shadow-slate-100"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-1 flex-1 rounded-full ${tone.rail}`} />
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 text-sm font-black shadow-sm transition group-hover:scale-105 ${tone.marker}`}>
          {phase.index}
        </span>
        <span className={`h-1 flex-1 rounded-full ${tone.rail}`} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-600">
          {phase.stageLabel}
        </span>
        <Badge tone={config.tone} className="px-2 py-1">
          <Icon size={12} className="mr-1 inline" />
          {config.label}
        </Badge>
      </div>

      <p className="mt-2 text-xs font-black uppercase text-slate-500">{phase.weekLabel}</p>
      <h3 className="mt-1 line-clamp-2 text-sm font-black leading-5 text-slate-950">
        {phase.title}
      </h3>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-500">
          <span>Tiến độ</span>
          <span>{phase.progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, phase.progress))}%` }}
          />
        </div>
      </div>
    </button>
  );
}

export default function RoadmapPhaseMap({
  items = [],
  phases: providedPhases,
  activePhaseKey,
  title = "Bản đồ lộ trình học",
  onPhaseSelect,
}) {
  const phases = useMemo(
    () => providedPhases || buildRoadmapPhases(items),
    [items, providedPhases],
  );
  const [internalActiveKey, setInternalActiveKey] = useState("");
  const fallbackActiveKey = getCurrentRoadmapPhaseKey(phases);
  const currentActiveKey = activePhaseKey || internalActiveKey || fallbackActiveKey;
  const overallProgress = phases.length
    ? Math.round(phases.reduce((sum, phase) => sum + phase.progress, 0) / phases.length)
    : 0;

  if (!phases.length) return null;

  function handleSelect(phase) {
    setInternalActiveKey(phase.key);
    onPhaseSelect?.(phase);
  }

  return (
    <Card className="overflow-hidden p-0" data-testid="roadmap-phase-map">
      <div className="soft-grid border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase text-blue-600">
              <MousePointerClick size={14} />
              Nhấn vào từng mốc để xem chi tiết
            </p>
            <h2 className="mt-2 text-xl font-black text-slate-950">{title}</h2>
          </div>
          <div className="grid min-w-0 gap-2 sm:min-w-72">
            <div className="flex items-center justify-between gap-3 text-xs font-black uppercase text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Route size={14} />
                Tổng tiến độ
              </span>
              <span>{overallProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
          <Badge tone="blue">{phases.length} giai đoạn</Badge>
        </div>
      </div>

      <div className="bg-slate-50 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {phases.map((phase) => (
            <RoadmapNode
              key={phase.key}
              phase={phase}
              active={phase.key === currentActiveKey}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
