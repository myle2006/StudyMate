import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardCheck, RotateCcw } from "lucide-react";
import { Alert, Button, Card, LoadingState, Textarea } from "../../../components/ui";
import { getStudentQuiz, submitStudentQuiz } from "../services/submissionService";

const optionKeys = ["A", "B", "C", "D"];

function optionText(question, key) {
  return question[`option_${key.toLowerCase()}`] || "";
}

function previousAnswer(submission, questionId) {
  const answers = submission?.quiz_payload?.answers || {};
  return answers[questionId] || answers[String(questionId)] || "";
}

export default function StudentQuizPage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [payload, setPayload] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadQuiz() {
      setLoading(true);
      setError("");
      try {
        const response = await getStudentQuiz(assignmentId);
        if (!active) return;
        setPayload(response.data);
        const initialAnswers = {};
        (response.data.questions || []).forEach((question) => {
          const value = previousAnswer(response.data.submission, question.id);
          if (value !== "") {
            initialAnswers[question.id] = value;
          }
        });
        setAnswers(initialAnswers);
      } catch (exception) {
        if (active) setError(exception.message || "Không thể tải quiz.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadQuiz();
    return () => {
      active = false;
    };
  }, [assignmentId]);

  const questions = payload?.questions || [];
  const assignment = payload?.assignment || {};
  const answeredCount = useMemo(
    () => questions.filter((question) => String(answers[question.id] || "").trim() !== "").length,
    [questions, answers]
  );
  const currentScore = result?.score ?? payload?.submission?.score ?? null;
  const passed = result?.passed ?? payload?.submission?.quiz_payload?.passed ?? false;
  const resultDetails = result?.details || payload?.submission?.quiz_payload?.details || [];
  const hasPreviousSubmission = Boolean(payload?.submission?.id);

  function updateAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      const response = await submitStudentQuiz(assignmentId, answers);
      setResult(response.data.result);
      setPayload((current) => ({
        ...current,
        submission: response.data.submission,
      }));
    } catch (exception) {
      const errors = exception.errors || {};
      const firstFieldError = Object.values(errors)[0];
      setError(firstFieldError || exception.message || "Không thể nộp quiz.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <LoadingState label="Đang tải quiz..." />
      </main>
    );
  }

  return (
    <main className="space-y-5 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">StudyMate Quiz</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{assignment.title || "Quiz xác nhận"}</h1>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
            Làm quiz để xác nhận hoàn tất bài học trên lộ trình. Điểm đạt yêu cầu: {payload?.passing_score || 70}% phần trắc nghiệm.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Quay lại
        </Button>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {hasPreviousSubmission && !result && (
        <Alert tone={passed ? "success" : "info"}>
          Bạn đã làm quiz này trước đó. Có thể xem lại nội dung bên dưới, chỉnh đáp án và nộp lại nếu muốn.
        </Alert>
      )}
      {result && (
        <Alert tone={result.passed ? "success" : "warning"}>
          Điểm quiz: {result.score}%. {result.passed ? "Bài học đã được xác nhận hoàn thành." : "Bạn cần đạt tối thiểu 70% để hoàn tất bài học."}
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5">
          {questions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <ClipboardCheck className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-3 text-xl font-black text-slate-900">Quiz chưa có câu hỏi</h2>
              <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                Admin/giảng viên cần nạp file CSV quiz khi tạo hoặc chỉnh sửa bài học.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {questions.map((question, index) => (
                <section key={question.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-600 text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black leading-6 text-slate-950">{question.question_text}</p>
                      <p className="mt-1 text-xs font-bold uppercase text-slate-400">
                        {question.question_type === "short_answer" ? "Tự luận ngắn" : "Trắc nghiệm một đáp án"} · {question.points || 1} điểm
                      </p>
                    </div>
                  </div>

                  {question.question_type === "short_answer" ? (
                    <Textarea
                      value={answers[question.id] || ""}
                      onChange={(event) => updateAnswer(question.id, event.target.value)}
                      className="mt-4 min-h-28"
                      placeholder="Nhập câu trả lời của bạn..."
                    />
                  ) : (
                    <div className="mt-4 grid gap-2">
                      {optionKeys.map((key) => {
                        const label = optionText(question, key);
                        if (!label) return null;
                        return (
                          <label key={key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={key}
                              checked={answers[question.id] === key}
                              onChange={() => updateAnswer(question.id, key)}
                              className="mt-1 h-4 w-4"
                            />
                            <span>
                              <span className="font-black text-blue-700">{key}.</span> {label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </section>
              ))}

              <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-bold text-slate-600">
                  Đã trả lời {answeredCount}/{questions.length} câu.
                </p>
                <Button type="submit" disabled={submitting || questions.length === 0}>
                  <CheckCircle2 size={16} />
                  {submitting ? "Đang chấm..." : "Nộp quiz"}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <aside className="space-y-4">
          <Card className="p-5">
            <p className="text-xs font-black uppercase text-slate-400">Tiến độ quiz</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-black text-slate-950">{currentScore !== null ? `${currentScore}%` : "--"}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${passed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {passed ? "Đã đạt" : "Chưa đạt"}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              Khi đạt tối thiểu 70%, node bài học trên roadmap sẽ tự chuyển sang hoàn thành.
            </p>
          </Card>

          {resultDetails.length > 0 && (
            <Card className="p-5">
              <p className="text-xs font-black uppercase text-slate-400">Kết quả từng câu</p>
              <div className="mt-3 space-y-2">
                {resultDetails.map((detail, index) => (
                  <div key={detail.question_id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                    Câu {index + 1}: {detail.is_correct === null ? "Đã lưu câu trả lời" : detail.is_correct ? "Đúng" : `Sai, đáp án đúng: ${detail.correct_answer}`}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Button to="/student/roadmaps" variant="secondary" className="w-full">
            <RotateCcw size={16} />
            Về danh sách lộ trình
          </Button>
          <Link to={`/student/assignments/${assignmentId}`} className="block text-center text-sm font-black text-blue-600 hover:text-blue-700">
            Xem chi tiết bài tập
          </Link>
        </aside>
      </div>
    </main>
  );
}
