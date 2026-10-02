import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Circle,
  Clock3,
  ExternalLink,
  FileText,
  Focus,
  Grip,
  Layers3,
  Lock,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { Badge, Button, Card, Input, Select } from "../../../components/ui";
import { downloadProtectedFile } from "../../../utils/downloadFile";
import {
  ROADMAP_NODE_STATUS,
  ROADMAP_NODE_TYPES,
  buildRoadmapVisualModel,
  canCompleteRoadmapNode,
  filterRoadmapNodes,
} from "../utils/roadmapVisualUtils";

const statusIconMap = {
  not_started: Circle,
  in_progress: Play,
  completed: CheckCircle2,
  overdue: Clock3,
  locked: Lock,
  rescheduled: RotateCcw,
  not_completed: X,
};

const nodeClasses = {
  not_started: "border-slate-300 bg-white text-slate-700",
  in_progress: "border-blue-500 bg-blue-50 text-blue-900 ring-blue-100",
  completed: "border-emerald-500 bg-emerald-50 text-emerald-900 ring-emerald-100",
  overdue: "border-rose-500 bg-rose-50 text-rose-900 ring-rose-100",
  locked: "border-slate-300 bg-slate-100 text-slate-500",
  rescheduled: "border-blue-400 bg-blue-50 text-blue-900",
  not_completed: "border-rose-500 bg-rose-50 text-rose-900",
};

const viewFilters = [
  { value: "all", label: "Toàn bộ" },
  { value: "current", label: "Đang học" },
  { value: "incomplete", label: "Chưa hoàn thành" },
  { value: "overdue", label: "Quá hạn" },
];

const statusFilters = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "not_started", label: "Chưa học" },
  { value: "in_progress", label: "Đang học" },
  { value: "completed", label: "Hoàn thành" },
  { value: "overdue", label: "Quá hạn" },
  { value: "locked", label: "Bị khóa" },
];

const typeFilters = [
  { value: "", label: "Tất cả bài học" },
  { value: "required", label: "Bắt buộc" },
  { value: "recommended", label: "Khuyến nghị" },
  { value: "optional", label: "Tùy chọn" },
];

function getStorageKey(roadmapId) {
  return `studymate-roadmap-visual-open-${roadmapId || "draft"}`;
}

