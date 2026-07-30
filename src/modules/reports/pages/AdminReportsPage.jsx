import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { Alert, LoadingState, PageHeader } from "../../../components/ui";
import { getSubjects } from "../../subjects/services/subjectService";
import { getStudents } from "../../../services/studentService";
import ReportExportCard from "../components/ReportExportCard";

const subjectStatuses = [
  { value: "studying", label: "Đang học" },
  { value: "paused", label: "Tạm dừng" },
  { value: "completed", label: "Hoàn thành" },
];

const studentStatuses = [
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Vô hiệu hóa" },
  { value: "locked", label: "Đã khóa" },
];

const assignmentStatuses = [
  { value: "open", label: "Đang mở" },
  { value: "closed", label: "Đã đóng" },
  { value: "draft", label: "Nháp" },
];

const submissionStatuses = [
  { value: "submitted", label: "Đã nộp" },
  { value: "late", label: "Nộp muộn" },
  { value: "graded", label: "Đã chấm" },
];

const roadmapStatuses = [
  { value: "draft", label: "Nháp" },
  { value: "active", label: "Đang học" },
  { value: "completed", label: "Hoàn thành" },
  { value: "paused", label: "Tạm dừng" },
];

export default function AdminReportsPage() {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFilters() {
      setLoading(true);
      setError("");

      try {
        const [subjectResponse, studentResponse] = await Promise.all([
          getSubjects(),
          getStudents({ limit: 1000 }),
        ]);
        setSubjects(subjectResponse.data || []);
        setStudents(studentResponse.data || []);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu filter báo cáo.");
      } finally {
        setLoading(false);
      }
    }

    loadFilters();
  }, []);

  const reports = useMemo(() => [
    {
      title: "Danh sách sinh viên",
      description: "Xuất tài khoản sinh viên, trạng thái và số môn được gán.",
      endpoint: "/admin/reports/students/export",
      filename: "students.csv",
      icon: Users,
      filters: ["date", "subject", "student", "status"],
      statusOptions: studentStatuses,
    },
    {
      title: "Danh sách môn học",
      description: "Xuất thông tin môn học và số sinh viên đang được gán.",
      endpoint: "/admin/reports/subjects/export",
      filename: "subjects.csv",
      icon: BookOpen,
      filters: ["date", "subject", "status"],
      statusOptions: subjectStatuses,
    },
    {
      title: "Sinh viên theo môn học",
      description: "Xuất danh sách phân công sinh viên vào từng môn học.",
      endpoint: "/admin/reports/student-subjects/export",
      filename: "student_subjects.csv",
      icon: UserRoundCheck,
      filters: ["date", "subject", "student", "status"],
      statusOptions: [
        { value: "active", label: "Đang gán" },
        { value: "removed", label: "Đã gỡ" },
      ],
    },
    {
      title: "Danh sách bài tập",
      description: "Xuất bài tập, deadline, số sinh viên được giao và số bài nộp.",
      endpoint: "/admin/reports/assignments/export",
      filename: "assignments.csv",
      icon: ClipboardList,
      filters: ["date", "subject", "status"],
      statusOptions: assignmentStatuses,
    },
    {
      title: "Danh sách bài nộp",
      description: "Xuất bài nộp, file, trạng thái nộp và thông tin sinh viên.",
      endpoint: "/admin/reports/submissions/export",
      filename: "submissions.csv",
      icon: FileText,
      filters: ["date", "subject", "student", "status"],
      statusOptions: submissionStatuses,
    },
    {
      title: "Điểm số và feedback",
      description: "Xuất các bài đã chấm kèm điểm, nhận xét và người chấm.",
      endpoint: "/admin/reports/grades/export",
      filename: "grades_feedback.csv",
      icon: FileSpreadsheet,
      filters: ["date", "subject", "student"],
    },
    {
      title: "Tiến độ học tập",
      description: "Xuất tiến độ lộ trình, số bước hoàn thành và thời lượng học.",
      endpoint: "/admin/reports/progress/export",
      filename: "learning_progress.csv",
      icon: BarChart3,
      filters: ["date", "subject", "student", "status"],
      statusOptions: roadmapStatuses,
    },
  ], []);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin Reports"
          title="Báo cáo"
          description="Xuất dữ liệu học tập, bài nộp, điểm số và hoạt động hệ thống sang CSV."
        />

        <Alert tone="error">{error}</Alert>

        {loading ? (
          <LoadingState label="Đang tải bộ lọc báo cáo..." />
        ) : (
          <section className="grid gap-5 lg:grid-cols-2">
            {reports.map((report) => (
              <ReportExportCard
                key={report.endpoint}
                {...report}
                subjects={subjects}
                students={students}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
