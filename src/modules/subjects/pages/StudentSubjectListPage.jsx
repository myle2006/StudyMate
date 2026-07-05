import React, { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader, SearchBox, Select } from "../../../components/ui";
import { getSubjects } from "../services/subjectService";

const statusConfig = {
  studying: { label: "Đang học", tone: "blue" },
  paused: { label: "Tạm dừng", tone: "amber" },
  completed: { label: "Hoàn thành", tone: "green" },
};

function SubjectCard({ subject }) {
  const status = statusConfig[subject.status] || { label: subject.status, tone: "slate" };

  return (
    <Card className="overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-video overflow-hidden" style={{ backgroundColor: subject.color || "#2563EB" }}>
        {subject.image ? (
          <img src={subject.image} alt={subject.subject_name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-white">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 text-3xl font-black ring-1 ring-white/25">
              {(subject.subject_name || "M").charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-blue-600">{subject.subject_code}</p>
            <h2 className="mt-2 line-clamp-2 text-lg font-black text-slate-950">{subject.subject_name}</h2>
          </div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-500">{subject.credits ?? 3} tín chỉ</p>
        <Button to={`/student/subjects/${subject.id}`} variant="secondary" className="mt-5">
          <Eye size={16} /> Xem chi tiết
        </Button>
      </div>
    </Card>
  );
}

export default function StudentSubjectListPage() {
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({ keyword: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSubjects(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const response = await getSubjects(nextFilters);
      setSubjects(response.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách môn học.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  function updateFilter(field, value) {
    const nextFilters = { ...filters, [field]: value };
    setFilters(nextFilters);
    loadSubjects(nextFilters);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="StudyMate AI"
        title="Môn học của tôi"
        description="Danh sách môn học trong hệ thống để bạn theo dõi lịch học và tiến độ cá nhân."
      />

      <Card className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <SearchBox
          value={filters.keyword}
          onChange={(event) => updateFilter("keyword", event.target.value)}
          placeholder="Tìm theo tên hoặc mã môn học"
        />
        <Select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="studying">Đang học</option>
          <option value="paused">Tạm dừng</option>
          <option value="completed">Hoàn thành</option>
        </Select>
      </Card>

      {error && <Card className="border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</Card>}

      {loading ? (
        <LoadingState label="Đang tải môn học..." />
      ) : subjects.length === 0 ? (
        <EmptyState title="Chưa có môn học" description="Admin chưa tạo môn học nào trong hệ thống." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}
