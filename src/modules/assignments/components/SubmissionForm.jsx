import React, { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, Card, Field, Textarea } from "../../../components/ui";
import AssignmentStatusBadge, { getDeadlineState } from "./AssignmentStatusBadge";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "zip", "rar", "png", "jpg", "jpeg"];

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function validate(content, file, hasExistingFile) {
  const errors = {};

  if (!content.trim() && !file && !hasExistingFile) {
    errors.content = "Vui lòng nhập nội dung bài làm hoặc upload file.";
  }

  if (file) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      errors.file = "File chỉ hỗ trợ pdf, doc, docx, zip, rar, png, jpg hoặc jpeg.";
    } else if (file.size > MAX_FILE_SIZE) {
      errors.file = "File bài nộp không được vượt quá 10MB.";
    }
  }

  return errors;
}

export default function SubmissionForm({ assignment, submission, apiErrors = {}, submitting = false, onSubmit }) {
  const [content, setContent] = useState(submission?.content || assignment?.submission_content || "");
  const [file, setFile] = useState(null);
  const [clientErrors, setClientErrors] = useState({});
  const errors = useMemo(() => ({ ...clientErrors, ...apiErrors }), [clientErrors, apiErrors]);
  const hasExistingFile = Boolean(submission?.file_path || assignment?.submission_file_path);
  const deadlineState = getDeadlineState(assignment?.deadline, assignment?.status, submission?.status || assignment?.submission_status || "not_submitted");
  const isClosed = assignment?.status === "closed";

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(content, file, hasExistingFile);
    setClientErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const payload = new FormData();
    payload.append("content", content.trim());
    if (file) {
      payload.append("file", file);
    }

    onSubmit?.(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="p-5">
        <Field label="Nội dung bài làm" error={errors.content}>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={12}
            disabled={isClosed}
            placeholder="Nhập nội dung bài làm, đường link repository, ghi chú hoặc phần trả lời của bạn"
          />
        </Field>
      </Card>

      <Card className="space-y-5 p-5">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-extrabold uppercase text-slate-500">Deadline</p>
          <p className="mt-2 text-sm font-black text-slate-950">{formatDateTime(assignment?.deadline)}</p>
          <div className="mt-3">
            <AssignmentStatusBadge
              type="deadline"
              deadline={assignment?.deadline}
              assignmentStatusValue={assignment?.status}
              submissionStatusValue={submission?.status || assignment?.submission_status || "not_submitted"}
            />
          </div>
        </div>

        {deadlineState.urgent && !isClosed && (
          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            Deadline đang đến gần. Hãy kiểm tra kỹ nội dung trước khi nộp.
          </div>
        )}

        {deadlineState.overdue && !submission && !isClosed && (
          <div className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            Bài nộp sau deadline sẽ được đánh dấu nộp muộn.
          </div>
        )}

        <Field label="File bài nộp" error={errors.file} hint="Tối đa 10MB. Hỗ trợ pdf, doc, docx, zip, rar, png, jpg, jpeg.">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.zip,.rar,.png,.jpg,.jpeg"
            disabled={isClosed}
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="mt-2 w-full rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-blue-700 disabled:bg-slate-100"
          />
        </Field>

        {(submission?.file_path || assignment?.submission_file_path) && !file && (
          <a
            href={submission?.file_path || assignment?.submission_file_path}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            Xem file đã nộp
          </a>
        )}

        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" disabled={submitting || isClosed}>
            {submitting ? "Đang gửi..." : submission ? "Cập nhật bài nộp" : "Nộp bài"}
          </Button>
          <Button to={`/student/assignments/${assignment?.id}`} variant="secondary" size="lg">
            Quay lại bài tập
          </Button>
        </div>
      </Card>
    </form>
  );
}
