import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, RotateCcw } from "lucide-react";
import { Alert, Button, Card, LoadingState, Modal, Textarea } from "../../../components/ui";
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
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const lastSecurityEventRef = useRef({ key: "", at: 0 });
  const answersRef = useRef({});
  const submittingRef = useRef(false);
  const forcedSubmitRef = useRef(false);
  const quizStartedAtRef = useRef(0);
  const submitQuizRef = useRef(null);

  useEffect(() => {
    let active = true;
    async function loadQuiz() {
      setLoading(true);
      setError("");
      try {
        const response = await getStudentQuiz(assignmentId);
        if (!active) return;
        setPayload(response.data);
        const savedQuiz = response.data.submission?.quiz_payload;
        setResult(savedQuiz && Object.prototype.hasOwnProperty.call(savedQuiz, "score")
          ? { score: Number(savedQuiz.score), passed: true, details: savedQuiz.details || [] }
          : null);
        setQuizStarted(false);
        setCurrentQuestionIndex(0);
        const initialAnswers = {};
        (response.data.questions || []).forEach((question) => {
          const value = previousAnswer(response.data.submission, question.id);
          if (value !== "") {
            initialAnswers[question.id] = value;
          }
        });
        answersRef.current = initialAnswers;
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
        const message = "Bạn đã rời khỏi tab quiz. Bài làm sẽ được nộp tự động.";
        warn("tab_hidden", message);
        forceSubmit(message, "tab_hidden");
      } else {
        if (!submittingRef.current) setPrivacyShield(false);
      }
    }

    function handleBlur() {
      setPrivacyShield(true);
      const message = "Cửa sổ quiz vừa mất focus. Bài làm sẽ được nộp tự động.";
      warn("window_blur", message);
      forceSubmit(message, "window_blur");
    }

    function handleFocus() {
      if (!submittingRef.current) setPrivacyShield(false);
    }

    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        const message = "Bạn đã thoát chế độ toàn màn hình. Bài làm sẽ được nộp tự động.";
        warn("fullscreen_exit", message);
        forceSubmit(message, "fullscreen_exit");
      }
    }

    function handleResize() {
      if (Date.now() - quizStartedAtRef.current < 1500 || document.fullscreenElement) return;

      const message = "Kích thước cửa sổ quiz đã thay đổi. Bài làm sẽ được nộp tự động.";
      warn("window_resize", message, { width: window.innerWidth, height: window.innerHeight });
      forceSubmit(message, "window_resize");
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
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("resize", handleResize);
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
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("resize", handleResize);
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
  const hasPreviousSubmission = Boolean(payload?.submission?.id);
  const currentQuestion = questions[currentQuestionIndex] || null;
  const isSubmissionLocked = hasPreviousSubmission || Boolean(result);

  function formatScore(score) {
    return score !== null && score !== undefined ? `${Number(score).toFixed(1)}/10` : "--";
  }

  function updateAnswer(questionId, value) {
    answersRef.current = { ...answersRef.current, [questionId]: value };
    setAnswers(answersRef.current);
  }

  async function submitQuiz({ forced = false } = {}) {
    if (!quizStarted || submittingRef.current || hasPreviousSubmission) return;

    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    setResult(null);
    if (forced) setConfirmationOpen(false);

    try {
      const response = await submitStudentQuiz(assignmentId, answersRef.current);
      setResult(response.data.result);
      setPayload((current) => ({
        ...current,
        submission: response.data.submission,
      }));
      setQuizStarted(false);
      setPrivacyShield(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {});
      }
    } catch (exception) {
      const errors = exception.errors || {};
      const firstFieldError = Object.values(errors)[0];
      setError(firstFieldError || exception.message || "Không thể nộp quiz.");
      setPrivacyShield(false);
      forcedSubmitRef.current = false;
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  submitQuizRef.current = submitQuiz;

  function handleSubmitRequest(event) {
    event?.preventDefault();
    if (!quizStarted || submittingRef.current || isSubmissionLocked) return;
    setConfirmationOpen(true);
  }

  function forceSubmit(reason, eventType) {
    if (!quizStarted || submittingRef.current || forcedSubmitRef.current || result) return;

    forcedSubmitRef.current = true;
    setConfirmationOpen(false);
    setPrivacyShield(true);
    setSecurityWarning(reason);
    logSecurityEvent(eventType, reason);
    submitQuizRef.current?.({ forced: true });
  }

  async function startQuiz() {
    setError("");
    setSecurityWarning("");
    forcedSubmitRef.current = false;
    quizStartedAtRef.current = Date.now();

    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (exception) {
        logSecurityEvent("fullscreen_failed", "Không thể bật chế độ toàn màn hình cho quiz.", {
          message: exception?.message || "requestFullscreen failed",
        });
        setSecurityWarning("Không thể bật chế độ toàn màn hình. Quiz vẫn bắt đầu nhưng hệ thống sẽ tự nộp nếu bạn rời cửa sổ.");
      }
    }

    setQuizStarted(true);
  }

  function goToQuestion(index) {
    if (questions.length === 0) return;
    const nextIndex = Math.min(Math.max(index, 0), questions.length - 1);
    setCurrentQuestionIndex(nextIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <LoadingState label="Đang tải quiz..." />
      </main>
    );
  }

  return (
    <main className={`relative space-y-5 p-4 sm:p-6 lg:p-8 ${quizStarted ? "h-screen overflow-y-auto overscroll-contain" : "min-h-screen"}`}>
      {privacyShield && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/95 p-6 text-center text-white">
          <div className="max-w-md">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-300" />
            <h2 className="mt-4 text-2xl font-black">Bài làm đang được nộp</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-200">
              Bạn đã rời khỏi môi trường làm quiz. Hệ thống đang gửi bài làm hiện tại lên máy chủ.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-blue-600">StudyMate Quiz</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{assignment.title || "Quiz xác nhận"}</h1>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
            Hoàn thành và nộp quiz để ghi nhận bài học đã hoàn tất trên lộ trình.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Quay lại
        </Button>
      </div>

      <Alert tone="warning">
        Quiz bắt buộc chạy ở chế độ toàn màn hình. Thoát fullscreen, rời tab, mất focus hoặc đổi kích thước cửa sổ sẽ tự động nộp bài. Không chuột phải, copy/cut/paste, in/lưu PDF hoặc dùng phím tắt sao chép. Số lần hệ thống cảnh báo: {securityEvents}.
      </Alert>
      {securityWarning && <Alert tone="error">{securityWarning}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      {hasPreviousSubmission && (
        <Alert tone="info">
          Quiz này đã được nộp. Bạn chỉ có thể xem lại kết quả, không thể nộp lại.
        </Alert>
      )}
      {result && (
        <Card className="border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Kết quả cuối cùng</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-emerald-950">Quiz đã được nộp</h2>
              <p className="mt-1 text-sm font-semibold text-emerald-800">Bài học đã được ghi nhận hoàn thành.</p>
            </div>
            <p className="text-3xl font-black text-emerald-700">{formatScore(result.score)}</p>
          </div>
        </Card>
      )}

      {!quizStarted && !result && !hasPreviousSubmission && questions.length > 0 && (
        <Card className="p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase text-amber-600">Trước khi bắt đầu</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Xác nhận quy tắc làm quiz</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                Sau khi bắt đầu, hệ thống sẽ bật toàn màn hình. Nếu bạn rời fullscreen, rời tab, mất focus hoặc đổi kích thước cửa sổ, bài làm sẽ được nộp tự động. Các hành động copy/cut/paste, in trang, chuột phải hoặc phím tắt mở công cụ kiểm tra cũng được ghi nhận.
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                Bạn có thể quay lại trang chi tiết bài tập trước khi bắt đầu nếu chưa sẵn sàng.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-black text-amber-900">{questions.length} câu hỏi</p>
              <p className="mt-2 text-sm font-semibold text-amber-800">Mỗi câu sẽ hiển thị riêng để bạn trả lời và điều hướng.</p>
              <Button type="button" className="mt-4 w-full" onClick={startQuiz}>
                Bắt đầu làm quiz
              </Button>
            </div>
          </div>
        </Card>
      )}

      {(quizStarted || questions.length === 0) && (
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
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {currentQuestion && (
                <section className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-600 text-sm font-black text-white">
                      {currentQuestionIndex + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black leading-6 text-slate-950">{currentQuestion.question_text}</p>
                      <p className="mt-1 text-xs font-bold uppercase text-slate-400">
                        {currentQuestion.question_type === "short_answer" ? "Tự luận ngắn" : "Trắc nghiệm một đáp án"} · {currentQuestion.points ?? 1} điểm
                      </p>
                    </div>
                  </div>

                  {currentQuestion.question_type === "short_answer" ? (
                    <Textarea
                      value={answers[currentQuestion.id] || ""}
                      onChange={(event) => updateAnswer(currentQuestion.id, event.target.value)}
                      className="mt-4 min-h-28"
                      placeholder="Nhập câu trả lời của bạn..."
                      disabled={isSubmissionLocked}
                    />
                  ) : (
                    <div className="mt-4 grid gap-2">
                      {optionKeys.map((key) => {
                        const label = optionText(currentQuestion, key);
                        if (!label) return null;
                        return (
                          <label key={key} className={`flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition ${isSubmissionLocked ? "cursor-default opacity-80" : "cursor-pointer hover:border-blue-200 hover:bg-blue-50"}`}>
                            <input
                              type="radio"
                              name={`question-${currentQuestion.id}`}
                              value={key}
                              checked={answers[currentQuestion.id] === key}
                              onChange={() => updateAnswer(currentQuestion.id, key)}
                              className="mt-1 h-4 w-4"
                              disabled={isSubmissionLocked}
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
              )}

              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <Button type="button" variant="secondary" onClick={() => goToQuestion(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0}>
                  <ChevronLeft size={16} />
                  Trước
                </Button>
                <span className="text-sm font-black text-slate-600">
                  Câu {questions.length > 0 ? currentQuestionIndex + 1 : 0}/{questions.length}
                </span>
                <Button type="button" variant="secondary" onClick={() => goToQuestion(currentQuestionIndex + 1)} disabled={currentQuestionIndex >= questions.length - 1}>
                  Sau
                  <ChevronRight size={16} />
                </Button>
              </div>
            </form>
          )}
        </Card>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Điều hướng câu hỏi</p>
                <p className="mt-1 text-sm font-bold text-slate-600">Đã trả lời {answeredCount}/{questions.length}</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Đã trả lời
                <span className="ml-1 h-2.5 w-2.5 rounded-full bg-slate-200 ring-1 ring-slate-300" /> Chưa trả lời
              </div>
            </div>
            <div className="mt-4 grid max-h-64 grid-cols-6 gap-2 overflow-y-auto pr-1 sm:grid-cols-8 lg:grid-cols-6">
              {questions.map((question, index) => {
                const isAnswered = String(answers[question.id] || "").trim() !== "";
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => goToQuestion(index)}
                    aria-current={index === currentQuestionIndex ? "step" : undefined}
                    aria-label={`Đi đến câu ${index + 1}${isAnswered ? ", đã trả lời" : ", chưa trả lời"}`}
                    className={`grid h-9 w-full place-items-center rounded-lg text-xs font-black transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                      isAnswered
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-200"
                    } ${index === currentQuestionIndex ? "ring-2 ring-blue-600 ring-offset-2" : ""}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            {isSubmissionLocked ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-700">
                Quiz đã được nộp. Không thể nộp lại.
              </div>
            ) : (
              <Button type="button" className="mt-4 w-full" onClick={handleSubmitRequest} disabled={submitting || questions.length === 0}>
                <CheckCircle2 size={16} />
                {submitting ? "Đang chấm..." : "Nộp quiz"}
              </Button>
            )}
          </Card>

          <Card className="p-5">
            <p className="text-xs font-black uppercase text-slate-400">Tiến độ quiz</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-black text-slate-950">{formatScore(currentScore)}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${isSubmissionLocked ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {isSubmissionLocked ? "Đã nộp" : "Chưa nộp"}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              Sau khi nộp, điểm số được lưu lại và bài học được ghi nhận hoàn thành.
            </p>
          </Card>

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

      <Modal
        open={confirmationOpen}
        title="Xác nhận nộp quiz"
        description={`Bạn đã trả lời ${answeredCount} trên ${questions.length} câu hỏi. Bạn có chắc muốn nộp bài không?`}
        onClose={() => {
          if (!submitting) setConfirmationOpen(false);
        }}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setConfirmationOpen(false)} disabled={submitting}>
              Tiếp tục làm
            </Button>
            <Button type="button" onClick={() => submitQuiz()} disabled={submitting}>
              {submitting ? "Đang chấm..." : "Xác nhận nộp"}
            </Button>
          </>
        }
      >
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-800">
          Bạn vẫn có thể nộp bài dù còn câu chưa trả lời. Các câu chưa trả lời sẽ được tính là chưa đúng.
        </p>
      </Modal>
    </main>
  );
}