function formatMinutes(value) {
  const minutes = Number(value) || 0;
  if (minutes < 60) return `${minutes || 0} phút`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`;
}

function getLessonText(item) {
  return item.lesson_content || item.description || "";
}

function getLessonLinks(item) {
  return [
    item.lesson_video_url ? { label: "Video bài học", href: item.lesson_video_url, icon: BookOpen } : null,
    item.lesson_external_url ? { label: "Link bài học", href: item.lesson_external_url, icon: ExternalLink } : null,
    item.lesson_material_path ? { label: "File tài liệu", href: item.lesson_material_path, icon: FileText, protected: true } : null,
    item.assignment_attachment_path ? { label: "File quiz", href: item.assignment_attachment_path, icon: ClipboardCheck, protected: true } : null,
  ].filter(Boolean);
}

function isQuizCompleted(item) {
  if ((item.assignment_submission_status || "") !== "graded") return false;
  return Number(item.assignment_score || 0) >= 7;
}

function RoadmapLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(ROADMAP_NODE_STATUS).map(([key, item]) => {
        const Icon = statusIconMap[key] || Circle;
        return (
          <span key={key} title={item.label} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
            <Icon size={13} />
            {item.label}
          </span>
        );
      })}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
        Môn học
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
        Chương
      </span>
    </div>
  );
}

function RoadmapNode({ node, selected, hidden, onSelect, onPhaseNavigate }) {
  const structural = node.kind === "root" || node.kind === "chapter";
  const statusConfig = ROADMAP_NODE_STATUS[node.status] || ROADMAP_NODE_STATUS.not_started;
  const typeConfig = ROADMAP_NODE_TYPES[node.type] || ROADMAP_NODE_TYPES.required;
  const Icon = structural ? Layers3 : statusIconMap[node.status] || Circle;
  const widthClass = node.kind === "root" ? "w-64" : "w-56";
  const toneClass = node.kind === "root"
    ? "border-blue-600 bg-blue-600 text-white ring-blue-100"
    : node.kind === "chapter"
      ? "border-indigo-300 bg-indigo-50 text-indigo-950 ring-indigo-100"
      : nodeClasses[node.status] || nodeClasses.not_started;

  return (
    <button
      type="button"
      data-testid="roadmap-visual-node"
      title={structural ? node.title : `${statusConfig.label} - ${typeConfig.label}`}
      onClick={() => onSelect(node)}
      onDoubleClick={() => node.phaseKey && onPhaseNavigate?.(node.phaseKey)}
      className={`absolute ${widthClass} rounded-lg border-2 p-3 text-left shadow-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${toneClass} ${
        !structural && node.type === "optional" ? "border-dashed" : "border-solid"
      } ${selected ? "ring-4 ring-amber-300" : ""} ${hidden ? "opacity-20 grayscale" : "hover:-translate-y-0.5 hover:shadow-md"}`}
      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
      aria-label={structural ? `${node.contentType}: ${node.title}` : `${node.title}, ${statusConfig.label}, ${typeConfig.label}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className={`block text-[11px] font-black uppercase ${node.kind === "root" ? "text-blue-100" : "text-slate-500"}`}>
            {node.kind === "root" ? "Gốc môn học" : `#${node.index} · ${node.contentType}`}
          </span>
          <span className="mt-1 line-clamp-2 block text-sm font-black leading-5">{node.title}</span>
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/80 text-slate-700">
          <Icon size={16} />
        </span>
      </div>

      {structural ? (
        <p className={`mt-3 text-xs font-bold ${node.kind === "root" ? "text-blue-50" : "text-indigo-700"}`}>
          {node.lessonCount || 0} bài học
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone={statusConfig.tone}>{statusConfig.label}</Badge>
          <Badge tone={typeConfig.tone}>{typeConfig.label}</Badge>
        </div>
      )}
    </button>
  );
}

function EmptyDetail() {
  return (
    <aside className="hidden rounded-lg border border-slate-200 bg-white p-5 lg:sticky lg:top-6 lg:block">
      <p className="text-sm font-bold text-slate-500">Chọn một bài học trên mindmap để xem nội dung học và quiz.</p>
    </aside>
  );
}

function StructureDetail({ node, nodes, onClose }) {
  const childLessons = nodes.filter((item) => item.kind === "lesson" && (node.kind === "root" || item.branch === node.branch));

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl lg:sticky lg:top-6 lg:z-auto lg:max-h-[calc(100vh-3rem)] lg:rounded-lg lg:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-blue-600">{node.contentType}</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{node.title}</h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Đóng chi tiết">
          <X size={18} />
        </button>
      </div>
      <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">
        Đây là node cấu trúc của mindmap. Chọn một bài học ở nhánh bên phải để xem nội dung học, tài liệu và quiz xác nhận.
      </p>
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">
        {childLessons.length} bài học trong {node.kind === "root" ? "môn học" : "chương này"}.
      </div>
    </aside>
  );
}

