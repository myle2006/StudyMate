import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, ClipboardCheck, Clock3, Map, Pencil, PlayCircle, Target, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, ConfirmDialog, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import RoadmapProgressBar from "../components/RoadmapProgressBar";
import RoadmapStageList from "../components/RoadmapStageList";
import RoadmapVisualExplorer from "../components/RoadmapVisualExplorer";
import {
  getRoadmapById,
  getRoadmapProgress,
  deleteRoadmap,
  rescheduleRoadmapItem,
  updateRoadmap,
  updateRoadmapItemResult,
  updateRoadmapItemStatus,
} from "../services/learningRoadmapService";
import {
  buildRoadmapPhases,
  getCurrentRoadmapPhaseKey,
} from "../utils/roadmapPhaseUtils";
import {
  buildRoadmapVisualModel,
  canCompleteRoadmapNode,
} from "../utils/roadmapVisualUtils";
import { findNextStudyNode, getStudentFacingStatus, getStudyActionLabel } from "../utils/roadmapStudyFlow";

const levelMap = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

const weekdayLabels = {
  1: "T2",
  2: "T3",
  3: "T4",
  4: "T5",
  5: "T6",
  6: "T7",
  7: "CN",
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

function formatMinutes(value) {
  const minutes = Number(value) || 0;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours <= 0) return `${rest} phút`;
  if (rest === 0) return `${hours} giờ`;
  return `${hours} giờ ${rest} phút`;
}

function formatWeekdays(value) {
  const days = Array.isArray(value) ? value : String(value || "").split(",");
  return days.map((day) => weekdayLabels[Number(day)]).filter(Boolean).join(", ") || "-";
}

function InfoItem({ icon: Icon, label, value, children }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-500">
        {Icon && <Icon size={16} />}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-bold text-slate-950">{children || value || "-"}</div>
    </div>
  );
}

