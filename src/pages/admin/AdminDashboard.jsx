import React from "react";
import { BookOpen, BarChart3, Users } from "lucide-react";
import { Button, Card, PageHeader } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const cards = [
    {
      title: "Sinh viên",
      text: "Quản lý tài khoản, trạng thái truy cập và import danh sách sinh viên.",
      to: "/admin/students",
      icon: Users,
      tone: "from-blue-500 to-indigo-500",
    },
    {
      title: "Môn học",
      text: "Tạo và cập nhật dữ liệu môn học dùng chung trong hệ thống.",
      to: "/admin/subjects",
      icon: BookOpen,
      tone: "from-cyan-500 to-blue-500",
    },
    {
      title: "Thống kê",
      text: "Theo dõi hoạt động học tập, số liệu người dùng và dữ liệu hệ thống.",
      to: "/admin/statistics",
      icon: BarChart3,
      tone: "from-violet-500 to-blue-500",
    },
  ];

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Admin Workspace"
        title="Dashboard quản trị"
        description={`Xin chào ${user?.full_name || "Admin"}. Các module quản trị chính được gom trong một không gian rõ ràng để thao tác nhanh hơn.`}
      />

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="overflow-hidden p-5">
              <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${card.tone} text-white shadow-lg shadow-blue-600/10`}>
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-black text-slate-950">{card.title}</h2>
              <p className="mt-2 min-h-16 text-sm leading-6 text-slate-500">{card.text}</p>
              <Button to={card.to} variant="secondary" className="mt-5 w-full">
                Mở module
              </Button>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
