import React from "react";
import { BookOpen, CalendarDays, Route } from "lucide-react";
import { Button, Card, PageHeader } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const cards = [
    ["Môn học", "Xem danh sách môn học và thông tin tín chỉ.", "/student/subjects", BookOpen],
    ["Lịch học", "Quản lý lịch cá nhân theo ngày, tuần và tháng.", "/student/schedules", CalendarDays],
    ["Lộ trình", "Theo dõi kế hoạch học tập và mục tiêu cá nhân.", "/roadmap", Route],
  ];

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Student Workspace"
        title="Trang cá nhân"
        description={`Xin chào ${user?.full_name || "bạn"}. Đây là trung tâm học tập cá nhân của bạn trên StudyMate AI.`}
      />

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {cards.map(([title, text, href, Icon]) => (
          <Card key={title} className="p-5">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-950">{title}</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{text}</p>
            <Button to={href} className="mt-5 w-full" variant="secondary">
              Mở
            </Button>
          </Card>
        ))}
      </div>
    </main>
  );
}
