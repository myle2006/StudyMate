import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardCheck, RotateCcw } from "lucide-react";
import { Alert, Button, Card, LoadingState, Textarea } from "../../../components/ui";
import { getStudentQuiz, logQuizSecurityEvent, submitStudentQuiz } from "../services/submissionService";

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
  const [quizStarted, setQuizStarted] = useState(false);
  const [securityWarning, setSecurityWarning] = useState("");
  const [securityEvents, setSecurityEvents] = useState(0);
  const [privacyShield, setPrivacyShield] = useState(false);
  const lastSecurityEventRef = useRef({ key: "", at: 0 });

  useEffect(() => {
    let active = true;
    async function loadQuiz() {
      setLoading(true);
      setError("");
      try {
        const response = await getStudentQuiz(assignmentId);
        if (!active) return;
        setPayload(response.data);
        setResult(null);
        setQuizStarted(false);
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

  function logSecurityEvent(eventType, message, metadata = {}) {
    const now = Date.now();
    const key = `${eventType}:${message}`;
    if (lastSecurityEventRef.current.key === key && now - lastSecurityEventRef.current.at < 1500) {
      return;
    }

    lastSecurityEventRef.current = { key, at: now };
    logQuizSecurityEvent(assignmentId, { event_type: eventType, message, metadata }).catch(() => {});
  }

  useEffect(() => {
    if (loading || result || !quizStarted) return undefined;

    let warningTimer;
    const blockedKeys = new Set(["c", "x", "v", "a", "s", "p", "u", "i", "j"]);

    function warn(eventType, message, metadata = {}) {
      setSecurityWarning(message);
      setSecurityEvents((count) => count + 1);
      logSecurityEvent(eventType, message, metadata);
      window.clearTimeout(warningTimer);
      warningTimer = window.setTimeout(() => setSecurityWarning(""), 5000);
    }

    function blockEvent(event, eventType, message, metadata = {}) {
      event.preventDefault();
      event.stopPropagation();
      warn(eventType, message, metadata);
      return false;
    }

    function handleContextMenu(event) {
      return blockEvent(event, "context_menu", "Chuột phải đã bị chặn trong khi làm quiz.");
    }

    function handleClipboard(event) {
      return blockEvent(event, `clipboard_${event.type}`, "Không được copy/cut/paste nội dung trong khi làm quiz.", {
        action: event.type,
      });
    }

    function handleSelectStart(event) {
      if (event.target?.matches?.("textarea, input")) return undefined;
      return blockEvent(event, "select_start", "Không được bôi đen hoặc sao chép đề quiz.");
    }

    function handleDragStart(event) {
      return blockEvent(event, "drag_start", "Không được kéo thả nội dung quiz.");
    }

    function handleKeyDown(event) {
      const key = event.key.toLowerCase();
      const withModifier = event.ctrlKey || event.metaKey;

      if (event.key === "PrintScreen") {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText("").catch(() => {});
        }
        return blockEvent(event, "print_screen", "Không được chụp màn hình trong khi làm quiz.");
      }

      if (withModifier && blockedKeys.has(key)) {
        return blockEvent(event, "blocked_shortcut", "Phím tắt này đã bị chặn trong khi làm quiz.", {
          key: event.key,
          ctrl: event.ctrlKey,
          meta: event.metaKey,
        });
      }

      if (event.key === "F12") {
        return blockEvent(event, "devtools_shortcut", "Không được mở công cụ kiểm tra trong khi làm quiz.", {
          key: event.key,
        });
      }

      return undefined;
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        setPrivacyShield(true);
        warn("tab_hidden", "Bạn vừa rời khỏi tab quiz. Hành động này có thể được xem là vi phạm quy tắc làm bài.");
      } else {
        setPrivacyShield(false);
      }
    }

    function handleBlur() {
      setPrivacyShield(true);
      warn("window_blur", "Cửa sổ quiz vừa mất focus. Vui lòng quay lại làm bài trong tab hiện tại.");
    }

    function handleFocus() {
      setPrivacyShield(false);
    }

    function handleBeforePrint(event) {
      return blockEvent(event, "print_attempt", "Không được in hoặc lưu PDF đề quiz.");
    }

    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("copy", handleClipboard, true);
    document.addEventListener("cut", handleClipboard, true);
    document.addEventListener("paste", handleClipboard, true);
    document.addEventListener("selectstart", handleSelectStart, true);
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("beforeprint", handleBeforePrint);

    return () => {
      window.clearTimeout(warningTimer);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("copy", handleClipboard, true);
      document.removeEventListener("cut", handleClipboard, true);
      document.removeEventListener("paste", handleClipboard, true);
      document.removeEventListener("selectstart", handleSelectStart, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("beforeprint", handleBeforePrint);
    };
  }, [assignmentId, loading, result, quizStarted]);

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
  const passingScore = Number(payload?.passing_score ?? 7);

  function formatScore(score) {
    return score !== null && score !== undefined ? `${Number(score).toFixed(1)}/10` : "--";
  }

  function updateAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!quizStarted) return;
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
    <main className="relative space-y-5 p-4 sm:p-6 lg:p-8">
      {privacyShield && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/95 p-6 text-center text-white">
          <div className="max-w-md">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-300" />
            <h2 className="mt-4 text-2xl font-black">Nội dung quiz đang được che</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-200">
              Quay lại cửa sổ quiz để tiếp tục làm bài. Việc rời tab hoặc mất focus có thể được ghi nhận là vi phạm quy tắc.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">StudyMate Quiz</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{assignment.title || "Quiz xác nhận"}</h1>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
            Làm quiz để xác nhận hoàn tất bài học trên lộ trình. Điểm đạt yêu cầu: {passingScore}/10 phần trắc nghiệm.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Quay lại
        </Button>
      </div>

      <Alert tone="warning">
        Quy tắc làm quiz: không chuột phải, không copy/cut/paste, không in/lưu PDF, không dùng phím tắt sao chép, không rời tab khi đang làm bài. Số lần hệ thống cảnh báo: {securityEvents}.
      </Alert>
      {securityWarning && <Alert tone="error">{securityWarning}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      {hasPreviousSubmission && !result && (
        <Alert tone={passed ? "success" : "info"}>
          Bạn đã làm quiz này trước đó. Có thể xem lại nội dung bên dưới, chỉnh đáp án và nộp lại nếu muốn.
        </Alert>
      )}
      {result && (
        <Alert tone={result.passed ? "success" : "warning"}>
          Điểm quiz: {formatScore(result.score)}. {result.passed ? "Bài học đã được xác nhận hoàn thành." : `Bạn cần đạt tối thiểu ${passingScore}/10 để hoàn tất bài học.`}
        </Alert>
      )}

      {!quizStarted && !result && questions.length > 0 && (
        <Card className="p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase text-amber-600">Trước khi bắt đầu</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Xác nhận quy tắc làm quiz</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                Sau khi bắt đầu, hệ thống sẽ ghi nhận các hành động như rời tab, mất focus cửa sổ, copy/cut/paste, in trang, chuột phải hoặc phím tắt mở công cụ kiểm tra. Các cảnh báo này chỉ được ghi nhận để giảng viên/admin xem xét khi cần.
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                Bạn có thể quay lại trang chi tiết bài tập trước khi bắt đầu nếu chưa sẵn sàng.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-black text-amber-900">{questions.length} câu hỏi</p>
              <p className="mt-2 text-sm font-semibold text-amber-800">Điểm đạt: {passingScore}/10.</p>
              <Button type="button" className="mt-4 w-full" onClick={() => setQuizStarted(true)}>
                Bắt đầu làm quiz
              </Button>
            </div>
          </div>
        </Card>
      )}

      {(quizStarted || result || questions.length === 0) && (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="select-none p-5">
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
              <span className="text-3xl font-black text-slate-950">{formatScore(currentScore)}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${passed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {passed ? "Đã đạt" : "Chưa đạt"}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              Khi đạt tối thiểu {passingScore}/10, node bài học trên roadmap sẽ tự chuyển sang hoàn thành.
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
      )}
    </main>
  );
}
