import React from "react";

function parseContent(content) {
  if (content && typeof content === "object") return content;
  if (typeof content !== "string" || content.trim() === "") return null;

  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function isQuizSubmission(content) {
  return parseContent(content)?.type === "lesson_quiz";
}

function answerLabel(value) {
  if (value === null || value === undefined || String(value).trim() === "") return "Chưa trả lời";
  return String(value);
}

export default function SubmissionContent({ content, emptyMessage = "Chưa có nội dung bài nộp." }) {
  const payload = parseContent(content);

  if (payload?.type !== "lesson_quiz") {
    const text = typeof content === "string" ? content : "";
    return <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-700">{text || emptyMessage}</p>;
  }

  const answers = payload.answers && typeof payload.answers === "object" ? payload.answers : {};
  const details = Array.isArray(payload.details) ? payload.details : [];
  const answeredCount = Object.values(answers).filter((value) => String(value ?? "").trim() !== "").length;

  return (
    <div className="mt-3 space-y-4 text-sm text-slate-700">
      <div className="flex flex-wrap gap-2 text-xs font-black">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Quiz</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
          Đã trả lời {answeredCount} câu
        </span>
        {payload.score !== undefined && payload.score !== null && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
            Điểm {Number(payload.score).toFixed(1)}/10
          </span>
        )}
      </div>

      {details.length > 0 ? (
        <div
          className="max-h-[36rem] space-y-2 overflow-y-auto overscroll-contain pr-2"
          aria-label={`Danh sách ${details.length} câu hỏi, tối đa 10 câu hiển thị cùng lúc`}
        >
          {details.map((detail, index) => {
            const status = detail.is_correct === true ? "Đúng" : detail.is_correct === false ? "Sai" : "Đã lưu";
            const statusClass = detail.is_correct === true
              ? "bg-emerald-50 text-emerald-700"
              : detail.is_correct === false
                ? "bg-rose-50 text-rose-700"
                : "bg-slate-100 text-slate-600";

            return (
              <div key={detail.question_id || index} className="rounded-lg border border-slate-200 bg-white px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-black text-slate-900">Câu {index + 1}</span>
                  <span className={`rounded-full px-2 py-1 text-xs font-black ${statusClass}`}>{status}</span>
                </div>
                <p className="mt-2 font-semibold">Câu trả lời: {answerLabel(detail.answer)}</p>
                {detail.correct_answer && (
                  <p className="mt-1 text-xs font-bold text-slate-500">Đáp án đúng: {detail.correct_answer}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">{JSON.stringify(payload, null, 2)}</pre>
      )}
    </div>
  );
}
