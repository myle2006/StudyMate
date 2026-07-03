import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <main className="min-h-full bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-sm font-extrabold uppercase text-blue-600 dark:text-blue-300">
          StudyMate AI
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">
          Trang cá nhân
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Xin chào {user?.full_name}. Đây là khu vực học tập cá nhân của bạn.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Môn học", "Quản lý môn học cá nhân", "/subjects"],
            ["Lộ trình", "Theo dõi kế hoạch học tập", "/roadmap"],
            ["AI Assistant", "Hỏi đáp và tóm tắt tài liệu", "/assistant"],
          ].map(([title, text, href]) => (
            <article key={title} className="rounded-lg border border-slate-200 p-5 dark:border-white/10">
              <h2 className="font-extrabold text-slate-950 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              <Link to={href} className="mt-4 inline-flex text-sm font-bold text-blue-600 hover:text-blue-700">
                Mở
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