function LessonDetail({ node, nodes, updating, onClose, onStart, onComplete }) {
  const prerequisites = node.prerequisiteIds.map((id) => nodes.find((item) => item.id === id)).filter(Boolean);
  const completeAllowed = canCompleteRoadmapNode(node, nodes);
  const links = getLessonLinks(node.item);

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 max-h-[82vh] overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl lg:sticky lg:top-6 lg:z-auto lg:max-h-[calc(100vh-3rem)] lg:rounded-lg lg:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-blue-600">{node.branch}</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{node.item.lesson_title || node.title}</h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Đóng chi tiết">
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone={ROADMAP_NODE_STATUS[node.status]?.tone || "slate"}>{ROADMAP_NODE_STATUS[node.status]?.label || node.status}</Badge>
        <Badge tone={ROADMAP_NODE_TYPES[node.type]?.tone || "blue"}>{ROADMAP_NODE_TYPES[node.type]?.label || node.type}</Badge>
        <Badge tone="blue">{formatMinutes(node.item.lesson_duration_minutes || node.item.duration_minutes)}</Badge>
      </div>

      <div className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
        <section>
          <p className="text-xs font-black uppercase text-slate-500">Nội dung bài học</p>
          <p className="mt-1 whitespace-pre-line">{getLessonText(node.item) || "Chưa có nội dung bài học."}</p>
        </section>

        {links.length > 0 && (
          <section>
            <p className="text-xs font-black uppercase text-slate-500">Tài liệu và liên kết</p>
            <div className="mt-2 grid gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => link.protected ? downloadProtectedFile(link.href) : window.open(link.href, "_blank", "noopener,noreferrer")}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-black text-blue-700 hover:border-blue-200 hover:bg-blue-100"
                  >
                    <Icon size={15} />
                    {link.label}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <p className="text-xs font-black uppercase text-slate-500">Quiz xác nhận</p>
          <p className="mt-1 whitespace-pre-line">{node.item.assignment_title || node.item.suggested_task || "Chưa gắn quiz xác nhận."}</p>
          {node.item.assignment_id && (
            <div className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
              Trạng thái quiz: {isQuizCompleted(node.item) ? "Đã đạt yêu cầu" : "Chưa đạt/chưa làm"}
            </div>
          )}
          {node.item.assignment_id && (
            <Button to={`/student/assignments/${node.item.assignment_id}/quiz`} variant="secondary" size="sm" className="mt-2">
              <ClipboardCheck size={15} />
              Làm quiz xác nhận
            </Button>
          )}
        </section>

        <section>
          <p className="text-xs font-black uppercase text-slate-500">Bài học tiên quyết</p>
          {prerequisites.length ? (
            <ul className="mt-2 space-y-2">
              {prerequisites.map((item) => (
                <li key={item.id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 font-bold text-slate-700">
                  {item.rawStatus === "completed" ? <CheckCircle2 size={15} className="text-emerald-600" /> : <Lock size={15} className="text-slate-500" />}
                  {item.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1">Không có bài học tiên quyết.</p>
          )}
        </section>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="secondary" onClick={() => onStart(node)} disabled={updating || node.rawStatus === "completed"}>
          <Play size={16} />
          Bắt đầu học
        </Button>
        <Button type="button" onClick={() => onComplete(node)} disabled={updating || !completeAllowed || node.rawStatus === "completed"} title={!completeAllowed ? "Cần hoàn thành bài học tiên quyết trước." : ""}>
          <CheckCircle2 size={16} />
          Đánh dấu hoàn thành
        </Button>
      </div>
      {!completeAllowed && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
          Node này đang bị khóa vì bài học tiên quyết chưa hoàn thành.
        </p>
      )}
    </aside>
  );
}

function DetailPanel({ node, nodes, updating, onClose, onStart, onComplete }) {
  if (!node) return <EmptyDetail />;
  if (node.kind !== "lesson") return <StructureDetail node={node} nodes={nodes} onClose={onClose} />;
  return <LessonDetail node={node} nodes={nodes} updating={updating} onClose={onClose} onStart={onStart} onComplete={onComplete} />;
}

export default function RoadmapVisualExplorer({
  roadmapId,
  rootTitle,
  rootDescription,
  items = [],
  phases = [],
  focusItemId = "",
  updatingItemId,
  onStatusChange,
  onPhaseNavigate,
}) {
  const phaseByItemId = useMemo(() => {
    const map = new Map();
    phases.forEach((phase) => {
      phase.items.forEach((item) => map.set(item.id, phase.key));
    });
    return map;
  }, [phases]);
  const visual = useMemo(() => buildRoadmapVisualModel(items, { phaseByItemId, rootTitle, rootDescription }), [items, phaseByItemId, rootTitle, rootDescription]);
  const [filters, setFilters] = useState({ keyword: "", status: "", type: "", view: "all" });
  const [selectedId, setSelectedId] = useState("");
  const [collapsedBranches, setCollapsedBranches] = useState([]);
  const [transform, setTransform] = useState({ x: 24, y: 24, scale: 0.9 });
  const [dragging, setDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dragRef = useRef({ x: 0, y: 0 });
  const focusedItemRef = useRef("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(getStorageKey(roadmapId)) || "[]");
      if (Array.isArray(saved)) setCollapsedBranches(saved);
    } catch {
      setCollapsedBranches([]);
    }
  }, [roadmapId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(roadmapId), JSON.stringify(collapsedBranches));
  }, [roadmapId, collapsedBranches]);

  useEffect(() => {
    if (!focusItemId || String(focusedItemRef.current) === String(focusItemId)) return;
    const focusNode = visual.lessonNodes.find((node) => String(node.item.id) === String(focusItemId));
    if (focusNode) {
      setSelectedId(focusNode.id);
      focusedItemRef.current = focusItemId;
    }
  }, [focusItemId, visual.lessonNodes]);

  useEffect(() => {
    if (!isFullscreen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  const filteredNodes = useMemo(() => filterRoadmapNodes(visual.nodes, filters), [visual.nodes, filters]);
  const visibleIds = new Set(filteredNodes.filter((node) => node.kind !== "lesson" || !collapsedBranches.includes(node.branch)).map((node) => node.id));
  const selectedNode = visual.nodes.find((node) => node.id === selectedId) || null;
  const width = Math.max(980, Math.max(0, ...visual.nodes.map((node) => node.x)) + 980);
  const height = Math.max(620, Math.max(0, ...visual.nodes.map((node) => node.y)) + 180);

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function resetView() {
    setTransform({ x: 24, y: 24, scale: 0.9 });
  }

  function zoom(delta) {
    setTransform((current) => ({
      ...current,
      scale: Math.min(1.4, Math.max(0.55, Number((current.scale + delta).toFixed(2)))),
    }));
  }

  function startDrag(event) {
    if (event.button !== 0) return;
    setDragging(true);
    dragRef.current = { x: event.clientX - transform.x, y: event.clientY - transform.y };
  }

  function moveDrag(event) {
    if (!dragging) return;
    setTransform((current) => ({ ...current, x: event.clientX - dragRef.current.x, y: event.clientY - dragRef.current.y }));
  }

  function toggleBranch(branch) {
    setCollapsedBranches((current) => (current.includes(branch) ? current.filter((item) => item !== branch) : [...current, branch]));
  }

  function handleWheel(event) {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    zoom(event.deltaY > 0 ? -0.08 : 0.08);
  }

  function handleNodeStatus(node, status) {
    if (node.kind !== "lesson") return;
    onStatusChange?.(node.item, status);
  }

  if (!visual.lessonNodes.length) {
    return (
      <Card className="p-6">
        <p className="text-sm font-bold text-slate-500">Môn học này chưa có bài học để hiển thị trên mindmap.</p>
      </Card>
    );
  }

  return (
    <section id="roadmap-mindmap" className={isFullscreen ? "fixed inset-0 z-[80] bg-slate-950/30 p-0" : "space-y-4"} data-testid="roadmap-visual-explorer">
      <Card className={`overflow-hidden p-0 ${isFullscreen ? "flex h-screen flex-col rounded-none border-0 shadow-none" : ""}`}>
        <div className={`border-b border-slate-200 bg-white p-4 sm:p-5 ${isFullscreen ? "shrink-0" : ""}`}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase text-blue-600">
                <Layers3 size={14} />
                Mindmap bài học
              </p>
              <h2 className="mt-2 text-xl font-black text-slate-950">Môn học → Chương → Bài học</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Kéo để di chuyển, Ctrl + cuộn hoặc nút +/- để phóng to thu nhỏ. Chọn bài học để xem nội dung và quiz ở sidebar.</p>
            </div>
            <div className="grid min-w-0 gap-3 sm:min-w-72">
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3 text-xs font-black uppercase text-slate-500">
                  <span>Tiến độ bài học</span>
                  <span>{visual.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${visual.progress}%` }} />
                </div>
                <p className="text-xs font-bold text-slate-500">{visual.completed}/{visual.total} bài học hoàn thành</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setIsFullscreen((current) => !current)}>
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                {isFullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"}
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_180px_180px_180px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={filters.keyword} onChange={(event) => updateFilter("keyword", event.target.value)} placeholder="Tìm bài học, chương, quiz..." className="pl-10" />
            </label>
            <Select value={filters.view} onChange={(event) => updateFilter("view", event.target.value)}>
              {viewFilters.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </Select>
            <Select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
              {statusFilters.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </Select>
            <Select value={filters.type} onChange={(event) => updateFilter("type", event.target.value)}>
              {typeFilters.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </Select>
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <RoadmapLegend />
            <div className="flex flex-wrap gap-2">
              {visual.branches.map((branch) => (
                <button key={branch} type="button" onClick={() => toggleBranch(branch)} className={`rounded-lg border px-3 py-2 text-xs font-black transition ${collapsedBranches.includes(branch) ? "border-slate-300 bg-slate-100 text-slate-500" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
                  {collapsedBranches.includes(branch) ? "Mở" : "Thu"} {branch}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`grid gap-0 bg-slate-50 lg:grid-cols-[minmax(0,1fr)_380px] ${isFullscreen ? "min-h-0 flex-1 overflow-hidden" : ""}`}>
          <div
            className={`relative overflow-hidden border-b border-slate-200 lg:border-b-0 lg:border-r ${isFullscreen ? "h-full min-h-[calc(100vh-18rem)] lg:min-h-0" : "min-h-[620px]"} ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
            onMouseDown={startDrag}
            onMouseMove={moveDrag}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
            onWheel={handleWheel}
          >
            <div className="absolute left-4 top-4 z-10 flex gap-2">
              <button type="button" onClick={() => zoom(0.1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm">+</button>
              <button type="button" onClick={() => zoom(-0.1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm">-</button>
              <button type="button" onClick={resetView} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-sm">
                <Focus size={15} /> Reset
              </button>
            </div>
            <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm">
              <Grip size={14} /> {Math.round(transform.scale * 100)}%
              {isFullscreen && <span className="hidden text-slate-400 sm:inline">Esc để thoát</span>}
            </div>

            <div className="absolute left-0 top-0 origin-top-left transition-transform" style={{ width, height, transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
              <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                <defs>
                  <marker id="roadmap-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
                  </marker>
                </defs>
                {visual.edges.map((edge) => {
                  const source = visual.nodes.find((node) => node.id === edge.sourceId);
                  const target = visual.nodes.find((node) => node.id === edge.targetId);
                  if (!source || !target) return null;
                  const hidden = !visibleIds.has(source.id) || !visibleIds.has(target.id);
                  const sourceWidth = source.kind === "root" ? 256 : 224;
                  const x1 = source.x + sourceWidth;
                  const y1 = source.y + 54;
                  const x2 = target.x;
                  const y2 = target.y + 54;
                  const midX = Math.round((x1 + x2) / 2);
                  const dash = edge.structural ? "" : "5 7";
                  return <path key={edge.id} data-testid="roadmap-visual-edge" d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`} fill="none" stroke={edge.optional ? "#f59e0b" : edge.structural ? "#64748b" : "#2563eb"} strokeWidth={edge.structural ? "2.5" : "2"} strokeDasharray={dash} markerEnd="url(#roadmap-arrow)" opacity={hidden ? 0.12 : 0.9} />;
                })}
              </svg>

              {visual.nodes.map((node) => (
                <RoadmapNode
                  key={node.id}
                  node={node}
                  selected={selectedNode?.id === node.id}
                  hidden={!visibleIds.has(node.id)}
                  onSelect={(nextNode) => setSelectedId(nextNode.id)}
                  onPhaseNavigate={(phaseKey) => onPhaseNavigate?.(phases.find((phase) => phase.key === phaseKey))}
                />
              ))}
            </div>
          </div>

          <DetailPanel node={selectedNode} nodes={visual.nodes} updating={Boolean(updatingItemId)} onClose={() => setSelectedId("")} onStart={(node) => handleNodeStatus(node, "in_progress")} onComplete={(node) => handleNodeStatus(node, "completed")} />
        </div>
      </Card>
    </section>
  );
}
