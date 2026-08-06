import React from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileDown,
  LayoutDashboard,
  LogIn,
  PlayCircle,
  Route as RouteIcon,
  UserPlus,
  Users,
} from "lucide-react";

const basePath = window.STUDYMATE_BASE_PATH || "";
const logoImage = `${basePath}/public/assets/images/plt-solutions-logo.png`;
const heroImage = `${basePath}/public/assets/images/studymate-hero-workspace.png`;

function appUrl(path) {
  return `${basePath}${path}`;
}

const features = [
  {
    title: "Trang cá nhân",
    text: "Nhìn nhanh môn học, lịch hôm nay, bài sắp hạn và tiến độ lộ trình.",
    icon: LayoutDashboard,
    tone: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    title: "Bài tập",
    text: "Xem deadline, nộp bài, cập nhật bài nộp và nhận phản hồi sau khi chấm.",
    icon: ClipboardCheck,
    tone: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    title: "Bài học",
    text: "Học theo môn, mở tài liệu/video/link và đánh dấu hoàn thành từng bài.",
    icon: BookOpen,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    title: "Lộ trình",
    text: "Theo dõi mục tiêu, từng bước học, trạng thái và phần tự đánh giá.",
    icon: RouteIcon,
    tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  {
    title: "Thông báo",
    text: "Nhắc lịch học, deadline gần đến và các việc cần chú ý trong ngày.",
    icon: Bell,
    tone: "bg-rose-50 text-rose-700 border-rose-100",
  },
  {
    title: "Báo cáo",
    text: "Admin quản lý sinh viên, môn học, bài nộp, điểm và xuất dữ liệu CSV.",
    icon: FileDown,
    tone: "bg-violet-50 text-violet-700 border-violet-100",
  },
];

const dayFlow = [
  ["08:00", "Vào trang cá nhân", "Xem lịch học, bài sắp hạn và thông báo mới."],
  ["10:30", "Mở bài học", "Đọc tài liệu, xem video và đánh dấu đã học."],
  ["19:30", "Làm theo lộ trình", "Cập nhật trạng thái từng bước, ghi chú phần còn vướng."],
  ["23:00", "Nộp bài", "Gửi nội dung/file bài làm, chờ điểm và feedback."],
];

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
        <a href={appUrl("/")} className="flex items-center gap-3">
          <span className="flex h-12 w-24 shrink-0 items-center rounded-lg bg-white">
            <img src={logoImage} alt="" className="max-h-12 w-full object-contain" />
          </span>
          <span>
            <span className="block text-base font-black leading-5 text-slate-950">StudyMate</span>
            <span className="block text-xs font-semibold leading-5 text-slate-500">Góc học tập cá nhân</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          <a href="#day-flow" className="text-sm font-bold text-slate-600 transition hover:text-sky-700">Một ngày học</a>
          <a href="#features" className="text-sm font-bold text-slate-600 transition hover:text-sky-700">Tính năng</a>
          <a href="#roles" className="text-sm font-bold text-slate-600 transition hover:text-sky-700">Vai trò</a>
        </nav>

        <div className="flex items-center gap-2">
          <a href={appUrl("/preview")} className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-black text-sky-700 transition hover:bg-sky-100">
            <PlayCircle className="h-4 w-4" />
            Dùng thử
          </a>
          <a href={appUrl("/login")} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-sky-700">
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </a>
        </div>
      </div>
    </header>
  );
}

