import React, { useEffect, useState } from "react";
import { Button, EmptyState, LoadingState, PageHeader } from "../../../components/ui";
import { getSubjects } from "../../subjects/services/subjectService";
import StudyScheduleCalendar from "../components/StudyScheduleCalendar";
import StudyScheduleFilter from "../components/StudyScheduleFilter";
import { getStudySchedules } from "../services/studyScheduleService";

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function StudyScheduleCalendarPage() {
  const [filters, setFilters] = useState({
    view: "week",
    date: today(),
    subject_id: "",
    schedule_type: "",
    status: "",
  });
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData(nextFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const [subjectResponse, scheduleResponse] = await Promise.all([
        getSubjects(),
        getStudySchedules(nextFilters),
      ]);
      setSubjects(subjectResponse.data || []);
      setSchedules(scheduleResponse.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải lịch học.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    loadData(nextFilters);
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Lịch học cá nhân"
        description={`${schedules.length} lịch học trong chế độ xem hiện tại. Chuyển nhanh giữa ngày, tuần và tháng để theo dõi kế hoạch học tập.`}
        actions={<Button to="/student/schedules/create">Thêm lịch học</Button>}
      />

      <div className="mt-6">
        <StudyScheduleFilter filters={filters} subjects={subjects} onChange={handleFilterChange} />
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>
      )}

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Đang tải lịch học..." />
        ) : schedules.length === 0 ? (
          <EmptyState
            title="Chưa có lịch học"
            description="Tạo lịch học đầu tiên để StudyMate giúp bạn theo dõi kế hoạch theo ngày, tuần và tháng."
            actionLabel="Thêm lịch học"
            actionTo="/student/schedules/create"
          />
        ) : (
          <StudyScheduleCalendar view={filters.view} date={filters.date} schedules={schedules} />
        )}
      </div>
    </main>
  );
}
