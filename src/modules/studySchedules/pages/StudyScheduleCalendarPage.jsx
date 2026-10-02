import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Alert, Button, EmptyState, LoadingState, PageHeader } from "../../../components/ui";
import { getMySubjects } from "../../studentSubjects/services/studentSubjectService";
import StudyScheduleCalendar from "../components/StudyScheduleCalendar";
import StudyScheduleDetailPanel from "../components/StudyScheduleDetailPanel";
import StudyScheduleFilter from "../components/StudyScheduleFilter";
import { getStudyScheduleById, getStudySchedules, updateStudySchedule } from "../services/studyScheduleService";

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function matchesActiveFilters(schedule, filters) {
  if (filters.subject_id && String(schedule.subject_id) !== String(filters.subject_id)) return false;
  if (filters.schedule_type && schedule.schedule_type !== filters.schedule_type) return false;
  if (filters.status && schedule.status !== filters.status) return false;

  return true;
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
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [error, setError] = useState("");

  async function loadData(nextFilters = filters, options = {}) {
    if (!options.silent) setLoading(true);
    setError("");

    try {
      const [subjectResponse, scheduleResponse] = await Promise.all([
        getMySubjects(),
        getStudySchedules(nextFilters),
      ]);
      setSubjects(subjectResponse.data || []);
      setSchedules(scheduleResponse.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải lịch học.");
    } finally {
      if (!options.silent) setLoading(false);
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

  function handleTodayClick() {
    const nextFilters = { ...filters, date: today() };
    setFilters(nextFilters);
    loadData(nextFilters);
  }

  async function handleScheduleSelect(schedule) {
    setSelectedSchedule(schedule);
    setApiErrors({});
    setError("");
    setDetailLoading(true);

    try {
      const response = await getStudyScheduleById(schedule.id);
      setSelectedSchedule(response.data || schedule);
    } catch (err) {
      setError(err.message || "Không thể tải chi tiết lịch học.");
    } finally {
      setDetailLoading(false);
    }
  }

  function handleClosePanel() {
    setSelectedSchedule(null);
    setApiErrors({});
  }

  async function handleUpdateSchedule(data) {
    if (!selectedSchedule?.id) return false;

    setSubmitting(true);
    setApiErrors({});

    try {
      const response = await updateStudySchedule(selectedSchedule.id, data);
      const updatedSchedule = response.data;
      setSelectedSchedule(updatedSchedule);
      setSchedules((current) => current.map((schedule) => (
        schedule.id === updatedSchedule.id ? updatedSchedule : schedule
      )).filter((schedule) => matchesActiveFilters(schedule, filters)));
      setError("");
      loadData(filters, { silent: true });
      return true;
    } catch (err) {
      setApiErrors(err.errors || {});
      setError(err.message || "Không thể cập nhật lịch học.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Lịch học cá nhân"
        description={`${schedules.length} lịch học trong chế độ xem hiện tại. Chuyển nhanh giữa ngày, tuần và tháng để theo dõi kế hoạch học tập.`}
        actions={
          <Button to="/student/schedules/create">
            <Plus size={16} /> Thêm lịch học
          </Button>
        }
      />

      <div className="mt-6">
        <StudyScheduleFilter filters={filters} subjects={subjects} onChange={handleFilterChange} onToday={handleTodayClick} />
      </div>

      <Alert tone="error" className="mt-4">{error}</Alert>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Đang tải lịch học..." />
        ) : schedules.length === 0 ? (
          <>
            <EmptyState
              title="Chưa có lịch học"
              description="Không có lịch trong bộ lọc/chế độ xem hiện tại. Hãy kiểm tra mốc ngày, trạng thái hoặc loại lịch nếu hệ thống báo trùng khi thêm mới."
              actionLabel="Thêm lịch học"
              actionTo="/student/schedules/create"
            />
            <div className="mt-5">
              <StudyScheduleCalendar view={filters.view} date={filters.date} schedules={schedules} onScheduleSelect={handleScheduleSelect} />
            </div>
          </>
        ) : (
          <StudyScheduleCalendar view={filters.view} date={filters.date} schedules={schedules} onScheduleSelect={handleScheduleSelect} />
        )}
      </div>

      <StudyScheduleDetailPanel
        open={Boolean(selectedSchedule)}
        schedule={selectedSchedule}
        subjects={subjects}
        loading={detailLoading}
        submitting={submitting}
        apiErrors={apiErrors}
        onClose={handleClosePanel}
        onSubmit={handleUpdateSchedule}
      />
    </main>
  );
}
