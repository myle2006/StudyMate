import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Field, Input, Textarea } from "../../../components/ui";

function validate(form) {
  const errors = {};
  const score = String(form.score ?? "").trim();

  if (score === "") {
    errors.score = "Điểm là bắt buộc.";
  } else if (Number.isNaN(Number(score))) {
    errors.score = "Điểm phải là số.";
  } else if (Number(score) < 0 || Number(score) > 10) {
    errors.score = "Điểm phải từ 0 đến 10.";
  }

  return errors;
}

export default function GradeForm({ submission, submitting = false, apiErrors = {}, onSubmit }) {
  const [form, setForm] = useState({
    score: submission?.score ?? "",
    feedback: submission?.feedback || "",
  });
  const [clientErrors, setClientErrors] = useState({});
  const errors = useMemo(() => ({ ...clientErrors, ...apiErrors }), [clientErrors, apiErrors]);

  useEffect(() => {
    setForm({
      score: submission?.score ?? "",
      feedback: submission?.feedback || "",
    });
    setClientErrors({});
  }, [submission?.id, submission?.score, submission?.feedback]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setClientErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSubmit?.({
      score: Number(form.score),
      feedback: form.feedback.trim(),
    });
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-start">
        <Field label="Điểm" error={errors.score}>
          <Input
            type="number"
            name="score"
            min="0"
            max="10"
            step="0.1"
            value={form.score}
            onChange={handleChange}
            placeholder="8.5"
          />
        </Field>

        <Field label="Feedback" error={errors.feedback}>
          <Textarea
            name="feedback"
            rows={4}
            value={form.feedback}
            onChange={handleChange}
            placeholder="Nhập nhận xét cho sinh viên"
          />
        </Field>

        <Button type="submit" className="mt-7 lg:min-w-32" disabled={submitting}>
          {submitting ? "Đang lưu..." : "Lưu điểm"}
        </Button>
      </form>
    </Card>
  );
}
