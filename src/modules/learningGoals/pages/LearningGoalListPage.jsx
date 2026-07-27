import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Alert, Button, Card, ConfirmDialog, EmptyState, Input, LoadingState, PageHeader, Select, useToast } from "../../../components/ui";
import LearningGoalCard from "../components/LearningGoalCard";
import { deleteLearningGoal, getLearningGoals } from "../services/learningGoalService";

export default function LearningGoalListPage() {
  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadGoals(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const response = await getLearningGoals(nextFilters);
      setGoals(response.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách mục tiêu học tập.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadGoals(filters);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [filters.keyword, filters.status]);

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  async function confirmDelete() {
    if (!deletingGoal) return;

    setDeleting(true);
    try {
      await deleteLearningGoal(deletingGoal.id);
      toast.success("Xóa mục tiêu học tập thành công.");
      setDeletingGoal(null);
      await loadGoals(filters);
    } catch (err) {
      toast.error(err.message || "Không thể xóa mục tiêu học tập.");
    } finally {
      setDeleting(false);
    }
  }

  const summary = useMemo(() => {
    const activeCount = goals.filter((goal) => goal.status === "active").length;
    return `${goals.length} mục tiêu đang hiển thị, ${activeCount} mục tiêu đang thực hiện.`;
  }, [goals]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="AI Learning Roadmap"
          title="Mục tiêu học tập"
          description={goals.length ? summary : "Tạo mục tiêu cá nhân để làm đầu vào cho AI tạo lộ trình học."}
          actions={
            <Button to="/student/learning-goals/create">
              <Plus size={16} /> Tạo mục tiêu
            </Button>
          }
        />

        <Card className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_260px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={filters.keyword}
              onChange={(event) => updateFilter("keyword", event.target.value)}
              placeholder="Tìm theo tiêu đề, mô tả hoặc môn học"
              className="mt-0 pl-11"
            />
          </label>

          <Select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} className="mt-0">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
            <option value="paused">Tạm dừng</option>
            <option value="cancelled">Đã hủy</option>
          </Select>
        </Card>

        <Alert tone="error">{error}</Alert>

        {loading ? (
          <LoadingState label="Đang tải mục tiêu học tập..." />
        ) : goals.length === 0 ? (
          <EmptyState
            title="Chưa có mục tiêu học tập"
            description="Tạo mục tiêu đầu tiên để StudyMate AI có dữ liệu xây dựng lộ trình học cá nhân hóa."
            actionLabel="Tạo mục tiêu"
            actionTo="/student/learning-goals/create"
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => (
              <LearningGoalCard key={goal.id} goal={goal} onDelete={setDeletingGoal} />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deletingGoal)}
        title="Xóa mục tiêu học tập?"
        description={deletingGoal ? `Mục tiêu "${deletingGoal.title}" sẽ được xóa khỏi danh sách của bạn.` : ""}
        confirmLabel="Xóa mục tiêu"
        danger
        loading={deleting}
        onCancel={() => setDeletingGoal(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}
