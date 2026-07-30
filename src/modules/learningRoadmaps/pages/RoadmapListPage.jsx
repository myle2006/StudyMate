import React, { useEffect, useMemo, useState } from "react";
import { Bot, Eye, Plus, Search, Trash2 } from "lucide-react";
import { Alert, Badge, Button, Card, ConfirmDialog, EmptyState, Input, LoadingState, PageHeader, Select, useToast } from "../../../components/ui";
import RoadmapProgressBar from "../components/RoadmapProgressBar";
import { deleteRoadmap, getRoadmaps } from "../services/learningRoadmapService";

const statusMap = {
  draft: { label: "Nháp", tone: "slate" },
  active: { label: "Đang học", tone: "blue" },
  completed: { label: "Hoàn thành", tone: "green" },
  paused: { label: "Tạm dừng", tone: "amber" },
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

function RoadmapStatusBadge({ status }) {
  const config = statusMap[status] || statusMap.draft;
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

export default function RoadmapListPage() {
  const toast = useToast();
  const [roadmaps, setRoadmaps] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingRoadmap, setDeletingRoadmap] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadRoadmaps(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const response = await getRoadmaps(nextFilters);
      setRoadmaps(response.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách lộ trình học.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => loadRoadmaps(filters), 250);
    return () => window.clearTimeout(timer);
  }, [filters.keyword, filters.status]);

  async function confirmDelete() {
    if (!deletingRoadmap) return;
    setDeleting(true);

    try {
      await deleteRoadmap(deletingRoadmap.id);
      toast.success("Xóa lộ trình học thành công.");
      setDeletingRoadmap(null);
      await loadRoadmaps(filters);
    } catch (err) {
      toast.error(err.message || "Không thể xóa lộ trình học.");
    } finally {
      setDeleting(false);
    }
  }

  const summary = useMemo(() => {
    const activeCount = roadmaps.filter((roadmap) => roadmap.status === "active").length;
    return `${roadmaps.length} lộ trình đang hiển thị, ${activeCount} lộ trình đang học.`;
  }, [roadmaps]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="StudyMate AI"
          title="Lộ trình học"
          description={roadmaps.length ? summary : "Tự tạo lộ trình hoặc dùng AI gợi ý rồi chỉnh sửa trước khi lưu."}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button to="/student/roadmaps/create">
                <Plus size={16} /> Tự tạo lộ trình
              </Button>
              <Button to="/student/roadmaps/generate" variant="secondary">
                <Bot size={16} /> Tạo bằng AI
              </Button>
            </div>
          }
        />

        <Card className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_240px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={filters.keyword}
              onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
              placeholder="Tìm theo tên lộ trình, mục tiêu hoặc môn học"
              className="mt-0 pl-11"
            />
          </label>
          <Select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="mt-0"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="active">Đang học</option>
            <option value="paused">Tạm dừng</option>
            <option value="completed">Hoàn thành</option>
          </Select>
        </Card>

        <Alert tone="error">{error}</Alert>

        {loading ? (
          <LoadingState label="Đang tải lộ trình học..." />
        ) : roadmaps.length === 0 ? (
          <EmptyState
            title="Chưa có lộ trình học"
            description="Tự tạo lộ trình từ đầu hoặc dùng AI gợi ý rồi chỉnh sửa trước khi lưu."
            actionLabel="Tự tạo lộ trình"
            actionTo="/student/roadmaps/create"
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {roadmaps.map((roadmap) => (
              <Card key={roadmap.id} className="flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black uppercase text-blue-600">
                      {roadmap.subject_code} - {roadmap.subject_name}
                    </p>
                    <h2 className="mt-2 line-clamp-2 text-lg font-black text-slate-950">{roadmap.title}</h2>
                  </div>
                  <RoadmapStatusBadge status={roadmap.status} />
                </div>
                <p className="mt-4 line-clamp-3 min-h-16 text-sm leading-6 text-slate-600">{roadmap.overview || roadmap.goal}</p>
                <div className="mt-4 space-y-3">
                  <RoadmapProgressBar value={roadmap.progress_percent} />
                  <p className="text-xs font-bold text-slate-500">
                    {roadmap.item_count || 0} bước · {formatDate(roadmap.start_date)} - {formatDate(roadmap.end_date)}
                  </p>
                </div>
                <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
                  <Button to={`/student/roadmaps/${roadmap.id}`} variant="secondary">
                    <Eye size={16} /> Chi tiết
                  </Button>
                  <Button type="button" variant="danger" onClick={() => setDeletingRoadmap(roadmap)}>
                    <Trash2 size={16} /> Xóa
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deletingRoadmap)}
        title="Xóa lộ trình học?"
        description={deletingRoadmap ? `Lộ trình "${deletingRoadmap.title}" sẽ bị xóa khỏi danh sách của bạn.` : ""}
        confirmLabel="Xóa lộ trình"
        danger
        loading={deleting}
        onCancel={() => setDeletingRoadmap(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}
