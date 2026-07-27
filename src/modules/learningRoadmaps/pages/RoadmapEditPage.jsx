import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, LoadingState, PageHeader, useToast } from "../../../components/ui";
import RoadmapPreviewEditor from "../components/RoadmapPreviewEditor";
import { getRoadmapById, updateRoadmap } from "../services/learningRoadmapService";

export default function RoadmapEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRoadmap() {
      setLoading(true);
      setError("");

      try {
        const response = await getRoadmapById(id);
        setRoadmap(response.data);
      } catch (err) {
        setError(err.message || "Không thể tải lộ trình học.");
      } finally {
        setLoading(false);
      }
    }

    loadRoadmap();
  }, [id]);

  async function handleSubmit(data) {
    setSubmitting(true);
    setApiErrors({});
    setError("");

    try {
      await updateRoadmap(id, data);
      toast.success("Cập nhật lộ trình học thành công.");
      navigate(`/student/roadmaps/${id}`);
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể cập nhật lộ trình học.");
      toast.error(err.message || "Không thể cập nhật lộ trình học.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState label="Đang tải lộ trình học..." />;
  }

  if (error || !roadmap) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Lộ trình học"
          title="Không thể chỉnh sửa"
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

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Lộ trình học"
          title="Chỉnh sửa lộ trình"
          description="Cập nhật thông tin tổng quan và các bước học trong lộ trình."
          actions={
            <Button to={`/student/roadmaps/${id}`} variant="secondary">
              <ArrowLeft size={16} /> Quay lại
            </Button>
          }
        />
        <Alert tone="error">{error}</Alert>
        <RoadmapPreviewEditor
          initialData={roadmap}
          submitting={submitting}
          apiErrors={apiErrors}
          submitLabel="Cập nhật lộ trình"
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
