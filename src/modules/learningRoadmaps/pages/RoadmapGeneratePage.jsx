import React, { useEffect, useState } from "react";
import { ArrowLeft, BookOpenCheck, CheckCircle2, Eye, PencilLine } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Button, Card, LoadingState, PageHeader, useToast } from "../../../components/ui";
import { getMySubjects } from "../../studentSubjects/services/studentSubjectService";
import { getLearningGoals } from "../../learningGoals/services/learningGoalService";
import RoadmapGenerateForm from "../components/RoadmapGenerateForm";
import { getRoadmapTemplates } from "../services/learningRoadmapService";
import { buildRoadmapPreviewFromDbTemplate } from "../utils/roadmapTemplatePreview";

function StepCard({ icon: Icon, title, description }) {
  return (
    <Card className="min-w-0 p-4">
      <div className="flex min-w-0 gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="break-words text-sm font-black text-slate-950">{title}</h2>
          <p className="mt-1 break-words text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
    </Card>
  );
}

export default function RoadmapGeneratePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [learningGoals, setLearningGoals] = useState([]);
  const [roadmapTemplates, setRoadmapTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");
  const initialGoalId = searchParams.get("goal_id") || "";

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [subjectsResponse, goalsResponse, templatesResponse] = await Promise.all([
          getMySubjects(),
          getLearningGoals(),
          getRoadmapTemplates(),
        ]);
        setSubjects(subjectsResponse.data || []);
        setLearningGoals(goalsResponse.data || []);
        setRoadmapTemplates(templatesResponse.data || []);
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
      const preview = buildRoadmapPreviewFromDbTemplate(data, data.roadmap_template);
      window.sessionStorage.setItem("studymate_roadmap_preview", JSON.stringify(preview));
      toast.success("Đã tạo bản nháp lộ trình từ mẫu. Hãy xem lại và chỉnh sửa trước khi lưu.");
      navigate("/student/roadmaps/preview", { state: { roadmap: preview } });
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể tạo lộ trình.");
      toast.error(err.message || "Không thể tạo lộ trình.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="StudyMate Roadmap"
          title="Tạo lộ trình học"
          description="Chọn môn học và mốc 1, 3 hoặc 6 tháng để xem lộ trình mẫu, sau đó cá nhân hóa mục tiêu và lịch học trước khi lưu."
          actions={
            <Button to="/student/roadmaps" variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
          }
        />

        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          <StepCard icon={BookOpenCheck} title="1. Chọn mẫu" description="Bắt đầu bằng môn học và thời lượng 1, 3 hoặc 6 tháng để thấy khung lộ trình cô đọng." />
          <StepCard icon={PencilLine} title="2. Cá nhân hóa" description="Điều chỉnh mục tiêu, trình độ, ngày học, giờ học và thời lượng theo lịch cá nhân." />
          <StepCard icon={Eye} title="3. Preview rồi lưu" description="Xem bản nháp theo từng nhiệm vụ, chỉnh lại nếu cần rồi lưu vào tiến độ học tập." />
        </div>

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
            roadmapTemplates={roadmapTemplates}
            initialGoalId={initialGoalId}
            submitting={submitting}
            apiErrors={apiErrors}
            onSubmit={handleSubmit}
          />
        )}

        <Card className="min-w-0 p-4">
          <div className="flex min-w-0 gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
            <p className="min-w-0 break-words text-sm font-semibold leading-6 text-slate-600">
              Lộ trình mẫu chỉ tạo bản nháp. Lộ trình chưa được lưu cho đến khi bạn xem preview và bấm xác nhận lưu.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
