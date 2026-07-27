import React, { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Card, EmptyState, PageHeader, useToast } from "../../../components/ui";
import RoadmapPreviewEditor from "../components/RoadmapPreviewEditor";
import { createRoadmap } from "../services/learningRoadmapService";

function readPreview(locationState) {
  if (locationState?.roadmap) return locationState.roadmap;

  try {
    return JSON.parse(window.sessionStorage.getItem("studymate_roadmap_preview") || "null");
  } catch {
    return null;
  }
}

export default function RoadmapPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const preview = useMemo(() => readPreview(location.state), [location.state]);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  async function handleSave(data) {
    setSubmitting(true);
    setApiErrors({});
    setError("");

    try {
      const response = await createRoadmap(data);
      window.sessionStorage.removeItem("studymate_roadmap_preview");
      toast.success("Chấp nhận lộ trình học thành công.");
      navigate(`/student/roadmaps/${response.data.id}`);
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể chấp nhận lộ trình học.");
      toast.error(err.message || "Không thể chấp nhận lộ trình học.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!preview) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <EmptyState
          title="Chưa có lộ trình preview"
          description="Hãy tạo lộ trình bằng AI trước, sau đó quay lại màn hình preview để chỉnh sửa và lưu."
          actionLabel="Tạo lộ trình AI"
          actionTo="/student/roadmaps/generate"
        />
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Preview"
          title="Xem lại lộ trình AI"
          description="AI chỉ tạo lộ trình gợi ý. Bạn có thể chỉnh sửa từng nhiệm vụ trước khi chấp nhận."
          actions={
            <Button to="/student/roadmaps/generate" variant="secondary">
              <ArrowLeft size={16} /> Tạo lại
            </Button>
          }
        />
        <Alert tone="error">{error}</Alert>
        {Array.isArray(apiErrors.schedule_conflicts) && apiErrors.schedule_conflicts.length > 0 && (
          <Card className="space-y-3 border-amber-200 bg-amber-50 p-4">
            <h2 className="text-sm font-black text-amber-900">Nhiệm vụ bị trùng lịch</h2>
            {apiErrors.schedule_conflicts.map((conflict, index) => (
              <div key={index} className="rounded-lg bg-white p-3 text-sm text-amber-900">
                <p className="font-extrabold">{conflict.title}</p>
                <p className="mt-1 font-semibold">
                  {conflict.planned_date} · {conflict.start_time} - {conflict.end_time}: {conflict.reason}
                </p>
                {conflict.suggestions?.length > 0 && (
                  <p className="mt-2 text-xs font-bold">
                    Gợi ý: {conflict.suggestions.map((slot) => `${slot.start_time}-${slot.end_time}`).join(", ")}
                  </p>
                )}
              </div>
            ))}
          </Card>
        )}
        <RoadmapPreviewEditor
          initialData={preview}
          submitting={submitting}
          apiErrors={apiErrors}
          submitLabel="Chấp nhận lộ trình"
          onSubmit={handleSave}
        />
      </div>
    </main>
  );
}