function StudyMatePreview() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg border border-sky-100 bg-white shadow-[0_28px_90px_rgba(14,116,144,0.15)]">
        <img src={heroImage} alt="Không gian học tập StudyMate" className="h-full min-h-[380px] w-full object-cover" />
      </div>

      <div className="absolute left-4 top-4 max-w-[250px] rounded-lg border border-white/80 bg-white/95 p-4 shadow-lg shadow-sky-900/10">
        <p className="text-xs font-black uppercase text-sky-700">Hôm nay</p>
        <h3 className="mt-1 text-lg font-black text-slate-950">Kiểm thử phần mềm</h3>
        <p className="mt-1 text-sm font-bold text-slate-500">08:00 - 10:00 · Phòng B204</p>
      </div>

      <div className="absolute bottom-4 left-4 w-[260px] rounded-lg border border-emerald-100 bg-white/95 p-4 shadow-lg shadow-emerald-900/10">
        <div className="flex items-center justify-between">
          <p className="text-sm font-black text-slate-950">Lộ trình học</p>
          <span className="text-sm font-black text-emerald-700">68%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[68%] rounded-full bg-emerald-500" />
        </div>
        <div className="mt-3 grid gap-2">
          {["Đọc tài liệu", "Viết 5 test case", "Tự đánh giá"].map((item, index) => (
            <div key={item} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <CheckCircle2 className={`h-4 w-4 ${index === 0 ? "text-emerald-600" : "text-slate-300"}`} />
              <span className="text-xs font-bold text-slate-600">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 max-w-[230px] rounded-lg border border-amber-100 bg-amber-50/95 p-4 shadow-lg shadow-amber-900/10">
        <p className="text-xs font-black uppercase text-amber-700">Deadline gần nhất</p>
        <h3 className="mt-1 text-sm font-black text-slate-950">Nộp bản phân tích yêu cầu</h3>
        <p className="mt-1 text-xs font-bold text-slate-600">Trước 23:59 hôm nay</p>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="soft-grid bg-sky-50">
      <div className="mx-auto grid min-h-[calc(100svh-74px)] max-w-7xl items-center gap-10 px-5 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="inline-flex rounded-lg border border-sky-200 bg-white px-4 py-2 text-sm font-black text-sky-700 shadow-sm">
            Dashboard học tập thân thiện cho sinh viên
          </p>
          <h1 className="mt-6 text-4xl font-black leading-[1.05] text-slate-950 sm:text-6xl">
            Học gọn hơn, deadline bớt đáng sợ hơn.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            StudyMate gom môn học, lịch học, bài tập, bài học, thông báo, điểm số và lộ trình vào một không gian học tập sáng sủa, dễ theo dõi mỗi ngày.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={appUrl("/preview")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-4 text-base font-black text-white shadow-[0_18px_44px_rgba(14,165,233,0.24)] transition hover:bg-sky-700">
              <PlayCircle className="h-5 w-5" />
              Dùng thử với tài khoản khách
            </a>
            <a href={appUrl("/register")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-6 py-4 text-base font-black text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50">
              <UserPlus className="h-5 w-5" />
              Tạo tài khoản
            </a>
            <a href={appUrl("/login")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-4 text-base font-black text-slate-800 transition hover:border-sky-300 hover:text-sky-700">
              <LogIn className="h-5 w-5" />
              Vào hệ thống
            </a>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[["1", "góc học tập"], ["Guest", "dùng thử"], ["CSV", "báo cáo"]].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-sky-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-2xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <StudyMatePreview />
      </div>
    </section>
  );
}

function DayFlow() {
  return (
    <section id="day-flow" className="bg-white py-18 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase text-sky-600">Một ngày học</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
            Từ mở dashboard đến nộp bài, mọi bước đều nằm cùng một chỗ
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dayFlow.map(([time, title, text], index) => (
            <article key={time} className="rounded-lg border border-sky-100 bg-sky-50/60 p-5 shadow-sm">
              <span className={`grid h-12 w-12 place-items-center rounded-lg text-sm font-black ${index === 0 ? "bg-sky-600 text-white" : index === 1 ? "bg-emerald-500 text-white" : index === 2 ? "bg-cyan-500 text-white" : "bg-amber-500 text-white"}`}>
                {time}
              </span>
              <h3 className="mt-5 text-lg font-black text-slate-950">{title}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="bg-slate-50 py-18 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-sky-600">Tính năng</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              Đủ nghiêm túc để quản lý học tập, đủ nhẹ nhàng để dùng mỗi ngày
            </h2>
          </div>
          <p className="max-w-md leading-7 text-slate-600">
            Mỗi module đều gắn với thao tác thật trong StudyMate: xem, lọc, mở chi tiết, cập nhật trạng thái và nhận phản hồi.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl">
                <span className={`grid h-12 w-12 place-items-center rounded-lg border ${feature.tone}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-black text-slate-950">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Roles() {
  return (
    <section id="roles" className="mx-auto max-w-7xl px-5 py-18 sm:px-6 sm:py-20 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-2">
        {[
          ["Sinh viên", "Một nơi gọn gàng để biết hôm nay học gì, còn bài nào, tiến độ ra sao.", CalendarDays, ["Dashboard", "Môn học của tôi", "Bài tập", "Bài học", "Lộ trình"]],
          ["Admin", "Quản lý lớp học, giao bài, tạo tài liệu, chấm điểm và theo dõi dữ liệu.", Users, ["Sinh viên", "Môn học", "Bài tập", "Bài nộp", "Báo cáo"]],
        ].map(([title, text, Icon, items], index) => (
          <article key={title} className={`rounded-lg border p-6 shadow-sm ${index === 0 ? "border-sky-100 bg-sky-50" : "border-emerald-100 bg-emerald-50"}`}>
            <Icon className={`h-8 w-8 ${index === 0 ? "text-sky-700" : "text-emerald-700"}`} />
            <h3 className="mt-4 text-2xl font-black text-slate-950">{title}</h3>
            <p className="mt-3 leading-7 text-slate-600">{text}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {items.map((item) => (
                <span key={item} className="rounded-full border border-white bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-18 sm:px-6 sm:pb-20 lg:px-8">
      <div className="grid gap-6 rounded-lg border border-sky-200 bg-sky-600 p-7 text-white shadow-[0_24px_70px_rgba(14,165,233,0.2)] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase text-sky-100">Bắt đầu nhẹ nhàng</p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Mở StudyMate và xem thử một ngày học mẫu</h2>
          <p className="mt-4 max-w-2xl leading-7 text-sky-50">
            Tài khoản khách dùng giao diện chính, dữ liệu mẫu lưu trong trình duyệt và không ghi vào database.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <a href={appUrl("/preview")} className="rounded-lg bg-white px-6 py-4 text-center font-black text-sky-700 transition hover:bg-sky-50">Dùng thử ngay</a>
          <a href={appUrl("/login")} className="rounded-lg border border-white/35 px-6 py-4 text-center font-black text-white transition hover:bg-white/10">Đăng nhập</a>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Header />
      <Hero />
      <DayFlow />
      <Features />
      <Roles />
      <CTA />
      <footer className="border-t border-sky-100 py-7">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 text-sm font-semibold text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-slate-800">StudyMate</p>
          <p>PLT Solutions - Không gian quản lý học tập cá nhân cho sinh viên.</p>
        </div>
      </footer>
    </main>
  );
}
