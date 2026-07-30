import React from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileDown,
  LayoutDashboard,
  LogIn,
  Route as RouteIcon,
  UserPlus,
  Users,
} from "lucide-react";

const basePath = window.STUDYMATE_BASE_PATH || "";
const logoImage = `${basePath}/public/assets/images/plt-solutions-logo.png`;

function appUrl(path) {
  return `${basePath}${path}`;
}

const features = [
  {
    title: "Dashboard cá nhân",
    text: "Tóm tắt môn học, lịch học, deadline, bài chưa nộp, điểm mới và tiến độ lộ trình.",
    icon: LayoutDashboard,
    tone: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    title: "Thông báo deadline",
    text: "Nhắc bài sắp hết hạn, lịch học hôm nay và roadmap bị trễ, kèm badge chưa đọc.",
    icon: Bell,
    tone: "bg-rose-50 text-rose-700 border-rose-100",
  },
  {
    title: "Bài học & tài liệu",
    text: "Admin tạo bài học theo môn, upload tài liệu, thêm video/link để sinh viên học theo tiến độ.",
    icon: BookOpen,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    title: "Bài tập & bài nộp",
    text: "Giao bài, nhận file, kiểm tra trạng thái nộp muộn, chấm điểm và phản hồi.",
    icon: ClipboardList,
    tone: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    title: "Lịch học & lộ trình",
    text: "Sinh viên theo dõi lịch học, mục tiêu và từng bước trong roadmap học tập.",
    icon: RouteIcon,
    tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  {
    title: "Báo cáo CSV",
    text: "Admin xuất dữ liệu sinh viên, môn học, bài nộp, điểm số và tiến độ học tập.",
    icon: FileDown,
    tone: "bg-violet-50 text-violet-700 border-violet-100",
  },
];

const workflow = [
  ["01", "Admin tạo dữ liệu", "Tạo môn học, gán sinh viên, tạo bài học và giao bài tập."],
  ["02", "Sinh viên học theo ngày", "Xem dashboard, lịch học, deadline, tài liệu và lộ trình."],
  ["03", "Theo dõi tiến độ", "Nộp bài, nhận feedback, đánh dấu bài học và cập nhật roadmap."],
  ["04", "Xuất báo cáo", "Admin xem tổng quan, chấm điểm và xuất CSV khi cần."],
];

function DashboardMockup() {
  return (
    <div className="dashboard-float relative rounded-lg border border-slate-200 bg-white p-4 shadow-[0_28px_90px_rgba(15,23,42,0.14)]">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-sm font-black text-slate-950">Trang cá nhân</p>
          <p className="text-xs font-bold text-slate-500">Hôm nay, 30/07</p>
        </div>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">3 thông báo</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          ["Môn học", "5", "blue"],
          ["Bài sắp hạn", "2", "amber"],
          ["Đã nộp", "12", "emerald"],
        ].map(([label, value, tone]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase text-slate-500">{label}</p>
            <p className={`mt-2 text-3xl font-black ${tone === "blue" ? "text-blue-700" : tone === "amber" ? "text-amber-700" : "text-emerald-700"}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="font-black text-slate-950">Tiến độ lộ trình</p>
            <span className="text-sm font-black text-blue-700">68%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[68%] rounded-full bg-blue-600" />
          </div>
          <div className="mt-4 grid gap-2">
            {["Ôn chương 2", "Làm bài kiểm thử", "Đọc tài liệu Unit Test"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <CheckCircle2 className={`h-4 w-4 ${index === 0 ? "text-emerald-600" : "text-slate-300"}`} />
                <span className="text-sm font-bold text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-lg bg-slate-950 p-4 text-white">
            <p className="text-xs font-black uppercase text-blue-200">Lịch học hôm nay</p>
            <p className="mt-2 text-lg font-black">Kiểm thử phần mềm</p>
            <p className="mt-1 text-sm font-semibold text-slate-300">08:00 - 10:00</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-black uppercase text-amber-700">Deadline gần nhất</p>
            <p className="mt-2 text-sm font-black text-slate-950">Nộp báo cáo trước 23:59</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <a href={appUrl("/")} className="flex items-center gap-3">
            <span className="flex h-12 w-24 shrink-0 items-center rounded-lg bg-white">
              <img src={logoImage} alt="" className="max-h-12 w-full object-contain" />
            </span>
            <span>
              <span className="block text-base font-black leading-5">StudyMate</span>
              <span className="block text-xs font-semibold leading-5 text-slate-500">Không gian học tập cá nhân</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            <a href="#features" className="text-sm font-bold text-slate-600 transition hover:text-blue-700">Tính năng</a>
            <a href="#workflow" className="text-sm font-bold text-slate-600 transition hover:text-blue-700">Quy trình</a>
            <a href="#roles" className="text-sm font-bold text-slate-600 transition hover:text-blue-700">Vai trò</a>
          </nav>

          <a href={appUrl("/login")} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700">
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </a>
        </div>
      </header>

      <section className="hero-grid bg-slate-50">
        <div className="mx-auto grid min-h-[calc(100svh-74px)] max-w-7xl items-center gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
          <div>
            <p className="inline-flex rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-black text-blue-700 shadow-sm">
              Dashboard học tập cá nhân cho sinh viên
            </p>
            <h1 className="mt-6 text-4xl font-black leading-[1.05] text-slate-950 sm:text-6xl">
              Học có kế hoạch, nộp bài đúng hạn.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              StudyMate gom môn học, lịch học, bài tập, tài liệu, thông báo deadline, điểm số và lộ trình vào một dashboard dễ dùng cho sinh viên và admin.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={appUrl("/register")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 text-base font-black text-white shadow-[0_18px_44px_rgba(37,99,235,0.24)] transition hover:bg-blue-700">
                <UserPlus className="h-5 w-5" />
                Tạo tài khoản
              </a>
              <a href={appUrl("/login")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-4 text-base font-black text-slate-800 transition hover:border-blue-400 hover:text-blue-700">
                <LogIn className="h-5 w-5" />
                Vào hệ thống
              </a>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[["2", "vai trò"], ["CSV", "báo cáo"], ["JWT", "bảo vệ API"]].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-2xl font-black text-slate-950">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <DashboardMockup />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-18 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-blue-600">Tính năng</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              Đầy đủ hơn bản tối giản, nhưng vẫn dễ scan
            </h2>
          </div>
          <p className="max-w-md leading-7 text-slate-600">
            Mỗi khối đều trỏ về chức năng thật trong hệ thống, không còn module rỗng.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                <span className={`grid h-12 w-12 place-items-center rounded-lg border ${feature.tone}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-black text-slate-950">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="workflow" className="bg-slate-50 py-18 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <p className="text-sm font-black uppercase text-blue-600">Quy trình</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                Một luồng làm việc rõ ràng từ admin đến sinh viên
              </h2>
            </div>
            <div className="grid gap-4">
              {workflow.map(([number, title, text]) => (
                <article key={number} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[56px_1fr]">
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">{number}</span>
                  <div>
                    <h3 className="text-lg font-black text-slate-950">{title}</h3>
                    <p className="mt-2 leading-7 text-slate-600">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="roles" className="mx-auto max-w-7xl px-5 py-18 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          {[
            ["Sinh viên", "Theo dõi lịch học, bài tập, bài học, điểm số và tiến độ cá nhân.", CalendarDays, ["Trang cá nhân", "Môn học của tôi", "Bài tập", "Bài học", "Lộ trình"]],
            ["Admin", "Quản lý dữ liệu lớp học, giao bài, chấm điểm và xuất báo cáo.", Users, ["Sinh viên", "Môn học", "Bài tập", "Bài nộp", "Báo cáo"]],
          ].map(([title, text, Icon, items]) => (
            <article key={title} className="rounded-lg border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_70px_rgba(15,23,42,0.14)]">
              <Icon className="h-8 w-8 text-blue-300" />
              <h3 className="mt-4 text-2xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{text}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {items.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-sm font-bold text-slate-100">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-18 sm:px-6 sm:pb-20 lg:px-8">
        <div className="grid gap-6 rounded-lg border border-slate-200 bg-blue-600 p-7 text-white shadow-[0_24px_70px_rgba(37,99,235,0.18)] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase text-blue-100">Bắt đầu</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Mở StudyMate và quản lý việc học ngay</h2>
            <p className="mt-4 max-w-2xl leading-7 text-blue-50">
              Giao diện có đủ thông tin để ra quyết định nhanh, nhưng vẫn giữ thao tác chính thật rõ ràng.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <a href={appUrl("/login")} className="rounded-lg bg-white px-6 py-4 text-center font-black text-blue-700 transition hover:bg-blue-50">Đăng nhập</a>
            <a href={appUrl("/register")} className="rounded-lg border border-white/30 px-6 py-4 text-center font-black text-white transition hover:bg-white/10">Tạo tài khoản</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-7">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 text-sm font-semibold text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-slate-800">StudyMate</p>
          <p>PLT Solutions - Nền tảng quản lý học tập cá nhân cho sinh viên.</p>
        </div>
      </footer>
    </main>
  );
}
