import React from "react";
import { ChevronDown, Layers, Minimize2, Navigation, Target } from "lucide-react";
import { Badge, Button } from "../../../components/ui";
import RoadmapItemCard from "./RoadmapItemCard";
import { roadmapPhaseStatusConfig } from "../utils/roadmapPhaseUtils";

function RoadmapStageAccordion({
  phase,
  open,
  active,
  highlighted,
  updatingItemId,
  savingResultItemId,
  reschedulingItemId,
  onToggle,
  onStatusChange,
  onResultSubmit,
  onRescheduleSubmit,
}) {
  const config = roadmapPhaseStatusConfig[phase.status] || roadmapPhaseStatusConfig.not_started;
  const Icon = config.icon;
  const panelId = `${phase.domId}-panel`;
  const headerId = `${phase.domId}-header`;

  return (
    <section
      id={phase.domId}
      data-roadmap-stage-key={phase.key}
      data-testid="roadmap-stage-accordion"
      className={`scroll-mt-28 overflow-hidden rounded-lg border bg-white transition duration-300 ${
        highlighted
          ? "border-orange-300 shadow-md shadow-orange-100 ring-4 ring-orange-100"
          : active
            ? "border-blue-300 shadow-sm ring-2 ring-blue-100"
            : "border-slate-200 shadow-sm shadow-slate-100"
      }`}
    >
      <button
        id={headerId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onToggle(phase)}
        className="flex w-full flex-col gap-3 p-4 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:flex-row sm:items-center sm:justify-between"
      >
        <span className="flex min-w-0 items-start gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-black ${
            active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
          }`}>
            {phase.index}
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-600">
                {phase.stageLabel}
              </span>
              <span className="text-xs font-black uppercase text-slate-500">{phase.weekLabel}</span>
            </span>
            <span className="mt-1 block text-base font-black text-slate-950">
              Giai đoạn {phase.index}: {phase.title}
            </span>
          </span>
        </span>

        <span className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Badge tone={config.tone}>
            <Icon size={13} className="mr-1 inline" />
            {config.label}
          </Badge>
          <Badge tone="blue">{phase.progress}% hoàn thành</Badge>
          <ChevronDown
            size={20}
            className={`text-slate-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          {open && (
            <div className="border-t border-slate-200 bg-slate-50/70 p-4">
              <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                      <Target size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-slate-500">Mục tiêu giai đoạn</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{phase.outcome}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-black uppercase text-slate-500">
                      <span>Tiến độ nhiệm vụ</span>
                      <span>{phase.completedCount}/{phase.items.length}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, phase.progress))}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {phase.items.map((item) => (
                    <RoadmapItemCard
                      key={item.id || `${phase.key}-${item._index}`}
                      item={item}
                      updating={updatingItemId === item.id}
                      savingResult={savingResultItemId === item.id}
                      rescheduling={reschedulingItemId === item.id}
                      onStatusChange={onStatusChange}
                      onResultSubmit={onResultSubmit}
                      onRescheduleSubmit={onRescheduleSubmit}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function RoadmapStageList({
  phases = [],
  activePhaseKey,
  openPhaseKeys = [],
  highlightedPhaseKey,
  updatingItemId,
  savingResultItemId,
  reschedulingItemId,
  onTogglePhase,
  onCollapseAll,
  onOpenCurrent,
  onStatusChange,
  onResultSubmit,
  onRescheduleSubmit,
}) {
  if (!phases.length) return null;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase text-blue-600">
            <Layers size={14} />
            Chi tiết theo giai đoạn
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Các bước học</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onOpenCurrent}>
            <Navigation size={15} />
            Mở giai đoạn hiện tại
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onCollapseAll}>
            <Minimize2 size={15} />
            Thu gọn tất cả
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {phases.map((phase) => (
          <RoadmapStageAccordion
            key={phase.key}
            phase={phase}
            open={openPhaseKeys.includes(phase.key)}
            active={activePhaseKey === phase.key}
            highlighted={highlightedPhaseKey === phase.key}
            updatingItemId={updatingItemId}
            savingResultItemId={savingResultItemId}
            reschedulingItemId={reschedulingItemId}
            onToggle={onTogglePhase}
            onStatusChange={onStatusChange}
            onResultSubmit={onResultSubmit}
            onRescheduleSubmit={onRescheduleSubmit}
          />
        ))}
      </div>
    </section>
  );
}
