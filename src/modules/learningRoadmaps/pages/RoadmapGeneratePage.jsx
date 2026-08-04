import React, { useEffect, useState } from "react";
import { ArrowLeft, Bot, CheckCircle2, CreditCard, Eye, PencilLine, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, Badge, Button, Card, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { getMySubjects } from "../../studentSubjects/services/studentSubjectService";
import { getLearningGoals } from "../../learningGoals/services/learningGoalService";
import RoadmapGenerateForm from "../components/RoadmapGenerateForm";
import { generateAIRoadmap, getAIRoadmapStatus } from "../services/learningRoadmapService";

const fallbackAiStatus = {
  provider: "ai",
  provider_label: "AI",
  configured: false,
  blocked: false,
  available: false,
  message: "Chưa lấy được trạng thái AI từ backend.",
  blocked_until: null,
};

function formatBlockedUntil(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StepCard({ icon: Icon, title, description }) {
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
    </Card>
  );
}

function logAiDiagnostics(status) {
  if (status && !status.available && status.diagnostics) {
    console.info("StudyMate AI diagnostics", status.diagnostics);
  }
}

function AIStatusBanner({ status, onRefresh }) {
  const current = status || fallbackAiStatus;
  const blockedUntil = formatBlockedUntil(current.blocked_until);
  const tone = current.available ? "green" : current.blocked ? "rose" : "amber";
  const Icon = current.available ? ShieldCheck : CreditCard;

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-3">
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${current.available ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            <Icon size={20} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-black text-slate-950">Trạng thái AI</h2>
              <Badge tone={tone}>{current.provider_label || "AI"}</Badge>
              <Badge tone={current.available ? "green" : "rose"}>
                {current.available ? "Có thể sử dụng" : "Đang tạm ngưng"}
              </Badge>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{current.message}</p>
            {blockedUntil && (
              <p className="mt-1 text-xs font-bold text-rose-600">Khóa tạm đến: {blockedUntil}</p>
            )}
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={onRefresh}>
          Cập nhật trạng thái
        </Button>
      </div>
    </Card>
  );
}

export default function RoadmapGeneratePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [learningGoals, setLearningGoals] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  async function refreshAiStatus(showToast = false) {
    try {
      const response = await getAIRoadmapStatus();
      setAiStatus(response.data || fallbackAiStatus);
      logAiDiagnostics(response.data);
      if (showToast) toast.success("Đã cập nhật trạng thái AI.");
    } catch (err) {
      const nextStatus = {
        ...fallbackAiStatus,
        message: err.message || fallbackAiStatus.message,
      };
      setAiStatus(nextStatus);
      if (showToast) toast.error(err.message || "Không thể cập nhật trạng thái AI.");
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [subjectsResponse, goalsResponse, aiStatusResponse] = await Promise.all([
          getMySubjects(),
          getLearningGoals(),
          getAIRoadmapStatus(),
        ]);
        setSubjects(subjectsResponse.data || []);
        setLearningGoals(goalsResponse.data || []);
        setAiStatus(aiStatusResponse.data || fallbackAiStatus);
        logAiDiagnostics(aiStatusResponse.data);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu tạo lộ trình.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleSubmit(data) {
    setSubmitting(true);
    setApiErrors({});
    setError("");

    try {
      const response = await generateAIRoadmap(data);
      window.sessionStorage.setItem("studymate_roadmap_preview", JSON.stringify(response.data));
      toast.success("AI đã tạo lộ trình gợi ý. Hãy xem lại trước khi lưu.");
      navigate("/student/roadmaps/preview", { state: { roadmap: response.data } });
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể tạo lộ trình bằng AI.");
      if (err.status === 429) {
        setAiStatus((current) => ({
          ...(current || fallbackAiStatus),
          configured: current?.configured ?? true,
          blocked: true,
          available: false,
          message: err.message || "AI đã hết credit/quota và đang tạm ngưng.",
        }));
      }
      toast.error(err.message || "Không thể tạo lộ trình bằng AI.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="StudyMate AI"
          title="Tạo lộ trình AI"
          description="Chọn môn học, nhập mục tiêu và khoảng thời gian để nhận lộ trình gợi ý trước khi lưu."
          actions={
            <Button to="/student/roadmaps" variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
          }
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <StepCard icon={Bot} title="1. Tạo gợi ý" description="AI dùng mục tiêu, trình độ và thời gian học để tạo bản nháp lộ trình." />
          <StepCard icon={PencilLine} title="2. Chỉnh sửa" description="Bạn xem lại từng bước học, đổi nội dung hoặc thêm mốc học nếu cần." />
          <StepCard icon={Eye} title="3. Lưu theo dõi" description="Sau khi xác nhận, lộ trình được lưu để theo dõi tiến độ học tập." />
        </div>

        <AIStatusBanner status={aiStatus} onRefresh={() => refreshAiStatus(true)} />
        <Alert tone="error">{error}</Alert>
        {!loading && subjects.length === 0 && (
          <Alert tone="warning">Bạn cần được admin gán vào ít nhất một môn học trước khi tạo lộ trình.</Alert>
        )}

        {loading ? (
          <LoadingState label="Đang tải dữ liệu tạo lộ trình..." />
        ) : (
          <RoadmapGenerateForm
            subjects={subjects}
            learningGoals={learningGoals}
            aiStatus={aiStatus || fallbackAiStatus}
            submitting={submitting}
            apiErrors={apiErrors}
            onRefreshStatus={() => refreshAiStatus(true)}
            onSubmit={handleSubmit}
          />
        )}

        <Card className="p-4">
          <div className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
            <p className="text-sm font-semibold leading-6 text-slate-600">
              AI chỉ tạo bản gợi ý. Lộ trình chưa được lưu cho đến khi bạn xem preview và bấm xác nhận lưu.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