function StudyFocusCard({ node, nodes, progressPercent, updating, onStart, onComplete, onShowMap }) {
  if (!node) return null;

  const item = node.item;
  const hasQuiz = Boolean(item.assignment_id);
  const statusText = getStudentFacingStatus(node);
  const completeAllowed = canCompleteRoadmapNode(node, nodes);

  return (
    <section className="overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-emerald-600 p-6 text-white">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase text-blue-100">
            <PlayCircle className="h-4 w-4" />
            Bài nên học tiếp theo
          </p>
          <h2 className="mt-3 text-2xl font-black">{item.lesson_title || node.title}</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-blue-50">
            {node.branch} · {formatMinutes(item.lesson_duration_minutes || item.duration_minutes)}. Hoàn thành bài này để mở bước tiếp theo trong lộ trình.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {hasQuiz ? (
              <Button to={`/student/assignments/${item.assignment_id}/quiz`} variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50">
                <ClipboardCheck size={16} />
                Làm quiz xác nhận
              </Button>
            ) : (
              <Button type="button" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => onStart(node)} disabled={updating || node.rawStatus === "completed"}>
                <PlayCircle size={16} />
                {getStudyActionLabel(item)}
              </Button>
            )}
            <Button type="button" variant="secondary" className="border-white/60 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={onShowMap}>
              <Map size={16} />
              Xem trên bản đồ
            </Button>
          </div>
        </div>
        <div className="grid gap-3 p-5">
          <InfoItem label="Trạng thái" value={statusText} />
          <InfoItem label="Tiến độ lộ trình" value={`${progressPercent}%`} />
          <InfoItem label="Quiz xác nhận" value={hasQuiz ? (item.assignment_submission_status === "graded" ? "Đã làm" : "Cần làm") : "Không yêu cầu"} />
          {!hasQuiz && (
            <Button type="button" onClick={() => onComplete(node)} disabled={updating || !completeAllowed || node.rawStatus === "completed"}>
              <CheckCircle2 size={16} />
              Đánh dấu hoàn thành
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function buildRoadmapStatusPayload(roadmap, status) {
  return {
    subject_id: roadmap.subject_id,
    learning_goal_id: roadmap.learning_goal_id || "",
    title: roadmap.title,
    overview: roadmap.overview || "",
    goal: roadmap.goal,
    current_level: roadmap.current_level,
    study_time_per_day: roadmap.study_time_per_day,
    available_weekdays: roadmap.available_weekdays || [1, 2, 3, 4, 5],
    preferred_start_time: roadmap.preferred_start_time || "19:00",
    session_duration_minutes: roadmap.session_duration_minutes || 60,
    max_daily_minutes: roadmap.max_daily_minutes || null,
    max_weekly_minutes: roadmap.max_weekly_minutes || null,
    reminder_minutes_before: roadmap.reminder_minutes_before ?? 15,
    start_date: roadmap.start_date,
    end_date: roadmap.end_date,
    generated_by_ai: roadmap.generated_by_ai,
    ai_prompt: roadmap.ai_prompt || "",
    ai_raw_response: roadmap.ai_raw_response || "",
    status,
  };
}

export default function RoadmapDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isGuestPreview } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressSummary, setProgressSummary] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [savingResultItemId, setSavingResultItemId] = useState(null);
  const [reschedulingItemId, setReschedulingItemId] = useState(null);
  const [completingRoadmap, setCompletingRoadmap] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activePhaseKey, setActivePhaseKey] = useState("");
  const [openPhaseKeys, setOpenPhaseKeys] = useState([]);
  const [highlightedPhaseKey, setHighlightedPhaseKey] = useState("");
  const highlightTimeoutRef = useRef(null);

  async function loadRoadmap() {
    setLoading(true);
    setError("");
    setProgressSummary(null);

    try {
      const roadmapResponse = await getRoadmapById(id);
      setRoadmap(roadmapResponse.data);

      try {
        const progressResponse = await getRoadmapProgress(id);
        setProgressSummary(progressResponse.data);
      } catch (progressError) {
        console.warn("Không thể tải thống kê tiến độ lộ trình.", progressError);
      }
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết lộ trình học.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoadmap();
  }, [id]);

  useEffect(() => () => {
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
  }, []);

  async function handleStatusChange(item, status) {
    if (status === "completed") {
      const visual = buildRoadmapVisualModel(roadmap?.items || []);
      const node = visual.nodes.find((candidate) => String(candidate.item.id) === String(item.id));
      if (node && !canCompleteRoadmapNode(node, visual.nodes)) {
        toast.error("Bạn cần hoàn thành nội dung tiên quyết trước khi đánh dấu node này hoàn thành.");
        return;
      }
    }

    setUpdatingItemId(item.id);

    try {
      const response = await updateRoadmapItemStatus(item.id, status);
      setRoadmap((current) => {
        if (!current) return current;

        return {
          ...current,
          progress_percent: response.data.progress_percent,
          items: current.items.map((currentItem) => (
            currentItem.id === item.id ? response.data.item : currentItem
          )),
        };
      });
      setProgressSummary(response.data.summary || response.data);
      toast.success(
        response.data.is_completed
          ? "Tất cả bước học đã hoàn thành. Bạn có thể chuyển lộ trình sang hoàn thành."
          : "Cập nhật trạng thái bước học thành công."
      );
    } catch (err) {
      toast.error(err.message || "Không thể cập nhật trạng thái bước học.");
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleResultSubmit(item, data) {
    setSavingResultItemId(item.id);

    try {
      const response = await updateRoadmapItemResult(item.id, {
        ...data,
        completion_percent: Number(data.completion_percent || 0),
        actual_study_minutes: data.actual_study_minutes === "" ? null : Number(data.actual_study_minutes),
        self_assessment: data.self_assessment === "" ? null : Number(data.self_assessment),
      });
      setRoadmap((current) => current ? ({
        ...current,
        progress_percent: response.data.progress_percent,
        items: current.items.map((currentItem) => (
          currentItem.id === item.id ? response.data.item : currentItem
        )),
      }) : current);
      setProgressSummary(response.data.summary);
      toast.success("Cập nhật kết quả học tập thành công.");
    } catch (err) {
      toast.error(err.message || "Không thể cập nhật kết quả học tập.");
    } finally {
      setSavingResultItemId(null);
    }
  }

  async function handleRescheduleSubmit(item, data) {
    setReschedulingItemId(item.id);

    try {
      const response = await rescheduleRoadmapItem(item.id, {
        ...data,
        duration_minutes: Number(data.duration_minutes || item.duration_minutes || 60),
      });
      setRoadmap((current) => current ? ({
        ...current,
        items: current.items.map((currentItem) => (
          currentItem.id === item.id ? response.data.item : currentItem
        )),
      }) : current);
      setProgressSummary(response.data.summary);
      toast.success("Dời lịch nhiệm vụ học thành công.");
    } catch (err) {
      const conflicts = err.errors?.schedule_conflicts;
      const suggestion = Array.isArray(conflicts) && conflicts[0]?.suggestions?.[0]
        ? ` Gợi ý: ${conflicts[0].suggestions[0].start_time}-${conflicts[0].suggestions[0].end_time}.`
        : "";
      toast.error((err.message || "Không thể dời lịch nhiệm vụ học.") + suggestion);
    } finally {
      setReschedulingItemId(null);
    }
  }

  async function handleCompleteRoadmap() {
    if (!roadmap) return;
    setCompletingRoadmap(true);

    try {
      const response = await updateRoadmap(roadmap.id, buildRoadmapStatusPayload(roadmap, "completed"));
      setRoadmap(response.data);
      toast.success("Đã chuyển lộ trình sang hoàn thành.");
    } catch (err) {
      toast.error(err.message || "Không thể chuyển lộ trình sang hoàn thành.");
    } finally {
      setCompletingRoadmap(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);

    try {
      await deleteRoadmap(id);
      toast.success("Xóa lộ trình học thành công.");
      navigate("/student/roadmaps");
    } catch (err) {
      toast.error(err.message || "Không thể xóa lộ trình học.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  const roadmapPhases = useMemo(() => buildRoadmapPhases(roadmap?.items || []), [roadmap?.items]);
  const currentPhaseKey = useMemo(() => getCurrentRoadmapPhaseKey(roadmapPhases), [roadmapPhases]);
  const phaseByItemId = useMemo(() => {
    const map = new Map();
    roadmapPhases.forEach((phase) => {
      phase.items.forEach((item) => map.set(item.id, phase.key));
    });
    return map;
  }, [roadmapPhases]);
  const studyFlow = useMemo(() => findNextStudyNode(roadmap?.items || [], {
    phaseByItemId,
    rootTitle: roadmap?.subject_name,
    rootDescription: roadmap?.subject_description || roadmap?.overview || "",
  }), [roadmap?.items, phaseByItemId, roadmap?.subject_name, roadmap?.subject_description, roadmap?.overview]);

  useEffect(() => {
    if (!roadmapPhases.length) return;

    setActivePhaseKey((current) => (
      roadmapPhases.some((phase) => phase.key === current) ? current : currentPhaseKey
    ));
    setOpenPhaseKeys((current) => {
      const validKeys = current.filter((key) => roadmapPhases.some((phase) => phase.key === key));
      return validKeys.length ? validKeys : [currentPhaseKey];
    });
  }, [roadmapPhases, currentPhaseKey]);

  function openPhase(phaseKey) {
    setOpenPhaseKeys((current) => (
      current.includes(phaseKey) ? current : [...current, phaseKey]
    ));
  }

  function highlightPhase(phaseKey) {
    setHighlightedPhaseKey(phaseKey);
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedPhaseKey((current) => (current === phaseKey ? "" : current));
    }, 1800);
  }

  function handlePhaseNavigate(phase) {
    setActivePhaseKey(phase.key);
    openPhase(phase.key);

    window.setTimeout(() => {
      document.getElementById(phase.domId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      highlightPhase(phase.key);
    }, 80);
  }

  function handleTogglePhase(phase) {
    setActivePhaseKey(phase.key);
    setOpenPhaseKeys((current) => (
      current.includes(phase.key)
        ? current.filter((key) => key !== phase.key)
        : [...current, phase.key]
    ));
  }

  function handleCollapseAll() {
    setOpenPhaseKeys([]);
  }

  function handleOpenCurrentPhase() {
    const phase = roadmapPhases.find((item) => item.key === currentPhaseKey) || roadmapPhases[0];
    if (phase) handlePhaseNavigate(phase);
  }

  function handleShowCurrentOnMap() {
    document.getElementById("roadmap-mindmap")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading) {
    return <LoadingState label="Đang tải lộ trình học..." />;
  }

  if (error || !roadmap) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Lộ trình học"
          title="Không tìm thấy lộ trình"
          description={error || "Lộ trình không tồn tại hoặc không thuộc tài khoản của bạn."}
          actions={
            <Button to="/student/roadmaps" variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
          }
        />
      </main>
    );
  }

  const lessonItems = (roadmap.items || []).filter((item) => item.lesson_id || item.lesson_title || item.lesson_content);
  const totalItems = lessonItems.length;
  const completedItems = lessonItems.filter((item) => item.status === "completed").length;
  const lessonProgressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const missedItems = lessonItems.filter((item) => {
    if (["completed", "not_completed"].includes(item.status)) return false;
    if (!item.planned_date || !item.start_time) return false;
    return new Date(`${item.planned_date}T${item.start_time}`) < new Date();
  });
  const shouldSuggestCompletion = totalItems > 0 && completedItems === totalItems && roadmap.status !== "completed";

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow={`${roadmap.subject_code} - ${roadmap.subject_name}`}
          title={roadmap.title}
          description={roadmap.overview}
          actions={
            <>
              <Button to="/student/roadmaps" variant="secondary">
                <ArrowLeft size={16} /> Danh sách
              </Button>
              {!isGuestPreview && (
                <>
                  <Button to={`/student/roadmaps/${roadmap.id}/edit`}>
                    <Pencil size={16} /> Sửa
                  </Button>
                  <Button type="button" variant="danger" onClick={() => setConfirmOpen(true)}>
                    <Trash2 size={16} /> Xóa
                  </Button>
                </>
              )}
            </>
          }
        />

        {roadmap.learning_goal_title && (
          <Card className="border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-extrabold uppercase text-blue-700">Đang phục vụ mục tiêu</p>
            <p className="mt-1 text-base font-black text-blue-950">{roadmap.learning_goal_title}</p>
          </Card>
        )}

        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="p-5 sm:p-6">
              <RoadmapProgressBar value={lessonProgressPercent} completed={completedItems} total={totalItems} />
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                  <Target size={18} />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-blue-700">Mục tiêu học tập</p>
                  <p className="mt-1 whitespace-pre-line text-sm font-semibold leading-6 text-slate-700">{roadmap.goal}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-slate-50/70 p-5 lg:border-l lg:border-t-0">
              <InfoItem icon={Clock3} label="Mỗi ngày" value={`${Number(roadmap.study_time_per_day).toFixed(1)} giờ`} />
              <InfoItem label="Trình độ" value={levelMap[roadmap.current_level] || roadmap.current_level} />
              <InfoItem icon={CalendarDays} label="Bắt đầu" value={formatDate(roadmap.start_date)} />
              <InfoItem icon={CalendarDays} label="Kết thúc" value={formatDate(roadmap.end_date)} />
            </div>
          </div>
          <details className="group border-t border-slate-200">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 sm:px-6">
              Xem lịch học và nhắc nhở
              <span className="text-xs font-bold text-blue-600 group-open:hidden">Mở rộng</span>
              <span className="hidden text-xs font-bold text-blue-600 group-open:inline">Thu gọn</span>
            </summary>
            <div className="grid gap-3 border-t border-slate-200 bg-slate-50/50 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
              <InfoItem label="Ngày học" value={formatWeekdays(roadmap.available_weekdays)} />
              <InfoItem label="Giờ bắt đầu" value={roadmap.preferred_start_time || "-"} />
              <InfoItem label="Mỗi buổi" value={formatMinutes(roadmap.session_duration_minutes)} />
              <InfoItem label="Nhắc lịch" value={`${roadmap.reminder_minutes_before ?? 0} phút trước`} />
            </div>
          </details>
        </Card>

        <StudyFocusCard
          node={studyFlow.node}
          nodes={studyFlow.visual.nodes}
          progressPercent={lessonProgressPercent}
          updating={Boolean(updatingItemId)}
          onStart={(node) => handleStatusChange(node.item, "in_progress")}
          onComplete={(node) => handleStatusChange(node.item, "completed")}
          onShowMap={handleShowCurrentOnMap}
        />

        {progressSummary && (
          <Card className="space-y-5 p-5 sm:p-6">
            <div>
              <p className="text-xs font-black uppercase text-blue-600">Tổng quan tiến độ</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Kết quả học tập</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <InfoItem label="Đã hoàn thành" value={`${progressSummary.completed_items || 0}/${progressSummary.total_items || 0} nhiệm vụ`} />
              <InfoItem label="Đã học" value={formatMinutes(progressSummary.actual_study_minutes)} />
              <InfoItem label="Còn lại" value={formatMinutes(progressSummary.remaining_minutes)} />
              <InfoItem label="Đạt mục tiêu" value={`${Number(progressSummary.goal_achievement_percent || 0).toFixed(0)}%`} />
            </div>
            <details className="group overflow-hidden rounded-xl border border-slate-200">
              <summary className="flex cursor-pointer list-none items-center justify-between bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-100">
                Tiến độ chi tiết theo ngày và tuần
                <span className="text-xs text-blue-600 group-open:hidden">Xem chi tiết</span>
                <span className="hidden text-xs text-blue-600 group-open:inline">Thu gọn</span>
              </summary>
              <div className="grid gap-4 border-t border-slate-200 p-4 lg:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <h3 className="text-sm font-black text-slate-950">Tiến độ theo ngày</h3>
                <div className="mt-3 space-y-2">
                  {(progressSummary.daily || []).slice(0, 5).map((day) => (
                    <div key={day.planned_date} className="flex items-center justify-between gap-3 text-sm font-bold text-slate-600">
                      <span>{formatDate(day.planned_date)}</span>
                      <span>{day.completed_items}/{day.total_items} · {Number(day.progress_percent || 0).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <h3 className="text-sm font-black text-slate-950">Tiến độ theo tuần</h3>
                <div className="mt-3 space-y-2">
                  {(progressSummary.weekly || []).slice(0, 5).map((week) => (
                    <div key={week.week_key} className="flex items-center justify-between gap-3 text-sm font-bold text-slate-600">
                      <span>{formatDate(week.week_start)} - {formatDate(week.week_end)}</span>
                      <span>{week.completed_items}/{week.total_items} · {Number(week.progress_percent || 0).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </details>
          </Card>
        )}

        {!isGuestPreview && shouldSuggestCompletion && (
          <Alert tone="success" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Tất cả bước học đã hoàn thành. Hãy chuyển trạng thái lộ trình sang hoàn thành.</span>
            <Button type="button" size="sm" onClick={handleCompleteRoadmap} disabled={completingRoadmap}>
              <CheckCircle2 size={16} />
              {completingRoadmap ? "Đang cập nhật..." : "Chuyển hoàn thành"}
            </Button>
          </Alert>
        )}

        {!isGuestPreview && missedItems.length > 0 && (
          <Alert tone="warning">
            Có {missedItems.length} nhiệm vụ đã qua giờ học. Hãy cập nhật trạng thái hoặc dời lịch để lộ trình tiếp tục chính xác.
          </Alert>
        )}

        <RoadmapVisualExplorer
          roadmapId={roadmap.id}
          rootTitle={roadmap.subject_name}
          rootDescription={roadmap.subject_description || roadmap.overview || ""}
          items={roadmap.items || []}
          phases={roadmapPhases}
          focusItemId={studyFlow.node?.item?.id}
          activePhaseKey={activePhaseKey}
          updatingItemId={updatingItemId}
          onPhaseNavigate={handlePhaseNavigate}
          onStatusChange={isGuestPreview ? undefined : handleStatusChange}
        />

        <RoadmapStageList
          phases={roadmapPhases}
          activePhaseKey={activePhaseKey}
          openPhaseKeys={openPhaseKeys}
          highlightedPhaseKey={highlightedPhaseKey}
          updatingItemId={updatingItemId}
          savingResultItemId={savingResultItemId}
          reschedulingItemId={reschedulingItemId}
          onTogglePhase={handleTogglePhase}
          onCollapseAll={handleCollapseAll}
          onOpenCurrent={handleOpenCurrentPhase}
          onStatusChange={isGuestPreview ? undefined : handleStatusChange}
          onResultSubmit={isGuestPreview ? undefined : handleResultSubmit}
          onRescheduleSubmit={undefined}
        />

      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa lộ trình học?"
        description={`Lộ trình "${roadmap.title}" sẽ bị xóa khỏi danh sách của bạn.`}
        confirmLabel="Xóa lộ trình"
        danger
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </main>
  );
}
