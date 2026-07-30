import React from "react";
import { Clock3, FileText } from "lucide-react";
import { Link } from "react-router-dom";

function formatDeadline(value) {
  if (!value) return "Chưa có hạn";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(String(value).replace(" ", "T")));
}

const submissionLabels = {
  not_submitted: "Chưa nộp",
  submitted: "Đã nộp",
  late: "Nộp muộn",
  graded: "Đã chấm",
};

export default function UpcomingAssignmentList({ assignments = [] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-950">Bài tập sắp đến hạn</h2>
        <FileText className="h-5 w-5 text-amber-600" />
      </div>

      {assignments.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
          Chưa có bài tập nào sắp đến hạn.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {assignments.map((assignment) => {
            const submissionStatus = assignment.submission_status || "not_submitted";

            return (
              <Link
                key={assignment.id}
                to={`/student/assignments/${assignment.id}`}
                className="block rounded-lg border border-slate-200 p-4 transition hover:border-amber-300 hover:bg-amber-50/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold uppercase text-amber-600">
                      {assignment.subject_code} · {assignment.subject_name}
                    </p>
                    <h3 className="mt-1 truncate text-sm font-black text-slate-950">{assignment.title}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600">
                    {submissionLabels[submissionStatus] || submissionStatus}
                  </span>
                </div>
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  Hạn nộp: {formatDeadline(assignment.deadline)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
