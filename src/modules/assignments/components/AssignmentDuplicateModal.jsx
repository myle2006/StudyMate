import React, { useEffect, useState } from "react";
import { Button, Field, Input, Modal, Textarea } from "../../../components/ui";

function toDatetimeLocal(value) {
  if (!value) return "";
  return String(value).replace(" ", "T").slice(0, 16);
}

export default function AssignmentDuplicateModal({ open, assignment, classes = [], loading = false, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    class_ids: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!assignment) return;

    setForm({
      title: assignment.title || "",
      description: assignment.description || "",
      deadline: toDatetimeLocal(assignment.deadline),
      class_ids: classes
        .filter((item) => String(item.id) !== String(assignment.class_id))
        .slice(0, 1)
        .map((item) => Number(item.id)),
    });
    setErrors({});
  }, [assignment?.id, classes.length]);

  if (!open || !assignment) return null;

  function toggleClass(classId, checked) {
    setForm((current) => ({
      ...current,
      class_ids: checked
        ? Array.from(new Set([...current.class_ids, Number(classId)]))
        : current.class_ids.filter((id) => id !== Number(classId)),
    }));
  }

  function handleSubmit() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Tên bài tập là bắt buộc.";
    if (!form.deadline) nextErrors.deadline = "Deadline là bắt buộc.";
    if (form.class_ids.length === 0) nextErrors.class_ids = "Vui lòng chọn ít nhất một lớp đích.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit?.({
      title: form.title.trim(),
      description: form.description.trim(),
      deadline: form.deadline,
      status: assignment.status || "draft",
      class_ids: form.class_ids,
    });
  }

  return (
    <Modal
      open={open}
      title="Duplicate bài tập"
      description="Tạo bản sao độc lập cho lớp khác trong cùng môn học."
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang duplicate..." : "Duplicate"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-4 text-sm">
          <p className="font-black text-slate-950">Bài tập nguồn: {assignment.title}</p>
          <p className="mt-1 font-semibold text-slate-600">Môn học: {assignment.subject_name}</p>
          <p className="mt-1 font-semibold text-slate-600">Lớp nguồn: {assignment.class_code || "DEFAULT"}</p>
        </div>

        <Field label="Gán sang lớp" error={errors.class_ids}>
          <div className="mt-2 grid max-h-44 gap-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
            {classes
              .filter((item) => String(item.id) !== String(assignment.class_id))
              .map((item) => (
                <label key={item.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={form.class_ids.includes(Number(item.id))}
                    onChange={(event) => toggleClass(item.id, event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  {item.class_code}{item.class_name ? ` - ${item.class_name}` : ""}
                </label>
              ))}
            {classes.filter((item) => String(item.id) !== String(assignment.class_id)).length === 0 && (
              <p className="text-sm font-semibold text-slate-500">Môn học này chưa có lớp đích khác.</p>
            )}
          </div>
        </Field>

        <Field label="Tên bài tập" error={errors.title}>
          <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
        </Field>

        <Field label="Deadline" error={errors.deadline}>
          <Input type="datetime-local" value={form.deadline} onChange={(event) => setForm((current) => ({ ...current, deadline: event.target.value }))} />
        </Field>

        <Field label="Mô tả / nội dung">
          <Textarea rows={5} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
        </Field>
      </div>
    </Modal>
  );
}
